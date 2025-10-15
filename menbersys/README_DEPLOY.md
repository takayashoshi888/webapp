# TKY出勤管理系统部署说明

## 项目概述
这是一个基于HTML、CSS和JavaScript的出勤管理系统，原始版本使用localStorage存储数据。本部署方案将数据存储迁移到MySQL数据库，并使用PHP作为后端API。

## 目录结构
```
/
├── api/                 # 后端API文件
│   ├── config.php      # 数据库配置
│   ├── auth.php        # 认证相关API
│   ├── members.php     # 成员管理API
│   ├── teams.php       # 团队管理API
│   ├── sites.php       # 现场管理API
│   └── attendance.php  # 出勤记录API
├── database.sql        # 数据库结构文件
├── index.html          # 主页面
├── admin-login.html    # 管理员登录页面
├── admin.html          # 管理员面板
├── user-login.html     # 用户登录页面
├── register.html       # 用户注册页面
├── user-data.html      # 用户数据页面
├── style.css           # 样式文件
└── script.js           # JavaScript文件
```

## 部署步骤

### 1. 数据库设置
1. 登录您的MySQL数据库管理界面
2. 执行 `database.sql` 文件创建数据库表结构
3. 确保数据库用户有足够的权限操作这些表

### 2. 配置文件修改
编辑 `api/config.php` 文件，填入您的数据库连接信息：
```php
define('DB_HOST', 'your_database_host');
define('DB_USER', 'your_database_username');
define('DB_PASS', 'your_database_password');
define('DB_NAME', 'your_database_name');
```

### 3. 文件上传
将所有文件上传到您的Web服务器根目录，保持目录结构不变。

### 4. 权限设置
确保API目录和其中的PHP文件有正确的执行权限。

## API接口说明

### 认证接口
- `api/auth.php` - 处理管理员和用户登录

### 成员管理接口
- `api/members.php` - 获取、添加、更新、删除成员信息

### 团队管理接口
- `api/teams.php` - 获取、添加、更新、删除团队信息

### 现场管理接口
- `api/sites.php` - 获取、添加、更新、删除现场信息

### 出勤记录接口
- `api/attendance.php` - 获取、添加出勤记录和统计数据

## 安全建议

1. 修改默认管理员密码
2. 使用HTTPS保护数据传输
3. 定期备份数据库
4. 限制数据库用户权限
5. 验证所有用户输入

## 注意事项

1. 本系统需要PHP 7.0或更高版本
2. 需要MySQL 5.6或更高版本
3. 确保服务器支持PDO MySQL扩展
4. 原始前端代码需要修改以使用后端API