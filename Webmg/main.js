// Web应用管理系统 - 主要JavaScript文件
// 包含数据管理、交互逻辑、动画效果等核心功能

// 全局变量和配置
const APP_CONFIG = {
    version: '1.0.0',
    storage_key: 'webapp_manager_data',
    animation_duration: 300,
    chart_colors: {
        primary: '#00d4ff',
        secondary: '#6c5ce7',
        success: '#00b894',
        warning: '#fdcb6e',
        error: '#e84393'
    }
};

// 数据管理类
class DataManager {
    constructor() {
        this.data = this.loadData();
        this.initializeDefaultData();
    }

    // 加载本地存储数据
    loadData() {
        const stored = localStorage.getItem(APP_CONFIG.storage_key);
        return stored ? JSON.parse(stored) : {};
    }

    // 保存数据到本地存储
    saveData() {
        localStorage.setItem(APP_CONFIG.storage_key, JSON.stringify(this.data));
    }

    // 初始化默认数据
    initializeDefaultData() {
        console.log('初始化默认数据...');
        
        if (!this.data.users || !Array.isArray(this.data.users)) {
            console.log('创建默认用户数据');
            this.data.users = [
                {
                    id: 1,
                    username: 'admin',
                    email: 'admin@webapp.com',
                    password: 'admin123',
                    avatar: 'resources/user-avatar.png',
                    role: 'admin',
                    created_at: new Date().toISOString()
                }
            ];
        }

        if (!this.data.applications) {
            this.data.applications = [
                {
                    id: 1,
                    name: '电商管理系统',
                    description: '完整的电商平台管理后台',
                    icon: '🛒',
                    status: 'running',
                    platform: 'AWS',
                    framework: 'React',
                    database: 'MySQL',
                    domain: 'shop.example.com',
                    created_at: '2024-01-15',
                    updated_at: '2024-10-26',
                    cpu_usage: 45,
                    memory_usage: 62,
                    disk_usage: 38
                },
                {
                    id: 2,
                    name: '博客平台',
                    description: '个人博客和内容管理系统',
                    icon: '📝',
                    status: 'stopped',
                    platform: 'Vercel',
                    framework: 'Next.js',
                    database: 'PostgreSQL',
                    domain: 'blog.example.com',
                    created_at: '2024-02-20',
                    updated_at: '2024-09-15',
                    cpu_usage: 0,
                    memory_usage: 0,
                    disk_usage: 25
                },
                {
                    id: 3,
                    name: 'API网关',
                    description: '微服务API统一入口',
                    icon: '🔀',
                    status: 'running',
                    platform: 'AWS',
                    framework: 'Node.js',
                    database: 'Redis',
                    domain: 'api.example.com',
                    created_at: '2024-03-10',
                    updated_at: '2024-10-25',
                    cpu_usage: 78,
                    memory_usage: 85,
                    disk_usage: 45
                }
            ];
        }

        if (!this.data.platforms) {
            this.data.platforms = [
                {
                    id: 1,
                    name: 'AWS',
                    type: 'cloud',
                    status: 'connected',
                    region: 'us-east-1',
                    access_key: 'AKIAIOSFODNN7EXAMPLE',
                    created_at: '2024-01-01'
                },
                {
                    id: 2,
                    name: 'Vercel',
                    type: 'static',
                    status: 'connected',
                    region: 'global',
                    access_key: 'vercel_token_example',
                    created_at: '2024-02-01'
                },
                {
                    id: 3,
                    name: 'DigitalOcean',
                    type: 'cloud',
                    status: 'disconnected',
                    region: 'nyc3',
                    access_key: '',
                    created_at: '2024-03-01'
                }
            ];
        }

        if (!this.data.databases) {
            this.data.databases = [
                {
                    id: 1,
                    name: '主数据库',
                    type: 'MySQL',
                    host: 'mysql.example.com',
                    port: 3306,
                    database: 'main_app',
                    username: 'app_user',
                    status: 'connected',
                    created_at: '2024-01-01'
                },
                {
                    id: 2,
                    name: '缓存数据库',
                    type: 'Redis',
                    host: 'redis.example.com',
                    port: 6379,
                    database: '0',
                    username: '',
                    status: 'connected',
                    created_at: '2024-02-01'
                },
                {
                    id: 3,
                    name: '分析数据库',
                    type: 'PostgreSQL',
                    host: 'postgres.example.com',
                    port: 5432,
                    database: 'analytics',
                    username: 'analytics_user',
                    status: 'disconnected',
                    created_at: '2024-03-01'
                }
            ];
        }

        if (!this.data.deployments) {
            this.data.deployments = [
                {
                    id: 1,
                    app_id: 1,
                    version: 'v2.1.0',
                    platform: 'AWS',
                    status: 'success',
                    deployed_at: '2024-10-26 14:30:00',
                    duration: '3分45秒'
                },
                {
                    id: 2,
                    app_id: 3,
                    version: 'v1.8.2',
                    platform: 'AWS',
                    status: 'success',
                    deployed_at: '2024-10-25 16:20:00',
                    duration: '2分15秒'
                },
                {
                    id: 3,
                    app_id: 2,
                    version: 'v1.5.1',
                    platform: 'Vercel',
                    status: 'failed',
                    deployed_at: '2024-09-15 10:15:00',
                    duration: '5分30秒'
                }
            ];
        }

        this.saveData();
    }

    // 用户认证
    authenticateUser(username, password) {
        if (!this.data.users || !Array.isArray(this.data.users)) {
            console.error('用户数据不存在或格式错误');
            return null;
        }
        
        const user = this.data.users.find(user => 
            (user.username === username || user.email === username) && 
            user.password === password
        );
        
        console.log('认证用户:', username, '结果:', user ? '成功' : '失败');
        return user;
    }

    // 获取当前登录用户
    getCurrentUser() {
        const userId = localStorage.getItem('current_user_id');
        return userId ? this.data.users.find(u => u.id === parseInt(userId)) : null;
    }

    // 设置当前登录用户
    setCurrentUser(user) {
        localStorage.setItem('current_user_id', user.id.toString());
    }

    // 注销当前用户
    logout() {
        localStorage.removeItem('current_user_id');
    }

    // 应用管理方法
    getApplications() {
        return this.data.applications || [];
    }

    getApplication(id) {
        return this.data.applications.find(app => app.id === id);
    }

    createApplication(appData) {
        const newId = Math.max(...this.data.applications.map(a => a.id), 0) + 1;
        const newApp = {
            id: newId,
            ...appData,
            created_at: new Date().toISOString().split('T')[0],
            updated_at: new Date().toISOString().split('T')[0],
            cpu_usage: 0,
            memory_usage: 0,
            disk_usage: 0
        };
        this.data.applications.push(newApp);
        this.saveData();
        return newApp;
    }

    updateApplication(id, appData) {
        const index = this.data.applications.findIndex(app => app.id === id);
        if (index !== -1) {
            this.data.applications[index] = {
                ...this.data.applications[index],
                ...appData,
                updated_at: new Date().toISOString().split('T')[0]
            };
            this.saveData();
            return this.data.applications[index];
        }
        return null;
    }

    deleteApplication(id) {
        const index = this.data.applications.findIndex(app => app.id === id);
        if (index !== -1) {
            this.data.applications.splice(index, 1);
            this.saveData();
            return true;
        }
        return false;
    }

    // 平台管理方法
    getPlatforms() {
        return this.data.platforms || [];
    }

    // 数据库管理方法
    getDatabases() {
        return this.data.databases || [];
    }

    // 部署历史方法
    getDeployments() {
        return this.data.deployments || [];
    }
}

// 动画管理类
class AnimationManager {
    constructor() {
        this.initializeAnimations();
    }

    initializeAnimations() {
        // 页面加载动画
        this.pageLoadAnimation();
        
        // 卡片悬停效果
        this.cardHoverEffects();
        
        // 按钮点击效果
        this.buttonClickEffects();
        
        // 表单验证动画
        this.formValidationAnimations();
    }

    pageLoadAnimation() {
        // 页面元素渐入动画
        anime({
            targets: '.fade-in',
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 800,
            delay: anime.stagger(100),
            easing: 'easeOutQuart'
        });

        // 数字跳动动画
        anime({
            targets: '.count-up',
            innerHTML: [0, (el) => el.getAttribute('data-count')],
            duration: 2000,
            round: 1,
            easing: 'easeOutExpo'
        });
    }

    cardHoverEffects() {
        const cards = document.querySelectorAll('.app-card, .platform-card, .database-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                anime({
                    targets: card,
                    scale: 1.05,
                    rotateY: 5,
                    boxShadow: '0 20px 40px rgba(0, 212, 255, 0.2)',
                    duration: 300,
                    easing: 'easeOutQuart'
                });
            });

            card.addEventListener('mouseleave', () => {
                anime({
                    targets: card,
                    scale: 1,
                    rotateY: 0,
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    duration: 300,
                    easing: 'easeOutQuart'
                });
            });
        });
    }

    buttonClickEffects() {
        const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const ripple = document.createElement('span');
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple');

                button.appendChild(ripple);

                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
    }

    formValidationAnimations() {
        const inputs = document.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                anime({
                    targets: input,
                    borderColor: '#00d4ff',
                    boxShadow: '0 0 0 3px rgba(0, 212, 255, 0.1)',
                    duration: 200
                });
            });

            input.addEventListener('blur', () => {
                anime({
                    targets: input,
                    borderColor: '#4a5568',
                    boxShadow: '0 0 0 0px rgba(0, 212, 255, 0)',
                    duration: 200
                });
            });
        });
    }

    // 显示成功消息动画
    showSuccessMessage(message) {
        const toast = this.createToast(message, 'success');
        this.animateToast(toast);
    }

    // 显示错误消息动画
    showErrorMessage(message) {
        const toast = this.createToast(message, 'error');
        this.animateToast(toast);
    }

    createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${type === 'success' ? '✅' : '❌'}</span>
                <span class="toast-message">${message}</span>
            </div>
        `;
        document.body.appendChild(toast);
        return toast;
    }

    animateToast(toast) {
        anime({
            targets: toast,
            translateX: [300, 0],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutQuart'
        });

        setTimeout(() => {
            anime({
                targets: toast,
                translateX: [0, 300],
                opacity: [1, 0],
                duration: 300,
                easing: 'easeInQuart',
                complete: () => toast.remove()
            });
        }, 3000);
    }
}

// 图表管理类
class ChartManager {
    constructor() {
        this.charts = {};
    }

    // 创建应用状态分布饼图
    createAppStatusChart(containerId, data) {
        const chart = echarts.init(document.getElementById(containerId));
        
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'item',
                backgroundColor: '#1a1a2e',
                borderColor: '#00d4ff',
                textStyle: { color: '#ffffff' }
            },
            series: [{
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['50%', '50%'],
                data: data,
                itemStyle: {
                    borderRadius: 8,
                    borderColor: '#1a1a2e',
                    borderWidth: 2
                },
                label: {
                    color: '#ffffff',
                    fontSize: 14
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 212, 255, 0.5)'
                    }
                }
            }]
        };

        chart.setOption(option);
        this.charts[containerId] = chart;
        return chart;
    }

    // 创建性能监控折线图
    createPerformanceChart(containerId, data) {
        const chart = echarts.init(document.getElementById(containerId));
        
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                backgroundColor: '#1a1a2e',
                borderColor: '#00d4ff',
                textStyle: { color: '#ffffff' }
            },
            legend: {
                data: ['CPU使用率', '内存使用率', '磁盘使用率'],
                textStyle: { color: '#ffffff' },
                top: 10
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: data.timestamps,
                axisLine: { lineStyle: { color: '#4a5568' } },
                axisLabel: { color: '#b2b2b2' }
            },
            yAxis: {
                type: 'value',
                axisLine: { lineStyle: { color: '#4a5568' } },
                axisLabel: { color: '#b2b2b2' },
                splitLine: { lineStyle: { color: '#2d3748' } }
            },
            series: [
                {
                    name: 'CPU使用率',
                    type: 'line',
                    data: data.cpu,
                    smooth: true,
                    lineStyle: { color: '#00d4ff' },
                    areaStyle: { color: 'rgba(0, 212, 255, 0.1)' }
                },
                {
                    name: '内存使用率',
                    type: 'line',
                    data: data.memory,
                    smooth: true,
                    lineStyle: { color: '#6c5ce7' },
                    areaStyle: { color: 'rgba(108, 92, 231, 0.1)' }
                },
                {
                    name: '磁盘使用率',
                    type: 'line',
                    data: data.disk,
                    smooth: true,
                    lineStyle: { color: '#00b894' },
                    areaStyle: { color: 'rgba(0, 184, 148, 0.1)' }
                }
            ]
        };

        chart.setOption(option);
        this.charts[containerId] = chart;
        return chart;
    }

    // 创建资源使用仪表盘
    createResourceGauge(containerId, value, title) {
        const chart = echarts.init(document.getElementById(containerId));
        
        const option = {
            backgroundColor: 'transparent',
            series: [{
                type: 'gauge',
                startAngle: 180,
                endAngle: 0,
                min: 0,
                max: 100,
                splitNumber: 10,
                itemStyle: {
                    color: '#00d4ff'
                },
                progress: {
                    show: true,
                    width: 18
                },
                pointer: {
                    show: false
                },
                axisLine: {
                    lineStyle: {
                        width: 18,
                        color: [[1, '#2d3748']]
                    }
                },
                axisTick: {
                    show: false
                },
                splitLine: {
                    show: false
                },
                axisLabel: {
                    show: false
                },
                title: {
                    fontSize: 14,
                    color: '#b2b2b2',
                    offsetCenter: [0, '30%']
                },
                detail: {
                    fontSize: 24,
                    color: '#ffffff',
                    formatter: '{value}%',
                    offsetCenter: [0, '-10%']
                },
                data: [{
                    value: value,
                    name: title
                }]
            }]
        };

        chart.setOption(option);
        this.charts[containerId] = chart;
        return chart;
    }

    // 响应式调整
    resizeCharts() {
        Object.values(this.charts).forEach(chart => {
            chart.resize();
        });
    }
}

// 模态框管理类
class ModalManager {
    constructor() {
        this.activeModal = null;
    }

    // 显示应用详情模态框
    showAppDetailModal(app) {
        const modal = this.createModal('应用详情', this.generateAppDetailContent(app));
        this.showModal(modal);
    }

    // 显示创建应用模态框
    showCreateAppModal() {
        const modal = this.createModal('创建新应用', this.generateCreateAppContent());
        this.showModal(modal);
        this.initializeCreateAppForm();
    }

    // 显示确认对话框
    showConfirmModal(message, onConfirm) {
        const modal = this.createModal('确认操作', this.generateConfirmContent(message, onConfirm));
        this.showModal(modal);
    }

    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-content">
                    ${content}
                </div>
            </div>
        `;

        // 绑定关闭事件
        modal.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        });

        return modal;
    }

    showModal(modal) {
        document.body.appendChild(modal);
        this.activeModal = modal;

        // 动画显示
        anime({
            targets: modal,
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutQuart'
        });

        anime({
            targets: modal.querySelector('.modal-container'),
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutQuart'
        });
    }

    closeModal(modal) {
        anime({
            targets: modal,
            opacity: [1, 0],
            duration: 200,
            easing: 'easeInQuart',
            complete: () => {
                modal.remove();
                this.activeModal = null;
            }
        });
    }

    generateAppDetailContent(app) {
        return `
            <div class="app-detail">
                <div class="app-header">
                    <div class="app-icon">${app.icon}</div>
                    <div class="app-info">
                        <h4>${app.name}</h4>
                        <p>${app.description}</p>
                        <span class="status status-${app.status}">${app.status}</span>
                    </div>
                </div>
                
                <div class="app-stats">
                    <div class="stat-item">
                        <span class="stat-label">CPU使用率</span>
                        <span class="stat-value">${app.cpu_usage}%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">内存使用率</span>
                        <span class="stat-value">${app.memory_usage}%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">磁盘使用率</span>
                        <span class="stat-value">${app.disk_usage}%</span>
                    </div>
                </div>

                <div class="app-config">
                    <h5>配置信息</h5>
                    <div class="config-grid">
                        <div class="config-item">
                            <span class="config-label">部署平台</span>
                            <span class="config-value">${app.platform}</span>
                        </div>
                        <div class="config-item">
                            <span class="config-label">开发框架</span>
                            <span class="config-value">${app.framework}</span>
                        </div>
                        <div class="config-item">
                            <span class="config-label">数据库</span>
                            <span class="config-value">${app.database}</span>
                        </div>
                        <div class="config-item">
                            <span class="config-label">域名</span>
                            <span class="config-value">${app.domain}</span>
                        </div>
                        <div class="config-item">
                            <span class="config-label">创建时间</span>
                            <span class="config-value">${app.created_at}</span>
                        </div>
                        <div class="config-item">
                            <span class="config-label">更新时间</span>
                            <span class="config-value">${app.updated_at}</span>
                        </div>
                    </div>
                </div>

                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="appManager.toggleAppStatus(${app.id})">
                        ${app.status === 'running' ? '停止应用' : '启动应用'}
                    </button>
                    <button class="btn btn-secondary" onclick="appManager.editApp(${app.id})">
                        编辑配置
                    </button>
                </div>
            </div>
        `;
    }

    generateCreateAppContent() {
        return `
            <form id="create-app-form" class="create-app-form">
                <div class="form-group">
                    <label for="app-name">应用名称 *</label>
                    <input type="text" id="app-name" name="name" required class="form-input">
                </div>

                <div class="form-group">
                    <label for="app-description">应用描述</label>
                    <textarea id="app-description" name="description" rows="3" class="form-input"></textarea>
                </div>

                <div class="form-group">
                    <label for="app-icon">应用图标</label>
                    <select id="app-icon" name="icon" class="form-input">
                        <option value="🌐">🌐 Web应用</option>
                        <option value="📱">📱 移动应用</option>
                        <option value="🛒">🛒 电商应用</option>
                        <option value="📝">📝 博客应用</option>
                        <option value="🔀">🔀 API服务</option>
                        <option value="📊">📊 数据分析</option>
                        <option value="🎮">🎮 游戏应用</option>
                        <option value="🏢">🏢 企业应用</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="app-framework">开发框架 *</label>
                    <select id="app-framework" name="framework" required class="form-input">
                        <option value="">请选择框架</option>
                        <option value="React">React</option>
                        <option value="Vue.js">Vue.js</option>
                        <option value="Angular">Angular</option>
                        <option value="Next.js">Next.js</option>
                        <option value="Node.js">Node.js</option>
                        <option value="Django">Django</option>
                        <option value="Flask">Flask</option>
                        <option value="Spring Boot">Spring Boot</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="app-platform">部署平台 *</label>
                    <select id="app-platform" name="platform" required class="form-input">
                        <option value="">请选择平台</option>
                        <option value="AWS">AWS</option>
                        <option value="Vercel">Vercel</option>
                        <option value="Netlify">Netlify</option>
                        <option value="DigitalOcean">DigitalOcean</option>
                        <option value="Heroku">Heroku</option>
                        <option value="阿里云">阿里云</option>
                        <option value="腾讯云">腾讯云</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="app-database">数据库类型 *</label>
                    <select id="app-database" name="database" required class="form-input">
                        <option value="">请选择数据库</option>
                        <option value="MySQL">MySQL</option>
                        <option value="PostgreSQL">PostgreSQL</option>
                        <option value="MongoDB">MongoDB</option>
                        <option value="Redis">Redis</option>
                        <option value="SQLite">SQLite</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="app-domain">域名</label>
                    <input type="text" id="app-domain" name="domain" placeholder="example.com" class="form-input">
                </div>

                <div class="modal-actions">
                    <button type="submit" class="btn btn-primary">创建应用</button>
                    <button type="button" class="btn btn-secondary" onclick="modalManager.closeModal(modalManager.activeModal)">取消</button>
                </div>
            </form>
        `;
    }

    generateConfirmContent(message, onConfirm) {
        return `
            <div class="confirm-content">
                <p class="confirm-message">${message}</p>
                <div class="modal-actions">
                    <button class="btn btn-danger" onclick="modalManager.closeModal(modalManager.activeModal); ${onConfirm}">确认</button>
                    <button class="btn btn-secondary" onclick="modalManager.closeModal(modalManager.activeModal)">取消</button>
                </div>
            </div>
        `;
    }

    initializeCreateAppForm() {
        const form = document.getElementById('create-app-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const appData = Object.fromEntries(formData.entries());
            
            // 验证必填字段
            if (!appData.name || !appData.framework || !appData.platform || !appData.database) {
                animationManager.showErrorMessage('请填写所有必填字段');
                return;
            }

            // 创建应用
            const newApp = dataManager.createApplication(appData);
            if (newApp) {
                animationManager.showSuccessMessage('应用创建成功！');
                this.closeModal(this.activeModal);
                
                // 如果是应用管理页面，刷新应用列表
                if (typeof appManager !== 'undefined' && appManager.refreshAppsList) {
                    appManager.refreshAppsList();
                }
            } else {
                animationManager.showErrorMessage('应用创建失败，请重试');
            }
        });
    }
}

// 全局实例
let dataManager, animationManager, chartManager, modalManager;

// 初始化管理器
document.addEventListener('DOMContentLoaded', () => {
    try {
        dataManager = new DataManager();
        animationManager = new AnimationManager();
        chartManager = new ChartManager();
        modalManager = new ModalManager();

        // 响应式图表调整
        window.addEventListener('resize', () => {
            if (chartManager && chartManager.resizeCharts) {
                chartManager.resizeCharts();
            }
        });
        
        console.log('所有管理器初始化成功');
    } catch (error) {
        console.error('初始化管理器时出错:', error);
    }
});

// 工具函数
const Utils = {
    // 格式化日期
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN');
    },

    // 生成随机ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // 防抖函数
    debounce(func, wait) {
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
    throttle(func, limit) {
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
    }
};