# TKY出勤管理系统部署指南

## 部署到InfinityFree的步骤

### 1. 准备工作
1. 注册InfinityFree账户：https://infinityfree.net/
2. 在InfinityFree上创建一个新的账户和网站
3. 获取数据库信息（主机名、用户名、密码、数据库名）

### 2. 数据库设置
1. 登录InfinityFree的控制面板
2. 进入MySQL数据库管理页面
3. 创建一个新的数据库
4. 使用phpMyAdmin或其他工具导入 `database.sql` 文件

### 3. 文件上传
1. 使用FTP客户端（如FileZilla）连接到您的InfinityFree账户
2. 将以下文件上传到您的网站根目录：
   - 所有的HTML文件（index.html, admin.html, user-login.html, register.html等）
   - CSS文件（style.css等）
   - JavaScript文件（script.js等）
   - images文件夹（如果有）

3. 将 `api` 文件夹中的所有PHP文件上传到网站根目录下的 `api` 文件夹中

### 4. 配置文件修改
1. 编辑 `api/config.php` 文件，填入您的数据库连接信息：
   ```php
   define('DB_HOST', 'your_db_host');
   define('DB_USER', 'your_db_username');
   define('DB_PASS', 'your_db_password');
   define('DB_NAME', 'your_db_name');
   ```

### 5. 前端代码修改
由于需要修改大量前端JavaScript代码以使用后端API，建议按以下方式操作：

1. 修改所有HTML文件中的JavaScript代码，将localStorage操作替换为AJAX请求到后端API
2. 例如，在admin.html中，将renderMembersTable()函数修改为从后端获取数据：
   ```javascript
   function renderMembersTable() {
       fetch('api/members.php?action=get_all')
           .then(response => response.json())
           .then(data => {
               if (data.success) {
                   // 使用返回的数据渲染表格
               } else {
                   alert('获取成员数据失败: ' + data.message);
               }
           })
           .catch(error => {
               console.error('Error:', error);
               alert('网络错误');
           });
   }
   ```

### 6. 管理员密码设置
1. 默认管理员账户：
   - 用户名: admin
   - 密码: admin123
2. 首次登录后，请立即修改密码以确保安全

## 注意事项

1. InfinityFree对数据库连接有一些限制，请确保您的代码能正确处理连接错误
2. 由于是免费服务，可能会有一些性能限制
3. 建议定期备份您的数据库
4. 为了安全起见，请使用HTTPS（InfinityFree可能需要您启用）

## 故障排除

1. 如果遇到数据库连接错误，请检查config.php中的数据库配置信息
2. 如果页面无法加载，请检查文件路径是否正确
3. 如果API返回错误，请检查PHP错误日志