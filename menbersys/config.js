// 配置文件 - 加载环境变量
require('dotenv').config();

module.exports = {
  supabase: {
    url: process.env.SUPABASE_URL || 'https://xhqvbirifrdlmlnrwayp.supabase.co',
    key: process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhocXZiaXJpZnJkbG1sbnJ3YXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTYzNzQsImV4cCI6MjA3NjA5MjM3NH0.CFLPI0sTrO5CYezI2BZRPyaLFS_A7NdxBbZ08qpTlVc'
  }
};