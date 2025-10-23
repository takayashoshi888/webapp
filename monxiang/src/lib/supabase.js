import { createClient } from '@supabase/supabase-js'

// 配置Supabase连接（需要替换为你的实际配置）
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 检查环境变量是否配置
if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase环境变量未配置，应用将以演示模式运行')
  console.log('请在 .env.local 文件中配置以下环境变量：')
  console.log('VITE_SUPABASE_URL=你的Supabase项目URL')
  console.log('VITE_SUPABASE_ANON_KEY=你的Supabase匿名密钥')
}

// 创建Supabase客户端（如果环境变量未配置，使用模拟客户端）
let supabase
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey)
} else {
  // 模拟Supabase客户端（用于演示）
  supabase = {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: null }, error: { message: '请配置Supabase环境变量' } }),
      signUp: () => Promise.resolve({ data: { user: null }, error: { message: '请配置Supabase环境变量' } }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: (callback) => {
        // 模拟认证状态监听
        return { data: { subscription: { unsubscribe: () => {} } } }
      }
    },
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: { message: '请配置Supabase环境变量' } }),
      update: () => Promise.resolve({ data: null, error: { message: '请配置Supabase环境变量' } }),
      delete: () => Promise.resolve({ error: { message: '请配置Supabase环境变量' } })
    }),
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: { message: '请配置Supabase环境变量' } }),
        download: () => Promise.resolve({ data: null, error: { message: '请配置Supabase环境变量' } }),
        remove: () => Promise.resolve({ error: { message: '请配置Supabase环境变量' } }),
        list: () => Promise.resolve({ data: [], error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } })
      })
    }
  }
}

// 数据库表结构常量
export const TABLES = {
  USERS: 'users',
  FINANCE: 'finance_records',
  TODO: 'todos',
  GOALS: 'goals',
  NOTES: 'notes',
  FILES: 'files'
}

// 财务分类常量
export const FINANCE_CATEGORIES = {
  INCOME: ['工资', '奖金', '投资', '其他收入'],
  EXPENSE: ['餐饮', '交通', '购物', '娱乐', '医疗', '教育', '住房', '其他支出']
}

// 导出Supabase客户端
export { supabase }