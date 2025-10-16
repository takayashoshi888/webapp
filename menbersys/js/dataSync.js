// 数据同步辅助函数
import { supabase } from './supabaseClient.js';

// 缓存映射数据
let teamMap = null;
let siteMap = null;
let memberMap = null;

// 获取团队ID
export async function getTeamId(teamName) {
    if (!teamMap) {
        const { data, error } = await supabase.from('teams').select('id, name');
        if (!error) {
            teamMap = Object.fromEntries(data.map(t => [t.name, t.id]));
        } else {
            console.error('获取团队数据失败:', error);
            return null;
        }
    }
    return teamMap?.[teamName] || null;
}

// 获取现场ID
export async function getSiteId(siteName) {
    if (!siteMap) {
        const { data, error } = await supabase.from('sites').select('id, name');
        if (!error) {
            siteMap = Object.fromEntries(data.map(s => [s.name, s.id]));
        } else {
            console.error('获取现场数据失败:', error);
            return null;
        }
    }
    return siteMap?.[siteName] || null;
}

// 根据成员名获取成员ID
export async function getMemberIdByName(memberName) {
    if (!memberMap) {
        const { data, error } = await supabase.from('members').select('id, name');
        if (!error) {
            memberMap = Object.fromEntries(data.map(m => [m.name, m.id]));
        } else {
            console.error('获取成员数据失败:', error);
            return null;
        }
    }
    return memberMap?.[memberName] || null;
}

// 根据团队ID获取团队名
export async function getTeamNameById(teamId) {
    if (!teamMap) {
        await getTeamId(''); // 初始化teamMap
    }
    const teamEntry = Object.entries(teamMap || {}).find(([name, id]) => id === teamId);
    return teamEntry ? teamEntry[0] : null;
}

// 同步成员数据到Supabase
export async function syncMembers() {
    try {
        const members = JSON.parse(localStorage.getItem('tky_attendance_system'))?.members || [];
        
        for (const member of members) {
            const teamId = await getTeamId(member.team);
            
            const { data, error } = await supabase
                .from('members')
                .upsert({
                    name: member.name,
                    team_id: teamId
                }, { onConflict: 'name' });
                
            if (error) {
                console.error('同步成员失败:', error);
            }
        }
        console.log('成员数据同步完成');
    } catch (error) {
        console.error('同步成员数据时出错:', error);
    }
}

// 同步出勤记录到Supabase
export async function syncAttendance() {
    try {
        const attendance = JSON.parse(localStorage.getItem('tky_attendance_system'))?.attendance || [];
        
        for (const record of attendance) {
            const memberId = await getMemberIdByName(record.name);
            const siteId = await getSiteId(record.site);
            const teamId = await getTeamId(record.team);
            
            if (memberId && siteId && teamId) {
                const { data, error } = await supabase
                    .from('attendance_records')
                    .upsert({
                        date: record.date,
                        member_id: memberId,
                        site_id: siteId,
                        team_id: teamId,
                        parking_fee: record.parkingFee,
                        highway_fee: record.highwayFee
                    }, { onConflict: 'date,member_id' });
                    
                if (error) {
                    console.error('同步出勤记录失败:', error);
                }
            }
        }
        console.log('出勤记录同步完成');
    } catch (error) {
        console.error('同步出勤记录时出错:', error);
    }
}

// 双向同步函数
export async function syncAllData() {
    console.log('开始全数据同步...');
    await syncMembers();
    await syncAttendance();
    console.log('全数据同步完成');
}

// 从Supabase同步数据到本地
export async function syncFromSupabase() {
    try {
        // 同步团队数据
        const { data: teams, error: teamsError } = await supabase.from('teams').select('*');
        if (!teamsError) {
            const currentData = JSON.parse(localStorage.getItem('tky_attendance_system')) || {};
            currentData.teams = teams.map(t => t.name);
            localStorage.setItem('tky_attendance_system', JSON.stringify(currentData));
        }
        
        // 同步现场数据
        const { data: sites, error: sitesError } = await supabase.from('sites').select('*');
        if (!sitesError) {
            const currentData = JSON.parse(localStorage.getItem('tky_attendance_system')) || {};
            currentData.sites = sites.map(s => s.name);
            localStorage.setItem('tky_attendance_system', JSON.stringify(currentData));
        }
        
        console.log('从Supabase同步数据完成');
    } catch (error) {
        console.error('从Supabase同步数据时出错:', error);
    }
}

// 同步状态检查函数
export async function checkSyncStatus() {
    try {
        // 检查云端连接
        const { data: cloudData, error: cloudError } = await supabase
            .from('teams')
            .select('id')
            .limit(1);
            
        if (cloudError) {
            throw new Error('云端连接失败');
        }
        
        // 检查本地数据
        const STORAGE_KEY = 'tky_attendance_system';
        const MEMBERS_KEY = 'members';
        const ATTENDANCE_KEY = 'attendance';
        
        const localData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        const localMembers = localData[MEMBERS_KEY] || [];
        const localAttendance = localData[ATTENDANCE_KEY] || [];
        
        // 检查云端数据
        const { data: cloudMembers } = await supabase
            .from('members')
            .select('id');
            
        const { data: cloudAttendance } = await supabase
            .from('attendance_records')
            .select('id');
            
        // 比较数据同步状态
        const membersSynced = localMembers.length === (cloudMembers?.length || 0);
        const attendanceSynced = localAttendance.length === (cloudAttendance?.length || 0);
        
        // 获取最后同步时间
        const lastSync = localStorage.getItem('lastSyncTimestamp') || null;
        
        return {
            cloudConnected: true,
            membersSynced,
            attendanceSynced,
            lastSync,
            localMembersCount: localMembers.length,
            cloudMembersCount: cloudMembers?.length || 0,
            localAttendanceCount: localAttendance.length,
            cloudAttendanceCount: cloudAttendance?.length || 0
        };
        
    } catch (error) {
        console.error('同步状态检查失败:', error);
        return {
            cloudConnected: false,
            membersSynced: false,
            attendanceSynced: false,
            lastSync: null,
            error: error.message
        };
    }
}

// 获取现场名称的辅助函数
export async function getSiteNameById(siteId) {
    try {
        const { data, error } = await supabase
            .from('sites')
            .select('name')
            .eq('id', siteId)
            .single();
            
        if (error) throw error;
        return data?.name || '未設定';
    } catch (error) {
        console.error('获取现场名称失败:', error);
        return '未設定';
    }
}

// 获取成员名称的辅助函数
export async function getMemberNameById(memberId) {
    try {
        const { data, error } = await supabase
            .from('members')
            .select('name')
            .eq('id', memberId)
            .single();
            
        if (error) throw error;
        return data?.name || '未設定';
    } catch (error) {
        console.error('获取成员名称失败:', error);
        return '未設定';
    }
}

// 设置最后同步时间
export function setLastSyncTimestamp() {
    localStorage.setItem('lastSyncTimestamp', new Date().toISOString());
}

// 获取最后同步时间
export function getLastSyncTimestamp() {
    return localStorage.getItem('lastSyncTimestamp');
}