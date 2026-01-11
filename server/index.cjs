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
const allowedOrigins = CORS_ORIGIN.split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // lejo request-e pa Origin (p.sh. curl/postman)
      if (!origin) return cb(null, true);

      // lejo çdo origin nga lista
      if (allowedOrigins.includes(origin)) return cb(null, true);

      return cb(new Error("CORS blocked: " + origin));
    },
    credentials: false,
  })
);

// ---- Helpers ----
async function getAuthUser(req) {
  const token = getBearerToken(req);
  if (!token) return null;

  const [rows] = await pool.query(
    `
    SELECT u.id, u.username, u.role, u.full_name
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = :token AND s.expires_at > NOW()
    LIMIT 1
    `,
    { token }
  );

  const u = rows?.[0];
  if (!u) return null;

  return { id: u.id, username: u.username, role: u.role, fullName: u.full_name };
}

function requireAuth(role) {
  return async (req, res, next) => {
    try {
      const me = await getAuthUser(req);
      if (!me) return res.status(401).json({ error: "Unauthorized" });
      if (role && me.role !== role) return res.status(403).json({ error: "Forbidden" });
      req.user = me;
      next();
    } catch (e) {
      return res.status(500).json({ error: e?.message || "Server error" });
    }
  };
}

// Cleanup expired sessions occasionally (cheap)
async function cleanupSessions() {
  try {
    await pool.query(`DELETE FROM sessions WHERE expires_at <= NOW()`);
  } catch {
    // ignore
  }
}

// ---- AUTH ----
app.post("/api/auth/login", async (req, res) => {
  try {
    await cleanupSessions();

    const username = String(req.body?.username || "").trim();
    const password = String(req.body?.password || "").trim();
    if (!username || !password) return res.status(400).json({ error: "Missing username/password" });

    const [rows] = await pool.query(
      `SELECT id, username, role, full_name, password_hash FROM users WHERE username = :username LIMIT 1`,
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
      user: { id: u.id, username: u.username, role: u.role, fullName: u.full_name },
    });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});
// ---- PROFILE (me) ----
app.get("/api/profile", requireAuth(), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, username, role, full_name, created_at FROM users WHERE id=:id LIMIT 1`,
      { id: req.user.id }
    );

    const u = rows?.[0];
    if (!u) return res.status(404).json({ error: "Not found" });

    return res.json({
      user: {
        id: u.id,
        username: u.username,
        role: u.role,
        fullName: u.full_name,
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
    const password = String(req.body?.password || "").trim(); // opsional

    if (!fullName) return res.status(400).json({ error: "Plotëso fullName." });
    if (password && password.length < 6) {
      return res.status(400).json({ error: "Password shumë i shkurtër (min 6)." });
    }

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      await pool.query(
        `UPDATE users SET full_name=:fullName, password_hash=:passwordHash, updated_at=NOW() WHERE id=:id`,
        { id: req.user.id, fullName, passwordHash }
      );
    } else {
      await pool.query(
        `UPDATE users SET full_name=:fullName, updated_at=NOW() WHERE id=:id`,
        { id: req.user.id, fullName }
      );
    }

    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});


app.post("/api/auth/logout", async (req, res) => {
  try {
    const token = getBearerToken(req);
    if (token) {
      await pool.query(`DELETE FROM sessions WHERE token = :token`, { token });
    }
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});

app.get("/api/auth/me", requireAuth(), async (req, res) => {
  return res.json({ user: req.user });
});

// ---- USERS (admin) ----
app.post("/api/users", requireAuth("admin"), async (req, res) => {
  try {
    const username = String(req.body?.username || "").trim();
    const password = String(req.body?.password || "").trim();
    const fullName = String(req.body?.fullName || "").trim();
    const role = req.body?.role === "admin" ? "admin" : "user";

    if (!username || !password || !fullName) {
      return res.status(400).json({ error: "Plotëso fullName, username, password." });
    }

    const [exists] = await pool.query(
      `SELECT 1 FROM users WHERE LOWER(username)=LOWER(:username) LIMIT 1`,
      { username }
    );
    if (exists.length) return res.status(409).json({ error: "Username ekziston." });

    const id = uuid();
    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      `
      INSERT INTO users (id, username, password_hash, role, full_name)
      VALUES (:id, :username, :passwordHash, :role, :fullName)
      `,
      { id, username, passwordHash, role, fullName }
    );

    return res.status(201).json({ user: { id, username, role, fullName } });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});

app.get("/api/users", requireAuth("admin"), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT id, username, role, full_name, created_at
      FROM users
      ORDER BY created_at DESC
      `
    );

    return res.json({
      users: rows.map((u) => ({
        id: u.id,
        username: u.username,
        role: u.role,
        fullName: u.full_name,
        createdAt: new Date(u.created_at).toISOString(),
      })),
    });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});

app.put("/api/users/:id", requireAuth("admin"), async (req, res) => {
  try {
    const id = String(req.params.id || "").trim();
    const username = String(req.body?.username || "").trim();
    const fullName = String(req.body?.fullName || "").trim();
    const password = String(req.body?.password || "").trim();

    if (!id) return res.status(400).json({ error: "Missing id." });
    if (!username || !fullName) return res.status(400).json({ error: "Plotëso fullName, username." });

    const [exists] = await pool.query(
      `SELECT 1 FROM users WHERE id = :id AND role='user' LIMIT 1`,
      { id }
    );
    if (!exists.length) return res.status(404).json({ error: "Not found" });

    const [dup] = await pool.query(
      `SELECT 1 FROM users WHERE LOWER(username)=LOWER(:username) AND id <> :id LIMIT 1`,
      { username, id }
    );
    if (dup.length) return res.status(409).json({ error: "Username ekziston." });

    if (password && password.length < 6) {
      return res.status(400).json({ error: "Password shumë i shkurtër (min 6)." });
    }

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      await pool.query(
        `
        UPDATE users
        SET username=:username, full_name=:fullName, password_hash=:passwordHash, updated_at=NOW()
        WHERE id=:id AND role='user'
        `,
        { id, username, fullName, passwordHash }
      );
    } else {
      await pool.query(
        `
        UPDATE users
        SET username=:username, full_name=:fullName, updated_at=NOW()
        WHERE id=:id AND role='user'
        `,
        { id, username, fullName }
      );
    }

    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});

app.delete("/api/users/:id", requireAuth("admin"), async (req, res) => {
  try {
    const id = String(req.params.id || "").trim();
    if (!id) return res.status(400).json({ error: "Missing id." });

    const [exists] = await pool.query(
      `SELECT 1 FROM users WHERE id = :id AND role='user' LIMIT 1`,
      { id }
    );
    if (!exists.length) return res.status(404).json({ error: "Not found" });

    await pool.query(`DELETE FROM users WHERE id=:id AND role='user'`, { id });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});

// ---- REPORTS ----
app.post("/api/reports", requireAuth("user"), async (req, res) => {
  try {
    const department = String(req.body?.department || "").trim() || null;
    const reason = String(req.body?.reason || "").trim();
    const date = String(req.body?.date || "").trim(); // YYYY-MM-DD
    const timeLeft = String(req.body?.timeLeft || "").trim(); // HH:MM

    if (!reason || !date || !timeLeft) {
      return res.status(400).json({ error: "Plotëso reason, date, timeLeft." });
    }

    const id = uuid();

    await pool.query(
      `
      INSERT INTO reports (id, user_id, department, reason, report_date, time_left, status)
      VALUES (:id, :userId, :department, :reason, :date, :timeLeft, 'submitted')
      `,
      { id, userId: req.user.id, department, reason, date, timeLeft }
    );

    return res.status(201).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});

app.get("/api/reports", requireAuth(), async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";

    const sql = isAdmin
      ? `
        SELECT r.id, r.user_id, u.full_name, r.department, r.reason,
               DATE_FORMAT(r.report_date, '%Y-%m-%d') AS report_date,
               TIME_FORMAT(r.time_left, '%H:%i') AS time_left,
               r.status, r.created_at, r.reviewed_at, r.reviewed_by
        FROM reports r
        JOIN users u ON u.id = r.user_id
        ORDER BY r.created_at DESC
      `
      : `
        SELECT r.id, r.user_id, u.full_name, r.department, r.reason,
               DATE_FORMAT(r.report_date, '%Y-%m-%d') AS report_date,
               TIME_FORMAT(r.time_left, '%H:%i') AS time_left,
               r.status, r.created_at, r.reviewed_at, r.reviewed_by
        FROM reports r
        JOIN users u ON u.id = r.user_id
        WHERE r.user_id = :userId
        ORDER BY r.created_at DESC
      `;

    const [rows] = isAdmin ? await pool.query(sql) : await pool.query(sql, { userId: req.user.id });

    return res.json({
      reports: rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        fullName: r.full_name,
        department: r.department,
        reason: r.reason,
        date: r.report_date,
        timeLeft: r.time_left,
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

app.put("/api/reports/:id", requireAuth("admin"), async (req, res) => {
  try {
    const id = String(req.params.id || "").trim();
    if (!id) return res.status(400).json({ error: "Missing id." });

    const department = String(req.body?.department || "").trim() || null;
    const reason = String(req.body?.reason || "").trim();
    const date = String(req.body?.date || "").trim(); // YYYY-MM-DD
    const timeLeft = String(req.body?.timeLeft || "").trim(); // HH:MM
    const statusRaw = req.body?.status;
    const status = statusRaw ? String(statusRaw).trim() : null;

    if (!reason || !date || !timeLeft) {
      return res.status(400).json({ error: "Plotëso reason, date, timeLeft." });
    }

    if (status && status !== "submitted" && status !== "reviewed") {
      return res.status(400).json({ error: "Status i pavlefshëm." });
    }

    const [exists] = await pool.query(`SELECT 1 FROM reports WHERE id = :id LIMIT 1`, { id });
    if (!exists.length) return res.status(404).json({ error: "Not found" });

    if (!status) {
      await pool.query(
        `
        UPDATE reports
        SET department=:department, reason=:reason, report_date=:date, time_left=:timeLeft
        WHERE id=:id
        `,
        { id, department, reason, date, timeLeft }
      );
    } else {
      await pool.query(
        `
        UPDATE reports
        SET department=:department,
            reason=:reason,
            report_date=:date,
            time_left=:timeLeft,
            status=:status,
            reviewed_at = CASE WHEN :status='reviewed' THEN NOW() ELSE NULL END,
            reviewed_by = CASE WHEN :status='reviewed' THEN :adminId ELSE NULL END
        WHERE id=:id
        `,
        { id, department, reason, date, timeLeft, status, adminId: req.user.id }
      );
    }

    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});

app.delete("/api/reports/:id", requireAuth("admin"), async (req, res) => {
  try {
    const id = String(req.params.id || "").trim();
    if (!id) return res.status(400).json({ error: "Missing id." });

    const [exists] = await pool.query(`SELECT 1 FROM reports WHERE id = :id LIMIT 1`, { id });
    if (!exists.length) return res.status(404).json({ error: "Not found" });

    await pool.query(`DELETE FROM reports WHERE id=:id`, { id });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});

app.patch("/api/reports/:id/review", requireAuth("admin"), async (req, res) => {
  try {
    const id = req.params.id;

    const [exists] = await pool.query(`SELECT 1 FROM reports WHERE id = :id LIMIT 1`, { id });
    if (!exists.length) return res.status(404).json({ error: "Not found" });

    await pool.query(
      `UPDATE reports SET status='reviewed', reviewed_at=NOW(), reviewed_by=:adminId WHERE id=:id`,
      { id, adminId: req.user.id }
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
