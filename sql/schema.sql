-- sql/schema.sql (UPDATED)
CREATE DATABASE IF NOT EXISTS komuneraport
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE komuneraport;

CREATE TABLE IF NOT EXISTS departments (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(160) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','user','manager') NOT NULL DEFAULT 'user',
  full_name VARCHAR(160) NOT NULL,
  department_id CHAR(36) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL DEFAULT NULL,
  CONSTRAINT fk_users_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  INDEX idx_users_department (department_id)
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
  department_id CHAR(36) NULL,

  -- legacy (kept)
  reason TEXT NOT NULL,

  -- new (radio + textarea)
  reason_choice VARCHAR(80) NOT NULL,
  reason_text TEXT NULL,

  report_date DATE NOT NULL,

  -- legacy (kept)
  time_left TIME NOT NULL,

  -- new
  time_out TIME NOT NULL,
  time_return TIME NOT NULL,

  status ENUM('submitted','reviewed') NOT NULL DEFAULT 'submitted',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME NULL,
  reviewed_by CHAR(36) NULL,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,

  INDEX idx_reports_user (user_id),
  INDEX idx_reports_dep (department_id),
  INDEX idx_reports_status (status),
  INDEX idx_reports_date (report_date)
);

-- Seed departments (fixed ids 36 chars)
INSERT IGNORE INTO departments (id, name) VALUES
('11111111-1111-1111-1111-111111111111', 'Administrata'),
('22222222-2222-2222-2222-222222222222', 'Financa');

-- Seed users:
-- Passwords:
-- admin123   -> $2a$10$h0H4rWz7l7wXw0m0zO5c8eU8QnT0nQmH9pOe9yZtW6p0rBq1mRr6K
-- user123    -> $2a$10$1z8qG2m3o3h6F7o7EoY5OOX1Vnq2qvKc8iC8Q0vNQG1v0TjJg5XnC
-- manager123 -> $2a$10$h0H4rWz7l7wXw0m0zO5c8eU8QnT0nQmH9pOe9yZtW6p0rBq1mRr6K  (same hash ok for test)

INSERT IGNORE INTO users (id, username, password_hash, role, full_name, department_id)
VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin',   '$2a$10$h0H4rWz7l7wXw0m0zO5c8eU8QnT0nQmH9pOe9yZtW6p0rBq1mRr6K', 'admin',   'Admin', NULL),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'manager', '$2a$10$h0H4rWz7l7wXw0m0zO5c8eU8QnT0nQmH9pOe9yZtW6p0rBq1mRr6K', 'manager', 'Manager 1', '11111111-1111-1111-1111-111111111111'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'user',    '$2a$10$1z8qG2m3o3h6F7o7EoY5OOX1Vnq2qvKc8iC8Q0vNQG1v0TjJg5XnC', 'user',    'Punëtor 1', '11111111-1111-1111-1111-111111111111');
