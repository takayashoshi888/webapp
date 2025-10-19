// 防抖函数
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 提示框组件
export function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// 数据持久化
export const storage = {
    save: async (key, data) => {
        try {
            const db = await openDB();
            await db.put('userData', data, key);
        } catch (error) {
            console.error('保存数据失败:', error);
            // 降级到 localStorage
            localStorage.setItem(key, JSON.stringify(data));
        }
    },
    
    load: async (key) => {
        try {
            const db = await openDB();
            return await db.get('userData', key);
        } catch (error) {
            console.error('读取数据失败:', error);
            // 降级到 localStorage
            return JSON.parse(localStorage.getItem(key));
        }
    }
};