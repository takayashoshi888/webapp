// データストレージキー
const STORAGE_KEY = 'tky_attendance_system';
const MEMBERS_KEY = 'members';
const TEAMS_KEY = 'teams';
const ATTENDANCE_KEY = 'attendance';
const SITES_KEY = 'sites';

// 初期データ
const initialData = {
    [MEMBERS_KEY]: [
        { id: 1, name: '山田太郎', team: 'チームA' },
        { id: 2, name: '佐藤花子', team: 'チームB' }
    ],
    [TEAMS_KEY]: ['チームA', 'チームB', 'チームC'],
    [SITES_KEY]: ['東京サイト', '大阪サイト', '名古屋サイト', '渋谷サイト'],
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
});

// 出勤登録ページ初期化
function initAttendancePage() {
    // 現場選択肢を更新
    const siteSelect = document.getElementById('site');
    siteSelect.innerHTML = '<option value="">選択してください</option>';
    getData(SITES_KEY).forEach(site => {
        const option = document.createElement('option');
        option.value = site;
        option.textContent = site;
        siteSelect.appendChild(option);
    });

    // チーム選択肢を更新
    const teamSelect = document.getElementById('team');
    teamSelect.innerHTML = '<option value="">選択してください</option>';
    getData(TEAMS_KEY).forEach(team => {
        const option = document.createElement('option');
        option.value = team;
        option.textContent = team;
        teamSelect.appendChild(option);
    });

    // 日付フィールドに今日の日付を設定
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
}
