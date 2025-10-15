// Supabase 客户端配置
import { createClient } from '@supabase/supabase-js'

// Supabase 项目配置
const supabaseUrl = 'https://xhqvbirifrdlmlnrwayp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhocXZiaXJpZnJkbG1sbnJ3YXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTYzNzQsImV4cCI6MjA3NjA5MjM3NH0.CFLPI0sTrO5CYezI2BZRPyaLFS_A7NdxBbZ08qpTlVc'

// 创建 Supabase 客户端实例
const supabase = createClient(supabaseUrl, supabaseKey)

// 导出 Supabase 客户端供其他模块使用
export default supabase

// 导出配置信息供需要直接访问的模块使用
export { supabaseUrl, supabaseKey }