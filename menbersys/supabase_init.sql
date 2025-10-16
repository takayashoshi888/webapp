-- TKY出勤管理系统 Supabase 数据库结构初始化脚本

-- 删除现有表（如果存在）
DROP TABLE IF EXISTS attendance_records;
DROP TABLE IF EXISTS members;
DROP TABLE IF EXISTS sites;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS admins;

-- 管理员表
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 团队表
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 成员表
CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(255),
    team_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
);

-- 现场表
CREATE TABLE sites (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 出勤记录表
CREATE TABLE attendance_records (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    member_id INTEGER NOT NULL,
    site_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    parking_fee INTEGER DEFAULT 0,
    highway_fee INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- 插入初始数据
INSERT INTO admins (username, password) VALUES ('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'); -- password: admin123

INSERT INTO teams (name) VALUES ('チームA'), ('チームB'), ('チームC');

INSERT INTO sites (name) VALUES ('東京サイト'), ('大阪サイト'), ('名古屋サイト'), ('渋谷サイト');

INSERT INTO members (name, username, password, team_id) VALUES 
('山田太郎', 'user1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1), -- password: password1
('佐藤花子', 'user2', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2); -- password: password2

-- 添加索引提高查询性能
CREATE INDEX IF NOT EXISTS idx_members_username ON members(username);
CREATE INDEX IF NOT EXISTS idx_members_team_id ON members(team_id);
CREATE INDEX IF NOT EXISTS idx_attendance_member_id ON attendance_records(member_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_attendance_site_id ON attendance_records(site_id);
CREATE INDEX IF NOT EXISTS idx_attendance_team_id ON attendance_records(team_id);

-- 添加视图以便于数据同步
CREATE OR REPLACE VIEW member_details AS
SELECT 
    m.id,
    m.name,
    m.username,
    m.password,
    t.name as team_name,
    t.id as team_id
FROM members m
LEFT JOIN teams t ON m.team_id = t.id;

CREATE OR REPLACE VIEW attendance_details AS
SELECT 
    ar.id,
    ar.date,
    m.name as member_name,
    m.id as member_id,
    s.name as site_name,
    s.id as site_id,
    t.name as team_name,
    t.id as team_id,
    ar.parking_fee,
    ar.highway_fee,
    ar.created_at
FROM attendance_records ar
LEFT JOIN members m ON ar.member_id = m.id
LEFT JOIN sites s ON ar.site_id = s.id
LEFT JOIN teams t ON ar.team_id = t.id;