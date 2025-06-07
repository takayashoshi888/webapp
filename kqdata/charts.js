// 初始化图表
let attendanceChart;

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    if (!JSON.parse(sessionStorage.getItem('currentUser'))) {
        window.location.href = 'index.html';
        return;
    }

    // 初始化用户数据
    initUserData();
    
    // 设置事件监听器
    setupEventListeners();
    
    // 加载默认图表
    loadDefaultChart();
    
    // 强制触发一次resize事件，帮助图表正确显示
    window.dispatchEvent(new Event('resize'));
});

// 初始化用户数据
function initUserData() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    document.getElementById('currentUser').textContent = `欢迎，${currentUser.username}`;
}

// 设置事件监听器
function setupEventListeners() {
    // 返回仪表盘按钮
    document.getElementById('backToDashboard')?.addEventListener('click', function() {
        window.location.href = 'dashboard.html';
    });
    
    // 退出登录按钮
    document.getElementById('logoutBtn')?.addEventListener('click', function() {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
    
    // 刷新图表按钮
    document.getElementById('refreshChart')?.addEventListener('click', refreshChart);

    // 图表类型、时间范围和数据类型选择变化时刷新图表
    document.getElementById('chartType')?.addEventListener('change', refreshChart);
    document.getElementById('timeRange')?.addEventListener('change', refreshChart);
    document.getElementById('dataType')?.addEventListener('change', refreshChart);
}

// 获取用户数据
function getUserData() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        console.error('未找到用户会话数据');
        return { records: [] };
    }
    
    const userId = currentUser.username;
    const userData = JSON.parse(localStorage.getItem('attendanceData_' + userId));
    
    // 确保userData有正确的结构
    if (!userData || !userData.records) {
        console.log('未找到用户数据或记录为空');
        return { records: [] };
    }
    
    return userData;
}

// 加载默认图表
function loadDefaultChart() {
    // 获取用户数据
    const userData = getUserData();
    
    // 检查是否有记录
    if (!userData.records || userData.records.length === 0) {
        // 显示无数据提示
        const ctx = document.getElementById('attendanceChart').getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.font = '16px Arial';
            ctx.fillStyle = '#666';
            ctx.textAlign = 'center';
            ctx.fillText('暂无考勤数据，请先在仪表盘添加记录', ctx.canvas.width / 2, ctx.canvas.height / 2);
            
            // 延时跳转只有在没有数据的情况下才需要
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        }
        return;
    }
    
    // 准备数据（最近30天的数据）
    const chartData = prepareChartData(userData.records, '30days', 'people');
    
    // 创建柱状图
    createChart(chartData.labels, chartData.values, 'bar', '考勤人数统计（最近30天）');
}

// 准备图表数据
function prepareChartData(records, timeRange, dataType) {
    // 获取当前日期
    const now = new Date();
    
    // 根据时间范围过滤记录
    let filteredRecords = records;
    const msPerDay = 24 * 60 * 60 * 1000;
    
    if (timeRange !== 'all') {
        const days = parseInt(timeRange);
        const cutoffDate = new Date(now.getTime() - (days * msPerDay));
        filteredRecords = records.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate >= cutoffDate;
        });
    }

    // 按日期排序
    filteredRecords.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 准备数据
    const labels = filteredRecords.map(record => formatDate(record.date));
    let values = [];

    switch(dataType) {
        case 'people':
            values = filteredRecords.map(record => record.peopleCount);
            break;
        case 'parkingFee':
            values = filteredRecords.map(record => record.parkingFee);
            break;
        case 'highwayFee':
            values = filteredRecords.map(record => record.highwayFee);
            break;
        case 'totalFee':
            values = filteredRecords.map(record => record.parkingFee + record.highwayFee);
            break;
    }

    return { labels, values };
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
}

// 创建图表
function createChart(labels, values, type, title) {
    const ctx = document.getElementById('attendanceChart').getContext('2d');
    
    // 如果已存在图表，先销毁
    if (attendanceChart) {
        attendanceChart.destroy();
    }

    // 获取当前选择的数据类型
    const dataType = document.getElementById('dataType').value;
    const yAxisLabel = getYAxisLabel(dataType);

    // 创建新图表
    attendanceChart = new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: values,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: yAxisLabel
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '日期'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: title,
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
    
    // 添加延时以确保图表渲染完成
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
    }, 100);
}

// 获取Y轴标签
function getYAxisLabel(dataType) {
    switch(dataType) {
        case 'people':
            return '人数';
        case 'parkingFee':
            return '停车费（円）';
        case 'highwayFee':
            return '高速费（円）';
        case 'totalFee':
            return '总费用（円）';
        default:
            return '';
    }
}

// 刷新图表
function refreshChart() {
    const chartType = document.getElementById('chartType').value;
    const timeRange = document.getElementById('timeRange').value;
    const dataType = document.getElementById('dataType').value;
    
    const userData = getUserData();
    if (!userData.records || userData.records.length === 0) {
        showAlert('暂无数据可显示');
        return;
    }
    
    const chartData = prepareChartData(userData.records, timeRange, dataType);
    const title = getChartTitle(dataType, timeRange);
    createChart(chartData.labels, chartData.values, chartType, title);
}

// 获取图表标题
function getChartTitle(dataType, timeRange) {
    let typeText = '';
    switch(dataType) {
        case 'people':
            typeText = '考勤人数';
            break;
        case 'parkingFee':
            typeText = '停车费';
            break;
        case 'highwayFee':
            typeText = '高速费';
            break;
        case 'totalFee':
            typeText = '总费用';
            break;
    }
    
    let timeText = '';
    switch(timeRange) {
        case '7days':
            timeText = '（最近7天）';
            break;
        case '30days':
            timeText = '（最近30天）';
            break;
        case '90days':
            timeText = '（最近90天）';
            break;
        case 'all':
            timeText = '（全部）';
            break;
    }
    
    return `${typeText}统计${timeText}`;
}

// 显示提示信息
function showAlert(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert';
    alertDiv.textContent = message;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}