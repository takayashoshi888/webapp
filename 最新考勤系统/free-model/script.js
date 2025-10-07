// Supabase配置
const SUPABASE_URL = 'https://haemafeqbytkimymgyyp.supabase.co'; // 替换为您的Supabase项目URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZW1hZmVxYnl0a2lteW1neXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NTA0NDgsImV4cCI6MjA3NTIyNjQ0OH0.-erJczPVdz0ENGhsQFtpSjUktSoVnkHjH3pmyZNvhf8'; // 替换为您的Supabase匿名密钥

// 初始化Supabase客户端
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 全局变量
let currentUser = null;
let attendanceRecords = [];
let users = [];
let authToken = null;

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否有存储的认证令牌
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('currentUser');
    
    if (storedToken && storedUser) {
        authToken = storedToken;
        currentUser = JSON.parse(storedUser);
        showMainPage();
    }
    
    // 设置默认日期
    const today = new Date();
    document.getElementById('recordDate').value = today.toISOString().split('T')[0];
    
    const currentMonth = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
    document.getElementById('filterMonth').value = currentMonth;
    document.getElementById('statsMonth').value = currentMonth;
    
    // 绑定表单事件
    bindEvents();
    
    // 绑定侧边栏菜单事件
    bindSidebarEvents();
    
    // 添加窗口大小改变事件监听器
    handleResponsiveDesign();
    window.addEventListener('resize', handleResponsiveDesign);

    // 初始化移动端优化
    initMobileOptimizations();

    // 添加侧边栏切换功能
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const mainContent = document.getElementById('mainContent');
    
    if (sidebarToggle && sidebar && mainContent) {
        sidebarToggle.addEventListener('click', function() {
            // 切换侧边栏状态
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('sidebar-collapsed');
            if (sidebarOverlay) {
                sidebarOverlay.classList.toggle('active');
            }
        });
    }
    
    // 点击遮罩层关闭侧边栏
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', function() {
            sidebar.classList.add('collapsed');
            mainContent.classList.remove('sidebar-collapsed');
            sidebarOverlay.classList.remove('active');
        });
    }
});

// 绑定事件
function bindEvents() {
    // 登录表单
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // 注册表单
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // 密码修改表单
    document.getElementById('forgotPasswordForm').addEventListener('submit', handlePasswordChange);
    
    // 考勤记录表单
    document.getElementById('attendanceForm').addEventListener('submit', handleAddRecord);
    
    // 添加移动端触摸支持
    addTouchSupport();
}

// 绑定侧边栏事件
function bindSidebarEvents() {
    // 为侧边栏菜单项绑定点击事件
    const menuItems = document.querySelectorAll('.sidebar-menu a:not(.external-link)');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // 阻止默认行为
            e.preventDefault();
            
            // 设置活动菜单项
            setActiveMenu(this);
            
            // 在移动端点击菜单项后关闭侧边栏
            const sidebar = document.getElementById('sidebar');
            const mainContent = document.getElementById('mainContent');
            const sidebarOverlay = document.getElementById('sidebarOverlay');
            
            if (window.innerWidth <= 768 && sidebar && mainContent) {
                sidebar.classList.add('collapsed');
                mainContent.classList.remove('sidebar-collapsed');
                if (sidebarOverlay) {
                    sidebarOverlay.classList.remove('active');
                }
            }
        });
    });
}

// 设置活动菜单项
function setActiveMenu(element) {
    // 移除所有活动状态
    document.querySelectorAll('.sidebar-menu a').forEach(item => {
        item.classList.remove('active');
    });
    // 添加当前项为活动状态
    element.classList.add('active');
}

// 显示页面
function showPage(pageId) {
    // 隐藏所有页面
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // 显示指定页面
    const page = document.getElementById(pageId);
    page.classList.add('active');
    
    // 在移动端隐藏侧边栏
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    if (window.innerWidth <= 768 && sidebar && mainContent) {
        sidebar.classList.add('collapsed');
        mainContent.classList.remove('sidebar-collapsed');
        if (sidebarOverlay) {
            sidebarOverlay.classList.remove('active');
        }
    }
}

// 显示标签
function showTab(tabId) {
    // 隐藏所有标签内容
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // 显示指定标签内容
    document.getElementById(tabId).classList.add('active');
}

// 显示消息
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // 在页面顶部固定位置显示消息（适合移动端）
    document.body.appendChild(messageDiv);
    
    // 添加动画效果
    setTimeout(() => {
        messageDiv.classList.add('show');
    }, 100);
    
    // 3秒后自动移除消息
    setTimeout(() => {
        messageDiv.classList.remove('show');
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, 3000);
}

// 初始化移动端优化
function initMobileOptimizations() {
    // 为输入框添加自动聚焦优化
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    });
}

// 处理响应式设计
function handleResponsiveDesign() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    if (window.innerWidth <= 768) {
        // 在小屏幕上默认隐藏侧边栏 (通过添加collapsed类)
        if (sidebar && mainContent) {
            // 确保侧边栏在移动设备上正确隐藏
            if (!sidebar.classList.contains('collapsed')) {
                sidebar.classList.add('collapsed');
                mainContent.classList.add('sidebar-collapsed');
                if (sidebarOverlay) {
                    sidebarOverlay.classList.remove('active');
                }
            }
        }
    } else {
        // 在大屏幕上展开侧边栏
        if (sidebar && mainContent) {
            sidebar.classList.remove('collapsed');
            mainContent.classList.remove('sidebar-collapsed');
            if (sidebarOverlay) {
                sidebarOverlay.classList.remove('active');
            }
        }
    }
}

// 添加移动端触摸支持
function addTouchSupport() {
    const buttons = document.querySelectorAll('button, .btn, .sidebar-toggle');
    buttons.forEach(button => {
        button.addEventListener('touchstart', function() {
            this.classList.add('touch-active');
        });
        
        button.addEventListener('touchend', function() {
            this.classList.remove('touch-active');
        });
        
        button.addEventListener('touchcancel', function() {
            this.classList.remove('touch-active');
        });
    });
}

// 处理登录
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
        showMessage('请输入邮箱和密码', 'error');
        return;
    }

    try {
        // 使用用户输入的邮箱和密码进行登录
        const { data, error } = await supabase.auth.signInWithPassword({
            email: username, // 登录表单中输入的是邮箱地址
            password: password
        });

        if (error) throw error;

        currentUser = {
            id: data.user.id,
            username: data.user.email, // 使用邮箱作为用户名显示
            email: data.user.email
        };

        // 保存到本地存储
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // 获取用户的考勤记录
        await loadAttendanceRecords();

        showMainPage();
        showMessage('登录成功！', 'success');
    } catch (error) {
        console.error('Login error:', error);
        // 根据不同的错误类型提供相应的错误提示
        if (error.message.includes('Invalid login credentials')) {
            showMessage('登录失败：邮箱或密码错误', 'error');
        } else if (error.message.includes('Email not confirmed')) {
            showMessage('登录失败：请先验证您的邮箱', 'error');
        } else {
            showMessage('登录失败: ' + error.message, 'error');
        }
    }
}

// 处理注册
async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!username || !email || !password || !confirmPassword) {
        showMessage('请填写所有字段', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('两次输入的密码不一致', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('密码长度至少6位', 'error');
        return;
    }
    
    try {
        // 创建用户
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username
                }
            }
        });
        
        if (error) throw error;
        
        showMessage('注册成功！请检查邮箱进行确认', 'success');
        
        // 清空表单
        document.getElementById('registerForm').reset();
        
        // 跳转到登录页面
        setTimeout(() => {
            showPage('loginPage');
        }, 1500);
    } catch (error) {
        console.error('注册失败:', error.message || JSON.stringify(error));
        showMessage('注册失败: ' + (error.message || '未知错误'), 'error');
    }
}

// 处理密码修改
async function handlePasswordChange(event) {
    event.preventDefault();
    
    // 注意：在实际应用中，密码修改应该通过更安全的方式处理
    // 这里为了简化，我们假设用户已经登录并直接更新密码
    showMessage('密码修改功能需要在登录状态下通过更安全的方式实现', 'error');
}

// 显示主页面
async function showMainPage() {
    showPage('mainPage');
    document.getElementById('currentUser').textContent = currentUser.username;
    
    // 如果还没有加载记录，则加载
    if (attendanceRecords.length === 0) {
        await loadAttendanceRecords();
    }
    
    refreshRecordsTable();
}

// 退出登录
function logout() {
    currentUser = null;
    authToken = null;
    attendanceRecords = [];
    
    // 清除本地存储
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    showPage('loginPage');
    
    // 清空表单
    document.querySelectorAll('form').forEach(form => form.reset());
    
    showMessage('已成功退出登录', 'info');
}

// 加载考勤记录
async function loadAttendanceRecords() {
    if (!currentUser) return;
    
    try {
        const { data, error } = await supabase
            .from('attendance_records')
            .select('*')
            .eq('user_id', currentUser.id); // currentUser.id 是UUID格式
        
        if (error) throw error;
        
        attendanceRecords = data.map(record => ({
            id: record.id.toString(),
            date: record.record_date,
            name: record.employee_name,
            count: record.employee_count,
            site: record.site_name,
            roomType: record.room_type,
            roomNumber: record.room_number,
            parkingFee: record.parking_fee,
            highwayFee: record.highway_fee,
            userId: record.user_id, // 保持UUID格式
            createdAt: record.created_at
        }));
    } catch (error) {
        console.error('加载考勤记录失败:', error.message || JSON.stringify(error));
        showMessage('加载考勤记录失败: ' + (error.message || '未知错误'), 'error');
    }
}

// 处理添加记录
async function handleAddRecord(event) {
    event.preventDefault();
    
    const date = document.getElementById('recordDate').value;
    const name = document.getElementById('employeeName').value.trim();
    const count = parseInt(document.getElementById('employeeCount').value);
    const site = document.getElementById('siteName').value.trim();
    const roomType = document.getElementById('roomType').value;
    const roomNumber = document.getElementById('roomNumber').value.trim();
    const parkingFee = parseFloat(document.getElementById('parkingFee').value) || 0;
    const highwayFee = parseFloat(document.getElementById('highwayFee').value) || 0;
    
    if (!date || !name || !count || !site) {
        showMessage('请填写所有必填字段', 'error');
        return;
    }
    
    // 准备插入的数据
    const recordData = {
        user_id: currentUser.id, // UUID字符串
        record_date: date,
        employee_name: name,
        employee_count: count,
        site_name: site,
        room_type: roomType,
        room_number: roomNumber,
        parking_fee: parkingFee,
        highway_fee: highwayFee
    };
    
    console.log('准备插入的数据:', recordData);
    
    try {
        const { data, error } = await supabase
            .from('attendance_records')
            .insert(recordData)
            .select();
        
        if (error) throw error;
        
        // 重新加载记录
        await loadAttendanceRecords();
        refreshRecordsTable();
        
        showMessage('考勤记录添加成功！', 'success');
        
        // 清空表单（保留日期）
        document.getElementById('employeeName').value = '';
        document.getElementById('employeeCount').value = '';
        document.getElementById('siteName').value = '';
        document.getElementById('roomType').value = '';
        document.getElementById('roomNumber').value = '';
        document.getElementById('parkingFee').value = '';
        document.getElementById('highwayFee').value = '';
    } catch (error) {
        console.error('添加记录失败:', error.message || JSON.stringify(error));
        console.error('尝试插入的数据:', recordData);
        showMessage('添加记录失败: ' + (error.message || '未知错误'), 'error');
    }
}

// 刷新记录表格
function refreshRecordsTable() {
    const tbody = document.getElementById('recordsTableBody');
    // 确保正确比较UUID字符串
    const userRecords = attendanceRecords.filter(record => record.userId === currentUser.id);
    
    tbody.innerHTML = '';
    
    userRecords.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(record => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${record.date}</td>
            <td>${record.name}</td>
            <td>${record.count}</td>
            <td>${record.site}</td>
            <td>${record.roomType || ''}</td>
            <td>${record.roomNumber || ''}</td>
            <td>¥${record.parkingFee.toLocaleString()}</td>
            <td>¥${record.highwayFee.toLocaleString()}</td>
            <td>
                <button class="btn btn-primary edit-btn" onclick="editRecord('${record.id}')">編集</button>
                <button class="btn btn-danger delete-btn" onclick="deleteRecord('${record.id}')">削除</button>
            </td>
        `;
    });
    
    // 为新添加的按钮添加触摸支持
    addTouchSupport();
}

// 编辑记录
function editRecord(recordId) {
    const record = attendanceRecords.find(record => record.id === recordId);
    if (record) {
        // 填充表单字段
        document.getElementById('recordDate').value = record.date;
        document.getElementById('employeeName').value = record.name;
        document.getElementById('employeeCount').value = record.count;
        document.getElementById('siteName').value = record.site;
        document.getElementById('roomType').value = record.roomType || '';
        document.getElementById('roomNumber').value = record.roomNumber || '';
        document.getElementById('parkingFee').value = record.parkingFee;
        document.getElementById('highwayFee').value = record.highwayFee;
        
        // 更改表单提交处理函数
        const form = document.getElementById('attendanceForm');
        form.removeEventListener('submit', handleAddRecord);
        form.addEventListener('submit', function editEventHandler(event) {
            event.preventDefault();
            
            // 更新记录
            updateRecord(recordId);
        });
        
        showMessage('请修改记录信息，然后提交表单以保存更改', 'info');
    }
}

// 更新记录
async function updateRecord(recordId) {
    const date = document.getElementById('recordDate').value;
    const name = document.getElementById('employeeName').value.trim();
    const count = parseInt(document.getElementById('employeeCount').value);
    const site = document.getElementById('siteName').value.trim();
    const roomType = document.getElementById('roomType').value;
    const roomNumber = document.getElementById('roomNumber').value.trim();
    const parkingFee = parseFloat(document.getElementById('parkingFee').value) || 0;
    const highwayFee = parseFloat(document.getElementById('highwayFee').value) || 0;
    
    if (!date || !name || !count || !site) {
        showMessage('请填写所有必填字段', 'error');
        return;
    }
    
    // 准备更新的数据
    const updateData = {
        record_date: date,
        employee_name: name,
        employee_count: count,
        site_name: site,
        room_type: roomType,
        room_number: roomNumber,
        parking_fee: parkingFee,
        highway_fee: highwayFee
    };
    
    console.log('准备更新的数据:', updateData);
    
    try {
        const { data, error } = await supabase
            .from('attendance_records')
            .update(updateData)
            .eq('id', recordId)
            .eq('user_id', currentUser.id)
            .select();
        
        if (error) throw error;
        
        // 重新加载记录
        await loadAttendanceRecords();
        refreshRecordsTable();
        
        // 恢复原始表单提交处理函数
        const form = document.getElementById('attendanceForm');
        form.removeEventListener('submit', editEventHandler);
        form.addEventListener('submit', handleAddRecord);
        
        // 清空表单
        form.reset();
        
        // 设置默认日期
        const today = new Date();
        document.getElementById('recordDate').value = today.toISOString().split('T')[0];
        
        showMessage('记录已更新', 'success');
    } catch (error) {
        console.error('更新记录失败:', error.message || JSON.stringify(error));
        console.error('尝试更新的数据:', updateData);
        showMessage('更新记录失败: ' + (error.message || '未知错误'), 'error');
    }
}

// 删除记录
async function deleteRecord(recordId) {
    if (confirm('この記録を削除しますか？')) {
        try {
            console.log('准备删除记录:', { id: recordId, user_id: currentUser.id });
            
            const { data, error } = await supabase
                .from('attendance_records')
                .delete()
                .eq('id', recordId)
                .eq('user_id', currentUser.id);
            
            if (error) throw error;
            
            // 重新加载记录
            await loadAttendanceRecords();
            refreshRecordsTable();
            
            showMessage('記録が削除されました', 'success');
        } catch (error) {
            console.error('删除记录失败:', error.message || JSON.stringify(error));
            console.error('尝试删除的记录:', { id: recordId, user_id: currentUser.id });
            showMessage('删除记录失败: ' + (error.message || '未知错误'), 'error');
        }
    }
}

// 过滤记录
function filterRecords() {
    const monthFilter = document.getElementById('filterMonth').value;
    const nameFilter = document.getElementById('filterName').value.toLowerCase();
    const tbody = document.getElementById('recordsTableBody');
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const date = row.cells[0].textContent;
        const name = row.cells[1].textContent.toLowerCase();
        
        const matchMonth = !monthFilter || date.startsWith(monthFilter);
        const matchName = !nameFilter || name.includes(nameFilter);
        
        row.style.display = (matchMonth && matchName) ? '' : 'none';
    });
}

// 导出为CSV
function exportToCSV() {
    const month = document.getElementById('statsMonth').value;
    if (!month) {
        showMessage('请先生成统计数据', 'error');
        return;
    }
    
    // 确保已经生成了统计数据
    const userRecords = attendanceRecords.filter(record => 
        record.userId === currentUser.id && record.date.startsWith(month)
    );
    
    if (userRecords.length === 0) {
        showMessage('该月份暂无数据可导出', 'error');
        return;
    }
    
    // 创建CSV内容
    let csvContent = '\uFEFF'; // BOM for UTF-8
    csvContent += '日期,姓名,人数,现场名称,部屋タイプ,部屋号,停车费,高速費\n';
    
    userRecords.forEach(record => {
        csvContent += `"${record.date}","${record.name}",${record.count},"${record.site}","${record.roomType || ''}","${record.roomNumber || ''}",${record.parkingFee},${record.highwayFee}\n`;
    });
    
    // 创建下载链接
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `考勤记录-${month}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showMessage('CSVファイル已下载', 'success');
}

// 导出PDF - 支持中文和日文
function exportToPDF() {
    const month = document.getElementById('statsMonth').value;
    if (!month) {
        showMessage('请先生成统计数据', 'error');
        return;
    }
    
    const userRecords = attendanceRecords.filter(record => 
        record.userId === currentUser.id && record.date.startsWith(month)
    );
    
    if (userRecords.length === 0) {
        showMessage('该月份暂无数据可导出', 'error');
        return;
    }
    
    // 显示加载提示
    showMessage('正在生成PDF，请稍候...', 'info');
    
    try {
        // 先尝试使用html2canvas方法，完美支持中文日文
        if (typeof html2canvas !== 'undefined') {
            exportToPDFWithCanvas();
        } else {
            // 如果html2canvas未加载，使用传统方法
            exportToPDFTraditional();
        }
        
    } catch (error) {
        console.error('PDF导出错误:', error);
        showMessage('PDF导出失败：' + error.message, 'error');
    }
}

// 传统PDF导出方法
function exportToPDFTraditional() {
    const month = document.getElementById('statsMonth').value;
    const userRecords = attendanceRecords.filter(record => 
        record.userId === currentUser.id && record.date.startsWith(month)
    );
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // 获取年月信息
    const [year, monthNum] = month.split('-');
    
    doc.setFont('helvetica');
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    
    // 使用英文显示标题
    doc.text(`Attendance Report ${year}-${monthNum}`, 20, 25);
    doc.text(`(Kaoqin Baobiao)`, 20, 35);
    
    // 统计数据
    const totalRecords = userRecords.length;
    const totalPeople = userRecords.reduce((sum, record) => sum + record.count, 0);
    const totalParkingFee = userRecords.reduce((sum, record) => sum + record.parkingFee, 0);
    const totalHighwayFee = userRecords.reduce((sum, record) => sum + record.highwayFee, 0);
    const totalFees = totalParkingFee + totalHighwayFee;
    
    doc.setFontSize(12);
    let yPos = 55;
    doc.text(`Total Records: ${totalRecords}`, 20, yPos);
    yPos += 10;
    doc.text(`Total People: ${totalPeople}`, 20, yPos);
    yPos += 10;
    doc.text(`Total Parking Fee: ¥${totalParkingFee.toLocaleString()}`, 20, yPos);
    yPos += 10;
    doc.text(`Total Highway Fee: ¥${totalHighwayFee.toLocaleString()}`, 20, yPos);
    yPos += 10;
    doc.text(`Total Fees: ¥${totalFees.toLocaleString()}`, 20, yPos);
    
    // 表格数据
    const tableData = userRecords.sort((a, b) => new Date(a.date) - new Date(b.date)).map(record => [
        record.date,
        record.name,
        record.count.toString(),
        record.site,
        `¥${record.parkingFee.toLocaleString()}`,
        `¥${record.highwayFee.toLocaleString()}`
    ]);
    
    doc.autoTable({
        startY: yPos + 20,
        head: [['Date', 'Name', 'Count', 'Site', 'Parking Fee', 'Highway Fee']],
        body: tableData,
        styles: { fontSize: 9, cellPadding: 3, halign: 'center' },
        headStyles: { fillColor: [102, 126, 234], textColor: [255, 255, 255] },
        columnStyles: {
            0: { cellWidth: 25 }, 1: { cellWidth: 30 }, 2: { cellWidth: 20 },
            3: { cellWidth: 35 }, 4: { cellWidth: 25 }, 5: { cellWidth: 25 }
        }
    });
    
    doc.save(`attendance-report-${month}.pdf`);
    showMessage('PDFファイル已成功导出！', 'success');
}

// 使用Canvas方法导出PDF - 完美支持中文日文
async function exportToPDFWithCanvas() {
    const month = document.getElementById('statsMonth').value;
    const userRecords = attendanceRecords.filter(record => 
        record.userId === currentUser.id && record.date.startsWith(month)
    );
    
    try {
        // 创建临时HTML元素
        const tempContainer = document.createElement('div');
        tempContainer.style.cssText = `position: fixed; top: -10000px; left: -10000px; width: 800px; 
            background: white; padding: 20px; font-family: 'Microsoft YaHei', 'SimHei', sans-serif; 
            font-size: 14px; line-height: 1.6;`;
        
        const [year, monthNum] = month.split('-');
        const totalRecords = userRecords.length;
        const totalPeople = userRecords.reduce((sum, record) => sum + record.count, 0);
        const totalParkingFee = userRecords.reduce((sum, record) => sum + record.parkingFee, 0);
        const totalHighwayFee = userRecords.reduce((sum, record) => sum + record.highwayFee, 0);
        const totalFees = totalParkingFee + totalHighwayFee;
        
        // 生成表格
        let tableHTML = `<table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead><tr style="background-color: #666EEA; color: white;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">日期</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">姓名</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">人数</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">现场名称</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">停车费</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">高速费</th>
            </tr></thead><tbody>`;
        
        userRecords.sort((a, b) => new Date(a.date) - new Date(b.date)).forEach((record, index) => {
            const bgColor = index % 2 === 0 ? '#f8fafc' : 'white';
            tableHTML += `<tr style="background-color: ${bgColor};">
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${record.date}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${record.name}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${record.count}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${record.site}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">¥${record.parkingFee.toLocaleString()}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">¥${record.highwayFee.toLocaleString()}</td>
            </tr>`;
        });
        tableHTML += '</tbody></table>';
        
        tempContainer.innerHTML = `
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #333; margin: 0 0 10px 0; font-size: 24px;">${year}年${monthNum}月考勤报表</h1>
                <h2 style="color: #666; margin: 0; font-size: 18px;">Attendance Report</h2>
            </div>
            <div style="margin-bottom: 30px; padding: 20px; background-color: #f0f8ff; border-radius: 8px;">
                <h3 style="margin: 0 0 15px 0; color: #333;">统计概覧</h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                    <div style="padding: 10px; background: white; border-radius: 5px;"><strong>总记录数：</strong> ${totalRecords}</div>
                    <div style="padding: 10px; background: white; border-radius: 5px;"><strong>总人数：</strong> ${totalPeople}</div>
                    <div style="padding: 10px; background: white; border-radius: 5px;"><strong>停车费总计：</strong> ¥${totalParkingFee.toLocaleString()}</div>
                    <div style="padding: 10px; background: white; border-radius: 5px;"><strong>高速费总计：</strong> ¥${totalHighwayFee.toLocaleString()}</div>
                    <div style="padding: 10px; background: white; border-radius: 5px; grid-column: span 2; text-align: center; font-weight: bold; font-size: 16px;"><strong>费用总计：</strong> ¥${totalFees.toLocaleString()}</div>
                </div>
            </div>
            <div><h3 style="margin: 0 0 15px 0; color: #333;">详细记录</h3>${tableHTML}</div>
            <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">生成时间：${new Date().toLocaleString('zh-CN')}</div>`;
        
        document.body.appendChild(tempContainer);
        
        // 使用html2canvas生成图片
        const canvas = await html2canvas(tempContainer, {
            scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff',
            width: 800, height: tempContainer.scrollHeight
        });
        
        document.body.removeChild(tempContainer);
        
        // 创建PDF
        const { jsPDF } = window.jspdf;
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 190;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        pdf.save(`考勤报表-${month}.pdf`);
        showMessage('PDFファイル已成功导出！完美支持中文和日文显示', 'success');
        
    } catch (error) {
        console.error('Canvas PDF导出错误:', error);
        showMessage('正在使用备用方法导出PDF...', 'info');
        exportToPDFTraditional();
    }
}

// 导出CSV
function exportToCSV() {
    const month = document.getElementById('statsMonth').value;
    if (!month) {
        showMessage('请先生成统计数据', 'error');
        return;
    }
    
    const userRecords = attendanceRecords.filter(record => 
        record.userId === currentUser.id && record.date.startsWith(month)
    );
    
    if (userRecords.length === 0) {
        showMessage('该月份暂无数据可导出', 'error');
        return;
    }
    
    // 创建CSV内容
    let csvContent = '\uFEFF'; // BOM for UTF-8
    csvContent += '日期,姓名,人数,现场名称,停车费,高速費\n';
    
    userRecords.forEach(record => {
        csvContent += `${record.date},${record.name},${record.count},${record.site},${record.parkingFee},${record.highwayFee}\n`;
    });
    
    // 创建下载链接
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance-report-${month}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showMessage('CSVファイル已下载', 'success');
}

// 生成统计
function generateStatistics() {
    const month = document.getElementById('statsMonth').value;
    if (!month) {
        showMessage('まず統計する月を選択してください', 'error');
        return;
    }
    
    const userRecords = attendanceRecords.filter(record => 
        record.userId === currentUser.id.toString() && record.date.startsWith(month)
    );
    
    if (userRecords.length === 0) {
        document.getElementById('statisticsResults').innerHTML = `
            <div class="stats-card">
                <h3>${month} 月統計結果</h3>
                <p>該月には考勤記録がありません</p>
            </div>
        `;
        return;
    }
    
    // 计算统计数据
    const totalRecords = userRecords.length;
    const totalPeople = userRecords.reduce((sum, record) => sum + record.count, 0);
    const totalParkingFee = userRecords.reduce((sum, record) => sum + record.parkingFee, 0);
    const totalHighwayFee = userRecords.reduce((sum, record) => sum + record.highwayFee, 0);
    const totalFees = totalParkingFee + totalHighwayFee;
    
    // 按姓名分组统计
    const nameStats = {};
    userRecords.forEach(record => {
        if (!nameStats[record.name]) {
            nameStats[record.name] = {
                records: 0,
                totalPeople: 0,
                totalParkingFee: 0,
                totalHighwayFee: 0
            };
        }
        nameStats[record.name].records++;
        nameStats[record.name].totalPeople += record.count;
        nameStats[record.name].totalParkingFee += record.parkingFee;
        nameStats[record.name].totalHighwayFee += record.highwayFee;
    });
    
    // 按现场分组统计
    const siteStats = {};
    userRecords.forEach(record => {
        if (!siteStats[record.site]) {
            siteStats[record.site] = {
                records: 0,
                totalPeople: 0,
                totalParkingFee: 0,
                totalHighwayFee: 0
            };
        }
        siteStats[record.site].records++;
        siteStats[record.site].totalPeople += record.count;
        siteStats[record.site].totalParkingFee += record.parkingFee;
        siteStats[record.site].totalHighwayFee += record.highwayFee;
    });
    
    // 按部屋タイプ分組统计
    const roomTypeStats = {};
    userRecords.forEach(record => {
        const roomType = record.roomType || '未指定';
        if (!roomTypeStats[roomType]) {
            roomTypeStats[roomType] = {
                records: 0,
                totalPeople: 0,
                totalParkingFee: 0,
                totalHighwayFee: 0
            };
        }
        roomTypeStats[roomType].records++;
        roomTypeStats[roomType].totalPeople += record.count;
        roomTypeStats[roomType].totalParkingFee += record.parkingFee;
        roomTypeStats[roomType].totalHighwayFee += record.highwayFee;
    });
    
    // 生成统计結果HTML
    let html = `
        <div class="stats-card">
            <h3>${month} 月统计概覧</h3>
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="label">总记录数</div>
                    <div class="value">${totalRecords}</div>
                </div>
                <div class="stat-item">
                    <div class="label">总人数</div>
                    <div class="value">${totalPeople}</div>
                </div>
                <div class="stat-item">
                    <div class="label">停车费总计</div>
                    <div class="value">¥${totalParkingFee.toLocaleString()}</div>
                </div>
                <div class="stat-item">
                    <div class="label">高速费总计</div>
                    <div class="value">¥${totalHighwayFee.toLocaleString()}</div>
                </div>
                <div class="stat-item">
                    <div class="label">费用总计</div>
                    <div class="value">¥${totalFees.toLocaleString()}</div>
                </div>
            </div>
        </div>
        
        <div class="stats-card">
            <h3>按姓名统计</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>姓名</th>
                            <th>记录数</th>
                            <th>总人数</th>
                            <th>停车费</th>
                            <th>高速费</th>
                            <th>费用小計</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    Object.entries(nameStats).forEach(([name, stats]) => {
        const subtotal = stats.totalParkingFee + stats.totalHighwayFee;
        html += `
            <tr>
                <td>${name}</td>
                <td>${stats.records}</td>
                <td>${stats.totalPeople}</td>
                <td>¥${stats.totalParkingFee.toLocaleString()}</td>
                <td>¥${stats.totalHighwayFee.toLocaleString()}</td>
                <td>¥${subtotal.toLocaleString()}</td>
            </tr>
        `;
    });
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="stats-card">
            <h3>按现场统计</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>现场名称</th>
                            <th>记录数</th>
                            <th>总人数</th>
                            <th>停车费</th>
                            <th>高速费</th>
                            <th>費用小計</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    Object.entries(siteStats).forEach(([site, stats]) => {
        const subtotal = stats.totalParkingFee + stats.totalHighwayFee;
        html += `
            <tr>
                <td>${site}</td>
                <td>${stats.records}</td>
                <td>${stats.totalPeople}</td>
                <td>¥${stats.totalParkingFee.toLocaleString()}</td>
                <td>¥${stats.totalHighwayFee.toLocaleString()}</td>
                <td>¥${subtotal.toLocaleString()}</td>
            </tr>
        `;
    });
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="stats-card">
            <h3>按部屋タイプ统计</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>部屋タイプ</th>
                            <th>记录数</th>
                            <th>总人数</th>
                            <th>停车费</th>
                            <th>高速費</th>
                            <th>費用小計</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    Object.entries(roomTypeStats).forEach(([roomType, stats]) => {
        const subtotal = stats.totalParkingFee + stats.totalHighwayFee;
        html += `
            <tr>
                <td>${roomType}</td>
                <td>${stats.records}</td>
                <td>${stats.totalPeople}</td>
                <td>¥${stats.totalParkingFee.toLocaleString()}</td>
                <td>¥${stats.totalHighwayFee.toLocaleString()}</td>
                <td>¥${subtotal.toLocaleString()}</td>
            </tr>
        `;
    });
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    document.getElementById('statisticsResults').innerHTML = html;
}

// 页面加载完成后检查认证状态
document.addEventListener('DOMContentLoaded', function() {
    // 检查本地存储中的认证信息
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    
    if (token && user) {
        try {
            authToken = token;
            currentUser = JSON.parse(user);
            showMainPage();
        } catch (e) {
            console.error('Failed to parse user data from localStorage:', e);
            // 清除无效的本地存储
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
        }
    }
});

/**
 * Opens the PDF editor in a new tab
 */
function openPDFEditor() {
    window.open('https://tools.pdf24.org/zh/', '_blank');
}
