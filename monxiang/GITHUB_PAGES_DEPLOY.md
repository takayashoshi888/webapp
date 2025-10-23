# GitHub Pages 部署指南

## 部署步骤

### 1. 配置 package.json
在您的 `package.json` 中添加以下配置：

```json
{
  "homepage": "https://[your-username].github.io/[your-repo-name]",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

请将 `[your-username]` 替换为您的GitHub用户名，`[your-repo-name]` 替换为您的仓库名称。

### 2. 安装 gh-pages 包
```bash
npm install --save-dev gh-pages
```

### 3. 配置环境变量
在项目根目录创建 `.env.production` 文件并添加您的Supabase配置：

```env
VITE_SUPABASE_URL=您的Supabase项目URL
VITE_SUPABASE_ANON_KEY=您的Supabase匿名密钥
```

### 4. 部署到GitHub Pages
```bash
npm run deploy
```

## 常见问题解决

### 1. 404错误
如果遇到404错误，请检查：
- `homepage` 字段是否正确配置
- 仓库名称是否正确
- 是否等待部署完成（通常需要1-2分钟）

### 2. 资源加载失败
如果遇到资源加载失败：
- 确保 `vite.config.js` 中的 `base` 配置正确
- 检查网络控制台中的资源路径是否正确

### 3. 环境变量未生效
- 确保在 `.env.production` 中配置了生产环境变量
- 重新部署以应用更改

## 自定义域名配置

如果使用自定义域名：
1. 在仓库根目录创建 `CNAME` 文件，内容为您的域名
2. 在域名提供商处配置CNAME记录指向 `[your-username].github.io`

## 访问您的应用

部署完成后，您的应用将可以通过以下URL访问：
```
https://[your-username].github.io/[your-repo-name]
```

例如：
```
https://takayashoshi888.github.io/dream-management
```