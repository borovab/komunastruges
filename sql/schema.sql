-- Komuna Raportim (MySQL) - Schema
-- Importo këtë file në phpMyAdmin ose mysql client.

CREATE DATABASE IF NOT EXISTS komuneraport
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE komuneraport;

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','user') NOT NULL DEFAULT 'user',
  full_name VARCHAR(160) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_sessions_user (user_id),
  INDEX idx_sessions_expires (expires_at)
);

CREATE TABLE IF NOT EXISTS reports (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  department VARCHAR(160) NULL,
  reason TEXT NOT NULL,
  report_date DATE NOT NULL,
  time_left TIME NOT NULL,
  status ENUM('submitted','reviewed') NOT NULL DEFAULT 'submitted',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME NULL,
  reviewed_by CHAR(36) NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_reports_user (user_id),
  INDEX idx_reports_status (status),
  INDEX idx_reports_date (report_date)
);

-- Seed: admin/admin123 dhe user/user123
-- NOTE: këto janë hash të bcryptjs për password-at respektive.
INSERT IGNORE INTO users (id, username, password_hash, role, full_name)
VALUES
  ('u_admin', 'admin', '$2a$10$h0H4rWz7l7wXw0m0zO5c8eU8QnT0nQmH9pOe9yZtW6p0rBq1mRr6K', 'admin', 'Admin'),
  ('u_1', 'user',  '$2a$10$1z8qG2m3o3h6F7o7EoY5OOX1Vnq2qvKc8iC8Q0vNQG1v0TjJg5XnC', 'user',  'Punëtor 1');

-- Hash-at më sipër janë për: admin123 dhe user123.
-- Nëse don me ndryshu seed, mundesh edhe nga UI e Admin-it me kriju punëtorë të rinj.
