// データストレージキー
const STORAGE_KEY = 'tky_attendance_system';
const MEMBERS_KEY = 'members';
const TEAMS_KEY = 'teams';
const ATTENDANCE_KEY = 'attendance';
const SITES_KEY = 'sites'; // 新增现场数据key

// 初期データ
const initialData = {
    [MEMBERS_KEY]: [
        { id: 1, name: '山田太郎', team: 'チームA' },
        { id: 2, name: '佐藤花子', team: 'チームB' }
    ],
    [TEAMS_KEY]: ['チームA', 'チームB', 'チームC'],
    [SITES_KEY]: ['東京サイト', '大阪サイト', '名古屋サイト', '渋谷サイト'], // 新增
    [ATTENDANCE_KEY]: []
};

// データ取得関数
function getData(key) {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialData;
    return key ? data[key] : data;
}

// データ保存関数
function saveData(key, value) {
    const data = getData();
    data[key] = value;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', function() {
    // 出勤登録ページ
    if (document.getElementById('attendanceForm')) {
        initAttendancePage();
    }
    
    // 管理者ページ
    if (document.getElementById('membersTable')) {
        initAdminPage();
    }
});

// 出勤登録ページ初期化
// 出勤登记页面初始化时
function initAttendancePage() {
    const form = document.getElementById('attendanceForm');
    const adminLoginBtn = document.getElementById('adminLogin');
    
    // フォーム送信処理
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const site = document.getElementById('site').value;
        const team = document.getElementById('team').value;
        const name = document.getElementById('name').value;
        const parkingFee = parseInt(document.getElementById('parkingFee').value) || 0;
        const highwayFee = parseInt(document.getElementById('highwayFee').value) || 0;
        const date = new Date().toISOString().split('T')[0];

        // === 新增：弹出信息确认 ===
        const confirmMsg = 
            `以下の内容で登録します。\n\n` +
            `現場名: ${site}\n` +
            `チーム: ${team}\n` +
            `氏名: ${name}\n` +
            `駐車料金: ${parkingFee} 円\n` +
            `高速料金: ${highwayFee} 円\n\n` +
            `よろしいですか？`;
        if (!window.confirm(confirmMsg)) {
            return; // 用户点“取消”则不提交
        }
        // === 新增结束 ===

        // 出勤記録を保存
        const attendance = getData(ATTENDANCE_KEY);
        attendance.push({
            date,
            site,
            team,
            name,
            parkingFee,
            highwayFee
        });
        saveData(ATTENDANCE_KEY, attendance);

        // フォームリセット
        form.reset();
        alert('出勤が登録されました！');
    });
    
    // 管理者ログインボタン
    adminLoginBtn.addEventListener('click', function() {
        const password = prompt('パスワードを入力してください');
        if (password === 'admin123') { // 簡易パスワードチェック
            window.location.href = 'admin.html';
        } else {
            alert('パスワードが間違っています');
        }
    });
    // 动态渲染现场下拉
    const siteSelect = document.getElementById('site');
    siteSelect.innerHTML = '<option value="">選択してください</option>';
    getData('sites').forEach(site => {
        const option = document.createElement('option');
        option.value = site;
        option.textContent = site;
        siteSelect.appendChild(option);
    });

    // ★ここを追加：チームも動的に生成
    const teamSelect = document.getElementById('team');
    teamSelect.innerHTML = '<option value="">選択してください</option>';
    getData('teams').forEach(team => {
        const option = document.createElement('option');
        option.value = team;
        option.textContent = team;
        teamSelect.appendChild(option);
    });
}

// 管理者ページ初期化
function initAdminPage() {
    // ログアウト処理
    document.getElementById('logout').addEventListener('click', function() {
        window.location.href = 'index.html';
    });
    
    // タブ切り替え
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
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
                renderMembersTable();
            } else if (tabId === 'teams') {
                renderTeamsTable();
            } else if (tabId === 'stats') {
                renderStats();
            }
        });
    });
    
    // メンバー追加モーダル
    const memberModal = document.getElementById('memberModal');
    const memberForm = document.getElementById('memberForm');
    document.getElementById('addMember').addEventListener('click', function() {
        document.getElementById('modalMemberTitle').textContent = 'メンバー追加';
        document.getElementById('memberId').value = '';
        document.getElementById('memberName').value = '';
        
        // チーム選択肢を更新
        const teamSelect = document.getElementById('memberTeam');
        teamSelect.innerHTML = '';
        getData(TEAMS_KEY).forEach(team => {
            const option = document.createElement('option');
            option.value = team;
            option.textContent = team;
            teamSelect.appendChild(option);
        });
        
        memberModal.style.display = 'block';
    });
    
    // チーム追加モーダル
    const teamModal = document.getElementById('teamModal');
    const teamForm = document.getElementById('teamForm');
    document.getElementById('addTeam').addEventListener('click', function() {
        document.getElementById('teamName').value = '';
        teamModal.style.display = 'block';
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
    memberForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const id = document.getElementById('memberId').value;
        const name = document.getElementById('memberName').value;
        const team = document.getElementById('memberTeam').value;
        
        const members = getData(MEMBERS_KEY);
        
        if (id) {
            // 既存メンバーを更新
            const index = members.findIndex(m => m.id == id);
            if (index !== -1) {
                members[index] = { id: parseInt(id), name, team };
            }
        } else {
            // 新規メンバーを追加
            const newId = members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1;
            members.push({ id: newId, name, team });
        }
        
        saveData(MEMBERS_KEY, members);
        memberModal.style.display = 'none';
        renderMembersTable();
    });
    
    // チームフォーム送信
    teamForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const teamName = document.getElementById('teamName').value;
        const teams = getData(TEAMS_KEY);
        
        if (!teams.includes(teamName)) {
            teams.push(teamName);
            saveData(TEAMS_KEY, teams);
            teamModal.style.display = 'none';
            renderTeamsTable();
        } else {
            alert('このチーム名は既に存在します');
        }
    });
    
    // データエクスポート
    document.getElementById('exportData').addEventListener('click', exportData);
    
    // 初期表示
    renderMembersTable();
    renderTeamsTable();
    renderStats();
}

// メンバーテーブルをレンダリング
function renderMembersTable() {
    const members = getData(MEMBERS_KEY);
    const teams = getData(TEAMS_KEY);
    const tbody = document.querySelector('#membersTable tbody');
    tbody.innerHTML = '';
    
    members.forEach(member => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${member.name}</td>
            <td>${member.team}</td>
            <td>
                <button class="action-btn btn-edit" data-id="${member.id}">編集</button>
                <button class="action-btn btn-delete" data-id="${member.id}">削除</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    // 編集ボタン
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const member = getData(MEMBERS_KEY).find(m => m.id == id);
            
            if (member) {
                document.getElementById('modalMemberTitle').textContent = 'メンバー編集';
                document.getElementById('memberId').value = member.id;
                document.getElementById('memberName').value = member.name;
                
                // チーム選択肢を更新
                const teamSelect = document.getElementById('memberTeam');
                teamSelect.innerHTML = '';
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
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('このメンバーを削除しますか？')) {
                const id = this.getAttribute('data-id');
                const members = getData(MEMBERS_KEY).filter(m => m.id != id);
                saveData(MEMBERS_KEY, members);
                renderMembersTable();
            }
        });
    });
}

// チームテーブルをレンダリング
function renderTeamsTable() {
    const teams = getData(TEAMS_KEY);
    const members = getData(MEMBERS_KEY);
    const tbody = document.querySelector('#teamsTable tbody');
    tbody.innerHTML = '';
    
    teams.forEach(team => {
        const memberCount = members.filter(m => m.team === team).length;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${team}</td>
            <td>${memberCount}</td>
            <td>
                <button class="action-btn btn-delete" data-team="${team}">削除</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // チーム削除ボタン
    document.querySelectorAll('#teamsTable .btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const team = this.getAttribute('data-team');
            const membersInTeam = getData(MEMBERS_KEY).filter(m => m.team === team).length;
            
            if (membersInTeam > 0) {
                alert('このチームにはメンバーが存在するため削除できません');
                return;
            }
            
            if (confirm(`チーム「${team}」を削除しますか？`)) {
                const teams = getData(TEAMS_KEY).filter(t => t !== team);
                saveData(TEAMS_KEY, teams);
                renderTeamsTable();
            }
        });
    });
    
    // 統計フィルターのチーム選択肢を更新
    const teamFilter = document.getElementById('statsTeamFilter');
    teamFilter.innerHTML = '<option value="all">全チーム</option>';
    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team;
        option.textContent = team;
        teamFilter.appendChild(option);
    });
}

// 統計をレンダリング
// 修复语法错误
function renderStats() {
    try {
        const startDate = document.getElementById('statsStartDate').value;
        const endDate = document.getElementById('statsEndDate').value;
        const selectedTeam = document.getElementById('statsTeamFilter').value;
        const selectedSite = document.getElementById('statsSiteFilter').value;

        // 获取数据
        const attendance = getData(ATTENDANCE_KEY) || [];
        
        // 数据过滤
        const filteredData = attendance.filter(record => {
            const matchTeam = selectedTeam === 'all' || record.team === selectedTeam;
            const matchSite = selectedSite === 'all' || record.site === selectedSite;
            const matchDate = (!startDate || record.date >= startDate) && 
                            (!endDate || record.date <= endDate);
            return matchTeam && matchSite && matchDate;
        });

        // 渲染各个统计表格
        renderSiteStats(filteredData);
        renderMemberStats(filteredData);
        renderTeamStats(filteredData);
        
    } catch (error) {
        console.error('统计数据处理错误:', error);
        showErrorMessage('データの処理中にエラーが発生しました。');
    }
}

// 添加错误提示函数
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    // 显示错误信息
    const statsContainer = document.querySelector('.excel-style-container');
    statsContainer.insertBefore(errorDiv, statsContainer.firstChild);
    
    // 3秒后自动移除错误信息
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// 現場別統計
// 添加统计渲染函数
function renderSiteStats(filteredData) {
    const siteStats = {
        '東京サイト': { days: 0, parkingFee: 0, highwayFee: 0, total: 0 },
        '大阪サイト': { days: 0, parkingFee: 0, highwayFee: 0, total: 0 },
        '名古屋サイト': { days: 0, parkingFee: 0, highwayFee: 0, total: 0 }
    };

    filteredData.forEach(record => {
        if (siteStats[record.site]) {
            siteStats[record.site].days++;
            siteStats[record.site].parkingFee += record.parkingFee;
            siteStats[record.site].highwayFee += record.highwayFee;
            siteStats[record.site].total += record.parkingFee + record.highwayFee;
        }
    });

    const tbody = document.querySelector('#siteStats tbody');
    tbody.innerHTML = '';

    Object.entries(siteStats).forEach(([site, stats]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${site}</td>
            <td>${stats.days}</td>
            <td>${stats.parkingFee.toLocaleString()} 円</td>
            <td>${stats.highwayFee.toLocaleString()} 円</td>
            <td>${stats.total.toLocaleString()} 円</td>
        `;
        tbody.appendChild(row);
    });
}

function renderMemberStats(filteredData) {
    const memberStats = {};
    filteredData.forEach(record => {
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

    // 修正这里
    const tbody = document.getElementById('memberStats');
    tbody.innerHTML = '';

    Object.entries(memberStats).forEach(([name, stats]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${name}</td>
            <td>${stats.days}</td>
            <td>${stats.parkingFee.toLocaleString()} 円</td>
            <td>${stats.highwayFee.toLocaleString()} 円</td>
            <td>${stats.total.toLocaleString()} 円</td>
        `;
        tbody.appendChild(row);
    });
}

function renderTeamStats(filteredData) {
    const teamStats = {};
    filteredData.forEach(record => {
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

    // 修正这里
    const tbody = document.getElementById('teamStats');
    tbody.innerHTML = '';

    Object.entries(teamStats).forEach(([team, stats]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${team}</td>
            <td>${stats.days}</td>
            <td>${stats.parkingFee.toLocaleString()} 円</td>
            <td>${stats.highwayFee.toLocaleString()} 円</td>
            <td>${stats.total.toLocaleString()} 円</td>
        `;
        tbody.appendChild(row);
    });
}

// 添加现场过滤事件监听
const statsSiteFilterElem = document.getElementById('statsSiteFilter');
if (statsSiteFilterElem) {
    statsSiteFilterElem.addEventListener('change', renderStats);
}

// データエクスポート
function exportData() {
    const attendance = getData(ATTENDANCE_KEY);
    const teamFilter = document.getElementById('statsTeamFilter').value;
    const startDate = document.getElementById('statsStartDate').value;
    const endDate = document.getElementById('statsEndDate').value;
    
    // フィルタリング
    let filteredData = [...attendance];
    
    if (teamFilter !== 'all') {
        filteredData = filteredData.filter(record => record.team === teamFilter);
    }
    
    if (startDate) {
        filteredData = filteredData.filter(record => record.date >= startDate);
    }
    
    if (endDate) {
        filteredData = filteredData.filter(record => record.date <= endDate);
    }
    
    if (filteredData.length === 0) {
        alert('エクスポートするデータがありません');
        return;
    }
    
    // CSVデータを生成
    let csv = '日付,現場名,チーム,氏名,駐車料金,高速料金,合計\n';
    
    filteredData.forEach(record => {
        csv += `${record.date},${record.site},${record.team},${record.name},${record.parkingFee},${record.highwayFee},${record.parkingFee + record.highwayFee}\n`;
    });
    
    // ファイル名を生成
    const now = new Date();
    const timestamp = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}`;
    const filename = `出勤データ_${teamFilter === 'all' ? '全チーム' : teamFilter}_${timestamp}.csv`;
    
    // ダウンロード
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// 添加全局错误处理
window.addEventListener('error', (e) => {
    console.error('Error:', e);
    showErrorToast('系统发生错误，请稍后重试');
});

function showErrorToast(message) {
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// 使用虚拟列表优化大数据量渲染
function renderVirtualTable(data, container) {
    const visibleItems = 20;
    const itemHeight = 50;
    
    container.addEventListener('scroll', () => {
        const start = Math.floor(container.scrollTop / itemHeight);
        const end = start + visibleItems;
        renderItems(data.slice(start, end));
    });
}

// 现场管理用のデータ
let sites = [
    { id: 1, name: '東京サイト' },
    { id: 2, name: '大阪サイト' },
    { id: 3, name: '名古屋サイト' }
];

// DOM要素の取得
const addSiteBtn = document.getElementById('addSite');
const siteModal = document.getElementById('siteModal');
const siteForm = document.getElementById('siteForm');
const siteNameInput = document.getElementById('siteName');
const siteIdInput = document.getElementById('siteId');
const sitesTableBody = document.querySelector('#sitesTable tbody');
const statsSiteFilter = document.getElementById('statsSiteFilter');

// 现场リストの表示
function renderSites() {
    sitesTableBody.innerHTML = '';
    statsSiteFilter.innerHTML = '<option value="all">全現場</option>';
    
    sites.forEach(site => {
        // 现场リストテーブルへの表示
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${site.name}</td>
            <td>
                <button class="btn-edit" onclick="openEditSiteModal(${site.id})">編集</button>
                <button class="btn-delete" onclick="deleteSite(${site.id})">削除</button>
            </td>
        `;
        sitesTableBody.appendChild(row);
        
        // 統計フィルターへの追加
        const option = document.createElement('option');
        option.value = site.name;
        option.textContent = site.name;
        statsSiteFilter.appendChild(option);
    });
}

// 现场追加/編集モーダルの表示
function openSiteModal(isEdit = false, site = null) {
    if (isEdit && site) {
        document.getElementById('modalSiteTitle').textContent = '现场編集';
        siteIdInput.value = site.id;
        siteNameInput.value = site.name;
    } else {
        document.getElementById('modalSiteTitle').textContent = '现场追加';
        siteIdInput.value = '';
        siteNameInput.value = '';
    }
    siteModal.style.display = 'block';
}

// 现场編集モーダルを開く
function openEditSiteModal(id) {
    const site = sites.find(s => s.id === id);
    if (site) {
        openSiteModal(true, site);
    }
}

// 现场の削除
function deleteSite(id) {
    if (confirm('本当にこの现场を削除しますか？')) {
        sites = sites.filter(s => s.id !== id);

        // ここを追加：localStorageのsitesも更新
        saveData('sites', sites.map(s => s.name));

        renderSites();
    }
}

// 现场の保存（追加/編集）
siteForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const siteData = {
        id: siteIdInput.value ? parseInt(siteIdInput.value) : Date.now(),
        name: siteNameInput.value.trim()
    };
    
    if (siteIdInput.value) {
        // 編集
        const index = sites.findIndex(s => s.id === siteData.id);
        if (index !== -1) {
            sites[index] = siteData;
        }
    } else {
        // 追加
        sites.push(siteData);
    }
    
    // ここを追加：localStorageのsitesも更新
    saveData('sites', sites.map(s => s.name));

    renderSites();
    siteModal.style.display = 'none';
});

// モーダルの閉じる処理
document.querySelectorAll('.modal .close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        siteModal.style.display = 'none';
    });
});

// 初期表示
document.addEventListener('DOMContentLoaded', function() {
    renderSites();
});

// 现场追加ボタンのイベントリスナー
if (addSiteBtn) {
    addSiteBtn.addEventListener('click', () => openSiteModal());
}

// 本日の出勤者数を更新する関数
function updateAttendanceCount() {
    const attendance = getData('attendance') || [];
    const today = new Date().toISOString().split('T')[0];
    const todayCount = attendance.filter(record => record.date === today).length;
    const countSpan = document.getElementById('attendanceCount');
    if (countSpan) {
        countSpan.textContent = todayCount;
    }
}

// 最新情報を更新する関数（例：常に「システム正常稼働中」表示）
function updateLatestNews(message = 'システム正常稼働中') {
    const newsSpan = document.getElementById('latestNews');
    if (newsSpan) {
        newsSpan.textContent = message;
    }
}

// ページ読み込み時と出勤登録時に呼び出す
document.addEventListener('DOMContentLoaded', function() {
    updateAttendanceCount();
    updateLatestNews();
});

// 删除下面这行注释和任何孤立的代码
// 出勤登録後にも呼び出す（initAttendancePage内のform.submit後）
//     updateAttendanceCount();