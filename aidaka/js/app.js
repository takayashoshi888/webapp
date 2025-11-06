// 应用主脚本文件
document.addEventListener('DOMContentLoaded', () => {
    // 初始化应用
    initApp();
});

// 全局变量
let currentUser = {
    name: '',
    site: '',
    weekDay: ''
};

let attendanceData = [];
let siteList = [];
let currentMonth = new Date();
let selectedDate = null;
let notes = [];

// 笔记附件和标签相关变量
let currentAttachments = [];
let currentTags = ['工作笔记'];

// 初始化应用
function initApp() {
    // 从本地存储加载数据
    loadFromLocalStorage();
    
    // 初始化事件监听器
    initEventListeners();
    
    // 更新UI
    updateUI();
    
    // 显示欢迎页面并开始倒计时
    showWelcomeScreen();
    
    // 设置星期几
    setWeekDay();
}

// 从本地存储加载数据
function loadFromLocalStorage() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }
    
    const savedAttendance = localStorage.getItem('attendanceData');
    if (savedAttendance) {
        attendanceData = JSON.parse(savedAttendance);
    }
    
    const savedSites = localStorage.getItem('siteList');
    if (savedSites) {
        siteList = JSON.parse(savedSites);
    }
    
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
        notes = JSON.parse(savedNotes);
    }
}

// 保存数据到本地存储
function saveToLocalStorage() {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
    localStorage.setItem('siteList', JSON.stringify(siteList));
    localStorage.setItem('notes', JSON.stringify(notes));
}

// 初始化事件监听器
function initEventListeners() {
    // 底部导航栏
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const screenId = item.getAttribute('data-screen');
            if (screenId) {
                showScreen(screenId);
                updateBottomNav(item);
            }
        });
    });
    
    // 返回按钮
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            showScreen('management-screen');
        });
    });
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 查看数据按钮
    document.getElementById('view-data-btn').addEventListener('click', () => {
        showScreen('management-screen');
    });
    
    // 退出按钮
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    // 管理页面导航卡片
    document.querySelectorAll('.nav-card').forEach(card => {
        card.addEventListener('click', () => {
            const page = card.getAttribute('data-page');
            if (page) {
                showScreen(`${page}-screen`);
            }
        });
    });
    
    // 月份导航
    document.getElementById('prev-month').addEventListener('click', () => {
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        updateCalendar();
    });
    
    document.getElementById('next-month').addEventListener('click', () => {
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        updateCalendar();
    });
    
    // 统计页面月份导航
    document.getElementById('prev-stats-month').addEventListener('click', () => {
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        updateStatistics();
    });
    
    document.getElementById('next-stats-month').addEventListener('click', () => {
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        updateStatistics();
    });
    
    // 添加现场
    document.getElementById('add-site-btn').addEventListener('click', () => {
        showModal('add-site-modal');
    });
    
    // 添加现场确认
    document.querySelector('#add-site-modal .confirm-btn').addEventListener('click', addNewSite);
    
    // 功能列表
    document.getElementById('ai-assistant').addEventListener('click', () => {
        showModal('ai-assistant-modal');
    });
    
    document.getElementById('export-report').addEventListener('click', exportReport);
    document.getElementById('share-data').addEventListener('click', shareData);
    document.getElementById('ai-summary').addEventListener('click', generateSummary);
    
    // AI助手发送消息
    document.getElementById('send-query').addEventListener('click', sendAIMessage);
    
    // AI助手快捷查询
    document.querySelectorAll('.quick-query-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('user-query').value = btn.textContent;
        });
    });
    
    // 模态框关闭按钮
    document.querySelectorAll('.close-modal, .cancel-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            hideModal();
        });
    });
    
    // 模态框背景点击关闭
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal();
            }
        });
    });
    
    // 笔记功能相关事件
    document.getElementById('add-note-btn').addEventListener('click', () => {
        showAddNoteModal();
    });
    
    // 保存笔记按钮
    document.getElementById('save-note-btn').addEventListener('click', saveNote);
    
    // 笔记内容字数统计
    document.getElementById('note-title').addEventListener('input', updateCharCount);
    document.getElementById('note-content').addEventListener('input', updateCharCount);
    
    // 笔记附件功能
    document.getElementById('add-note-attach').addEventListener('click', showAttachmentSection);
    
    // 笔记标签功能
    document.getElementById('add-note-tag').addEventListener('click', showTagSection);
    
    // 附件功能相关事件
    document.getElementById('close-attachment').addEventListener('click', hideAttachmentSection);
    document.getElementById('file-select-btn').addEventListener('click', () => {
        document.getElementById('file-input').click();
    });
    document.getElementById('file-input').addEventListener('change', handleFileSelect);
    
    // 拖拽上传功能
    const dropzone = document.getElementById('attachment-dropzone');
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });
    
    dropzone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
    });
    
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        handleFiles(files);
    });
    
    // 标签功能相关事件
    document.getElementById('close-tag').addEventListener('click', hideTagSection);
    document.getElementById('add-tag-btn').addEventListener('click', addTagFromInput);
    document.getElementById('tag-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTagFromInput();
        }
    });
    
    // 快捷标签
    document.querySelectorAll('.quick-tag').forEach(btn => {
        btn.addEventListener('click', () => {
            const tag = btn.getAttribute('data-tag');
            addTag(tag);
        });
    });
}

// 显示欢迎页面并开始倒计时
function showWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcome-screen');
    showScreen('welcome-screen');
    
    // 5秒后跳转到打卡页面
    setTimeout(() => {
        showScreen('checkin-screen');
    }, 5000);
}

// 显示指定屏幕
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        
        // 控制底部导航栏的显示
        const bottomNav = document.querySelector('.bottom-nav');
        if (bottomNav) {
            // 欢迎页面和打卡页面不显示底部导航栏
            if (screenId === 'welcome-screen' || screenId === 'checkin-screen') {
                bottomNav.style.display = 'none';
            } else {
                bottomNav.style.display = 'flex';
            }
        }
        
        // 根据页面更新内容
        switch(screenId) {
            case 'management-screen':
                updateManagementScreen();
                break;
            case 'site-settings-screen':
                updateSiteSettingsScreen();
                break;
            case 'attendance-records-screen':
                updateAttendanceRecordsScreen();
                break;
            case 'data-statistics-screen':
                updateStatistics();
                break;
            case 'notes-screen':
                updateNotesScreen();
                break;
        }
    }
}

// 绑定事件监听器
function bindEventListeners() {
    // 绑定打卡按钮
    const checkinBtn = document.getElementById('checkin-btn');
    if (checkinBtn) {
        checkinBtn.addEventListener('click', checkIn);
        console.log('打卡按钮绑定成功');
    } else {
        console.log('未找到打卡按钮');
    }
    
    // 绑定保存信息按钮
    const saveInfoBtn = document.querySelector('.save-info-btn');
    if (saveInfoBtn) {
        saveInfoBtn.addEventListener('click', saveUserInfo);
        console.log('保存信息按钮绑定成功');
    } else {
        console.log('未找到保存信息按钮');
    }
    
    // 绑定其他事件监听器
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const screenId = item.getAttribute('data-screen');
            if (screenId) {
                showScreen(screenId);
                updateBottomNav(item);
            }
        });
    });
    
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            showScreen('management-screen');
        });
    });
    
    document.getElementById('view-data-btn').addEventListener('click', () => {
        showScreen('management-screen');
    });
    
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    document.querySelectorAll('.nav-card').forEach(card => {
        card.addEventListener('click', () => {
            const page = card.getAttribute('data-page');
            if (page) {
                showScreen(`${page}-screen`);
            }
        });
    });
    
    document.getElementById('prev-month').addEventListener('click', () => {
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        updateCalendar();
    });
    
    document.getElementById('next-month').addEventListener('click', () => {
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        updateCalendar();
    });
}

// 更新底部导航状态
function updateBottomNav(activeItem) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    activeItem.classList.add('active');
}

// 设置星期几
function setWeekDay() {
    const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    currentUser.weekDay = weekDays[new Date().getDay()];
}

// 更新UI
function updateUI() {
    // 更新用户信息
    if (currentUser.name) {
        document.getElementById('user-name').value = currentUser.name;
        document.getElementById('header-user-name').textContent = currentUser.name;
    }
    
    if (currentUser.site) {
        document.getElementById('site-name').value = currentUser.site;
        document.getElementById('header-site-name').textContent = currentUser.site;
    }
    
    document.getElementById('week-day').textContent = currentUser.weekDay;
}

// 保存用户信息
function saveUserInfo() {
    const name = document.getElementById('user-name').value.trim();
    const site = document.getElementById('site-name').value.trim();
    
    if (!name) {
        showToast('请输入您的姓名', 'error');
        return;
    }
    
    if (!site) {
        showToast('请输入现场名称', 'error');
        return;
    }
    
    currentUser.name = name;
    currentUser.site = site;
    
    saveToLocalStorage();
    updateUI();
    showToast('信息保存成功', 'success');
}

// 打卡功能
function checkIn() {
    const name = document.getElementById('user-name').value.trim();
    const site = document.getElementById('site-name').value.trim();
    
    if (!name || !site) {
        showToast('请先填写完整信息', 'error');
        return;
    }
    
    const now = new Date();
    const date = formatDate(now);
    const time = formatTime(now);
    
    // 检查今天是否已打卡
    const todayRecord = attendanceData.find(record => 
        record.name === name && 
        record.site === site && 
        record.date === date
    );
    
    if (todayRecord) {
        showToast('今天已经打卡了', 'warning');
        return;
    }
    
    // 创建打卡记录
    const record = {
        id: Date.now().toString(),
        name,
        site,
        date,
        time,
        timestamp: now.getTime()
    };
    
    attendanceData.push(record);
    saveToLocalStorage();
    
    showToast('打卡成功！', 'success');
    
    // 2秒后跳转到管理页面
    setTimeout(() => {
        showScreen('management-screen');
    }, 2000);
}

// 更新管理页面
function updateManagementScreen() {
    updateCalendar();
}

// 更新日历
function updateCalendar() {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // 更新月份显示
    document.getElementById('current-month').textContent = `${year}年${month + 1}月`;
    
    // 清空日历
    const calendarGrid = document.querySelector('.calendar-grid');
    // 保留表头
    const headers = Array.from(calendarGrid.querySelectorAll('.day-header'));
    calendarGrid.innerHTML = '';
    headers.forEach(header => calendarGrid.appendChild(header));
    
    // 获取月份第一天和最后一天
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    
    // 添加上月尾部日期
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const day = prevLastDay.getDate() - i;
        createCalendarDay(day, 'prev-month', new Date(year, month - 1, day));
    }
    
    // 添加当月日期
    const today = new Date();
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day);
        let status = 'current-month';
        
        if (date.toDateString() === today.toDateString()) {
            status += ' today';
        }
        
        // 检查是否有打卡记录
        const dateStr = formatDate(date);
        const hasRecord = attendanceData.some(record => record.date === dateStr);
        if (hasRecord) {
            status += ' checked-in';
        }
        
        createCalendarDay(day, status, date);
    }
    
    // 添加下月开始日期
    const remainingCells = 42 - (firstDayOfWeek + lastDay.getDate());
    for (let day = 1; day <= remainingCells; day++) {
        createCalendarDay(day, 'next-month', new Date(year, month + 1, day));
    }
}

// 创建日历日期元素
function createCalendarDay(day, status, date) {
    const calendarGrid = document.querySelector('.calendar-grid');
    const dayElement = document.createElement('div');
    dayElement.className = `calendar-day ${status}`;
    dayElement.textContent = day;
    
    // 添加点击事件
    if (status.includes('current-month')) {
        dayElement.addEventListener('click', () => {
            handleCalendarClick(date);
        });
    }
    
    calendarGrid.appendChild(dayElement);
}

// 处理日历点击
function handleCalendarClick(date) {
    const dateStr = formatDate(date);
    selectedDate = date;
    
    // 查找当天的打卡记录
    const record = attendanceData.find(r => r.date === dateStr);
    
    if (record) {
        // 已有记录，询问是否取消
        if (confirm(`已找到${dateStr}的打卡记录，是否取消打卡？`)) {
            // 取消打卡
            attendanceData = attendanceData.filter(r => r.date !== dateStr);
            saveToLocalStorage();
            updateCalendar();
            showToast(`已取消${dateStr}的打卡记录`, 'success');
        }
    } else {
        // 没有记录，询问是否提前打卡
        if (confirm(`${dateStr}没有打卡记录，是否提前打卡？`)) {
            // 提前打卡
            const name = currentUser.name || '未设置';
            const site = currentUser.site || '未设置';
            const time = '09:00:00'; // 默认上班时间
            
            const newRecord = {
                id: Date.now().toString(),
                name,
                site,
                date: dateStr,
                time,
                timestamp: date.getTime(),
                isAdvance: true
            };
            
            attendanceData.push(newRecord);
            saveToLocalStorage();
            updateCalendar();
            showToast(`已添加${dateStr}的提前打卡记录`, 'success');
        }
    }
}

// 更新现场设置页面
function updateSiteSettingsScreen() {
    const siteListElement = document.querySelector('.site-list');
    siteListElement.innerHTML = '';
    
    if (siteList.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = '暂无现场记录';
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.padding = '2rem';
        emptyMessage.style.color = '#6c757d';
        siteListElement.appendChild(emptyMessage);
        return;
    }
    
    siteList.forEach(site => {
        const siteItem = document.createElement('div');
        siteItem.className = 'site-item';
        
        siteItem.innerHTML = `
            <div class="site-info">
                <div class="site-name">${site.name}</div>
                <div class="site-meta">星期：${site.weekDay} | 用户：${site.userName}</div>
                <div class="site-meta">创建时间：${site.createdTime}</div>
            </div>
            <div class="site-actions">
                <button class="action-btn edit" data-id="${site.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" data-id="${site.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // 添加编辑和删除事件
        siteItem.querySelector('.edit').addEventListener('click', (e) => {
            e.stopPropagation();
            editSite(site.id);
        });
        
        siteItem.querySelector('.delete').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteSite(site.id);
        });
        
        siteListElement.appendChild(siteItem);
    });
}

// 添加新现场
function addNewSite() {
    const siteName = document.getElementById('new-site-name').value.trim();
    
    if (!siteName) {
        showToast('请输入现场名称', 'error');
        return;
    }
    
    const now = new Date();
    const newSite = {
        id: Date.now().toString(),
        name: siteName,
        weekDay: currentUser.weekDay,
        userName: currentUser.name || '未设置',
        createdTime: formatDateTime(now)
    };
    
    siteList.push(newSite);
    saveToLocalStorage();
    updateSiteSettingsScreen();
    
    // 重置表单并关闭弹窗
    document.getElementById('new-site-name').value = '';
    hideModal();
    
    showToast('现场添加成功', 'success');
}

// 编辑现场
function editSite(id) {
    const site = siteList.find(s => s.id === id);
    if (!site) return;
    
    const newName = prompt('请输入新的现场名称:', site.name);
    if (newName && newName.trim()) {
        site.name = newName.trim();
        saveToLocalStorage();
        updateSiteSettingsScreen();
        showToast('现场更新成功', 'success');
    }
}

// 删除现场
function deleteSite(id) {
    if (confirm('确定要删除此现场吗？')) {
        siteList = siteList.filter(s => s.id !== id);
        saveToLocalStorage();
        updateSiteSettingsScreen();
        showToast('现场删除成功', 'success');
    }
}

// 更新打卡记录页面
function updateAttendanceRecordsScreen() {
    const recordsList = document.querySelector('.records-list');
    recordsList.innerHTML = '';
    
    if (attendanceData.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = '暂无打卡记录';
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.padding = '2rem';
        emptyMessage.style.color = '#6c757d';
        recordsList.appendChild(emptyMessage);
        return;
    }
    
    // 按时间排序（最新的在前面）
    const sortedRecords = [...attendanceData].sort((a, b) => b.timestamp - a.timestamp);
    
    sortedRecords.forEach(record => {
        const recordItem = document.createElement('div');
        recordItem.className = 'record-item';
        
        recordItem.innerHTML = `
            <div class="record-info">
                <div class="record-name">${record.name}</div>
                <div class="record-meta">
                    <div class="record-site">${record.site}</div>
                    <div class="record-date">${record.date}</div>
                    <div class="record-time">${record.time}</div>
                </div>
            </div>
            <div class="record-actions">
                <button class="action-btn edit" data-id="${record.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" data-id="${record.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // 添加编辑和删除事件
        recordItem.querySelector('.edit').addEventListener('click', (e) => {
            e.stopPropagation();
            editRecord(record.id);
        });
        
        recordItem.querySelector('.delete').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteRecord(record.id);
        });
        
        recordsList.appendChild(recordItem);
    });
}

// 编辑打卡记录
function editRecord(id) {
    const record = attendanceData.find(r => r.id === id);
    if (!record) return;
    
    // 填充表单
    document.getElementById('edit-record-name').value = record.name;
    document.getElementById('edit-record-site').value = record.site;
    document.getElementById('edit-record-date').value = record.date;
    document.getElementById('edit-record-time').value = record.time;
    
    // 显示弹窗
    showModal('edit-record-modal');
}

// 删除打卡记录
function deleteRecord(id) {
    if (confirm('确定要删除这条打卡记录吗？')) {
        attendanceData = attendanceData.filter(r => r.id !== id);
        saveToLocalStorage();
        updateAttendanceRecordsScreen();
        showToast('记录删除成功', 'success');
    }
}

// 更新数据统计页面
function updateStatistics() {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // 更新月份显示
    document.getElementById('stats-month').textContent = `${year}年${month + 1}月`;
    
    // 筛选当月数据
    const monthStart = new Date(year, month, 1).getTime();
    const monthEnd = new Date(year, month + 1, 0).getTime();
    
    const monthRecords = attendanceData.filter(record => {
        const recordDate = new Date(record.date).getTime();
        return recordDate >= monthStart && recordDate <= monthEnd;
    });
    
    // 统计数据
    const attendanceDays = new Set(monthRecords.map(r => r.date)).size;
    const lateCount = monthRecords.filter(r => {
        const time = r.time.split(':');
        return parseInt(time[0]) > 9 || (parseInt(time[0]) === 9 && parseInt(time[1]) > 0);
    }).length;
    
    // 计算总工时（假设每次打卡代表8小时工作）
    const workHours = attendanceDays * 8;
    
    // 更新显示
    document.getElementById('attendance-days').textContent = attendanceDays;
    document.getElementById('late-count').textContent = lateCount;
    document.getElementById('work-hours').textContent = workHours;
    
    // 更新图表
    updateCharts(monthRecords);
}

// 更新图表
function updateCharts(monthRecords) {
    // 按日期分组的打卡记录
    const dateRecords = {};
    monthRecords.forEach(record => {
        if (!dateRecords[record.date]) {
            dateRecords[record.date] = 0;
        }
        dateRecords[record.date]++;
    });
    
    // 按现场分组的打卡记录
    const siteRecords = {};
    monthRecords.forEach(record => {
        if (!siteRecords[record.site]) {
            siteRecords[record.site] = 0;
        }
        siteRecords[record.site]++;
    });
    
    // 这里应该使用Chart.js更新图表，但为了简化，先跳过
}

// 导出报表
function exportReport() {
    if (attendanceData.length === 0) {
        showToast('暂无数据可导出', 'warning');
        return;
    }
    
    // 生成CSV数据
    const headers = ['姓名', '现场', '日期', '时间'];
    const csvData = [headers.join(',')];
    
    attendanceData.forEach(record => {
        csvData.push([record.name, record.site, record.date, record.time].join(','));
    });
    
    const csvString = csvData.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // 创建下载链接
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `考勤记录_${formatDate(new Date())}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('报表导出成功', 'success');
}

// 分享数据
function shareData() {
    if (attendanceData.length === 0) {
        showToast('暂无数据可分享', 'warning');
        return;
    }
    
    // 生成分享内容
    const totalRecords = attendanceData.length;
    const uniqueDates = new Set(attendanceData.map(r => r.date)).size;
    const uniqueSites = new Set(attendanceData.map(r => r.site)).size;
    
    const shareContent = `📊 考勤数据统计

总打卡记录：${totalRecords}条
考勤天数：${uniqueDates}天
涉及现场：${uniqueSites}个

数据来源：现场考勤管理系统`;
    
    // 尝试使用Web Share API
    if (navigator.share) {
        navigator.share({
            title: '考勤数据统计',
            text: shareContent
        }).then(() => {
            showToast('分享成功', 'success');
        }).catch(() => {
            copyToClipboard(shareContent, '考勤数据');
        });
    } else {
        copyToClipboard(shareContent, '考勤数据');
    }
}

// AI生成总结
function generateSummary() {
    if (attendanceData.length === 0) {
        showToast('暂无数据可分析', 'warning');
        return;
    }
    
    // 生成简单的统计总结
    const totalRecords = attendanceData.length;
    const uniqueDates = new Set(attendanceData.map(r => r.date)).size;
    const uniqueSites = [...new Set(attendanceData.map(r => r.site))];
    const recordsByUser = {};
    
    attendanceData.forEach(record => {
        if (!recordsByUser[record.name]) {
            recordsByUser[record.name] = 0;
        }
        recordsByUser[record.name]++;
    });
    
    let summary = `📈 考勤数据AI分析报告

总体情况：
- 总打卡记录：${totalRecords}条
- 考勤天数：${uniqueDates}天
- 涉及现场：${uniqueSites.length}个

人员出勤情况：
`;
    
    Object.entries(recordsByUser).forEach(([name, count]) => {
        summary += `- ${name}：${count}次\n`;
    });
    
    summary += `\n现场分布情况：
`;
    
    uniqueSites.forEach(site => {
        const count = attendanceData.filter(r => r.site === site).length;
        summary += `- ${site}：${count}次\n`;
    });
    
    // 显示结果
    const messagesContainer = document.getElementById('chat-messages');
    const aiMessage = document.createElement('div');
    aiMessage.className = 'ai-message';
    aiMessage.textContent = summary;
    messagesContainer.appendChild(aiMessage);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // 显示AI助手弹窗
    showModal('ai-assistant-modal');
}

// 发送AI消息
function sendAIMessage() {
    const queryInput = document.getElementById('user-query');
    const query = queryInput.value.trim();
    
    if (!query) {
        showToast('请输入问题', 'error');
        return;
    }
    
    // 添加用户消息
    const messagesContainer = document.getElementById('chat-messages');
    const userMessage = document.createElement('div');
    userMessage.className = 'user-message';
    userMessage.textContent = query;
    messagesContainer.appendChild(userMessage);
    
    // 清空输入框
    queryInput.value = '';
    
    // 模拟AI回复
    setTimeout(() => {
        const aiMessage = document.createElement('div');
        aiMessage.className = 'ai-message';
        
        // 简单的查询响应逻辑
        if (query.includes('迟到') || query.includes('晚')) {
            const lateRecords = attendanceData.filter(r => {
                const time = r.time.split(':');
                return parseInt(time[0]) > 9 || (parseInt(time[0]) === 9 && parseInt(time[1]) > 0);
            });
            
            aiMessage.textContent = `共有${lateRecords.length}次迟到记录，占总打卡记录的${(lateRecords.length / attendanceData.length * 100).toFixed(1)}%`;
        } else if (query.includes('现场') || query.includes('地点')) {
            const siteRecords = {};
            attendanceData.forEach(record => {
                if (!siteRecords[record.site]) {
                    siteRecords[record.site] = 0;
                }
                siteRecords[record.site]++;
            });
            
            const sortedSites = Object.entries(siteRecords).sort((a, b) => b[1] - a[1]);
            aiMessage.textContent = `最常去的现场是：${sortedSites[0][0]}，共打卡${sortedSites[0][1]}次`;
        } else if (query.includes('工时') || query.includes('时长')) {
            const uniqueDates = new Set(attendanceData.map(r => r.date)).size;
            const totalHours = uniqueDates * 8; // 假设每天8小时
            aiMessage.textContent = `总工作时长约为${totalHours}小时，按${uniqueDates}个工作日计算`;
        } else {
            aiMessage.textContent = '抱歉，我不太理解您的问题。您可以尝试询问关于迟到次数、最常去的现场或工作时长等问题。';
        }
        
        messagesContainer.appendChild(aiMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 1000);
}

// 退出登录
function logout() {
    if (confirm('确定要退出登录吗？')) {
        // 清空用户信息
        currentUser = {
            name: '',
            site: '',
            weekDay: ''
        };
        
        saveToLocalStorage();
        updateUI();
        
        // 跳转到打卡页面
        showScreen('checkin-screen');
        showToast('已退出登录', 'success');
    }
}

// ========== 笔记功能模块 ==========

// 更新笔记页面
function updateNotesScreen() {
    const notesList = document.querySelector('.notes-list');
    notesList.innerHTML = '';
    
    if (notes.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = '暂无笔记';
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.padding = '2rem';
        emptyMessage.style.color = '#6c757d';
        notesList.appendChild(emptyMessage);
        return;
    }
    
    // 按时间排序（最新的在前面）
    const sortedNotes = [...notes].sort((a, b) => b.timestamp - a.timestamp);
    
    sortedNotes.forEach(note => {
        const noteItem = document.createElement('div');
        noteItem.className = 'note-item';
        
        // 生成附件图标HTML
        const attachmentsHTML = note.attachments && note.attachments.length > 0 ? 
            `<div class="note-attachments">
                <i class="fas fa-paperclip"></i>
                <span>${note.attachments.length}个附件</span>
            </div>` : '';
        
        // 生成标签HTML
        const tagsHTML = note.tags && note.tags.length > 0 ? 
            `<div class="note-tags">
                ${note.tags.map(tag => `<span class="note-tag">${tag}</span>`).join('')}
            </div>` : '';
        
        noteItem.innerHTML = `
            <div class="note-item-header">
                <div class="note-title">${note.title}</div>
                <div class="note-actions-menu">
                    <button class="note-action-icon" data-id="${note.id}" data-action="share">
                        <i class="fas fa-share-alt"></i>
                    </button>
                    <button class="note-action-icon" data-id="${note.id}" data-action="edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="note-action-icon" data-id="${note.id}" data-action="delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="note-content">${note.content}</div>
            <div class="note-footer">
                <span class="note-date">${formatDateTime(note.timestamp)}</span>
                ${attachmentsHTML}
                ${tagsHTML}
            </div>
        `;
        
        // 添加分享事件
        noteItem.querySelector('.note-action-icon[data-action="share"]').addEventListener('click', (e) => {
            e.stopPropagation();
            shareNote(note.id);
        });
        
        // 添加编辑和删除事件
        noteItem.querySelector('.note-action-icon[data-action="edit"]').addEventListener('click', (e) => {
            e.stopPropagation();
            editNote(note.id);
        });
        
        noteItem.querySelector('.note-action-icon[data-action="delete"]').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteNote(note.id);
        });
        
        // 添加点击展开/折叠功能
        noteItem.addEventListener('click', () => {
            noteItem.classList.toggle('expanded');
        });
        
        notesList.appendChild(noteItem);
    });
}

// 显示添加笔记弹窗
function showAddNoteModal() {
    // 清空输入框
    document.getElementById('note-title').value = '';
    document.getElementById('note-content').value = '';
    
    // 重置附件和标签状态
    currentAttachments = [];
    currentTags = ['工作笔记'];
    updateAttachmentList();
    updateTagList();
    
    // 更新字数统计
    updateCharCount();
    
    // 隐藏附件和标签区域
    hideAttachmentSection();
    hideTagSection();
    
    // 重置弹窗标题
    document.querySelector('#add-note-modal .modal-header h3').innerHTML = '<i class="fas fa-sticky-note"></i> 添加笔记';
    
    // 重置保存按钮事件
    document.getElementById('save-note-btn').onclick = saveNote;
    
    // 显示弹窗
    showModal('add-note-modal');
}

// 更新字数统计
function updateCharCount() {
    const title = document.getElementById('note-title').value;
    const content = document.getElementById('note-content').value;
    
    const titleCount = title.length;
    const contentCount = content.length;
    
    // 更新显示
    document.getElementById('title-count').textContent = titleCount;
    document.getElementById('content-count').textContent = contentCount;
    
    // 智能颜色警告
    const titleCountEl = document.getElementById('title-count');
    const contentCountEl = document.getElementById('content-count');
    
    // 标题字数警告
    if (titleCount >= 45) {
        titleCountEl.className = 'char-count error';
    } else if (titleCount >= 40) {
        titleCountEl.className = 'char-count warning';
    } else {
        titleCountEl.className = 'char-count';
    }
    
    // 内容字数警告
    if (contentCount >= 450) {
        contentCountEl.className = 'char-count error';
    } else if (contentCount >= 400) {
        contentCountEl.className = 'char-count warning';
    } else {
        contentCountEl.className = 'char-count';
    }
}

// ========== 附件功能模块 ==========

// 显示附件上传区域
function showAttachmentSection() {
    document.getElementById('attachment-section').style.display = 'block';
    document.getElementById('tag-section').style.display = 'none';
}

// 隐藏附件上传区域
function hideAttachmentSection() {
    document.getElementById('attachment-section').style.display = 'none';
}

// 处理文件选择
function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

// 处理文件列表
function handleFiles(files) {
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach(file => {
        // 检查文件大小（最大10MB）
        if (file.size > 10 * 1024 * 1024) {
            showToast(`文件 "${file.name}" 太大，请选择小于10MB的文件`, 'error');
            return;
        }
        
        // 检查文件类型
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 
                             'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                             'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                             'text/plain', 'application/zip'];
        
        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx|txt|zip)$/i)) {
            showToast(`不支持的文件类型：${file.name}`, 'error');
            return;
        }
        
        // 添加到附件列表
        const attachment = {
            id: Date.now().toString() + Math.random(),
            name: file.name,
            type: file.type,
            size: file.size,
            file: file,
            uploadTime: new Date().toISOString()
        };
        
        currentAttachments.push(attachment);
        updateAttachmentList();
        
        showToast(`已添加附件：${file.name}`, 'success');
    });
    
    // 清空文件输入框
    document.getElementById('file-input').value = '';
}

// 更新附件列表显示
function updateAttachmentList() {
    const attachmentList = document.getElementById('attachment-list');
    attachmentList.innerHTML = '';
    
    if (currentAttachments.length === 0) {
        attachmentList.innerHTML = '<div class="no-attachments">暂无附件</div>';
        return;
    }
    
    currentAttachments.forEach(attachment => {
        const attachmentItem = document.createElement('div');
        attachmentItem.className = 'attachment-item';
        
        // 获取文件图标
        const fileIcon = getFileIcon(attachment.type, attachment.name);
        const fileSize = formatFileSize(attachment.size);
        
        attachmentItem.innerHTML = `
            <div class="attachment-info">
                <i class="${fileIcon}"></i>
                <div class="attachment-details">
                    <div class="attachment-name">${attachment.name}</div>
                    <div class="attachment-meta">${fileSize} • ${formatDateTime(new Date(attachment.uploadTime))}</div>
                </div>
            </div>
            <button class="attachment-remove" data-id="${attachment.id}">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // 添加删除事件
        attachmentItem.querySelector('.attachment-remove').addEventListener('click', (e) => {
            e.stopPropagation();
            removeAttachment(attachment.id);
        });
        
        attachmentList.appendChild(attachmentItem);
    });
}

// 移除附件
function removeAttachment(id) {
    currentAttachments = currentAttachments.filter(a => a.id !== id);
    updateAttachmentList();
    showToast('附件已移除', 'success');
}

// 获取文件图标
function getFileIcon(type, name) {
    if (type.includes('image')) return 'fas fa-file-image';
    if (type.includes('pdf')) return 'fas fa-file-pdf';
    if (type.includes('word') || name.match(/\.(doc|docx)$/i)) return 'fas fa-file-word';
    if (type.includes('excel') || name.match(/\.(xls|xlsx)$/i)) return 'fas fa-file-excel';
    if (type.includes('zip')) return 'fas fa-file-archive';
    if (type.includes('text')) return 'fas fa-file-alt';
    return 'fas fa-file';
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ========== 标签功能模块 ==========

// 显示标签管理区域
function showTagSection() {
    document.getElementById('tag-section').style.display = 'block';
    document.getElementById('attachment-section').style.display = 'none';
}

// 隐藏标签管理区域
function hideTagSection() {
    document.getElementById('tag-section').style.display = 'none';
}

// 从输入框添加标签
function addTagFromInput() {
    const tagInput = document.getElementById('tag-input');
    const tagText = tagInput.value.trim();
    
    if (!tagText) {
        showToast('请输入标签内容', 'error');
        return;
    }
    
    if (tagText.length > 20) {
        showToast('标签长度不能超过20个字符', 'error');
        return;
    }
    
    if (currentTags.includes(tagText)) {
        showToast('标签已存在', 'warning');
        return;
    }
    
    addTag(tagText);
    tagInput.value = '';
}

// 添加标签
function addTag(tagText) {
    if (!currentTags.includes(tagText)) {
        currentTags.push(tagText);
        updateTagList();
        showToast(`已添加标签：${tagText}`, 'success');
    }
}

// 更新标签列表显示
function updateTagList() {
    const tagList = document.getElementById('tag-list');
    tagList.innerHTML = '';
    
    currentTags.forEach(tag => {
        const tagItem = document.createElement('div');
        tagItem.className = 'tag-item';
        tagItem.innerHTML = `
            <span>${tag}</span>
            <button type="button" class="remove-tag" data-tag="${tag}">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // 添加删除事件
        tagItem.querySelector('.remove-tag').addEventListener('click', (e) => {
            e.stopPropagation();
            removeTag(tag);
        });
        
        tagList.appendChild(tagItem);
    });
}

// 移除标签
function removeTag(tag) {
    currentTags = currentTags.filter(t => t !== tag);
    updateTagList();
    showToast(`已移除标签：${tag}`, 'success');
}

// ========== 笔记分享功能 ==========

// 分享笔记
function shareNote(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (!note) {
        showToast('笔记不存在', 'error');
        return;
    }
    
    // 生成分享内容
    const shareContent = generateShareContent(note);
    
    // 尝试使用Web Share API
    if (navigator.share) {
        navigator.share({
            title: `分享笔记：${note.title}`,
            text: shareContent,
            url: window.location.href
        }).then(() => {
            showToast('分享成功', 'success');
        }).catch(() => {
            copyToClipboard(shareContent, '笔记');
        });
    } else {
        copyToClipboard(shareContent, '笔记');
    }
}

// 生成分享内容
function generateShareContent(note) {
    const attachmentsInfo = note.attachments && note.attachments.length > 0 ? 
        `\n附件：${note.attachments.length}个文件` : '';
    
    const tagsInfo = note.tags && note.tags.length > 0 ? 
        `\n标签：${note.tags.join(', ')}` : '';
    
    return `📝 ${note.title}

${note.content}
${attachmentsInfo}
${tagsInfo}

来源：现场考勤管理系统 · ${formatDateTime(note.timestamp)}`;
}

// ========== 笔记保存功能 ==========

// 保存笔记
function saveNote() {
    const title = document.getElementById('note-title').value.trim();
    const content = document.getElementById('note-content').value.trim();
    
    if (!title) {
        showToast('请输入笔记标题', 'error');
        return;
    }
    
    if (!content) {
        showToast('请输入笔记内容', 'error');
        return;
    }
    
    // 处理附件数据（不保存实际的文件对象，只保存元数据）
    const attachmentsData = currentAttachments.map(attachment => ({
        id: attachment.id,
        name: attachment.name,
        type: attachment.type,
        size: attachment.size,
        uploadTime: attachment.uploadTime
    }));
    
    const newNote = {
        id: Date.now().toString(),
        title,
        content,
        attachments: attachmentsData,
        tags: [...currentTags],
        timestamp: Date.now()
    };
    
    notes.push(newNote);
    saveToLocalStorage();
    updateNotesScreen();
    
    // 重置状态
    currentAttachments = [];
    currentTags = ['工作笔记'];
    
    // 关闭弹窗
    hideModal();
    showToast('笔记添加成功', 'success');
}

// 编辑笔记
function editNote(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    
    // 填充表单
    document.getElementById('note-title').value = note.title;
    document.getElementById('note-content').value = note.content;
    
    // 设置附件和标签
    currentAttachments = note.attachments || [];
    currentTags = note.tags || ['工作笔记'];
    updateAttachmentList();
    updateTagList();
    
    updateCharCount();
    
    // 修改弹窗标题
    document.querySelector('#add-note-modal .modal-header h3').innerHTML = '<i class="fas fa-edit"></i> 编辑笔记';
    
    // 修改保存按钮事件
    document.getElementById('save-note-btn').onclick = () => updateNote(id);
    
    // 显示弹窗
    showModal('add-note-modal');
}

// 更新笔记
function updateNote(id) {
    const title = document.getElementById('note-title').value.trim();
    const content = document.getElementById('note-content').value.trim();
    
    if (!title) {
        showToast('请输入笔记标题', 'error');
        return;
    }
    
    if (!content) {
        showToast('请输入笔记内容', 'error');
        return;
    }
    
    // 处理附件数据
    const attachmentsData = currentAttachments.map(attachment => ({
        id: attachment.id,
        name: attachment.name,
        type: attachment.type,
        size: attachment.size,
        uploadTime: attachment.uploadTime
    }));
    
    // 更新笔记
    const noteIndex = notes.findIndex(n => n.id === id);
    if (noteIndex !== -1) {
        notes[noteIndex].title = title;
        notes[noteIndex].content = content;
        notes[noteIndex].attachments = attachmentsData;
        notes[noteIndex].tags = [...currentTags];
        notes[noteIndex].timestamp = Date.now(); // 更新修改时间
        
        saveToLocalStorage();
        updateNotesScreen();
        
        // 重置状态
        currentAttachments = [];
        currentTags = ['工作笔记'];
        
        // 关闭弹窗
        hideModal();
        showToast('笔记更新成功', 'success');
        
        // 恢复弹窗标题和保存按钮事件
        document.querySelector('#add-note-modal .modal-header h3').innerHTML = '<i class="fas fa-sticky-note"></i> 添加笔记';
        document.getElementById('save-note-btn').onclick = saveNote;
    }
}

// 删除笔记
function deleteNote(id) {
    if (confirm('确定要删除这条笔记吗？')) {
        notes = notes.filter(n => n.id !== id);
        saveToLocalStorage();
        updateNotesScreen();
        showToast('笔记删除成功', 'success');
    }
}

// ========== 工具函数 ==========

// 显示模态框
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

// 隐藏模态框
function hideModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// 显示提示消息
function showToast(message, type = 'info') {
    // 创建提示元素
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // 添加到页面
    document.body.appendChild(toast);
    
    // 显示动画
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // 自动隐藏
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// 复制到剪贴板
function copyToClipboard(content, type = '内容') {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(content).then(() => {
            showToast(`${type}已复制到剪贴板，可以分享给他人`, 'success');
        }).catch(() => {
            fallbackCopyTextToClipboard(content, type);
        });
    } else {
        fallbackCopyTextToClipboard(content, type);
    }
}

// 备用复制方法
function fallbackCopyTextToClipboard(text, type = '内容') {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showToast(`${type}已复制到剪贴板，可以分享给他人`, 'success');
    } catch (err) {
        showToast('复制失败，请手动复制', 'error');
    }
    
    document.body.removeChild(textArea);
}

// 格式化日期
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 格式化时间
function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

// 格式化日期时间
function formatDateTime(timestamp) {
    const date = new Date(timestamp);
    return `${formatDate(date)} ${formatTime(date)}`;
}