// Supabase 配置
const supabaseUrl = 'https://xhqvbirifrdlmlnrwayp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhocXZiaXJpZnJkbG1sbnJ3YXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTYzNzQsImV4cCI6MjA3NjA5MjM3NH0.CFLPI0sTrO5CYezI2BZRPyaLFS_A7NdxBbZ08qpTlVc';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// 数据存储键
const STORAGE_KEY = 'tky_attendance_system';
const MEMBERS_KEY = 'members';
const TEAMS_KEY = 'teams';
const SITES_KEY = 'sites';
const ATTENDANCE_KEY = 'attendance';

// 初期データ
const initialData = {
    [MEMBERS_KEY]: [],
    [TEAMS_KEY]: [],
    [SITES_KEY]: [],
    [ATTENDANCE_KEY]: []
};

// 智能数据获取函数 - 优先从Supabase获取，失败时使用本地缓存
async function getData(key) {
    try {
        // 首先尝试从Supabase获取最新数据
        let supabaseData = null;
        
        if (key === MEMBERS_KEY) {
            const { data, error } = await supabase
                .from('members')
                .select('*');
            if (!error) supabaseData = data;
        } else if (key === TEAMS_KEY) {
            const { data, error } = await supabase
                .from('teams')
                .select('*');
            if (!error) supabaseData = data.map(t => t.name);
        } else if (key === SITES_KEY) {
            const { data, error } = await supabase
                .from('sites')
                .select('*');
            if (!error) supabaseData = data.map(s => s.name);
        } else if (key === ATTENDANCE_KEY) {
            const { data, error } = await supabase
                .from('attendance_records')
                .select('*');
            if (!error) supabaseData = data;
        }
        
        // 如果从Supabase成功获取数据，更新本地存储
        if (supabaseData !== null) {
            const currentData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialData;
            currentData[key] = supabaseData;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
            console.log(`✅ 从Supabase成功获取${key}数据`);
            return supabaseData;
        }
    } catch (error) {
        console.warn(`⚠️ 从Supabase获取${key}数据失败，使用本地缓存:`, error.message);
    }
    
    // 如果Supabase获取失败，使用本地存储数据
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialData;
    return key ? data[key] : data;
}

// 智能数据保存函数 - 同时保存到本地和Supabase
async function saveData(key, value) {
    // 先保存到本地存储
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialData;
    data[key] = value;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    
    // 然后同步到Supabase
    try {
        if (key === MEMBERS_KEY) {
            // 同步成员数据到Supabase
            for (const member of value) {
                const teamId = await getTeamId(member.team);
                if (teamId) {
                    const { error } = await supabase
                        .from('members')
                        .upsert({
                            name: member.name,
                            username: member.username,
                            password: member.password,
                            team_id: teamId
                        }, { onConflict: 'username' });
                    if (error) throw error;
                }
            }
        } else if (key === TEAMS_KEY) {
            // 同步团队数据到Supabase
            for (const teamName of value) {
                const { error } = await supabase
                    .from('teams')
                    .upsert({ name: teamName }, { onConflict: 'name' });
                if (error) throw error;
            }
        } else if (key === SITES_KEY) {
            // 同步现场数据到Supabase
            for (const siteName of value) {
                const { error } = await supabase
                    .from('sites')
                    .upsert({ name: siteName }, { onConflict: 'name' });
                if (error) throw error;
            }
        }
        
        console.log(`✅ ${key}数据已成功同步到Supabase`);
    } catch (error) {
        console.error(`❌ ${key}数据同步到Supabase失败:`, error);
        // 即使云端同步失败，本地数据仍然保存成功
    }
}

// 数据映射辅助函数
let teamMap = null;

// 获取团队ID
async function getTeamId(teamName) {
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

// 页面加载时测试 Supabase 连接
document.addEventListener('DOMContentLoaded', async function() {
    const statusDiv = document.getElementById('supabaseStatus');
    
    try {
        // 测试连接 - 尝试获取一个简单的查询
        const { data, error } = await supabase
            .from('teams')
            .select('id')
            .limit(1);
        
        if (error) {
            throw error;
        }
        
        // 显示成功连接消息
        statusDiv.style.display = 'block';
        statusDiv.style.backgroundColor = '#d4edda';
        statusDiv.style.color = '#155724';
        statusDiv.style.border = '1px solid #c3e6cb';
        statusDiv.innerHTML = '✅ 成功连接云端数据库 (Supabase)';
        
    } catch (error) {
        // 连接失败时显示错误消息
        console.log('Supabase 连接测试失败:', error.message);
        statusDiv.style.display = 'block';
        statusDiv.style.backgroundColor = '#f8d7da';
        statusDiv.style.color = '#721c24';
        statusDiv.style.border = '1px solid #f5c6cb';
        statusDiv.innerHTML = `❌ 数据库连接失败: ${error.message}`;
    }
    
    // 初始化页面功能
    await initializePage();
});

// 初始化页面功能
async function initializePage() {
    // 页面加载时同步所有数据
    try {
        console.log('🔄 正在从Supabase同步数据...');
        
        // 同步团队成员数据
        await getData(MEMBERS_KEY);
        await getData(TEAMS_KEY);
        await getData(SITES_KEY);
        await getData(ATTENDANCE_KEY);
        
        console.log('✅ 数据同步完成');
    } catch (error) {
        console.warn('⚠️ 数据同步过程中出现错误，使用本地数据:', error);
    }
    // ログアウト処理
    document.getElementById('logout').addEventListener('click', function() {
        if (confirm('本当にログアウトしますか？')) {
            window.location.href = 'index.html';
        }
    });

    // タブ切り替え
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const tabId = this.getAttribute('data-tab');
            
            // アクティブなタブを更新
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // タブコンテンツを更新
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');
            
            // タブ固有の初期化
            if (tabId === 'members') {
                await renderMembersTable();
            } else if (tabId === 'teams') {
                await renderTeamsTable();
            } else if (tabId === 'sites') {
                await renderSitesTable();
            } else if (tabId === 'stats') {
                await renderStats();
            }
        });
    });

    // メンバー追加ボタン
    document.getElementById('addMember').addEventListener('click', async function() {
        document.getElementById('modalMemberTitle').textContent = 'メンバー追加';
        document.getElementById('memberId').value = '';
        document.getElementById('memberName').value = '';
        document.getElementById('memberUsername').value = '';
        document.getElementById('memberPassword').value = '';
        
        // チーム選択肢を更新
        const teamSelect = document.getElementById('memberTeam');
        teamSelect.innerHTML = '';
        const teams = await getData(TEAMS_KEY);
        teams.forEach(team => {
            const option = document.createElement('option');
            option.value = team;
            option.textContent = team;
            teamSelect.appendChild(option);
        });
        
        document.getElementById('memberModal').style.display = 'block';
    });

    // チーム追加ボタン
    document.getElementById('addTeam').addEventListener('click', function() {
        document.getElementById('teamName').value = '';
        document.getElementById('teamModal').style.display = 'block';
    });

    // モーダル閉じるボタン
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    // ウィンドウ外クリックでモーダルを閉じる
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // メンバーフォーム送信
    document.getElementById('memberForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const id = document.getElementById('memberId').value;
        const name = document.getElementById('memberName').value;
        const username = document.getElementById('memberUsername').value;
        const password = document.getElementById('memberPassword').value;
        const team = document.getElementById('memberTeam').value;
        
        // パスワード長さ確認
        if (password && password.length < 8) {
            alert('パスワードは8文字以上である必要があります');
            return;
        }
        
        const members = await getData(MEMBERS_KEY);
        
        if (id) {
            // 既存メンバーを更新
            const index = members.findIndex(m => m.id === parseInt(id));
            if (index !== -1) {
                members[index] = { ...members[index], name, username, password, team };
            }
        } else {
            // 新しいメンバーを追加
            const newId = members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1;
            members.push({ id: newId, name, username, password, team });
        }
        
        await saveData(MEMBERS_KEY, members);

        // 同步到Supabase
        try {
            const teamId = await getTeamId(team);
            if (teamId) {
                const { data, error } = await supabase
                    .from('members')
                    .upsert({
                        name: name,
                        username: username,
                        password: password,
                        team_id: teamId
                    }, { onConflict: 'username' });
                    
                if (error) {
                    console.error('Supabase 同步失败:', error);
                    alert('成员已保存到本地，但云端同步失败');
                } else {
                    console.log('成员数据已同步到 Supabase');
                }
            } else {
                console.warn('无法找到对应的团队ID，跳过Supabase同步');
                alert('成员已保存到本地，但云端同步需要团队映射');
            }
        } catch (error) {
            console.error('Supabase 同步过程中出错:', error);
            alert('成员已保存到本地，但云端同步出错');
        }
        
        document.getElementById('memberModal').style.display = 'none';
        await renderMembersTable();
    });

    // チームフォーム送信
    document.getElementById('teamForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const teamName = document.getElementById('teamName').value;
        const teams = await getData(TEAMS_KEY);
        
        if (!teams.includes(teamName)) {
            teams.push(teamName);
            await saveData(TEAMS_KEY, teams);
            document.getElementById('teamModal').style.display = 'none';
            await renderTeamsTable();
        } else {
            alert('このチーム名は既に存在します');
        }
    });

    // 現地フォーム送信
    document.getElementById('siteForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const siteId = document.getElementById('siteId').value;
        const siteName = document.getElementById('siteName').value.trim();
        const sites = await getData(SITES_KEY);
        
        if (siteId !== '') {
            // 編集
            sites[parseInt(siteId)] = siteName;
        } else {
            // 追加
            if (!sites.includes(siteName)) {
                sites.push(siteName);
            } else {
                alert('この現場名は既に存在します');
                return;
            }
        }
        
        await saveData(SITES_KEY, sites);
        document.getElementById('siteModal').style.display = 'none';
        await renderSitesTable();
    });

    // 現地追加ボタン
    document.getElementById('addSite').addEventListener('click', function() {
        document.getElementById('siteId').value = '';
        document.getElementById('siteName').value = '';
        document.getElementById('modalSiteTitle').textContent = '現場追加';
        document.getElementById('siteModal').style.display = 'block';
    });

    // データエクスポート
    document.getElementById('exportData').addEventListener('click', async function() {
        const attendance = await getData(ATTENDANCE_KEY) || [];
        if (!attendance.length) {
            alert('エクスポートするデータがありません');
            return;
        }
        
        // CSVデータを生成
        let csv = '日付,現場名,チーム,氏名,駐車料金,高速料金,合計\n';
        attendance.forEach(record => {
            csv += `${record.date},${record.site},${record.team},${record.name},${record.parkingFee},${record.highwayFee},${record.parkingFee + record.highwayFee}\n`;
        });
        
        // ファイル名を生成
        const now = new Date();
        const timestamp = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}`;
        const filename = `出勤データ_${timestamp}.csv`;
        
        // ダウンロード
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    });

    // パスワード変更フォーム送信
    document.getElementById('passwordChangeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;
        
        // 現在のパスワードを検証
        const adminPassword = localStorage.getItem('adminPassword') || 'admin123';
        
        if (currentPassword !== adminPassword) {
            alert('現在のパスワードが正しくありません');
            return;
        }
        
        // 新しいパスワードの確認
        if (newPassword !== confirmNewPassword) {
            alert('新しいパスワードが一致しません');
            return;
        }
        
        // パスワード長さ確認
        if (newPassword.length < 8) {
            alert('新しいパスワードは8文字以上である必要があります');
            return;
        }
        
        // 新しいパスワードを保存
        localStorage.setItem('adminPassword', newPassword);
        
        // フォームをリセット
        document.getElementById('passwordChangeForm').reset();
        
        alert('パスワードが正常に変更されました');
    });

    // 初期表示
    await renderMembersTable();
    await renderTeamsTable();
    await renderSitesTable();
}

// メンバーテーブルをレンダリング
async function renderMembersTable() {
    const members = await getData(MEMBERS_KEY);
    const tbody = document.querySelector('#membersTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    members.forEach(member => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${member.name}</td>
            <td>${member.username}</td>
            <td>${member.team}</td>
            <td>
                <button class="action-btn btn-edit" data-id="${member.id}">編集</button>
                <button class="action-btn btn-delete" data-id="${member.id}">削除</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    // 編集ボタン
    document.querySelectorAll('#membersTable .btn-edit').forEach(btn => {
        btn.addEventListener('click', async function() {
            const id = this.getAttribute('data-id');
            const members = await getData(MEMBERS_KEY);
            const member = members.find(m => m.id === parseInt(id));
            
            if (member) {
                document.getElementById('modalMemberTitle').textContent = 'メンバー編集';
                document.getElementById('memberId').value = member.id;
                document.getElementById('memberName').value = member.name;
                document.getElementById('memberUsername').value = member.username;
                document.getElementById('memberPassword').value = member.password;
                
                // チーム選択肢を更新
                const teamSelect = document.getElementById('memberTeam');
                teamSelect.innerHTML = '';
                const teams = await getData(TEAMS_KEY);
                teams.forEach(team => {
                    const option = document.createElement('option');
                    option.value = team;
                    option.textContent = team;
                    option.selected = team === member.team;
                    teamSelect.appendChild(option);
                });
                
                document.getElementById('memberModal').style.display = 'block';
            }
        });
    });
    
    // 削除ボタン
    document.querySelectorAll('#membersTable .btn-delete').forEach(btn => {
        btn.addEventListener('click', async function() {
            if (confirm('このメンバーを削除しますか？')) {
                const id = this.getAttribute('data-id');
                const members = await getData(MEMBERS_KEY);
                const filteredMembers = members.filter(m => m.id !== parseInt(id));
                await saveData(MEMBERS_KEY, filteredMembers);
                
                // 同步删除到Supabase
                try {
                    const { error } = await supabase
                        .from('members')
                        .delete()
                        .eq('id', id);
                    
                    if (error) {
                        console.error('Supabase 删除失败:', error);
                        alert('成员已从本地删除，但云端同步失败');
                    } else {
                        console.log('成员数据已从 Supabase 删除');
                    }
                } catch (error) {
                    console.error('Supabase 删除过程中出错:', error);
                    alert('成员已从本地删除，但云端同步出错');
                }
                
                await renderMembersTable();
            }
        });
    });
}

// チームテーブルをレンダリング
async function renderTeamsTable() {
    const teams = await getData(TEAMS_KEY);
    const members = await getData(MEMBERS_KEY);
    const tbody = document.querySelector('#teamsTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    teams.forEach(team => {
        const memberCount = members.filter(m => m.team === team).length;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${team}</td>
            <td>${memberCount}</td>
            <td>
                <button class="action-btn btn-edit" data-team="${team}">編集</button>
                <button class="action-btn btn-delete" data-team="${team}">削除</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // チーム編集ボタン
    document.querySelectorAll('#teamsTable .btn-edit').forEach(btn => {
        btn.addEventListener('click', async function() {
            const oldTeamName = this.getAttribute('data-team');
            const newTeamName = prompt('新しいチーム名を入力してください', oldTeamName);
            
            if (newTeamName && newTeamName !== oldTeamName) {
                const teams = await getData(TEAMS_KEY);
                if (teams.includes(newTeamName)) {
                    alert('このチーム名は既に存在します');
                    return;
                }
                
                // 更新团队名称
                const updatedTeams = teams.map(t => t === oldTeamName ? newTeamName : t);
                await saveData(TEAMS_KEY, updatedTeams);
                
                // 更新关联成员
                const members = await getData(MEMBERS_KEY);
                const updatedMembers = members.map(m => {
                    if (m.team === oldTeamName) {
                        return {...m, team: newTeamName};
                    }
                    return m;
                });
                await saveData(MEMBERS_KEY, updatedMembers);
                
                await renderTeamsTable();
                await renderMembersTable();
            }
        });
    });
    
    // チーム削除ボタン
    document.querySelectorAll('#teamsTable .btn-delete').forEach(btn => {
        btn.addEventListener('click', async function() {
            const team = this.getAttribute('data-team');
            const members = await getData(MEMBERS_KEY);
            const membersInTeam = members.filter(m => m.team === team).length;
            
            if (membersInTeam > 0) {
                alert('このチームにはメンバーが存在するため削除できません');
                return;
            }
            
            if (confirm(`チーム「${team}」を削除しますか？`)) {
                const teams = await getData(TEAMS_KEY);
                const filteredTeams = teams.filter(t => t !== team);
                await saveData(TEAMS_KEY, filteredTeams);
                
                // 同步删除到Supabase
                try {
                    // 首先获取团队ID
                    const { data: teamData, error: teamError } = await supabase
                        .from('teams')
                        .select('id')
                        .eq('name', team)
                        .single();
                    
                    if (teamError) {
                        console.error('获取团队ID失败:', teamError);
                        alert('团队已从本地删除，但云端同步失败');
                        await renderTeamsTable();
                        return;
                    }
                    
                    // 删除Supabase中的团队
                    const { error } = await supabase
                        .from('teams')
                        .delete()
                        .eq('id', teamData.id);
                    
                    if (error) {
                        console.error('Supabase 删除团队失败:', error);
                        alert('团队已从本地删除，但云端同步失败');
                    } else {
                        console.log('团队数据已从 Supabase 删除');
                    }
                } catch (error) {
                    console.error('Supabase 删除团队过程中出错:', error);
                    alert('团队已从本地删除，但云端同步出错');
                }
                
                await renderTeamsTable();
            }
        });
    });
}

// 現地管理テーブルをレンダリング
async function renderSitesTable() {
    const sites = await getData(SITES_KEY);
    const tbody = document.querySelector('#sitesTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    sites.forEach((site, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${site}</td>
            <td>
                <button class="action-btn btn-edit" data-index="${index}">編集</button>
                <button class="action-btn btn-delete" data-index="${index}">削除</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // 現地編集ボタン
    document.querySelectorAll('#sitesTable .btn-edit').forEach(btn => {
        btn.addEventListener('click', async function() {
            const index = parseInt(this.getAttribute('data-index'));
            await editSite(index);
        });
    });
    
    // 現地削除ボタン
    document.querySelectorAll('#sitesTable .btn-delete').forEach(btn => {
        btn.addEventListener('click', async function() {
            const index = parseInt(this.getAttribute('data-index'));
            await deleteSite(index);
        });
    });
}

// 現地編集
async function editSite(index) {
    const sites = await getData(SITES_KEY);
    const siteName = sites[index];
    document.getElementById('siteId').value = index;
    document.getElementById('siteName').value = siteName;
    document.getElementById('modalSiteTitle').textContent = '現場編集';
    document.getElementById('siteModal').style.display = 'block';
}

// 現地削除
async function deleteSite(index) {
    const sites = await getData(SITES_KEY);
    const siteName = sites[index];
    
    if (confirm(`本当に現場「${siteName}」を削除しますか？`)) {
        sites.splice(index, 1);
        await saveData(SITES_KEY, sites);
        
        // 同步删除到Supabase
        try {
            // 删除Supabase中的现场
            const { error } = await supabase
                .from('sites')
                .delete()
                .eq('name', siteName);
            
            if (error) {
                console.error('Supabase 删除现场失败:', error);
                alert('现场已从本地删除，但云端同步失败');
            } else {
                console.log('现场数据已从 Supabase 删除');
            }
        } catch (error) {
            console.error('Supabase 删除现场过程中出错:', error);
            alert('现场已从本地删除，但云端同步出错');
        }
        
        await renderSitesTable();
    }
}

// 統計データをレンダリング
async function renderStats() {
    const attendance = await getData(ATTENDANCE_KEY) || [];
    
    // 現場別統計
    const siteStats = {};
    const sites = await getData(SITES_KEY);
    sites.forEach(site => {
        siteStats[site] = { days: 0, parkingFee: 0, highwayFee: 0, total: 0 };
    });

    attendance.forEach(record => {
        if (siteStats[record.site]) {
            siteStats[record.site].days++;
            siteStats[record.site].parkingFee += record.parkingFee;
            siteStats[record.site].highwayFee += record.highwayFee;
            siteStats[record.site].total += record.parkingFee + record.highwayFee;
        }
    });

    const siteStatsTbody = document.getElementById('siteStatsBody');
    if (siteStatsTbody) {
        siteStatsTbody.innerHTML = '';
        Object.entries(siteStats).forEach(([site, stats]) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${site}</td>
                <td>${stats.days}</td>
                <td>${stats.parkingFee.toLocaleString()} 円</td>
                <td>${stats.highwayFee.toLocaleString()} 円</td>
                <td>${stats.total.toLocaleString()} 円</td>
            `;
            siteStatsTbody.appendChild(row);
        });
    }

    // メンバー別統計
    const memberStats = {};
    attendance.forEach(record => {
        if (!memberStats[record.name]) {
            memberStats[record.name] = {
                days: 0,
                parkingFee: 0,
                highwayFee: 0,
                total: 0
            };
        }
        memberStats[record.name].days++;
        memberStats[record.name].parkingFee += record.parkingFee;
        memberStats[record.name].highwayFee += record.highwayFee;
        memberStats[record.name].total += record.parkingFee + record.highwayFee;
    });

    const memberStatsTbody = document.getElementById('memberStats');
    if (memberStatsTbody) {
        memberStatsTbody.innerHTML = '';
        Object.entries(memberStats).forEach(([name, stats]) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${name}</td>
                <td>${stats.days}</td>
                <td>${stats.parkingFee.toLocaleString()} 円</td>
                <td>${stats.highwayFee.toLocaleString()} 円</td>
                <td>${stats.total.toLocaleString()} 円</td>
            `;
            memberStatsTbody.appendChild(row);
        });
    }

    // チーム別統計
    const teamStats = {};
    attendance.forEach(record => {
        if (!teamStats[record.team]) {
            teamStats[record.team] = {
                days: 0,
                parkingFee: 0,
                highwayFee: 0,
                total: 0
            };
        }
        teamStats[record.team].days++;
        teamStats[record.team].parkingFee += record.parkingFee;
        teamStats[record.team].highwayFee += record.highwayFee;
        teamStats[record.team].total += record.parkingFee + record.highwayFee;
    });

    const teamStatsTbody = document.getElementById('teamStats');
    if (teamStatsTbody) {
        teamStatsTbody.innerHTML = '';
        Object.entries(teamStats).forEach(([team, stats]) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${team}</td>
                <td>${stats.days}</td>
                <td>${stats.parkingFee.toLocaleString()} 円</td>
                <td>${stats.highwayFee.toLocaleString()} 円</td>
                <td>${stats.total.toLocaleString()} 円</td>
            `;
            teamStatsTbody.appendChild(row);
        });
    }
}
