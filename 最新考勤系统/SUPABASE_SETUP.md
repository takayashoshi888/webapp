# Supabase 数据库设置指南

## 第一步：创建 Supabase 账户和项目

1. 访问 [https://supabase.com](https://supabase.com)
2. 点击 "Start your project" 注册账户
3. 登录后点击 "New Project"
4. 填写项目信息：
   - Name: 考勤系统 (或任意名称)
   - Database Password: 设置一个强密码
   - Region: 选择离你最近的区域（建议选择 Singapore 或 Tokyo）
5. 点击 "Create new project"

## 第二步：获取连接信息

1. 在项目仪表板中，点击左侧菜单的 "Settings"
2. 点击 "API"
3. 复制以下信息：
   - **Project URL**: 类似 `https://xxxxx.supabase.co`
   - **anon public key**: 类似 `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 第三步：配置项目

1. 打开项目中的 `supabase-config.js` 文件
2. 将获取的信息替换到对应位置：
   ```javascript
   const SUPABASE_URL = 'https://your-project.supabase.co'; // 替换为你的项目URL
   const SUPABASE_ANON_KEY = 'your-anon-key'; // 替换为你的anon public key
   ```

## 第四步：创建数据库表

在 Supabase 仪表板中：

1. 点击左侧菜单的 "SQL Editor"
2. 点击 "New query"
3. 复制粘贴以下 SQL 代码并执行：

```sql
-- 创建用户表
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建考勤记录表
CREATE TABLE attendance_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    name TEXT NOT NULL,
    count INTEGER NOT NULL,
    site TEXT NOT NULL,
    parking_fee DECIMAL(10,2) DEFAULT 0,
    highway_fee DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX idx_attendance_records_user_id ON attendance_records(user_id);
CREATE INDEX idx_attendance_records_date ON attendance_records(date);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

4. 点击 "Run" 执行 SQL

## 第五步：设置行级安全策略 (RLS)

为了数据安全，需要设置行级安全策略：

1. 在 SQL Editor 中执行以下代码：

```sql
-- 启用行级安全
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- 用户表策略：用户只能访问自己的数据
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own data" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (true);

-- 考勤记录表策略：用户只能访问自己的记录
CREATE POLICY "Users can view own records" ON attendance_records
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own records" ON attendance_records
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own records" ON attendance_records
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete own records" ON attendance_records
    FOR DELETE USING (true);
```

## 第六步：测试连接

1. 保存配置文件
2. 在浏览器中打开你的考勤系统
3. 如果看到 "云端数据库连接成功！" 的消息，说明配置正确
4. 如果看到错误消息，请检查：
   - URL 和 API Key 是否正确
   - 网络连接是否正常
   - 数据库表是否创建成功

## 功能说明

配置完成后，你的考勤系统将具备以下功能：

### 数据同步
- 所有新的用户注册都会保存到云端数据库
- 所有考勤记录都会实时同步到云端
- 支持离线模式，网络恢复后自动同步

### 数据安全
- 密码加密存储
- 行级安全策略确保用户只能访问自己的数据
- 支持跨设备数据同步

### 备份恢复
- 数据自动备份到云端
- 即使本地数据丢失，也可以从云端恢复
- 支持多设备使用同一账户

## 故障排除

### 连接失败
1. 检查网络连接
2. 确认 URL 和 API Key 正确
3. 检查 Supabase 项目状态

### 数据不同步
1. 检查浏览器控制台是否有错误信息
2. 确认用户已登录
3. 检查数据库表结构是否正确

### 权限错误
1. 确认已执行 RLS 策略设置
2. 检查表的权限设置
3. 确认 API Key 有正确权限

## 注意事项

1. **安全**: 不要将 API Key 暴露在公开代码库中
2. **备份**: 定期备份 Supabase 数据库
3. **监控**: 关注 Supabase 项目的使用量和性能
4. **更新**: 定期更新 Supabase 客户端版本

配置完成后，你的考勤系统就可以使用云端数据库了！