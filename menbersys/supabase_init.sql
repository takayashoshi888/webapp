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