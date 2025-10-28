// 全局变量
let userSettings = null;
let attendanceRecords = [];
let currentPage = 'settings-page';

// DOM元素
const pages = {
    settings: document.getElementById('settings-page'),
    dashboard: document.getElementById('dashboard-page'),
    history: document.getElementById('history-page'),
    report: document.getElementById('report-page')
};

const navButtons = {
    dashboard: document.getElementById('nav-dashboard'),
    history: document.getElementById('nav-history'),
    report: document.getElementById('nav-report'),
    settings: document.getElementById('nav-settings')
};

const mobileNavButtons = {
    dashboard: document.getElementById('mobile-nav-dashboard'),
    history: document.getElementById('mobile-nav-history'),
    report: document.getElementById('mobile-nav-report'),
    settings: document.getElementById('mobile-nav-settings')
};

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    // 加载用户设置
    loadUserSettings();
    
    // 加载考勤记录
    loadAttendanceRecords();
    
    // 设置当前日期
    setCurrentDate();
    
    // 初始化导航事件
    initNavigation();
    
    // 初始化移动端菜单
    initMobileMenu();
    
    // 初始化设置表单
    initSettingsForm();
    
    // 初始化打卡按钮
    initCheckInButton();
    
    // 初始化历史记录页面
    initHistoryPage();
    
    // 初始化报表页面
    initReportPage();
    
    // 确定初始页面
    determineInitialPage();
});

// 加载用户设置
function loadUserSettings() {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
        userSettings = JSON.parse(savedSettings);
        document.getElementById('name').value = userSettings.name;
        document.getElementById('site').value = userSettings.site;
    }
}

// 保存用户设置
function saveUserSettings(settings) {
    userSettings = settings;
    localStorage.setItem('userSettings', JSON.stringify(settings));
    updateUserInfoDisplay();
}

// 加载考勤记录
function loadAttendanceRecords() {
    const savedRecords = localStorage.getItem('attendanceRecords');
    if (savedRecords) {
        attendanceRecords = JSON.parse(savedRecords);
    }
}

// 保存考勤记录
function saveAttendanceRecords() {
    localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
}

// 设置当前日期
function setCurrentDate() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    document.getElementById('current-date').textContent = now.toLocaleDateString('zh-CN', options);
}

// 初始化导航事件
function initNavigation() {
    // 桌面端导航
    Object.keys(navButtons).forEach(page => {
        navButtons[page].addEventListener('click', () => {
            navigateTo(page + '-page');
        });
    });
    
    // 移动端导航
    Object.keys(mobileNavButtons).forEach(page => {
        mobileNavButtons[page].addEventListener('click', () => {
            navigateTo(page + '-page');
            document.getElementById('mobile-menu').classList.add('hidden');
        });
    });
}

// 初始化移动端菜单
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// 初始化设置表单
function initSettingsForm() {
    const settingsForm = document.getElementById('settings-form');
    
    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const site = document.getElementById('site').value.trim();
        
        if (!name || !site) {
            showNotification('请填写完整的信息', 'error');
            return;
        }
        
        const settings = { name, site };
        saveUserSettings(settings);
        showNotification('设置保存成功');
        
        // 如果是首次设置，导航到打卡页面
        if (currentPage === 'settings-page') {
            navigateTo('dashboard-page');
        }
    });
}

// 初始化打卡按钮
function initCheckInButton() {
    const checkInBtn = document.getElementById('check-in-btn');
    
    checkInBtn.addEventListener('click', () => {
        if (!userSettings) {
            showNotification('请先完成个人信息设置', 'error');
            navigateTo('settings-page');
            return;
        }
        
        const today = new Date();
        const todayStr = formatDate(today);
        
        // 检查是否已经打卡
        const alreadyCheckedIn = attendanceRecords.some(record => record.date === todayStr);
        
        if (alreadyCheckedIn) {
            showNotification('您今天已经打卡了', 'error');
            return;
        }
        
        // 创建新的打卡记录
        const newRecord = {
            date: todayStr,
            name: userSettings.name,
            site: userSettings.site,
            timestamp: today.getTime()
        };
        
        // 添加到记录中
        attendanceRecords.push(newRecord);
        saveAttendanceRecords();
        
        // 更新累计出勤天数
        updateTotalAttendance();
        
        showNotification('打卡成功！');
    });
}

// 初始化历史记录页面
function initHistoryPage() {
    // 生成年份选项
    generateYearOptions();
    
    // 筛选按钮事件
    document.getElementById('filter-btn').addEventListener('click', filterHistoryRecords);
}

// 生成年份选项
function generateYearOptions() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const startYear = 2023; // 起始年份
    
    const yearSelects = [
        document.getElementById('filter-year'),
        document.getElementById('report-year')
    ];
    
    yearSelects.forEach(select => {
        // 清空现有选项
        select.innerHTML = '';
        
        // 添加年份选项
        for (let year = currentYear; year >= startYear; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year + '年';
            select.appendChild(option);
        }
        
        // 默认选择当前年份
        select.value = currentYear;
    });
}

// 筛选历史记录
function filterHistoryRecords() {
    const year = document.getElementById('filter-year').value;
    const month = document.getElementById('filter-month').value;
    
    let filteredRecords = attendanceRecords;
    
    // 按年份筛选
    if (year) {
        filteredRecords = filteredRecords.filter(record => {
            const recordYear = record.date.split('-')[0];
            return recordYear === year;
        });
    }
    
    // 按月份筛选
    if (month && month !== '0') {
        filteredRecords = filteredRecords.filter(record => {
            const recordMonth = record.date.split('-')[1];
            // 确保月份格式一致（补零）
            const formattedMonth = month.padStart(2, '0');
            return recordMonth === formattedMonth;
        });
    }
    
    // 显示筛选结果
    displayHistoryRecords(filteredRecords);
}

// 显示历史记录
function displayHistoryRecords(records) {
    const tableBody = document.getElementById('history-table-body');
    const noHistoryMessage = document.getElementById('no-history-message');
    
    // 清空表格
    tableBody.innerHTML = '';
    
    if (records.length === 0) {
        tableBody.parentElement.classList.add('hidden');
        noHistoryMessage.classList.remove('hidden');
        return;
    }
    
    tableBody.parentElement.classList.remove('hidden');
    noHistoryMessage.classList.add('hidden');
    
    // 按日期倒序排列
    records.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 添加记录到表格
    records.forEach(record => {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-200 hover:bg-gray-50';
        
        row.innerHTML = `
            <td class="py-3 px-4">${record.date}</td>
            <td class="py-3 px-4">${record.name}</td>
            <td class="py-3 px-4">${record.site}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// 初始化报表页面
function initReportPage() {
    // 生成年份选项
    generateYearOptions();
    
    // 设置当前月份为默认值
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    document.getElementById('report-month').value = currentMonth;
    
    // 生成报表按钮事件
    document.getElementById('generate-report-btn').addEventListener('click', generateReport);
    
    // 导出PDF按钮事件
    document.getElementById('export-pdf-btn').addEventListener('click', exportReportToPDF);
    
    // 分享报表按钮事件
    document.getElementById('share-report-btn').addEventListener('click', shareReport);
}

// 生成报表
function generateReport() {
    const year = document.getElementById('report-year').value;
    const month = document.getElementById('report-month').value;
    
    console.log('生成报表参数:', { year, month, attendanceRecords });
    
    if (!userSettings) {
        showNotification('请先完成个人信息设置', 'error');
        return;
    }
    
    // 筛选指定月份的记录 - 修复月份比较问题
    const monthlyRecords = attendanceRecords.filter(record => {
        const recordYear = record.date.split('-')[0];
        const recordMonth = record.date.split('-')[1];
        // 确保月份格式一致（补零）
        const formattedMonth = month.padStart(2, '0');
        const match = recordYear === year && recordMonth === formattedMonth;
        if (match) console.log('匹配记录:', record);
        return match;
    });
    
    console.log('筛选结果:', monthlyRecords);
    
    // 更新报表信息
    document.getElementById('report-name').textContent = userSettings.name;
    document.getElementById('report-site').textContent = userSettings.site;
    document.getElementById('report-attendance-count').textContent = monthlyRecords.length;
    
    // 生成日历
    generateCalendar(year, month, monthlyRecords);
    
    // 生成图表
    generateChart(monthlyRecords);
    
    showNotification(`报表生成成功！共找到 ${monthlyRecords.length} 条记录`);
}

// 生成日历
function generateCalendar(year, month, records) {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    
    // 创建日期对象
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay(); // 0 = 周日, 1 = 周一, ..., 6 = 周六
    
    // 添加星期标题
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    weekdays.forEach(weekday => {
        const dayElement = document.createElement('div');
        dayElement.className = 'text-center font-semibold text-gray-600 py-2';
        dayElement.textContent = weekday;
        calendar.appendChild(dayElement);
    });
    
    // 添加空白格子（月初前的空白）
    for (let i = 0; i < firstDayOfWeek; i++) {
        const emptyElement = document.createElement('div');
        emptyElement.className = 'h-12';
        calendar.appendChild(emptyElement);
    }
    
    // 添加日期格子
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const currentDate = new Date(year, month - 1, day);
        const dayOfWeek = currentDate.getDay(); // 0 = 周日, 1 = 周一, ..., 6 = 周六
        const isAttended = records.some(record => record.date === dateStr);
        
        // 判断是否为工作日（周一至周六）
        const isWorkday = dayOfWeek >= 1 && dayOfWeek <= 6;
        
        // 设置日期格子的样式
        let dayClass = 'h-12 border border-gray-200 flex items-center justify-center relative';
        let dayContent = `<span class="text-sm font-medium">${day}</span>`;
        
        if (isAttended) {
            // 出勤的日子：绿色背景
            dayClass += ' bg-green-100 border-green-300';
            dayContent += '<div class="absolute bottom-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>';
        } else if (isWorkday) {
            // 工作日但未出勤：橙色背景（提醒）
            dayClass += ' bg-orange-50 border-orange-200';
            dayContent += '<div class="absolute bottom-1 right-1 w-2 h-2 bg-orange-400 rounded-full"></div>';
        } else {
            // 周日且未出勤：灰色背景
            dayClass += ' bg-gray-50';
        }
        
        // 如果是周日，添加特殊标记
        if (dayOfWeek === 0) {
            dayContent += '<div class="absolute top-1 left-1 w-1 h-1 bg-blue-400 rounded-full"></div>';
        }
        
        const dayElement = document.createElement('div');
        dayElement.className = dayClass;
        dayElement.innerHTML = dayContent;
        
        // 添加日期信息作为数据属性，便于后续处理
        dayElement.setAttribute('data-date', dateStr);
        dayElement.setAttribute('data-day-of-week', dayOfWeek);
        dayElement.setAttribute('data-is-workday', isWorkday);
        dayElement.setAttribute('data-is-attended', isAttended);
        
        calendar.appendChild(dayElement);
    }
}

// 生成图表
function generateChart(records) {
    const ctx = document.getElementById('attendance-chart').getContext('2d');
    
    // 如果已有图表实例，先销毁
    if (window.attendanceChart) {
        window.attendanceChart.destroy();
    }
    
    // 按周统计出勤情况
    const weeklyData = [0, 0, 0, 0, 0]; // 5周的数据
    
    records.forEach(record => {
        const date = new Date(record.date);
        const weekOfMonth = Math.ceil((date.getDate() + 6 - date.getDay()) / 7);
        if (weekOfMonth >= 1 && weekOfMonth <= 5) {
            weeklyData[weekOfMonth - 1]++;
        }
    });
    
    window.attendanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['第一周', '第二周', '第三周', '第四周', '第五周'],
            datasets: [{
                label: '出勤天数',
                data: weeklyData,
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// 导出报表为PDF
function exportReportToPDF() {
    if (!userSettings) {
        showNotification('请先完成个人信息设置', 'error');
        return;
    }
    
    // 直接使用浏览器打印功能生成PDF（最可靠的方法）
    generatePrintablePDF();
}

// 分享报表功能
function shareReport() {
    if (!userSettings) {
        showNotification('请先完成个人信息设置', 'error');
        return;
    }
    
    const year = document.getElementById('report-year').value;
    const month = document.getElementById('report-month').value;
    
    const monthlyRecords = attendanceRecords.filter(record => {
        const recordYear = record.date.split('-')[0];
        const recordMonth = record.date.split('-')[1];
        const formattedMonth = month.padStart(2, '0');
        return recordYear === year && recordMonth === formattedMonth;
    });
    
    // 创建分享内容
    const shareData = {
        title: `${userSettings.name}的考勤报表 - ${year}年${month}月`,
        text: generateShareText(userSettings, year, month, monthlyRecords),
        url: window.location.href,
        html: generateShareHTML(userSettings, year, month, monthlyRecords)
    };
    
    // 显示分享选项对话框
    showShareDialog(shareData);
}

// 生成分享文本
function generateShareText(userSettings, year, month, records) {
    return `${userSettings.name}的${year}年${month}月考勤报表\n` +
           `现场：${userSettings.site}\n` +
           `出勤天数：${records.length}天\n` +
           `出勤日期：${records.map(r => r.date).join(', ')}`;
}

// 生成分享HTML内容
function generateShareHTML(userSettings, year, month, records) {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #3b82f6; text-align: center;">${userSettings.name}的考勤报表</h2>
            <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <p><strong>现场名称：</strong>${userSettings.site}</p>
                <p><strong>统计月份：</strong>${year}年${month}月</p>
                <p><strong>出勤天数：</strong>${records.length}天</p>
            </div>
            <div>
                <h3 style="color: #4b5563;">出勤记录</h3>
                <ul style="list-style: none; padding: 0;">
                    ${records.map(record => `<li style="padding: 5px 0; border-bottom: 1px solid #eee;">${record.date}</li>`).join('')}
                </ul>
            </div>
            <p style="text-align: center; color: #6b7280; margin-top: 20px;">生成时间：${new Date().toLocaleString('zh-CN')}</p>
        </div>
    `;
}

// 显示分享对话框
function showShareDialog(shareData) {
    // 创建分享对话框
    const dialog = document.createElement('div');
    dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    dialog.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div class="p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold text-gray-800">分享报表</h3>
                    <button class="text-gray-400 hover:text-gray-600" onclick="this.closest('.fixed').remove()">
                        <i class="fa fa-times"></i>
                    </button>
                </div>
                
                <div class="space-y-4">
                    <!-- 复制链接 -->
                    <div class="share-option">
                        <button onclick="copyShareLink('${encodeURIComponent(shareData.text)}')" class="w-full bg-blue-100 text-blue-700 py-3 px-4 rounded-md hover:bg-blue-200 transition-colors flex items-center justify-center">
                            <i class="fa fa-link mr-2"></i>
                            复制分享链接
                        </button>
                    </div>
                    
                    <!-- 生成二维码 -->
                    <div class="share-option">
                        <button onclick="generateQRCode('${encodeURIComponent(shareData.text)}')" class="w-full bg-green-100 text-green-700 py-3 px-4 rounded-md hover:bg-green-200 transition-colors flex items-center justify-center">
                            <i class="fa fa-qrcode mr-2"></i>
                            生成二维码
                        </button>
                    </div>
                    
                    <!-- 邮件分享 -->
                    <div class="share-option">
                        <button onclick="shareByEmail('${encodeURIComponent(shareData.title)}', '${encodeURIComponent(shareData.text)}')" class="w-full bg-red-100 text-red-700 py-3 px-4 rounded-md hover:bg-red-200 transition-colors flex items-center justify-center">
                            <i class="fa fa-envelope mr-2"></i>
                            邮件分享
                        </button>
                    </div>
                    
                    <!-- 复制文本 -->
                    <div class="share-option">
                        <button onclick="copyShareText('${encodeURIComponent(shareData.text)}')" class="w-full bg-purple-100 text-purple-700 py-3 px-4 rounded-md hover:bg-purple-200 transition-colors flex items-center justify-center">
                            <i class="fa fa-copy mr-2"></i>
                            复制文本内容
                        </button>
                    </div>
                </div>
                
                <div class="mt-6 text-center text-sm text-gray-500">
                    <p>选择您喜欢的分享方式</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    // 点击背景关闭对话框
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
            dialog.remove();
        }
    });
}

// 复制分享链接
function copyShareLink(text) {
    const shareUrl = `${window.location.origin}${window.location.pathname}?share=${btoa(text)}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
        showNotification('分享链接已复制到剪贴板');
        document.querySelector('.fixed').remove();
    }).catch(() => {
        showNotification('复制失败，请手动复制', 'error');
    });
}

// 生成二维码
function generateQRCode(text) {
    const shareUrl = `${window.location.origin}${window.location.pathname}?share=${btoa(text)}`;
    
    // 创建二维码对话框
    const dialog = document.createElement('div');
    dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    dialog.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 p-6">
            <div class="text-center">
                <h3 class="text-lg font-semibold mb-4">扫描二维码分享</h3>
                <div id="qrcode" class="mb-4 p-4 bg-white border border-gray-200 rounded">
                    <div class="text-gray-400 text-sm">正在生成二维码...</div>
                </div>
                <button onclick="this.closest('.fixed').remove()" class="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200">
                    关闭
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    // 简单的文本二维码生成（实际项目中可以使用专业库）
    setTimeout(() => {
        const qrcodeEl = document.getElementById('qrcode');
        qrcodeEl.innerHTML = `
            <div style="font-family: monospace; font-size: 8px; line-height: 8px; text-align: center;">
                📱 扫描分享<br>
                ╔══════════╗<br>
                ║ 考勤报表 ║<br>
                ║  二维码  ║<br>
                ╚══════════╝<br>
                链接: ${shareUrl.substring(0, 20)}...
            </div>
        `;
    }, 500);
}

// 邮件分享
function shareByEmail(subject, body) {
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(emailUrl, '_blank');
    document.querySelector('.fixed').remove();
    showNotification('邮件客户端已打开，请填写收件人');
}

// 复制文本内容
function copyShareText(text) {
    navigator.clipboard.writeText(decodeURIComponent(text)).then(() => {
        showNotification('文本内容已复制到剪贴板');
        document.querySelector('.fixed').remove();
    }).catch(() => {
        showNotification('复制失败，请手动复制', 'error');
    });
}

// 使用浏览器打印功能生成PDF
function generatePrintablePDF() {
    const year = document.getElementById('report-year').value;
    const month = document.getElementById('report-month').value;
    
    const monthlyRecords = attendanceRecords.filter(record => {
        const recordYear = record.date.split('-')[0];
        const recordMonth = record.date.split('-')[1];
        const formattedMonth = month.padStart(2, '0');
        return recordYear === year && recordMonth === formattedMonth;
    });
    
    // 创建打印内容
    const printContent = `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
            <meta charset="UTF-8">
            <title>考勤报表 - ${userSettings.name} - ${year}年${month}月</title>
            <style>
                body {
                    font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                    color: #333;
                    line-height: 1.6;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 2px solid #3b82f6;
                    padding-bottom: 15px;
                }
                .header h1 {
                    color: #3b82f6;
                    margin: 0;
                    font-size: 24px;
                }
                .info-section {
                    margin-bottom: 25px;
                    background: #f8fafc;
                    padding: 15px;
                    border-radius: 8px;
                }
                .info-section h2 {
                    color: #4b5563;
                    margin: 0 0 10px 0;
                    font-size: 18px;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                }
                .info-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 5px 0;
                }
                .info-label {
                    font-weight: bold;
                    color: #6b7280;
                }
                .records-section {
                    margin-top: 20px;
                }
                .records-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                }
                .records-table th {
                    background: #3b82f6;
                    color: white;
                    padding: 12px;
                    text-align: left;
                }
                .records-table td {
                    padding: 10px 12px;
                    border-bottom: 1px solid #e5e7eb;
                }
                .records-table tr:nth-child(even) {
                    background: #f9fafb;
                }
                .summary {
                    text-align: center;
                    margin: 20px 0;
                    font-size: 18px;
                    color: #059669;
                    font-weight: bold;
                }
                @media print {
                    body { margin: 0; padding: 15px; }
                    .header { margin-bottom: 20px; }
                    .info-section { margin-bottom: 20px; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>考勤报表</h1>
                <p>生成时间: ${new Date().toLocaleString('zh-CN')}</p>
            </div>
            
            <div class="info-section">
                <h2>基本信息</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">姓名:</span>
                        <span>${userSettings.name}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">现场名称:</span>
                        <span>${userSettings.site}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">统计月份:</span>
                        <span>${year}年${month}月</span>
                    </div>
                </div>
            </div>
            
            <div class="summary">
                本月出勤天数: ${monthlyRecords.length} 天
            </div>
            
            <div class="records-section">
                <h2>出勤记录详情</h2>
                <table class="records-table">
                    <thead>
                        <tr>
                            <th>序号</th>
                            <th>日期</th>
                            <th>星期</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${monthlyRecords.map((record, index) => {
                            const date = new Date(record.date);
                            const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
                            const weekday = weekdays[date.getDay()];
                            return `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${record.date}</td>
                                    <td>星期${weekday}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            
            ${monthlyRecords.length === 0 ? '<p style="text-align: center; color: #6b7280; margin: 40px 0;">本月暂无出勤记录</p>' : ''}
        </body>
        </html>
    `;
    
    // 创建打印窗口
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // 等待内容加载完成后打印
    printWindow.onload = function() {
        setTimeout(() => {
            printWindow.print();
            // 不自动关闭窗口，让用户选择是否保存PDF
            showNotification('请使用浏览器的"打印"功能，选择"另存为PDF"来保存文件');
        }, 500);
    };
}

// 导航到指定页面
function navigateTo(pageId) {
    // 如果没有设置用户信息且不是设置页面，则显示提示
    if (!userSettings && pageId !== 'settings-page') {
        showNotification('请先完成个人信息设置', 'error');
        return;
    }
    
    // 隐藏所有页面
    Object.values(pages).forEach(page => {
        page.classList.add('hidden');
    });
    
    // 显示目标页面
    document.getElementById(pageId).classList.remove('hidden');
    
    // 更新当前页面
    currentPage = pageId;
    
    // 如果导航到历史记录页面，加载历史记录
    if (pageId === 'history-page') {
        filterHistoryRecords();
    }
    
    // 如果导航到报表页面，生成报表
    if (pageId === 'report-page') {
        generateReport();
    }
    
    // 如果导航到打卡页面，更新用户信息和累计出勤天数
    if (pageId === 'dashboard-page') {
        updateUserInfoDisplay();
        updateTotalAttendance();
    }
}

// 更新用户信息显示
function updateUserInfoDisplay() {
    if (userSettings) {
        document.getElementById('user-name').textContent = userSettings.name;
        document.getElementById('user-site').textContent = userSettings.site;
    }
}

// 更新累计出勤天数
function updateTotalAttendance() {
    const totalDays = attendanceRecords.length;
    document.getElementById('total-attendance').textContent = totalDays;
}

// 确定初始页面
function determineInitialPage() {
    if (userSettings) {
        navigateTo('dashboard-page');
    } else {
        navigateTo('settings-page');
    }
}

// 显示通知
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationIcon = document.getElementById('notification-icon');
    const notificationMessage = document.getElementById('notification-message');
    
    // 设置消息内容
    notificationMessage.textContent = message;
    
    // 设置通知类型
    notification.className = 'fixed top-4 right-4 max-w-sm bg-white rounded-lg shadow-lg p-4 transform transition-transform duration-300 flex items-center z-50';
    notification.classList.add(type);
    
    // 设置图标
    if (type === 'error') {
        notificationIcon.className = 'fa fa-exclamation-circle text-red-500';
        notification.classList.add('border-l-4', 'border-red-500');
    } else {
        notificationIcon.className = 'fa fa-check-circle text-green-500';
        notification.classList.add('border-l-4', 'border-green-500');
    }
    
    // 显示通知
    notification.classList.remove('translate-x-full');
    
    // 3秒后自动隐藏
    setTimeout(() => {
        notification.classList.add('translate-x-full');
    }, 3000);
}

// 格式化日期为 YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}