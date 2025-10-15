# Supabase 客户端更新说明

## 更新内容

根据 Supabase 官方推荐的最佳实践，我们对项目中的 Supabase 客户端配置进行了以下更新：

### 1. Supabase 客户端配置文件更新

**文件**: [js/supabaseClient.js](file:///E:/项目集合/tky团队管理/js/supabaseClient.js)

- 使用 CDN 导入方式替代 npm 包导入
- 简化导出方式，使用 `export const supabase` 替代 `export default supabase`
- 移除了复杂的环境变量处理逻辑

### 2. HTML 文件更新

以下文件已更新以适应新的 Supabase 客户端导入方式：

- [supabase_test.html](file:///E:/项目集合/tky团队管理/supabase_test.html)
- [supabase_test_compat.html](file:///E:/项目集合/tky团队管理/supabase_test_compat.html)
- [user-login.html](file:///E:/项目集合/tky团队管理/user-login.html)
- [admin-login.html](file:///E:/项目集合/tky团队管理/admin-login.html)
- [user-data.html](file:///E:/项目集合/tky团队管理/user-data.html)
- [admin.html](file:///E:/项目集合/tky团队管理/admin.html)

### 3. 新增兼容版本客户端

**文件**: [js/supabaseClientCompat.js](file:///E:/项目集合/tky团队管理/js/supabaseClientCompat.js)

为不支持 ES 模块的环境提供兼容版本的客户端。

## 使用说明

### 在 HTML 中引入模块

确保你的 HTML 文件使用 `<script type="module">` 来加载：

```html
<script type="module">
  import { supabase } from './js/supabaseClient.js'

  // 示例：获取当前用户信息
  const user = await supabase.auth.getUser()
  console.log('当前用户:', user)
</script>
```

### 注意事项

1. **路径正确**：确保 `supabaseClient.js` 文件位于 `./js/` 目录下。
2. **使用本地服务器**：不要直接用 `file://` 打开 HTML 文件，建议使用 VS Code 的 Live Server 或 `npx serve` 启动本地服务器。
3. **密钥安全**：不要将 `service_role` 密钥暴露在前端，只使用 `anon` 公钥。

## 测试

使用 `supabase_test.html` 和 `supabase_test_compat.html` 文件来测试 Supabase 连接是否正常工作。