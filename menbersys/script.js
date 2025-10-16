// データストレージキー
export const STORAGE_KEY = 'tky_attendance_system';
export const MEMBERS_KEY = 'members';
export const TEAMS_KEY = 'teams';
export const ATTENDANCE_KEY = 'attendance';
export const SITES_KEY = 'sites';

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
export function getData(key) {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialData;
    return key ? data[key] : data;
}

// データ保存関数
export function saveData(key, value) {
    const data = getData();
    data[key] = value;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 出勤登録ページ初期化
export function initAttendancePage() {
    // 現場選択肢を更新
    const siteSelect = document.getElementById('site');
    if (siteSelect) {
        siteSelect.innerHTML = '<option value="">選択してください</option>';
        getData(SITES_KEY).forEach(site => {
            const option = document.createElement('option');
            option.value = site;
            option.textContent = site;
            siteSelect.appendChild(option);
        });
    }

    // チーム選択肢を更新
    const teamSelect = document.getElementById('team');
    if (teamSelect) {
        teamSelect.innerHTML = '<option value="">選択してください</option>';
        getData(TEAMS_KEY).forEach(team => {
            const option = document.createElement('option');
            option.value = team;
            option.textContent = team;
            teamSelect.appendChild(option);
        });
    }

    // 日付フィールドに今日の日付を設定
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
}

// 获取当前日期
export function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}

// 验证表单数据
export function validateFormData(formData) {
    const { date, site, team, name } = formData;
    
    if (!date || !site || !team || !name) {
        return { valid: false, message: '请填写所有必填字段' };
    }
    
    if (new Date(date) > new Date()) {
        return { valid: false, message: '日期不能超过今天' };
    }
    
    return { valid: true };
}

// 格式化金额显示
export function formatCurrency(amount) {
    return new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY'
    }).format(amount);
}

// 显示成功消息
export function showSuccessMessage(message) {
    alert(message);
}

// 显示错误消息
export function showErrorMessage(message) {
    alert('错误: ' + message);
}
