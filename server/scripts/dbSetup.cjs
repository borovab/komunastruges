// server/scripts/dbSetup.cjs
require("dotenv").config();

const fs = require("node:fs");
const path = require("node:path");
const mysql = require("mysql2/promise");

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

  const sql = fs.readFileSync(schemaPath, "utf8");

  // Connect WITHOUT selecting a database (so it works even if DB doesn't exist)
  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: true,
  });

  try {
    await conn.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await conn.query(`USE \`${database}\`;`);

    await conn.query(sql);

    console.log("✅ DB schema imported successfully.");
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
