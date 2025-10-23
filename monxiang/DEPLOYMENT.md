# 部署指南

## 免费部署选项

### 1. Vercel 部署（推荐）

**步骤：**
1. 将代码推送到GitHub仓库
2. 访问 [vercel.com](https://vercel.com) 并登录
3. 点击 "New Project"
4. 导入你的GitHub仓库
5. 配置环境变量：
   - `VITE_SUPABASE_URL`: 你的Supabase项目URL
   - `VITE_SUPABASE_ANON_KEY`: 你的Supabase匿名密钥
6. 点击 "Deploy"

**优势：**
- 自动SSL证书
- 全球CDN
- 自动部署（Git push触发）
- 免费额度充足

### 2. Netlify 部署

**步骤：**
1. 将代码推送到GitHub仓库
2. 访问 [netlify.com](https://netlify.com) 并登录
3. 点击 "New site from Git"
4. 选择GitHub仓库
5. 构建设置：
   - Build command: `npm run build`
   - Publish directory: `dist`
6. 在 "Site settings" > "Environment variables" 中添加环境变量
7. 部署完成

### 3. GitHub Pages 部署

**步骤：**
1. 在 `package.json` 中添加 homepage 字段：
   ```json
   "homepage": "https://yourusername.github.io/repository-name"
   ```
2. 安装 gh-pages: `npm install --save-dev gh-pages`
3. 在 `package.json` 中添加脚本：
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```
4. 运行 `npm run deploy`

## Supabase 配置

### 1. 创建Supabase项目
1. 访问 [supabase.com](https://supabase.com)
2. 注册账号并创建新项目
3. 等待项目初始化完成

### 2. 配置数据库
1. 进入SQL编辑器
2. 执行 `supabase/schema.sql` 中的SQL脚本
3. 验证所有表创建成功

### 3. 获取配置信息
1. 进入项目设置
2. 获取以下信息：
   - Project URL (`VITE_SUPABASE_URL`)
   - anon public key (`VITE_SUPABASE_ANON_KEY`)

### 4. 配置存储桶
1. 进入Storage页面
2. 创建名为 "files" 的存储桶
3. 设置公开权限

## 环境变量配置

### 开发环境
复制 `.env.example` 为 `.env`：
```env
VITE_SUPABASE_URL=你的Supabase项目URL
VITE_SUPABASE_ANON_KEY=你的Supabase匿名密钥
VITE_APP_NAME=梦想管理
```

### 生产环境
在部署平台的环境变量设置中添加：
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 优化建议

### 性能优化
1. **代码分割**: 使用React.lazy()进行路由懒加载
2. **图片优化**: 使用WebP格式，添加懒加载
3. **缓存策略**: 配置适当的缓存头

### SEO优化
1. 添加meta标签和Open Graph标签
2. 生成sitemap.xml
3. 配置robots.txt

### 安全优化
1. 启用Supabase的行级安全策略
2. 配置CSP头
3. 使用HTTPS

## 监控和分析

### 错误监控
- 集成Sentry进行错误追踪
- 使用浏览器控制台日志

### 用户分析
- 集成Google Analytics
- 使用热力图分析用户行为

## 备份策略

### 数据库备份
1. Supabase自动备份
2. 定期导出SQL备份

### 文件备份
1. 定期下载重要文件
2. 使用版本控制管理代码

## 故障排除

### 常见问题
1. **环境变量未生效**: 检查变量名是否正确，重启服务
2. **数据库连接失败**: 检查Supabase项目状态和网络连接
3. **文件上传失败**: 检查存储桶权限和文件大小限制

### 日志查看
- Vercel: 在部署详情中查看构建日志
- Netlify: 在Deploy Logs中查看日志
- 本地: 使用浏览器开发者工具

## 扩展功能

### 后续可添加的功能
1. PWA支持（离线使用）
2. 多语言支持
3. 主题切换
4. 数据导入导出
5. 移动端App（使用Capacitor）