import { debounce, showToast, storage } from './utils.js';

// 应用状态管理
const state = {
    currentPage: 'dashboard',
    currentDate: new Date(),
    dreams: [],
    goals: [],
    journalEntries: [],
    selectedMood: 4
};

// 添加快捷键支持
document.addEventListener('keydown', (e) => {
    if (e.key === '?' && !e.ctrlKey && !e.altKey) {
        showShortcutHelp();
    }
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveCurrentPage();
    }
});

// 优化数据加载
async function loadData() {
    try {
        showLoading();
        const [dreams, goals, journal] = await Promise.all([
            storage.load('dreams'),
            storage.load('goals'),
            storage.load('journalEntries')
        ]);
        
        state.dreams = dreams || [];
        state.goals = goals || [];
        state.journalEntries = journal || [];
        
        if (state.dreams.length === 0) {
            await loadSampleData();
        }
        
        hideLoading();
        showToast('数据加载成功');
    } catch (error) {
        console.error('数据加载失败:', error);
        showToast('数据加载失败，请刷新重试', 'error');
    }
}

// ... 其他现有函数的优化版本 ...