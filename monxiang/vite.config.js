import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  // Vercel 部署配置
  base: "/",
  // 优化构建配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
})