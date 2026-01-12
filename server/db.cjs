// server/db.cjs
const mysql = require("mysql2/promise");

function mustEnv(name, fallback) {
  const v = process.env[name] ?? fallback;
  if (v === undefined || v === null || v === "") {
    throw new Error(`Missing env: ${name}`);
  }
  return v;
}

function createPool() {
  const host = mustEnv("DB_HOST");
  const user = mustEnv("DB_USER");
  const password = process.env.DB_PASSWORD ?? "";
  const database = mustEnv("DB_NAME");
  const port = Number(process.env.DB_PORT || 3306);

  return mysql.createPool({
    host,
    user,
    password,
    database,
    port,
    connectionLimit: 10,
    namedPlaceholders: true,
  });
}

module.exports = { createPool };
