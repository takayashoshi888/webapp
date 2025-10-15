# 环境变量设置说明

## 问题说明

在使用 Supabase 客户端时，我们遇到了两个主要问题：
1. 模块加载错误（由于浏览器对 file:// 协议的限制）
2. 安全问题（API 密钥硬编码在前端代码中）

## 解决方案

### 方案一：使用本地开发服务器（推荐）

1. 安装依赖：
   ```bash
   npm install
   ```

2. 启动服务器：
   ```bash
   npm start
   ```

3. 在浏览器中访问 `http://localhost:3000`

### 方案二：设置环境变量

1. 复制 `.env.example` 文件并重命名为 `.env`：
   ```bash
   cp .env.example .env
   ```

2. 在 `.env` 文件中填入实际的 Supabase API 密钥：
   ```
   SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhocXZiaXJpZnJkbG1sbnJ3YXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTYzNzQsImV4cCI6MjA3NjA5MjM3NH0.CFLPI0sTrO5CYezI2BZRPyaLFS_A7NdxBbZ08qpTlVc
   ```

### 方案三：使用兼容版本

对于不能使用本地服务器的情况，可以使用 `supabaseClientCompat.js` 文件，它通过 CDN 动态加载 Supabase 库，避免了模块导入问题。

## 生产环境注意事项

1. **永远不要在前端代码中硬编码敏感信息**
2. 在生产环境中，应该使用后端 API 来处理数据库操作
3. 考虑使用 Supabase 的 Row Level Security (RLS) 来增强数据安全
4. 定期轮换 API 密钥

## 测试连接

1. 使用本地服务器时，访问 `supabase_test.html`
2. 无法使用本地服务器时，访问 `supabase_test_compat.html`