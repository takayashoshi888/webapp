// Supabase 客户端配置（兼容版本）
// 这个版本避免使用动态导入，适合直接在浏览器中使用

// 注意：在生产环境中，不应该在前端代码中硬编码密钥
// 这里仅用于开发和测试目的
const SUPABASE_CONFIG = {
    url: 'https://xhqvbirifrdlmlnrwayp.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhocXZiaXJpZnJkbG1sbnJ3YXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTYzNzQsImV4cCI6MjA3NjA5MjM3NH0.CFLPI0sTrO5CYezI2BZRPyaLFS_A7NdxBbZ08qpTlVc'
};

// supabaseClientCompat.js
// 兼容版本的 Supabase 客户端，用于不支持 ES 模块的环境

async function createSupabaseClient() {
    // 动态导入 Supabase 客户端
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
    
    // 替换为你的 Supabase 项目 URL 和 匿名公开 API 密钥
    const supabaseUrl = 'https://xhqvbirifrdlmlnrwayp.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhocXZiaXJpZnJkbG1sbnJ3YXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTYzNzQsImV4cCI6MjA3NjA5MjM3NH0.CFLPI0sTrO5CYezI2BZRPyaLFS_A7NdxBbZ08qpTlVc';
    
    return createClient(supabaseUrl, supabaseKey);
}

export { createSupabaseClient, SUPABASE_CONFIG };