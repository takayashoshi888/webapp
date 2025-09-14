// Supabase配置文件
// 请替换为你的Supabase项目URL和密钥

// ===== 重要说明 =====
// 请访问 https://supabase.com 创建账户和项目
// 1. 注册Supabase账户
// 2. 创建新项目
// 3. 在项目设置中获取以下信息：
//    - Project URL (项目URL)
//    - Project API keys > anon public (匿名公钥)
// 4. 替换下面的配置信息

const SUPABASE_URL = 'https://lezgxyfgievltcrbyhka.supabase.co'; // 替换为你的Supabase项目URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxlemd4eWZnaWV2bHRjcmJ5aGthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NDEwODMsImV4cCI6MjA3MzQxNzA4M30.oIGwW3-z65AF9fCPdPX39tNmQ335qnseGTB_ok6SAww'; // 替换为你的Supabase匿名密钥

// 初始化Supabase客户端
let supabase;

// 检查Supabase配置是否完成
function checkSupabaseConfig() {
    if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
        console.warn('请先配置Supabase连接信息！');
        showMessage('请先配置Supabase连接信息，查看supabase-config.js文件', 'error');
        return false;
    }
    return true;
}

// 初始化Supabase连接
async function initSupabase() {
    if (!checkSupabaseConfig()) {
        return false;
    }
    
    try {
        // 初始化Supabase客户端
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // 测试连接
        const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
        
        if (error && error.code === 'PGRST116') {
            // 表不存在，需要创建表结构
            console.log('数据库表不存在，需要创建表结构');
            showMessage('正在初始化数据库结构...', 'info');
            await createDatabaseTables();
        }
        
        console.log('Supabase连接成功！');
        showMessage('云端数据库连接成功！', 'success');
        return true;
        
    } catch (error) {
        console.error('Supabase初始化失败:', error);
        showMessage('云端数据库连接失败，请检查配置', 'error');
        return false;
    }
}

// 创建数据库表结构
async function createDatabaseTables() {
    try {
        // 创建用户表的SQL
        const createUsersTableSQL = `
            CREATE TABLE IF NOT EXISTS users (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `;
        
        // 创建考勤记录表的SQL
        const createRecordsTableSQL = `
            CREATE TABLE IF NOT EXISTS attendance_records (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                date DATE NOT NULL,
                name TEXT NOT NULL,
                count INTEGER NOT NULL,
                site TEXT NOT NULL,
                parking_fee DECIMAL(10,2) DEFAULT 0,
                highway_fee DECIMAL(10,2) DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `;
        
        // 执行SQL创建表
        const { error: usersError } = await supabase.rpc('exec_sql', { sql: createUsersTableSQL });
        if (usersError) {
            console.error('创建用户表失败:', usersError);
        }
        
        const { error: recordsError } = await supabase.rpc('exec_sql', { sql: createRecordsTableSQL });
        if (recordsError) {
            console.error('创建考勤记录表失败:', recordsError);
        }
        
        console.log('数据库表结构创建完成');
        
    } catch (error) {
        console.error('创建数据库表结构失败:', error);
        showMessage('数据库初始化失败，请联系管理员', 'error');
    }
}

// 数据库操作类
class SupabaseDB {
    // 用户相关操作
    static async createUser(userData) {
        try {
            const { data, error } = await supabase
                .from('users')
                .insert([{
                    username: userData.username,
                    email: userData.email,
                    password: userData.password
                }])
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('创建用户失败:', error);
            return { success: false, error: error.message };
        }
    }
    
    static async getUserByCredentials(username, password) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('username', username)
                .eq('password', password)
                .single();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('获取用户失败:', error);
            return { success: false, error: error.message };
        }
    }
    
    static async getUserByUsernameAndEmail(username, email) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('username', username)
                .eq('email', email)
                .single();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('获取用户失败:', error);
            return { success: false, error: error.message };
        }
    }
    
    static async updateUserPassword(userId, newPassword) {
        try {
            const { data, error } = await supabase
                .from('users')
                .update({ password: newPassword })
                .eq('id', userId)
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('更新密码失败:', error);
            return { success: false, error: error.message };
        }
    }
    
    static async checkUserExists(username, email) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('username, email')
                .or(`username.eq.${username},email.eq.${email}`);
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('检查用户存在性失败:', error);
            return { success: false, error: error.message };
        }
    }
    
    // 考勤记录相关操作
    static async createRecord(recordData) {
        try {
            const { data, error } = await supabase
                .from('attendance_records')
                .insert([{
                    user_id: recordData.userId,
                    date: recordData.date,
                    name: recordData.name,
                    count: recordData.count,
                    site: recordData.site,
                    parking_fee: recordData.parkingFee,
                    highway_fee: recordData.highwayFee
                }])
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('创建考勤记录失败:', error);
            return { success: false, error: error.message };
        }
    }
    
    static async getRecordsByUserId(userId) {
        try {
            const { data, error } = await supabase
                .from('attendance_records')
                .select('*')
                .eq('user_id', userId)
                .order('date', { ascending: false });
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('获取考勤记录失败:', error);
            return { success: false, error: error.message };
        }
    }
    
    static async deleteRecord(recordId) {
        try {
            const { error } = await supabase
                .from('attendance_records')
                .delete()
                .eq('id', recordId);
            
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('删除考勤记录失败:', error);
            return { success: false, error: error.message };
        }
    }
    
    static async getRecordsByUserIdAndMonth(userId, year, month) {
        try {
            const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
            const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
            
            const { data, error } = await supabase
                .from('attendance_records')
                .select('*')
                .eq('user_id', userId)
                .gte('date', startDate)
                .lte('date', endDate)
                .order('date', { ascending: true });
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('按月获取考勤记录失败:', error);
            return { success: false, error: error.message };
        }
    }
}

// 导出配置供其他文件使用
window.SupabaseDB = SupabaseDB;
window.initSupabase = initSupabase;
window.checkSupabaseConfig = checkSupabaseConfig;

// 页面加载完成后自动初始化Supabase
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(async () => {
        const success = await initSupabase();
        if (success && typeof updateConnectionStatus === 'function') {
            updateConnectionStatus();
        }
    }, 1000);
});