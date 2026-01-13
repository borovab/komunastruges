// server/index.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const { createPool } = require("./db.cjs");
const { uuid, getBearerToken, daysToMs } = require("./auth.cjs");

const app = express();
const pool = createPool();

const PORT = Number(process.env.PORT || 3001);
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
const SESSION_DAYS = Number(process.env.SESSION_DAYS || 7);

app.use(express.json({ limit: "200kb" }));

const allowedOrigins = String(CORS_ORIGIN)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// ✅ MOS E PREK CORS/ORIGIN (siç e ke)
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // curl/postman
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("CORS blocked: " + origin));
    },
    origin: true,
    credentials: false,
  })
);

// ---- Helpers ----
function normRole(v) {
  const r = String(v || "").trim().toLowerCase();
  if (["menagjer", "menaxher", "menager"].includes(r)) return "manager";
  return r;
}

async function getAuthUser(req) {
  const token = getBearerToken(req);
  if (!token) return null;

  const [rows] = await pool.query(
    `
    SELECT u.id, u.username, u.role, u.full_name, u.department_id
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = :token AND s.expires_at > NOW()
    LIMIT 1
    `,
    { token }
  );

  const u = rows?.[0];
  if (!u) return null;

  return {
    id: u.id,
    username: u.username,
    role: normRole(u.role),
    fullName: u.full_name,
    departmentId: u.department_id || null,
  };
}

function requireAuth(role) {
  return async (req, res, next) => {
    try {
      const me = await getAuthUser(req);
      if (!me) return res.status(401).json({ error: "Unauthorized" });

      if (role && me.role !== normRole(role)) return res.status(403).json({ error: "Forbidden" });

      req.user = me;
      next();
    } catch (e) {
      return res.status(500).json({ error: e?.message || "Server error" });
    }
  };
}

function requireAnyRole(roles) {
  return async (req, res, next) => {
    try {
      const me = await getAuthUser(req);
      if (!me) return res.status(401).json({ error: "Unauthorized" });

      const allowed = (roles || []).map(normRole);
      if (allowed.length && !allowed.includes(me.role)) return res.status(403).json({ error: "Forbidden" });

      req.user = me;
      next();
    } catch (e) {
      return res.status(500).json({ error: e?.message || "Server error" });
    }
  };
}

async function cleanupSessions() {
  try {
    await pool.query(`DELETE FROM sessions WHERE expires_at <= NOW()`);
  } catch {}
}

// ---- AUTH ----
app.post("/api/auth/login", async (req, res) => {
  try {
    await cleanupSessions();

    const username = String(req.body?.username || "").trim();
    const password = String(req.body?.password || "").trim();
    if (!username || !password) return res.status(400).json({ error: "Missing username/password" });

    const [rows] = await pool.query(
      `SELECT id, username, role, full_name, password_hash, department_id FROM users WHERE username = :username LIMIT 1`,
      { username }
    );

    const u = rows?.[0];
    if (!u) return res.status(401).json({ error: "Kredenciale të pasakta." });

    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) return res.status(401).json({ error: "Kredenciale të pasakta." });

    const token = uuid();
    const expiresAt = new Date(Date.now() + daysToMs(SESSION_DAYS));

    await pool.query(
      `INSERT INTO sessions (token, user_id, expires_at) VALUES (:token, :userId, :expiresAt)`,
      { token, userId: u.id, expiresAt }
    );

    return res.json({
      token,
      user: {
        id: u.id,
        username: u.username,
        role: normRole(u.role),
        fullName: u.full_name,
        departmentId: u.department_id || null,
      },
    });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});

app.post("/api/auth/logout", async (req, res) => {
  try {
    const token = getBearerToken(req);
    if (token) await pool.query(`DELETE FROM sessions WHERE token = :token`, { token });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});

app.get("/api/auth/me", requireAuth(), async (req, res) => {
  return res.json({ user: req.user });
});

// ---- PROFILE (me) ----
app.get("/api/profile", requireAuth(), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, username, role, full_name, department_id, created_at FROM users WHERE id=:id LIMIT 1`,
      { id: req.user.id }
    );

    const u = rows?.[0];
    if (!u) return res.status(404).json({ error: "Not found" });

    return res.json({
      user: {
        id: u.id,
        username: u.username,
        role: normRole(u.role),
        fullName: u.full_name,
        departmentId: u.department_id || null,
        createdAt: new Date(u.created_at).toISOString(),
      },
    });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});

app.put("/api/profile", requireAuth(), async (req, res) => {
  try {
    const fullName = String(req.body?.fullName || "").trim();
    const password = String(req.body?.password || "").trim(); // optional

    if (!fullName) return res.status(400).json({ error: "Plotëso fullName." });
    if (password && password.length < 6) return res.status(400).json({ error: "Password shumë i shkurtër (min 6)." });

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      await pool.query(`UPDATE users SET full_name=:fullName, password_hash=:passwordHash WHERE id=:id`, {
        id: req.user.id,
        fullName,
        passwordHash,
      });
    } else {
      await pool.query(`UPDATE users SET full_name=:fullName WHERE id=:id`, {
        id: req.user.id,
        fullName,
      });
    }

    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});

// ---- DEPARTMENTS ----
app.get("/api/departments", requireAuth(), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT id, name, created_at
      FROM departments
      ORDER BY name ASC
      `
    );

    return res.json({
      departments: rows.map((d) => ({
        id: d.id,
        name: d.name,
        createdAt: d.created_at ? new Date(d.created_at).toISOString() : null,
      })),
    });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});

// ✅ superadmin lejohet si admin
app.post("/api/departments", requireAnyRole(["admin", "superadmin"]), async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    if (!name) return res.status(400).json({ error: "Plotëso name." });

    const [dup] = await pool.query(`SELECT 1 FROM departments WHERE LOWER(name)=LOWER(:name) LIMIT 1`, { name });
    if (dup.length) return res.status(409).json({ error: "Departamenti ekziston." });

    const id = uuid();
    await pool.query(`INSERT INTO departments (id, name) VALUES (:id, :name)`, { id, name });

    return res.status(201).json({ department: { id, name } });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});

// ✅ superadmin lejohet si admin
app.put("/api/departments/:id", requireAnyRole(["admin", "superadmin"]), async (req, res) => {
  try {
    const id = String(req.params.id || "").trim();
    const name = String(req.body?.name || "").trim();
    if (!id) return res.status(400).json({ error: "Missing id." });
    if (!name) return res.status(400).json({ error: "Plotëso name." });

    const [exists] = await pool.query(`SELECT 1 FROM departments WHERE id=:id LIMIT 1`, { id });
    if (!exists.length) return res.status(404).json({ error: "Not found" });

    const [dup] = await pool.query(
      `SELECT 1 FROM departments WHERE LOWER(name)=LOWER(:name) AND id <> :id LIMIT 1`,
      { name, id }
    );
    if (dup.length) return res.status(409).json({ error: "Departamenti ekziston." });

    await pool.query(`UPDATE departments SET name=:name WHERE id=:id`, { id, name });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});

// ✅ superadmin lejohet si admin
app.delete("/api/users/:id", requireAnyRole(["admin", "manager", "superadmin"]), async (req, res) => {
  try {
    const id = String(req.params.id || "").trim();
    if (!id) return res.status(400).json({ error: "Missing id." });

    if (req.user.role === "manager") {
      const [rows] = await pool.query(`SELECT role, department_id FROM users WHERE id=:id LIMIT 1`, { id });
      if (!rows.length) return res.status(404).json({ error: "Not found" });

      const r = rows[0];
      if (normRole(r.role) !== "user") return res.status(403).json({ error: "Forbidden" });
      if ((r.department_id || null) !== (req.user.departmentId || null)) {
        return res.status(403).json({ error: "Forbidden" });
      }

      await pool.query(`DELETE FROM users WHERE id=:id AND role='user'`, { id });
      return res.json({ ok: true });
    }

    // ✅ admin/superadmin: lejo fshirje vetëm user/manager, por jep arsye kur është admin/superadmin
    const [rows] = await pool.query(`SELECT role FROM users WHERE id=:id LIMIT 1`, { id });
    if (!rows.length) return res.status(404).json({ error: "Not found" });

    const targetRole = normRole(rows[0].role);

    if (targetRole === "admin" || targetRole === "superadmin") {
      return res.status(403).json({ error: "Nuk lejohet fshirja e admin/superadmin." });
    }

    await pool.query(`DELETE FROM users WHERE id=:id AND role IN ('user','manager')`, { id });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});


// ---- USERS (admin + manager + superadmin) ----
app.post("/api/users", requireAnyRole(["admin", "manager", "superadmin"]), async (req, res) => {
  try {
    const meRole = req.user.role;

    const username = String(req.body?.username || "").trim();
    const password = String(req.body?.password || "").trim();
    const fullName = String(req.body?.fullName || "").trim();

    if (!username || !password || !fullName) {
      return res.status(400).json({ error: "Plotëso fullName, username, password." });
    }
    if (password.length < 6) return res.status(400).json({ error: "Password shumë i shkurtër (min 6)." });

    let role = "user";
    let departmentId = null;

    // ✅ superadmin trajtohet si admin (nuk i kërkon department vetes, dhe mundet me zgjedh role)
    if (meRole === "admin" || meRole === "superadmin") {
      const roleRaw = String(req.body?.role || "user").trim();

      role =
        roleRaw === "superadmin" || roleRaw === "admin" || roleRaw === "manager" || roleRaw === "user" ? roleRaw : "user";

      const departmentIdRaw = req.body?.departmentId;
      departmentId = departmentIdRaw === null || departmentIdRaw === undefined ? null : String(departmentIdRaw).trim();

      if ((role === "user" || role === "manager") && !departmentId) {
        return res.status(400).json({ error: "Zgjidh department." });
      }
    } else {
      role = "user";
      departmentId = req.user.departmentId || null;
      if (!departmentId) return res.status(400).json({ error: "Manageri s’ka department." });
    }

    if (departmentId) {
      const [depExists] = await pool.query(`SELECT 1 FROM departments WHERE id=:id LIMIT 1`, { id: departmentId });
      if (!depExists.length) return res.status(400).json({ error: "Department i pavlefshëm." });
    }

    const [exists] = await pool.query(`SELECT 1 FROM users WHERE LOWER(username)=LOWER(:username) LIMIT 1`, { username });
    if (exists.length) return res.status(409).json({ error: "Username ekziston." });

    const id = uuid();
    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      `
      INSERT INTO users (id, username, password_hash, role, full_name, department_id)
      VALUES (:id, :username, :passwordHash, :role, :fullName, :departmentId)
      `,
      {
        id,
        username,
        passwordHash,
        role,
        fullName,
        // ✅ admin/superadmin pa department
        departmentId: role === "admin" || role === "superadmin" ? null : departmentId,
      }
    );

    return res.status(201).json({
      user: {
        id,
        username,
        role,
        fullName,
        departmentId: role === "admin" || role === "superadmin" ? null : departmentId,
      },
    });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});

app.get("/api/users", requireAnyRole(["admin", "manager", "superadmin"]), async (req, res) => {
  try {
    if (req.user.role === "manager") {
      const dep = req.user.departmentId || "__none__";
      const [rows] = await pool.query(
        `
        SELECT u.id, u.username, u.role, u.full_name, u.created_at, u.department_id, d.name AS department_name
        FROM users u
        LEFT JOIN departments d ON d.id = u.department_id
        WHERE u.role='user' AND u.department_id = :dep
        ORDER BY u.created_at DESC
        `,
        { dep }
      );

      return res.json({
        users: rows.map((u) => ({
          id: u.id,
          username: u.username,
          role: normRole(u.role),
          fullName: u.full_name,
          createdAt: new Date(u.created_at).toISOString(),
          departmentId: u.department_id || null,
          departmentName: u.department_name || null,
        })),
      });
    }

    const [rows] = await pool.query(
      `
      SELECT u.id, u.username, u.role, u.full_name, u.created_at, u.department_id, d.name AS department_name
      FROM users u
      LEFT JOIN departments d ON d.id = u.department_id
      ORDER BY u.created_at DESC
      `
    );

    return res.json({
      users: rows.map((u) => ({
        id: u.id,
        username: u.username,
        role: normRole(u.role),
        fullName: u.full_name,
        createdAt: new Date(u.created_at).toISOString(),
        departmentId: u.department_id || null,
        departmentName: u.department_name || null,
      })),
    });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});

app.put("/api/users/:id", requireAnyRole(["admin", "manager", "superadmin"]), async (req, res) => {
  try {
    const id = String(req.params.id || "").trim();
    if (!id) return res.status(400).json({ error: "Missing id." });

    const username = String(req.body?.username || "").trim();
    const fullName = String(req.body?.fullName || "").trim();
    const password = String(req.body?.password || "").trim();

    if (!username || !fullName) return res.status(400).json({ error: "Plotëso fullName, username." });

    const [curRows] = await pool.query(`SELECT role, department_id FROM users WHERE id=:id LIMIT 1`, { id });
    if (!curRows.length) return res.status(404).json({ error: "Not found" });

    const curRole = normRole(curRows[0].role);
    const curDep = curRows[0].department_id || null;

    if (curRole === "admin" || curRole === "superadmin") {
      return res.status(403).json({ error: "Nuk lejohet edit i admin/superadmin këtu." });
    }

    if (req.user.role === "manager") {
      if (curRole !== "user") return res.status(403).json({ error: "Forbidden" });
      if ((req.user.departmentId || null) !== (curDep || null)) return res.status(403).json({ error: "Forbidden" });

      const [dup] = await pool.query(
        `SELECT 1 FROM users WHERE LOWER(username)=LOWER(:username) AND id <> :id LIMIT 1`,
        { username, id }
      );
      if (dup.length) return res.status(409).json({ error: "Username ekziston." });

      if (password && password.length < 6) return res.status(400).json({ error: "Password shumë i shkurtër (min 6)." });

      if (password) {
        const passwordHash = await bcrypt.hash(password, 10);
        await pool.query(
          `
          UPDATE users
          SET username=:username,
              full_name=:fullName,
              password_hash=:passwordHash
          WHERE id=:id AND role='user'
          `,
          { id, username, fullName, passwordHash }
        );
      } else {
        await pool.query(
          `
          UPDATE users
          SET username=:username,
              full_name=:fullName
          WHERE id=:id AND role='user'
          `,
          { id, username, fullName }
        );
      }

      return res.json({ ok: true });
    }

    const roleRaw = req.body?.role ? String(req.body.role).trim() : null;
    const nextRole = roleRaw === "manager" || roleRaw === "user" ? roleRaw : null;

    const departmentIdRaw = req.body?.departmentId;
    const departmentId =
      departmentIdRaw === undefined ? undefined : departmentIdRaw === null ? null : String(departmentIdRaw).trim();

    const finalRole = nextRole || curRole;
    const finalDepartmentId = departmentId === undefined ? curDep : departmentId;

    if ((finalRole === "user" || finalRole === "manager") && !finalDepartmentId) {
      return res.status(400).json({ error: "Zgjidh department." });
    }

    if (finalDepartmentId) {
      const [depExists] = await pool.query(`SELECT 1 FROM departments WHERE id=:id LIMIT 1`, { id: finalDepartmentId });
      if (!depExists.length) return res.status(400).json({ error: "Department i pavlefshëm." });
    }

    const [dup] = await pool.query(
      `SELECT 1 FROM users WHERE LOWER(username)=LOWER(:username) AND id <> :id LIMIT 1`,
      { username, id }
    );
    if (dup.length) return res.status(409).json({ error: "Username ekziston." });

    if (password && password.length < 6) return res.status(400).json({ error: "Password shumë i shkurtër (min 6)." });

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      await pool.query(
        `
        UPDATE users
        SET username=:username,
            full_name=:fullName,
            password_hash=:passwordHash,
            role=:role,
            department_id=:departmentId
        WHERE id=:id AND role IN ('user','manager')
        `,
        { id, username, fullName, passwordHash, role: finalRole, departmentId: finalDepartmentId }
      );
    } else {
      await pool.query(
        `
        UPDATE users
        SET username=:username,
            full_name=:fullName,
            role=:role,
            department_id=:departmentId
        WHERE id=:id AND role IN ('user','manager')
        `,
        { id, username, fullName, role: finalRole, departmentId: finalDepartmentId }
      );
    }

    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});

app.delete("/api/users/:id", requireAnyRole(["admin", "manager", "superadmin"]), async (req, res) => {
  try {
    const id = String(req.params.id || "").trim();
    if (!id) return res.status(400).json({ error: "Missing id." });

    if (req.user.role === "manager") {
      const [rows] = await pool.query(`SELECT role, department_id FROM users WHERE id=:id LIMIT 1`, { id });
      if (!rows.length) return res.status(404).json({ error: "Not found" });

      const r = rows[0];
      if (normRole(r.role) !== "user") return res.status(403).json({ error: "Forbidden" });
      if ((r.department_id || null) !== (req.user.departmentId || null)) {
        return res.status(403).json({ error: "Forbidden" });
      }

      await pool.query(`DELETE FROM users WHERE id=:id AND role='user'`, { id });
      return res.json({ ok: true });
    }

    const [exists] = await pool.query(
      `SELECT 1 FROM users WHERE id = :id AND role IN ('user','manager') LIMIT 1`,
      { id }
    );
    if (!exists.length) return res.status(404).json({ error: "Not found" });

    await pool.query(`DELETE FROM users WHERE id=:id AND role IN ('user','manager')`, { id });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});

// ---- REPORTS ----
app.post("/api/reports", requireAnyRole(["user", "manager"]), async (req, res) => {
  try {
    const date = String(req.body?.date || "").trim(); // YYYY-MM-DD

    const reasonChoice = String(req.body?.reasonChoice || "").trim();
    const reasonText = String(req.body?.reasonText || "").trim();
    const raport = String(req.body?.raport || "").trim(); // ✅ NEW (optional)

    const timeOut = String(req.body?.timeOut || req.body?.timeLeft || "").trim(); // HH:MM
    const timeReturnRaw = req.body?.timeReturn;
    const timeReturn = timeReturnRaw === null || timeReturnRaw === undefined ? "" : String(timeReturnRaw).trim(); // HH:MM

    if (!reasonChoice || !date || !timeOut) {
      return res.status(400).json({ error: "Plotëso reasonChoice, date, timeOut." });
    }

    const id = uuid();

    await pool.query(
      `
      INSERT INTO reports (
        id, user_id, department_id,
        reason, reason_choice, reason_text, report_text,
        report_date, time_out, time_return, status
      )
      VALUES (
        :id, :userId, :departmentId,
        :reason, :reasonChoice, :reasonText, :reportText,
        :date, :timeOut, :timeReturn, 'submitted'
      )
      `,
      {
        id,
        userId: req.user.id,
        departmentId: req.user.departmentId || null,
        reason: reasonChoice,
        reasonChoice,
        reasonText,
        reportText: raport || null, // ✅ NEW
        date,
        timeOut,
        timeReturn: timeReturn || null,
      }
    );

    return res.status(201).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});

app.get("/api/reports", requireAuth(), async (req, res) => {
  try {
    const role = req.user.role;

    let sql = "";
    let params = {};

    const baseSelect = `
        SELECT r.id, r.user_id, u.full_name, u.username, u.role as user_role,
               r.department_id, d.name AS department_name,
               r.reason,
               r.reason_choice,
               r.reason_text,
               r.report_text,
               DATE_FORMAT(r.report_date, '%Y-%m-%d') AS report_date,
               TIME_FORMAT(r.time_out, '%H:%i') AS time_out,
               TIME_FORMAT(r.time_return, '%H:%i') AS time_return,
               r.status, r.created_at, r.reviewed_at, r.reviewed_by
        FROM reports r
        JOIN users u ON u.id = r.user_id
        LEFT JOIN departments d ON d.id = r.department_id
    `;

    // ✅ superadmin sillet si admin (sheh krejt)
    if (role === "admin" || role === "superadmin") {
      sql = `
        ${baseSelect}
        ORDER BY r.created_at DESC
      `;
    } else if (role === "manager") {
      sql = `
        ${baseSelect}
        WHERE r.department_id = :departmentId
        ORDER BY r.created_at DESC
      `;
      params = { departmentId: req.user.departmentId || "__none__" };
    } else {
      sql = `
        ${baseSelect}
        WHERE r.user_id = :userId
        ORDER BY r.created_at DESC
      `;
      params = { userId: req.user.id };
    }

    const [rows] = await pool.query(sql, params);

    return res.json({
      reports: rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        fullName: r.full_name,
        username: r.username,
        userRole: normRole(r.user_role),
        departmentId: r.department_id || null,
        departmentName: r.department_name || null,

        reason: r.reason,
        reasonChoice: r.reason_choice || r.reason || null,
        reasonText: r.reason_text || null,
        raport: r.report_text || null, // ✅ NEW

        date: r.report_date,

        timeOut: r.time_out,
        timeReturn: r.time_return,

        status: r.status,
        createdAt: new Date(r.created_at).toISOString(),
        reviewedAt: r.reviewed_at ? new Date(r.reviewed_at).toISOString() : null,
        reviewedBy: r.reviewed_by,
      })),
    });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});


app.patch("/api/reports/:id/review", requireAnyRole(["admin", "manager", "superadmin"]), async (req, res) => {
  try {
    const id = String(req.params.id || "").trim();
    if (!id) return res.status(400).json({ error: "Missing id." });

    if (req.user.role === "manager") {
      const [ok] = await pool.query(`SELECT 1 FROM reports WHERE id=:id AND department_id=:dep LIMIT 1`, {
        id,
        dep: req.user.departmentId || "__none__",
      });
      if (!ok.length) return res.status(404).json({ error: "Not found" });
    } else {
      const [exists] = await pool.query(`SELECT 1 FROM reports WHERE id=:id LIMIT 1`, { id });
      if (!exists.length) return res.status(404).json({ error: "Not found" });
    }

    await pool.query(`UPDATE reports SET status='reviewed', reviewed_at=NOW(), reviewed_by=:adminId WHERE id=:id`, {
      id,
      adminId: req.user.id,
    });

    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});

app.put("/api/reports/:id", requireAnyRole(["user", "manager"]), async (req, res) => {
  try {
    const id = String(req.params.id || "").trim();
    if (!id) return res.status(400).json({ error: "Missing id." });

    const date = String(req.body?.date || "").trim(); // YYYY-MM-DD
    const reasonChoice = String(req.body?.reasonChoice || "").trim();
    const reasonText = String(req.body?.reasonText || "").trim();
    const raport = String(req.body?.raport || "").trim(); // ✅ NEW (optional)

    const timeOut = String(req.body?.timeOut || req.body?.timeLeft || "").trim(); // HH:MM

    const timeReturnRaw = req.body?.timeReturn;
    const timeReturn = timeReturnRaw === null || timeReturnRaw === undefined ? "" : String(timeReturnRaw).trim();

    if (!reasonChoice || !date || !timeOut) {
      return res.status(400).json({ error: "Plotëso reasonChoice, date, timeOut." });
    }

    const [own] = await pool.query(`SELECT status FROM reports WHERE id=:id AND user_id=:userId LIMIT 1`, {
      id,
      userId: req.user.id,
    });
    if (!own.length) return res.status(404).json({ error: "Not found" });

    if (String(own[0].status) !== "submitted") {
      return res.status(403).json({ error: "Nuk mund të ndryshohet pasi është shqyrtuar." });
    }

    await pool.query(
      `
      UPDATE reports
      SET reason=:reason,
          reason_choice=:reasonChoice,
          reason_text=:reasonText,
          report_text=:reportText,
          report_date=:date,
          time_out=:timeOut,
          time_return=:timeReturn
      WHERE id=:id AND user_id=:userId AND status='submitted'
      `,
      {
        id,
        userId: req.user.id,
        reason: reasonChoice,
        reasonChoice,
        reasonText,
        reportText: raport || null, // ✅ NEW
        date,
        timeOut,
        timeReturn: timeReturn || null,
      }
    );

    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});
app.get("/api/health", async (_, res) => {
  return res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`API: http://localhost:${PORT}`);
  console.log(`CORS_ORIGIN: ${CORS_ORIGIN}`);
});
