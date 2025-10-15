# Supabase 客户端设置说明

## 概述

本文档说明了如何在前端项目中使用 Supabase 客户端连接脚本。

## 文件结构

```
/js/
  └── supabaseClient.js  # Supabase 客户端配置文件
/supabase_test.html      # Supabase 连接测试页面
```

## Supabase 客户端配置 (supabaseClient.js)

```javascript
// Supabase 客户端配置
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Supabase 项目配置
const supabaseUrl = 'https://xhqvbirifrdlmlnrwayp.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || '默认密钥'

// 创建 Supabase 客户端实例
const supabase = createClient(supabaseUrl, supabaseKey)

// 导出 Supabase 客户端供其他模块使用
export default supabase

// 导出配置信息供需要直接访问的模块使用
export { supabaseUrl, supabaseKey }
```

## 在 HTML 中使用

确保在 HTML 文件中使用 `<script type="module">` 来加载脚本：

```html
<script type="module">
  import { supabase } from './js/supabaseClient.js'

  // 示例：获取数据
  const { data, error } = await supabase
    .from('teams')
    .select('*')
</script>
```

## 环境变量配置

为了安全起见，建议使用环境变量来存储 Supabase 密钥：

1. 复制 `.env.example` 文件并重命名为 `.env`
2. 在 `.env` 文件中设置您的 Supabase API 密钥：
   ```
   SUPABASE_KEY=your_actual_supabase_key
   ```

## 运行项目

### 使用本地服务器（推荐）

1. 安装依赖：
   ```bash
   npm install
   ```

2. 启动服务器：
   ```bash
   npm start
   ```

3. 在浏览器中访问 `http://localhost:3000`

### 直接打开 HTML 文件

如果直接打开 HTML 文件，确保使用现代浏览器，并注意可能会遇到模块加载限制。

## 安全注意事项

1. **永远不要在前端代码中硬编码敏感信息**
2. 只使用 `anon` 公钥，不要使用 `service_role` 密钥
3. 在生产环境中，考虑使用后端 API 来处理数据库操作
4. 定期轮换 API 密钥

## 测试连接

访问 `supabase_test.html` 页面来测试 Supabase 连接是否成功。