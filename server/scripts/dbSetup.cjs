// server/scripts/dbSetup.cjs
require("dotenv").config();

const fs = require("node:fs");
const path = require("node:path");
const mysql = require("mysql2/promise");

function splitSqlStatements(sql) {
  const out = [];
  let cur = "";

  let inSingle = false;
  let inDouble = false;
  let inBacktick = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    const next = sql[i + 1];

    // end line comment
    if (inLineComment) {
      cur += ch;
      if (ch === "\n") inLineComment = false;
      continue;
    }

    // end block comment
    if (inBlockComment) {
      cur += ch;
      if (ch === "*" && next === "/") {
        cur += next;
        i++;
        inBlockComment = false;
      }
      continue;
    }

    // start comments (only when NOT inside quotes)
    if (!inSingle && !inDouble && !inBacktick) {
      if (ch === "-" && next === "-") {
        inLineComment = true;
        cur += ch + next;
        i++;
        continue;
      }
      if (ch === "#") {
        inLineComment = true;
        cur += ch;
        continue;
      }
      if (ch === "/" && next === "*") {
        inBlockComment = true;
        cur += ch + next;
        i++;
        continue;
      }
    }

    // handle quotes
    if (!inDouble && !inBacktick && ch === "'" && !isEscaped(cur)) {
      inSingle = !inSingle;
      cur += ch;
      continue;
    }
    if (!inSingle && !inBacktick && ch === '"' && !isEscaped(cur)) {
      inDouble = !inDouble;
      cur += ch;
      continue;
    }
    if (!inSingle && !inDouble && ch === "`") {
      inBacktick = !inBacktick;
      cur += ch;
      continue;
    }

    // statement boundary
    if (!inSingle && !inDouble && !inBacktick && ch === ";") {
      const s = cur.trim();
      if (s) out.push(s);
      cur = "";
      continue;
    }

    cur += ch;
  }

  const last = cur.trim();
  if (last) out.push(last);

  return out;
}

function isEscaped(buffer) {
  // count trailing backslashes
  let bs = 0;
  for (let i = buffer.length - 1; i >= 0; i--) {
    if (buffer[i] === "\\") bs++;
    else break;
  }
  return bs % 2 === 1;
}

async function runSchemaImport() {
  const host = process.env.DB_HOST || "127.0.0.1";
  const port = Number(process.env.DB_PORT || 3306);
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD ?? "";
  const database = process.env.DB_NAME || "komuneraport";

  const schemaPath =
    process.env.SCHEMA_PATH || path.join(__dirname, "..", "..", "sql", "schema.sql");

  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found: ${schemaPath}`);
  }

  const rawSql = fs.readFileSync(schemaPath, "utf8");
  const statements = splitSqlStatements(rawSql);

  if (!statements.length) {
    throw new Error("Schema file is empty (no SQL statements found).");
  }

  // Connect WITHOUT selecting a database (so it works even if DB doesn't exist)
  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    charset: "utf8mb4",
    // IMPORTANT: we execute statements one-by-one, so no need for multipleStatements
    multipleStatements: false,
  });

  try {
    await conn.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await conn.query(`USE \`${database}\`;`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];

      try {
        await conn.query(stmt);
      } catch (e) {
        const preview = stmt.replace(/\s+/g, " ").slice(0, 220);
        const msg = e?.message || String(e);
        throw new Error(
          `Schema failed at statement #${i + 1}/${statements.length}: ${msg}\nSQL: ${preview}`
        );
      }
    }

    console.log("✅ DB schema imported successfully.");
    console.log(`Schema: ${schemaPath}`);
    console.log(`DB: ${user}@${host}:${port}/${database}`);
  } finally {
    await conn.end();
  }
}

module.exports = { runSchemaImport };

if (require.main === module) {
  runSchemaImport().catch((e) => {
    console.error("❌ DB setup failed:", e?.message || e);
    process.exit(1);
  });
}
