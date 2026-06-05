-- 创建 users 表
CREATE TABLE IF NOT EXISTS users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  username   TEXT NOT NULL UNIQUE,
  password   TEXT NOT NULL,                -- bcrypt hash
  role       TEXT NOT NULL DEFAULT 'user', -- admin / user
  is_active  INTEGER DEFAULT 1,
  created_at TEXT,
  updated_at TEXT,
  deleted_at TEXT
);

-- 第一个注册的用户自动成为 admin，后续注册为普通 user