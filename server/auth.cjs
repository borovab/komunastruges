// server/auth.cjs
const crypto = require("node:crypto");

function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex");
}

function getBearerToken(req) {
  const h = req.headers.authorization || "";
  return h.startsWith("Bearer ") ? h.slice(7) : null;
}

function daysToMs(days) {
  return Number(days) * 24 * 60 * 60 * 1000;
}

module.exports = { uuid, getBearerToken, daysToMs };
