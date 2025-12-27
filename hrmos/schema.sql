CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT,
  email TEXT UNIQUE,
  password_hash TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS tokens (
  token TEXT PRIMARY KEY,
  user_id TEXT,
  created_at TEXT,
  expires_at TEXT
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  record_date TEXT,
  employee_name TEXT,
  employee_count INTEGER,
  site_name TEXT,
  room_type TEXT,
  room_number TEXT,
  parking_fee REAL,
  highway_fee REAL,
  created_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_records_user ON attendance_records(user_id);
CREATE INDEX IF NOT EXISTS idx_records_date ON attendance_records(record_date);