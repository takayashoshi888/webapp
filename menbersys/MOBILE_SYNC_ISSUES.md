# 移动端数据库同步问题排查与解决方案

## 问题描述

数据库连接在PC端可以正常工作，但在移动端无法同步数据。

## 系统认证机制说明

本系统使用传统的用户名/密码认证机制，而非邮箱注册机制。用户可以通过以下方式登录：

1. 使用系统预设账户：
   - 用户名: user1, 密码: password1
   - 用户名: user2, 密码: password2

2. 通过注册页面创建新账户：
   - 访问 [register.html](file:///E:/项目集合/tky团队管理/register.html) 注册新用户
   - 注册信息将存储在本地localStorage中

3. 管理员在后台添加用户：
   - 管理员可以在 [admin.html](file:///E:/项目集合/tky团队管理/admin.html) 中添加新用户

## 用户数据同步机制说明

系统使用本地localStorage存储用户数据，这导致在不同设备间用户数据无法自动同步。为了解决这个问题，我们提供了用户数据同步功能：

1. **双向同步页面**：访问 [sync_users.html](file:///E:/项目集合/tky团队管理/sync_users.html) 可以手动同步用户数据
2. **同步脚本**：[sync_users_to_supabase.js](file:///E:/项目集合/tky团队管理/sync_users_to_supabase.js) 提供了编程接口用于数据同步

## 可能的原因及解决方案

### 1. 网络连接问题

**原因**: 移动设备可能无法访问Supabase服务器。

**解决方案**:
- 确保移动设备已连接到互联网
- 检查移动设备是否可以访问 `https://xhqvbirifrdlmlnrwayp.supabase.co`
- 尝试在移动设备浏览器中直接访问Supabase URL

### 2. CORS（跨域资源共享）限制

**原因**: Supabase可能未正确配置允许来自移动设备的请求。

**解决方案**:
1. 登录Supabase控制台
2. 进入项目设置
3. 在"API"部分检查"Additional URLs"设置
4. 添加移动应用的域名或IP地址

### 3. 移动浏览器兼容性问题

**原因**: 移动浏览器可能不支持某些JavaScript特性。

**解决方案**:
- 使用兼容版本的Supabase客户端 ([supabaseClientCompat.js](file:///E:/项目集合/tky团队管理/js/supabaseClientCompat.js))
- 确保使用 `<script type="module">` 标签
- 测试不同移动浏览器的表现

### 4. SSL/TLS证书问题

**原因**: 移动设备可能不信任Supabase的SSL证书。

**解决方案**:
- 确保使用的是有效的SSL证书
- 在移动设备上手动信任证书（如果需要）

### 5. 防火墙或代理设置

**原因**: 移动网络或公司网络的防火墙可能阻止了连接。

**解决方案**:
- 检查网络设置
- 尝试使用不同的网络连接（如切换到移动数据）

### 6. 认证会话问题

**原因**: 移动端可能无法正确维护认证会话。

**解决方案**:
- 使用[mobile_login.html](file:///E:/项目集合/tky团队管理/mobile_login.html)测试登录功能
- 确保正确处理认证令牌
- 检查浏览器是否阻止了第三方Cookie

### 7. 用户数据未同步

**原因**: 用户数据存储在本地localStorage中，不同设备间无法自动同步。

**解决方案**:
- 访问 [sync_users.html](file:///E:/项目集合/tky团队管理/sync_users.html) 手动同步用户数据
- 在每个设备上执行同步操作以确保数据一致性

## 测试步骤

### 1. 使用移动端测试页面

打开 [mobile_test.html](file:///E:/项目集合/tky团队管理/mobile_test.html) 文件，在移动设备浏览器中测试连接：

1. 点击"测试 Supabase 连接"按钮
2. 观察是否能成功获取数据
3. 查看控制台是否有错误信息

### 2. 测试认证功能

打开 [mobile_login.html](file:///E:/项目集合/tky团队管理/mobile_login.html) 文件，在移动设备浏览器中测试认证：

1. 输入测试用户名和密码（如 user1/password1）
2. 点击"登录"验证登录功能
3. 点击"获取当前用户"检查会话状态

### 3. 注册新用户

打开 [register.html](file:///E:/项目集合/tky团队管理/register.html) 文件，在移动设备浏览器中注册新用户：

1. 填写注册表单
2. 提交注册信息
3. 使用新注册的账户在[mobile_login.html](file:///E:/项目集合/tky团队管理/mobile_login.html)中登录

### 4. 同步用户数据

打开 [sync_users.html](file:///E:/项目集合/tky团队管理/sync_users.html) 文件，在每个设备上同步用户数据：

1. 点击"同步用户数据"按钮执行双向同步
2. 检查本地和云端的用户数据是否一致
3. 在所有设备上重复此操作

### 5. 检查浏览器开发者工具

在移动浏览器中：
1. 打开开发者工具（如果支持）
2. 查看网络请求标签
3. 检查是否有失败的请求
4. 查看控制台错误信息

### 6. 使用兼容版本

如果标准版本无法工作，尝试使用兼容版本：
1. 打开 [supabase_test_compat.html](file:///E:/项目集合/tky团队管理/supabase_test_compat.html)
2. 点击"测试连接"按钮
3. 观察结果

## 最佳实践

### 1. 响应式设计

确保应用在移动设备上有良好的用户体验：

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### 2. 错误处理

在代码中添加适当的错误处理：

```javascript
try {
  const { data, error } = await supabase
    .from('your_table')
    .select('*');
  
  if (error) {
    console.error('数据库错误:', error);
    // 在移动端显示友好的错误消息
  }
} catch (error) {
  console.error('网络错误:', error);
  // 处理网络连接问题
}
```

### 3. 认证处理

正确处理认证会话：

```javascript
// 检查用户是否已登录
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

if (currentUser) {
  // 用户已登录
  console.log('已登录用户:', currentUser.username);
} else {
  // 用户未登录
  console.log('用户未登录');
}
```

### 4. 数据同步

定期同步用户数据以确保跨设备一致性：

```javascript
// 手动触发数据同步
import { syncUsersBidirectionally } from './sync_users_to_supabase.js';

// 在适当的时候调用同步函数
syncUsersBidirectionally();
```

### 5. 离线支持

考虑实现离线支持功能：
- 使用本地存储缓存数据
- 在网络恢复时同步数据
- 提供离线模式下的基本功能

## 进一步诊断

如果以上解决方案都无法解决问题，请提供以下信息：

1. 移动设备型号和操作系统版本
2. 移动浏览器名称和版本
3. 具体的错误消息
4. 网络环境（WiFi/移动数据）
5. 是否在其他移动设备上也有同样问题

## 联系支持

如果问题持续存在，请联系：
- Supabase支持团队
- 项目维护人员