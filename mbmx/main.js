// 目标管理梦想清单应用主要JavaScript逻辑

// 数据存储和管理
class GoalManager {
    constructor() {
        this.goals = this.loadGoals();
        this.dreams = this.loadDreams();
        this.categories = [
            { id: 'health', name: '健康', icon: '❤️', color: '#FF6B6B' },
            { id: 'career', name: '事业', icon: '💼', color: '#4ECDC4' },
            { id: 'learning', name: '学习', icon: '📚', color: '#FFD93D' },
            { id: 'finance', name: '财务', icon: '💰', color: '#6C5CE7' },
            { id: 'relationships', name: '人际关系', icon: '👥', color: '#FD79A8' }
        ];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderGoals();
        this.updateStats();
        this.initAnimations();
    }

    // 数据持久化
    loadGoals() {
        const saved = localStorage.getItem('goals');
        return saved ? JSON.parse(saved) : this.getDefaultGoals();
    }

    saveGoals() {
        localStorage.setItem('goals', JSON.stringify(this.goals));
    }

    loadDreams() {
        const saved = localStorage.getItem('dreams');
        return saved ? JSON.parse(saved) : [];
    }

    saveDreams() {
        localStorage.setItem('dreams', JSON.stringify(this.dreams));
    }

    getDefaultGoals() {
        return [
            {
                id: '1',
                title: '每天运动30分钟',
                description: '保持健康的生活方式，提高身体素质',
                category: 'health',
                priority: 'high',
                progress: 75,
                deadline: '2025-12-31',
                createdAt: '2025-01-01',
                status: 'active'
            },
            {
                id: '2',
                title: '学习新技能',
                description: '掌握前端开发新技术，提升专业能力',
                category: 'learning',
                priority: 'medium',
                progress: 45,
                deadline: '2025-06-30',
                createdAt: '2025-01-15',
                status: 'active'
            },
            {
                id: '3',
                title: '储蓄计划',
                description: '每月储蓄收入的20%，为未来做准备',
                category: 'finance',
                priority: 'high',
                progress: 60,
                deadline: '2025-12-31',
                createdAt: '2025-02-01',
                status: 'active'
            },
            {
                id: '4',
                title: '拓展人脉网络',
                description: '参加行业活动，建立专业人际关系',
                category: 'relationships',
                priority: 'medium',
                progress: 30,
                deadline: '2025-08-31',
                createdAt: '2025-02-15',
                status: 'active'
            },
            {
                id: '5',
                title: '职业发展规划',
                description: '制定详细的职业发展路径和行动计划',
                category: 'career',
                priority: 'high',
                progress: 20,
                deadline: '2025-10-31',
                createdAt: '2025-03-01',
                status: 'active'
            }
        ];
    }

    // 目标管理方法
    addGoal(goalData) {
        const goal = {
            id: Date.now().toString(),
            ...goalData,
            progress: 0,
            createdAt: new Date().toISOString().split('T')[0],
            status: 'active'
        };
        this.goals.push(goal);
        this.saveGoals();
        this.renderGoals();
        this.updateStats();
        this.showNotification('目标添加成功！');
    }

    updateGoal(id, updates) {
        const index = this.goals.findIndex(goal => goal.id === id);
        if (index !== -1) {
            this.goals[index] = { ...this.goals[index], ...updates };
            this.saveGoals();
            this.renderGoals();
            this.updateStats();
        }
    }

    deleteGoal(id) {
        this.goals = this.goals.filter(goal => goal.id !== id);
        this.saveGoals();
        this.renderGoals();
        this.updateStats();
        this.showNotification('目标已删除');
    }

    // 筛选和排序
    filterGoals(category) {
        this.currentFilter = category;
        this.renderGoals();
    }

    getFilteredGoals() {
        if (this.currentFilter === 'all') {
            return this.goals;
        }
        return this.goals.filter(goal => goal.category === this.currentFilter);
    }

    // 渲染方法
    renderGoals() {
        const container = document.getElementById('goals-container');
        if (!container) return;

        const goals = this.getFilteredGoals();
        
        container.innerHTML = goals.map(goal => this.createGoalCard(goal)).join('');
        
        // 添加动画效果
        anime({
            targets: '.goal-card',
            translateY: [50, 0],
            opacity: [0, 1],
            delay: anime.stagger(100),
            duration: 600,
            easing: 'easeOutQuart'
        });
    }

    createGoalCard(goal) {
        const category = this.categories.find(c => c.id === goal.category);
        const priorityColors = {
            high: '#FF6B6B',
            medium: '#FFD93D', 
            low: '#4ECDC4'
        };

        return `
            <div class="goal-card bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 cursor-pointer" 
                 data-goal-id="${goal.id}">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center space-x-2">
                        <span class="text-2xl">${category.icon}</span>
                        <span class="text-sm font-medium text-gray-600">${category.name}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <div class="w-3 h-3 rounded-full" style="background-color: ${priorityColors[goal.priority]}"></div>
                        <span class="text-xs text-gray-500">${goal.priority === 'high' ? '高' : goal.priority === 'medium' ? '中' : '低'}优先级</span>
                    </div>
                </div>
                
                <h3 class="text-lg font-semibold text-gray-800 mb-2">${goal.title}</h3>
                <p class="text-sm text-gray-600 mb-4 line-clamp-2">${goal.description}</p>
                
                <div class="mb-4">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-sm text-gray-600">进度</span>
                        <span class="text-sm font-medium" style="color: ${category.color}">${goal.progress}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="h-2 rounded-full transition-all duration-500" 
                             style="width: ${goal.progress}%; background-color: ${category.color}"></div>
                    </div>
                </div>
                
                <div class="flex justify-between items-center text-xs text-gray-500">
                    <span>截止: ${goal.deadline}</span>
                    <div class="flex space-x-2">
                        <button class="edit-goal-btn text-blue-500 hover:text-blue-700" data-goal-id="${goal.id}">
                            编辑
                        </button>
                        <button class="delete-goal-btn text-red-500 hover:text-red-700" data-goal-id="${goal.id}">
                            删除
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // 统计更新
    updateStats() {
        const totalGoals = this.goals.length;
        const completedGoals = this.goals.filter(goal => goal.progress === 100).length;
        const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
        
        // 更新统计卡片
        const statsContainer = document.getElementById('stats-container');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">今日概览</h3>
                    <div class="space-y-4">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">总目标数</span>
                            <span class="text-2xl font-bold" style="color: #FF6B6B">${totalGoals}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">完成率</span>
                            <span class="text-2xl font-bold" style="color: #4ECDC4">${completionRate}%</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">已完成</span>
                            <span class="text-2xl font-bold" style="color: #FFD93D">${completedGoals}</span>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">分类统计</h3>
                    <div class="space-y-3">
                        ${this.categories.map(category => {
                            const categoryGoals = this.goals.filter(goal => goal.category === category.id);
                            const categoryCompleted = categoryGoals.filter(goal => goal.progress === 100).length;
                            const categoryRate = categoryGoals.length > 0 ? Math.round((categoryCompleted / categoryGoals.length) * 100) : 0;
                            
                            return `
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center space-x-2">
                                        <span>${category.icon}</span>
                                        <span class="text-sm text-gray-600">${category.name}</span>
                                    </div>
                                    <div class="text-right">
                                        <span class="text-sm font-medium" style="color: ${category.color}">${categoryRate}%</span>
                                        <div class="text-xs text-gray-500">${categoryCompleted}/${categoryGoals.length}</div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }
    }

    // 事件绑定
    bindEvents() {
        // 添加目标按钮
        const addGoalBtn = document.getElementById('add-goal-btn');
        if (addGoalBtn) {
            addGoalBtn.addEventListener('click', () => this.showAddGoalModal());
        }

        // 分类筛选器
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.filterGoals(category);
                this.updateFilterButtons(category);
            });
        });

        // 目标卡片事件委托
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-goal-btn')) {
                this.editGoal(e.target.dataset.goalId);
            }
            if (e.target.classList.contains('delete-goal-btn')) {
                this.deleteGoal(e.target.dataset.goalId);
            }
        });

        // 模态框事件
        document.addEventListener('click', (e) => {
            if (e.target.id === 'goal-modal-overlay') {
                this.hideModal();
            }
        });
    }

    // 模态框管理
    showAddGoalModal() {
        const modal = document.getElementById('goal-modal');
        const form = document.getElementById('goal-form');
        
        form.reset();
        form.dataset.mode = 'add';
        
        modal.classList.remove('hidden');
        anime({
            targets: '#goal-modal-content',
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutQuart'
        });
    }

    hideModal() {
        const modal = document.getElementById('goal-modal');
        anime({
            targets: '#goal-modal-content',
            scale: [1, 0.8],
            opacity: [1, 0],
            duration: 200,
            easing: 'easeInQuart',
            complete: () => {
                modal.classList.add('hidden');
            }
        });
    }

    // 筛选按钮状态更新
    updateFilterButtons(activeCategory) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('bg-blue-500', 'text-white');
            btn.classList.add('bg-gray-200', 'text-gray-700');
        });
        
        const activeBtn = document.querySelector(`[data-category="${activeCategory}"]`);
        if (activeBtn) {
            activeBtn.classList.remove('bg-gray-200', 'text-gray-700');
            activeBtn.classList.add('bg-blue-500', 'text-white');
        }
    }

    // 通知系统
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notification.textContent = message;
        document.body.appendChild(notification);

        anime({
            targets: notification,
            translateX: [300, 0],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutQuart'
        });

        setTimeout(() => {
            anime({
                targets: notification,
                translateX: [0, 300],
                opacity: [1, 0],
                duration: 300,
                easing: 'easeInQuart',
                complete: () => {
                    document.body.removeChild(notification);
                }
            });
        }, 3000);
    }

    // 动画初始化
    initAnimations() {
        // 页面加载动画
        anime({
            targets: '.animate-on-load',
            translateY: [30, 0],
            opacity: [0, 1],
            delay: anime.stagger(100),
            duration: 800,
            easing: 'easeOutQuart'
        });

        // 背景动画
        this.initBackgroundAnimation();
    }

    initBackgroundAnimation() {
        const canvas = document.getElementById('background-canvas');
        if (!canvas) return;

        // 使用p5.js创建背景动画
        const sketch = (p) => {
            let particles = [];
            
            p.setup = () => {
                p.createCanvas(p.windowWidth, p.windowHeight);
                
                // 创建粒子
                for (let i = 0; i < 50; i++) {
                    particles.push({
                        x: p.random(p.width),
                        y: p.random(p.height),
                        size: p.random(2, 8),
                        speedX: p.random(-0.5, 0.5),
                        speedY: p.random(-0.5, 0.5),
                        color: p.random(['#FF6B6B', '#4ECDC4', '#FFD93D'])
                    });
                }
            };
            
            p.draw = () => {
                p.clear();
                
                // 绘制和更新粒子
                particles.forEach(particle => {
                    p.fill(particle.color + '40');
                    p.noStroke();
                    p.circle(particle.x, particle.y, particle.size);
                    
                    // 更新位置
                    particle.x += particle.speedX;
                    particle.y += particle.speedY;
                    
                    // 边界检查
                    if (particle.x < 0 || particle.x > p.width) particle.speedX *= -1;
                    if (particle.y < 0 || particle.y > p.height) particle.speedY *= -1;
                });
            };
            
            p.windowResized = () => {
                p.resizeCanvas(p.windowWidth, p.windowHeight);
            };
        };
        
        new p5(sketch, canvas);
    }
}

// 表单处理
function handleGoalForm(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    const goalData = {
        title: formData.get('title'),
        description: formData.get('description'),
        category: formData.get('category'),
        priority: formData.get('priority'),
        deadline: formData.get('deadline')
    };
    
    if (form.dataset.mode === 'add') {
        window.goalManager.addGoal(goalData);
    }
    
    window.goalManager.hideModal();
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    // 检查登录状态
    checkAuthentication();
    
    window.goalManager = new GoalManager();
    
    // 表单提交事件
    const goalForm = document.getElementById('goal-form');
    if (goalForm) {
        goalForm.addEventListener('submit', handleGoalForm);
    }
    
    // 模态框关闭按钮
    const closeModalBtn = document.getElementById('close-modal-btn');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            window.goalManager.hideModal();
        });
    }
    
    // 浮动添加按钮
    const floatingAddBtn = document.getElementById('floating-add-btn');
    if (floatingAddBtn) {
        floatingAddBtn.addEventListener('click', () => {
            window.goalManager.showAddGoalModal();
        });
    }
    
    // 模态框关闭按钮2（在表单中）
    const closeModalBtn2 = document.getElementById('close-modal-btn-2');
    if (closeModalBtn2) {
        closeModalBtn2.addEventListener('click', () => {
            window.goalManager.hideModal();
        });
    }
    
    // 添加页面特定的初始化
    initPageSpecificFeatures();
});

// 认证管理
function checkAuthentication() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // 如果是登录页面，不检查认证
    if (currentPage === 'login.html') {
        return;
    }
    
    const loginData = localStorage.getItem('dreamListLogin') || sessionStorage.getItem('dreamListLogin');
    
    if (!loginData) {
        // 未登录，跳转到登录页面
        window.location.href = 'login.html';
        return;
    }
    
    const data = JSON.parse(loginData);
    if (!data.isLoggedIn) {
        window.location.href = 'login.html';
    }
}

function logout() {
    if (confirm('确定要登出吗？')) {
        localStorage.removeItem('dreamListLogin');
        sessionStorage.removeItem('dreamListLogin');
        window.location.href = 'login.html';
    }
}

// 页面特定功能初始化
function initPageSpecificFeatures() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // 初始化通用功能
    initCommonFeatures();
    
    switch(currentPage) {
        case 'index.html':
        case '':
            initGoalPageFeatures();
            break;
        case 'dreams.html':
            initDreamsPageFeatures();
            break;
        case 'analytics.html':
            initAnalyticsPageFeatures();
            break;
        case 'settings.html':
            initSettingsPageFeatures();
            break;
    }
}

// 通用功能初始化
function initCommonFeatures() {
    // 登出按钮事件
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // 视觉化面板按钮
    const visualBoardBtn = document.getElementById('visual-board-btn');
    if (visualBoardBtn) {
        visualBoardBtn.addEventListener('click', () => {
            window.location.href = 'visual-board.html';
        });
    }
}

// 目标页面特定功能
function initGoalPageFeatures() {
    // 添加键盘快捷键
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + N 添加新目标
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            window.goalManager.showAddGoalModal();
        }
        
        // ESC 关闭模态框
        if (e.key === 'Escape') {
            const modal = document.getElementById('goal-modal');
            if (modal && !modal.classList.contains('hidden')) {
                window.goalManager.hideModal();
            }
        }
    });
    
    // 添加滚动效果
    let ticking = false;
    function updateScrollEffects() {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelectorAll('.parallax-element');
        
        parallax.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
        
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateScrollEffects);
            ticking = true;
        }
    });
}

// 梦想页面特定功能
function initDreamsPageFeatures() {
    // 添加键盘快捷键
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + D 添加新梦想
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            if (window.dreamManager) {
                window.dreamManager.showAddDreamModal();
            }
        }
        
        // ESC 关闭模态框
        if (e.key === 'Escape') {
            const modal = document.getElementById('dream-modal');
            if (modal && !modal.classList.contains('hidden')) {
                window.dreamManager.hideModal();
            }
        }
    });
}

// 分析页面特定功能
function initAnalyticsPageFeatures() {
    // 添加图表交互增强
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('stat-card')) {
            // 添加点击统计卡片的动画效果
            anime({
                targets: e.target,
                scale: [1, 1.05, 1],
                duration: 300,
                easing: 'easeOutQuart'
            });
        }
    });
    
    // 添加数据刷新功能
    let refreshTimeout;
    function scheduleDataRefresh() {
        refreshTimeout = setTimeout(() => {
            if (window.analyticsManager) {
                window.analyticsManager.updateKeyMetrics();
                window.analyticsManager.initCharts();
                window.analyticsManager.initHeatmap();
                window.analyticsManager.initRanking();
                window.analyticsManager.initRecentActivities();
            }
            scheduleDataRefresh();
        }, 30000); // 每30秒刷新一次数据
    }
    
    scheduleDataRefresh();
    
    // 页面可见性变化时刷新数据
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && window.analyticsManager) {
            window.analyticsManager.updateKeyMetrics();
        }
    });
}

// 设置页面特定功能
function initSettingsPageFeatures() {
    // 添加设置变更的实时预览
    document.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox' && e.target.id.includes('notifications')) {
            // 模拟通知权限检查
            if (e.target.checked && 'Notification' in window) {
                Notification.requestPermission().then(permission => {
                    if (permission !== 'granted') {
                        e.target.checked = false;
                        window.settingsManager.showNotification('请允许通知权限', 'error');
                    }
                });
            }
        }
    });
    
    // 添加主题预览功能
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
            const theme = e.target.value;
            document.body.className = document.body.className.replace(/theme-\w+/g, '');
            if (theme !== 'auto') {
                document.body.classList.add(`theme-${theme}`);
            }
        });
    }
}

// 通用工具函数
const Utils = {
    // 格式化日期
    formatDate: (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    
    // 计算剩余天数
    getDaysUntil: (dateString) => {
        const targetDate = new Date(dateString);
        const today = new Date();
        const diffTime = targetDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    },
    
    // 生成随机ID
    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // 防抖函数
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // 节流函数
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // 深拷贝对象
    deepClone: (obj) => {
        return JSON.parse(JSON.stringify(obj));
    },
    
    // 验证目标数据
    validateGoal: (goalData) => {
        const errors = [];
        
        if (!goalData.title || goalData.title.trim().length === 0) {
            errors.push('目标标题不能为空');
        }
        
        if (!goalData.description || goalData.description.trim().length === 0) {
            errors.push('目标描述不能为空');
        }
        
        if (!goalData.category) {
            errors.push('请选择目标分类');
        }
        
        if (!goalData.priority) {
            errors.push('请选择优先级');
        }
        
        if (!goalData.deadline) {
            errors.push('请设置截止日期');
        } else if (new Date(goalData.deadline) <= new Date()) {
            errors.push('截止日期必须大于今天');
        }
        
        return errors;
    }
};

// 将工具函数挂载到全局
window.Utils = Utils;

// 添加全局错误处理
window.addEventListener('error', (e) => {
    console.error('应用错误:', e.error);
    // 可以在这里添加错误上报逻辑
});

// 添加未处理的Promise错误
window.addEventListener('unhandledrejection', (e) => {
    console.error('未处理的Promise错误:', e.reason);
    e.preventDefault();
});

// 添加离线状态检测
window.addEventListener('online', () => {
    if (window.goalManager) {
        window.goalManager.showNotification('网络连接已恢复');
    }
});

window.addEventListener('offline', () => {
    if (window.goalManager) {
        window.goalManager.showNotification('网络连接已断开，数据将保存在本地', 'warning');
    }
});

// 添加页面卸载前的数据保存
document.addEventListener('beforeunload', () => {
    // 确保所有数据都已保存
    if (window.goalManager) {
        window.goalManager.saveGoals();
    }
    if (window.dreamManager) {
        window.dreamManager.saveDreams();
    }
});