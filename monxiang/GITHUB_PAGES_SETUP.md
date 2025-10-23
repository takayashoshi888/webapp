# GitHub Pages 部署设置

## 1. 安装必要的依赖

首先安装 gh-pages 包用于部署：

```bash
npm install --save-dev gh-pages
```

## 2. 修改 package.json

将以下内容添加到您的 package.json 文件中：

```json
{
  "name": "梦想管理",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "homepage": "https://takayashoshi888.github.io/dream-management",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.38.0",
    "lucide-react": "^0.293.0",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.3",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.24",
    "tailwindcss": "^3.3.0",
    "vite": "^4.4.5",
    "gh-pages": "^5.0.0"
  }
}
```

注意添加的字段：
- `"homepage"`: 指向您的 GitHub Pages URL
- `"predeploy"`: 部署前自动构建
- `"deploy"`: 部署命令

## 3. 配置环境变量

在项目根目录创建 `.env.production` 文件：

```env
VITE_SUPABASE_URL=您的Supabase项目URL
VITE_SUPABASE_ANON_KEY=您的Supabase匿名密钥
```

## 4. 部署应用

运行以下命令部署到 GitHub Pages：

```bash
npm run deploy
```

## 5. GitHub Pages 设置

1. 在 GitHub 仓库中，进入 Settings > Pages
2. 选择 "gh-pages" 分支作为源
3. 选择 "/root" 作为文件夹
4. 保存设置

## 6. 访问您的应用

部署完成后，您的应用将可以通过以下 URL 访问：
https://takayashoshi888.github.io/dream-management

## 故障排除

### 如果仍然出现 404 错误：

1. 检查仓库名称是否正确（应为 dream-management）
2. 确认 homepage 字段指向正确的 URL
3. 等待几分钟让 GitHub Pages 完成部署
4. 清除浏览器缓存后重新访问

### 如果资源加载失败：

1. 检查浏览器控制台中的错误信息
2. 确认 Vite 配置中的 base 路径正确
3. 重新运行部署命令