// 同步本地用户数据到Supabase数据库
import { supabase } from './js/supabaseClient.js';

// 同步注册用户到Supabase members表
async function syncRegisteredUsersToSupabase() {
    try {
        // 从本地存储获取注册用户
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
        
        console.log('正在同步用户数据到Supabase...');
        console.log('本地用户数量:', registeredUsers.length);
        
        // 获取现有的团队数据
        const { data: teams, error: teamsError } = await supabase
            .from('teams')
            .select('id, name');
            
        if (teamsError) {
            console.error('获取团队数据失败:', teamsError);
            return;
        }
        
        // 创建团队名称到ID的映射
        const teamMap = {};
        teams.forEach(team => {
            teamMap[team.name] = team.id;
        });
        
        // 同步每个用户到Supabase
        for (const user of registeredUsers) {
            // 检查用户是否已存在
            const { data: existingUser, error: checkError } = await supabase
                .from('members')
                .select('id')
                .eq('username', user.username)
                .single();
                
            if (checkError && checkError.code !== 'PGRST116') {
                console.error('检查用户存在性时出错:', checkError);
                continue;
            }
            
            // 准备用户数据
            const userData = {
                name: user.name,
                username: user.username,
                password: user.password, // 注意：在实际应用中应该加密密码
                team_id: teamMap[user.team] || null
            };
            
            if (existingUser) {
                // 更新现有用户
                const { error: updateError } = await supabase
                    .from('members')
                    .update(userData)
                    .eq('id', existingUser.id);
                    
                if (updateError) {
                    console.error('更新用户失败:', updateError);
                } else {
                    console.log(`用户 ${user.username} 已更新`);
                }
            } else {
                // 插入新用户
                const { error: insertError } = await supabase
                    .from('members')
                    .insert(userData);
                    
                if (insertError) {
                    console.error('插入用户失败:', insertError);
                } else {
                    console.log(`用户 ${user.username} 已插入`);
                }
            }
        }
        
        console.log('用户数据同步完成');
    } catch (error) {
        console.error('同步过程中发生错误:', error);
    }
}

// 从Supabase获取用户数据到本地存储
async function syncSupabaseUsersToLocal() {
    try {
        console.log('正在从Supabase同步用户数据到本地...');
        
        // 从Supabase获取所有用户
        const { data: members, error } = await supabase
            .from('members')
            .select('name, username, password, teams(name)');
            
        if (error) {
            console.error('获取用户数据失败:', error);
            return;
        }
        
        console.log('从Supabase获取到用户数量:', members.length);
        
        // 转换数据格式以匹配本地存储结构
        const registeredUsers = members.map(member => ({
            name: member.name,
            username: member.username,
            password: member.password,
            team: member.teams ? member.teams.name : ''
        }));
        
        // 保存到本地存储
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        
        console.log('本地用户数据已更新');
    } catch (error) {
        console.error('同步过程中发生错误:', error);
    }
}

// 双向同步用户数据
async function syncUsersBidirectionally() {
    console.log('开始双向同步用户数据...');
    
    // 首先同步本地数据到Supabase
    await syncRegisteredUsersToSupabase();
    
    // 然后从Supabase同步数据到本地（Supabase作为主数据源）
    await syncSupabaseUsersToLocal();
    
    console.log('双向同步完成');
}

// 导出函数
export { 
    syncRegisteredUsersToSupabase, 
    syncSupabaseUsersToLocal, 
    syncUsersBidirectionally 
};

// 如果直接运行此脚本，则执行双向同步
if (typeof window !== 'undefined' && window.location) {
    syncUsersBidirectionally();
}