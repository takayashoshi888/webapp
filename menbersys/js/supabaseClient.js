// supabaseClient.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 替换为你的 Supabase 项目 URL 和 匿名公开 API 密钥
const supabaseUrl = 'https://xhqvbirifrdlmlnrwayp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhocXZiaXJpZnJkbG1sbnJ3YXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTYzNzQsImV4cCI6MjA3NjA5MjM3NH0.CFLPI0sTrO5CYezI2BZRPyaLFS_A7NdxBbZ08qpTlVc'

export const supabase = createClient(supabaseUrl, supabaseKey)

// 导出 Supabase 客户端供其他模块使用
export default supabase

// 导出配置信息供需要直接访问的模块使用
export { supabaseUrl, supabaseKey }