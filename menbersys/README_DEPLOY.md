# TKY出勤管理系统部署说明

## 项目概述
这是一个基于HTML、CSS和JavaScript的出勤管理系统，原始版本使用localStorage存储数据。本部署方案将数据存储迁移到Supabase数据库，并使用Supabase JavaScript客户端作为后端API。

## 目录结构
```
/
├── api/                      # 后端API文件（Supabase版本）
│   ├── supabase_config.php   # Supabase配置
│   ├── supabase_connection.php  # Supabase连接类
│   ├── members_supabase.php  # 成员管理API
│   ├── teams_supabase.php    # 团队管理API
│   ├── sites_supabase.php    # 现场管理API
│   ├── attendance_supabase.php  # 出勤记录API
│   └── auth_supabase.php     # 认证相关API
├── js/                       # 前端JavaScript文件
│   ├── supabaseClient.js     # Supabase客户端配置
│   └── supabaseClientCompat.js  # Supabase客户端兼容版本
├── .env                      # 环境变量配置文件
├── .env.example              # 环境变量配置示例
├── server.js                 # 本地开发服务器
├── package.json              # 项目依赖配置
├── supabase_init.sql         # Supabase数据库初始化脚本
├── index.html                # 主页面
├── admin-login.html          # 管理员登录页面
├── admin.html                # 管理员面板
├── user-login.html           # 用户登录页面
├── register.html             # 用户注册页面
├── user-data.html            # 用户数据页面
├── style.css                 # 样式文件
└── script.js                 # JavaScript文件
```

## 部署步骤

### 1. Supabase 数据库设置
1. 登录到 Supabase 控制台 (https://app.supabase.io/)
2. 创建一个新的项目
3. 在 SQL 编辑器中运行 `supabase_init.sql` 文件中的脚本创建数据库表结构

### 2. 环境变量配置
1. 复制 `.env.example` 文件并重命名为 `.env`：
   ```bash
   cp .env.example .env
   ```

2. 在 `.env` 文件中填入实际的 Supabase API 密钥：
   ```
   SUPABASE_KEY=your_supabase_key_here
   ```

### 3. 本地开发服务器设置
1. 安装依赖：
   ```bash
   npm install
   ```

2. 启动本地开发服务器：
   ```bash
   npm start
   ```

3. 在浏览器中访问 `http://localhost:3000`

### 4. 文件上传
将所有文件上传到您的Web服务器根目录，保持目录结构不变。

## Supabase 客户端使用说明

### 客户端配置
Supabase 客户端配置文件位于 `js/supabaseClient.js`，使用 ES 模块语法通过 CDN 导入 Supabase 库：

```javascript
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
```

### 在 HTML 中使用
确保在 HTML 文件中使用 `<script type="module">` 来加载脚本：

```html
<script type="module">
  import supabase from './js/supabaseClient.js'
  
  // 示例：获取数据
  const { data, error } = await supabase
    .from('teams')
    .select('*')
</script>
```

### 安全注意事项
1. 使用环境变量存储 Supabase 密钥
2. 只使用 `anon` 公钥，不要使用 `service_role` 密钥
3. 在生产环境中，考虑使用后端 API 来处理数据库操作

## API接口说明

### 认证接口
- `api/auth_supabase.php` - 处理管理员和用户登录

### 成员管理接口
- `api/members_supabase.php` - 获取、添加、更新、删除成员信息

### 团队管理接口
- `api/teams_supabase.php` - 获取、添加、更新、删除团队信息

### 现场管理接口
- `api/sites_supabase.php` - 获取、添加、更新、删除现场信息

### 出勤记录接口
- `api/attendance_supabase.php` - 获取、添加出勤记录和统计数据

## 安全建议

1. 修改默认管理员密码
2. 使用HTTPS保护数据传输
3. 定期备份数据库
4. 限制数据库用户权限
5. 验证所有用户输入
6. 不要在前端代码中硬编码API密钥

## 注意事项

1. 本系统需要 Node.js 环境来运行本地开发服务器
2. 确保服务器支持 ES6 模块导入
3. 在生产环境中，建议使用后端API来处理数据库操作，而不是直接从前端访问
4. 原始前端代码需要修改以使用新的 Supabase API
5. 不要直接用 `file://` 协议打开 HTML 文件，应使用本地服务器运行