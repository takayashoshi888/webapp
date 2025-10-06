// Supabase配置文件
// 用于前端JavaScript应用连接Supabase数据库

// 从环境变量或直接定义您的Supabase配置
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://haemafeqbytkimymgyyp.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZW1hZmVxYnl0a2lteW1neXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NTA0NDgsImV4cCI6MjA3NTIyNjQ0OH0.-erJczPVdz0ENGhsQFtpSjUktSoVnkHjH3pmyZNvhf8';

// 初始化Supabase客户端
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 导出配置和客户端
export { supabase, SUPABASE_URL, SUPABASE_ANON_KEY };

// 表名常量
export const TABLE_NAMES = {
  USERS: 'users',
  ATTENDANCE_RECORDS: 'attendance_records'
};

// 常用查询函数
export const SupabaseQueries = {
  // 获取用户的所有考勤记录
  getUserAttendanceRecords: async (userId) => {
    const { data, error } = await supabase
      .from(TABLE_NAMES.ATTENDANCE_RECORDS)
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  },
  
  // 添加新的考勤记录
  addAttendanceRecord: async (record) => {
    const { data, error } = await supabase
      .from(TABLE_NAMES.ATTENDANCE_RECORDS)
      .insert(record);
    
    if (error) throw error;
    return data;
  },
  
  // 更新考勤记录
  updateAttendanceRecord: async (id, updates, userId) => {
    const { data, error } = await supabase
      .from(TABLE_NAMES.ATTENDANCE_RECORDS)
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  },
  
  // 删除考勤记录
  deleteAttendanceRecord: async (id, userId) => {
    const { data, error } = await supabase
      .from(TABLE_NAMES.ATTENDANCE_RECORDS)
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  }
};