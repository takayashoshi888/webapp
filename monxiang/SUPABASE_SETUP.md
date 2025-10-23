# Supabase 配置指南

## 🚨 重要提示

当前应用遇到了Supabase配置错误。请按照以下步骤配置Supabase以启用完整功能。

## 📋 配置步骤

### 1. 创建Supabase项目

1. 访问 [supabase.com](https://supabase.com)
2. 注册账号并登录
3. 点击 "New Project"
4. 填写项目信息：
   - **Name**: 梦想管理
   - **Database Password**: 设置安全密码
   - **Region**: 选择离你最近的区域（如ap-southeast-1）
5. 点击 "Create new project"

### 2. 获取配置信息

项目创建完成后，进入项目设置：
1. 点击左侧菜单 "Settings"
2. 选择 "API" 标签页
3. 复制以下信息：
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`

### 3. 配置数据库

1. 进入左侧菜单 "SQL Editor"
2. 点击 "New query"
3. 复制 `supabase/schema.sql` 文件中的全部内容
4. 粘贴到SQL编辑器中
5. 点击 "Run" 执行SQL脚本
6. 验证所有表创建成功

### 4. 配置文件存储

1. 进入左侧菜单 "Storage"
2. 点击 "New Bucket"
3. 填写信息：
   - **Name**: `files`
   - **Public**: 开启（允许公开访问）
4. 点击 "Create bucket"

### 5. 配置环境变量

在项目根目录创建 `.env.local` 文件：

```env
# Supabase配置
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 应用配置
VITE_APP_NAME=梦想管理
```

**注意**: 将上面的URL和Key替换为你的实际配置。

## 🔧 验证配置

配置完成后：

1. 重启开发服务器：
   ```bash
   npm run dev
   ```

2. 打开浏览器访问 `http://localhost:3000`

3. 测试功能：
   - 注册新用户
   - 创建待办事项
   - 测试文件上传

## 🆘 故障排除

### 常见问题

#### 1. "supabaseUrl is required" 错误
- **原因**: 环境变量未正确配置
- **解决**: 检查 `.env.local` 文件是否存在且配置正确

#### 2. 数据库连接失败
- **原因**: SQL脚本执行失败
- **解决**: 重新执行 `supabase/schema.sql` 中的SQL脚本

#### 3. 文件上传失败
- **原因**: 存储桶未正确配置
- **解决**: 检查Storage中的 `files` 存储桶是否存在且为公开

#### 4. 认证失败
- **原因**: 认证策略未生效
- **解决**: 确保SQL脚本中的行级安全策略已执行

### 调试技巧

1. **检查控制台**: 打开浏览器开发者工具查看错误信息
2. **验证环境变量**: 确保变量名拼写正确
3. **检查网络**: 确保可以访问Supabase服务
4. **查看日志**: 在Supabase仪表板的Logs中查看错误日志

## 📞 获取帮助

如果遇到问题：

1. **Supabase文档**: [docs.supabase.com](https://docs.supabase.com)
2. **社区支持**: [Supabase Discord](https://discord.supabase.com)
3. **GitHub Issues**: 在项目仓库创建Issue

## 🎯 配置完成标志

当以下功能正常工作时，说明配置成功：

- ✅ 用户可以注册和登录
- ✅ 待办事项可以保存和加载
- ✅ 财务记录可以持久化
- ✅ 文件可以上传和下载
- ✅ 所有数据在刷新页面后仍然存在

---

**注意**: 在配置完成前，应用将以演示模式运行，数据不会持久化保存。