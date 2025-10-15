# TKY出勤管理系统 Supabase 配置说明

## Supabase 项目信息

- **项目 URL**: https://xhqvbirifrdlmlnrwayp.supabase.co

## 文件结构

```
/
├── api/
│   ├── supabase_config.php      # Supabase 配置文件
│   ├── supabase_connection.php  # Supabase 连接类
│   ├── members_supabase.php     # 成员管理 API (Supabase 版本)
│   ├── teams_supabase.php       # 团队管理 API (Supabase 版本)
│   ├── sites_supabase.php       # 现场管理 API (Supabase 版本)
│   ├── attendance_supabase.php  # 出勤记录 API (Supabase 版本)
│   └── auth_supabase.php        # 认证 API (Supabase 版本)
├── js/
│   └── supabaseClient.js        # 前端 Supabase 客户端
├── .env                         # 环境变量配置文件
├── .env.example                 # 环境变量配置示例
├── config.js                    # Node.js 环境配置
├── package.json                 # 项目依赖配置
├── supabase_init.sql            # Supabase 数据库初始化脚本
└── SUPABASE_README.md           # 本说明文件
```

## 环境变量配置

为了安全地管理 Supabase API 密钥，项目使用环境变量来存储敏感信息。

### 配置步骤

1. 复制 `.env.example` 文件并重命名为 `.env`：
   ```bash
   cp .env.example .env
   ```

2. 在 `.env` 文件中填入实际的 Supabase API 密钥：
   ```
   SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhocXZiaXJpZnJkbG1sbnJ3YXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTYzNzQsImV4cCI6MjA3NjA5MjM3NH0.CFLPI0sTrO5CYezI2BZRPyaLFS_A7NdxBbZ08qpTlVc
   ```

### 前端使用

前端 JavaScript 客户端 (`js/supabaseClient.js`) 使用 `process.env.SUPABASE_KEY` 来获取 API 密钥：
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xhqvbirifrdlmlnrwayp.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)
```

## 数据库配置

### 1. 初始化数据库表

在 Supabase SQL 编辑器中运行 `supabase_init.sql` 文件中的脚本，创建所需的数据库表。

### 2. 表结构说明

- **admins**: 管理员账户表
- **teams**: 团队信息表
- **members**: 成员信息表
- **sites**: 现场信息表
- **attendance_records**: 出勤记录表

## API 接口说明

所有 API 接口都位于 `api/` 目录下，使用 Supabase 作为后端数据库。

### 认证接口 (auth_supabase.php)

- 管理员登录
- 用户登录
- 用户注册
- 修改管理员密码

### 成员管理接口 (members_supabase.php)

- 获取所有成员
- 添加成员
- 更新成员
- 删除成员

### 团队管理接口 (teams_supabase.php)

- 获取所有团队
- 添加团队
- 更新团队
- 删除团队

### 现场管理接口 (sites_supabase.php)

- 获取所有现场
- 添加现场
- 更新现场
- 删除现场

### 出勤记录接口 (attendance_supabase.php)

- 获取所有出勤记录
- 添加出勤记录
- 获取统计信息

## 前端集成

### 使用 Supabase JavaScript 客户端

项目包含一个预配置的 Supabase JavaScript 客户端 `js/supabaseClient.js`，可以直接在前端代码中使用：

```javascript
import supabase from './js/supabaseClient.js'

// 示例：获取所有团队
const { data, error } = await supabase
  .from('teams')
  .select('*')
```

### 迁移现有 API 调用

要使用 Supabase 版本的 API，需要修改前端 JavaScript 代码中的 API 调用地址，将原来的 `api/xxx.php` 改为 `api/xxx_supabase.php`。

例如：
```javascript
// 原来的调用
fetch('api/members.php?action=get_all')

// 改为 Supabase 版本
fetch('api/members_supabase.php?action=get_all')
```

## 安全建议

1. 在生产环境中，不要将 API 密钥暴露在前端代码中
2. 考虑使用 Supabase 的 Row Level Security (RLS) 来增强数据安全
3. 定期轮换 API 密钥
4. 使用 HTTPS 保护数据传输