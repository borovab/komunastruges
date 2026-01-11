require("dotenv").config();

const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

(async () => {
  const host = process.env.DB_HOST || "127.0.0.1";
  const port = Number(process.env.DB_PORT || 3306);
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD ?? "";
  const database = process.env.DB_NAME || "komuneraport";

  const conn = await mysql.createConnection({ host, port, user, password, database });

  try {
    const adminHash = await bcrypt.hash("admin123", 10);
    const userHash = await bcrypt.hash("user123", 10);

    await conn.query(`UPDATE users SET password_hash=? WHERE username='admin'`, [adminHash]);
    await conn.query(`UPDATE users SET password_hash=? WHERE username='user'`, [userHash]);

    console.log("✅ Reset OK:");
    console.log("admin / admin123");
    console.log("user  / user123");
  } finally {
    await conn.end();
  }
})().catch((e) => {
  console.error("❌ Failed:", e?.message || e);
  process.exit(1);
});
