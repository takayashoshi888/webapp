// 全局变量
let currentUser = null;
let attendanceRecords = [];
let users = [];

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    // 从本地存储加载数据
    loadFromStorage();
    
    // 设置默认日期
    const today = new Date();
    document.getElementById('recordDate').value = today.toISOString().split('T')[0];
    
    const currentMonth = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
    document.getElementById('filterMonth').value = currentMonth;
    document.getElementById('statsMonth').value = currentMonth;
    
    // 绑定表单事件
    bindEvents();
    
    // 检查是否有已登录用户
    if (currentUser) {
        showMainPage();
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
}

// 显示页面
function showPage(pageId) {
    // 隐藏所有页面
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // 显示指定页面
    document.getElementById(pageId).classList.add('active');
}

// 显示标签
function showTab(tabId) {
    // 隐藏所有标签内容
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // 移除所有标签按钮的活动状态
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(button => button.classList.remove('active'));
    
    // 显示指定标签内容
    document.getElementById(tabId).classList.add('active');
    
    // 激活对应的标签按钮
    event.target.classList.add('active');
}

// 显示消息
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // 插入到当前活动页面的顶部
    const activePage = document.querySelector('.page.active');
    const container = activePage.querySelector('.container') || activePage.querySelector('.form-container');
    container.insertBefore(messageDiv, container.firstChild);
    
    // 3秒后自动移除消息
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 3000);
}

// 处理登录
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        showMessage('请输入用户名和密码', 'error');
        return;
    }
    
    // 查找用户
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        saveToStorage();
        showMainPage();
        showMessage('登录成功！', 'success');
    } else {
        showMessage('用户名或密码错误', 'error');
    }
}

// 处理注册
function handleRegister(event) {
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
    
    // 检查用户名是否已存在
    if (users.some(u => u.username === username)) {
        showMessage('用户名已存在', 'error');
        return;
    }
    
    // 检查邮箱是否已存在
    if (users.some(u => u.email === email)) {
        showMessage('邮箱已被注册', 'error');
        return;
    }
    
    // 创建新用户
    const newUser = {
        id: Date.now().toString(),
        username: username,
        email: email,
        password: password,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveToStorage();
    
    showMessage('注册成功！请登录', 'success');
    
    // 清空表单
    document.getElementById('registerForm').reset();
    
    // 跳转到登录页面
    setTimeout(() => {
        showPage('loginPage');
    }, 1500);
}

// 处理密码修改
function handlePasswordChange(event) {
    event.preventDefault();
    
    const username = document.getElementById('forgotUsername').value.trim();
    const email = document.getElementById('forgotEmail').value.trim();
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    
    if (!username || !email || !newPassword || !confirmNewPassword) {
        showMessage('请填写所有字段', 'error');
        return;
    }
    
    if (newPassword !== confirmNewPassword) {
        showMessage('两次输入的新密码不一致', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showMessage('密码长度至少6位', 'error');
        return;
    }
    
    // 查找用户
    const userIndex = users.findIndex(u => u.username === username && u.email === email);
    
    if (userIndex === -1) {
        showMessage('用户名或邮箱不正确', 'error');
        return;
    }
    
    // 更新密码
    users[userIndex].password = newPassword;
    saveToStorage();
    
    showMessage('密码修改成功！请使用新密码登录', 'success');
    
    // 清空表单
    document.getElementById('forgotPasswordForm').reset();
    
    // 跳转到登录页面
    setTimeout(() => {
        showPage('loginPage');
    }, 1500);
}

// 显示主页面
function showMainPage() {
    showPage('mainPage');
    document.getElementById('currentUser').textContent = currentUser.username;
    refreshRecordsTable();
}

// 退出登录
function logout() {
    currentUser = null;
    saveToStorage();
    showPage('loginPage');
    
    // 清空表单
    document.querySelectorAll('form').forEach(form => form.reset());
    
    showMessage('已成功退出登录', 'info');
}

// 处理添加记录
function handleAddRecord(event) {
    event.preventDefault();
    
    const date = document.getElementById('recordDate').value;
    const name = document.getElementById('employeeName').value.trim();
    const count = parseInt(document.getElementById('employeeCount').value);
    const site = document.getElementById('siteName').value.trim();
    const parkingFee = parseFloat(document.getElementById('parkingFee').value) || 0;
    const highwayFee = parseFloat(document.getElementById('highwayFee').value) || 0;
    
    if (!date || !name || !count || !site) {
        showMessage('请填写所有必填字段', 'error');
        return;
    }
    
    const record = {
        id: Date.now().toString(),
        date: date,
        name: name,
        count: count,
        site: site,
        parkingFee: parkingFee,
        highwayFee: highwayFee,
        userId: currentUser.id,
        createdAt: new Date().toISOString()
    };
    
    attendanceRecords.push(record);
    saveToStorage();
    refreshRecordsTable();
    
    showMessage('考勤记录添加成功！', 'success');
    
    // 清空表单（保留日期）
    document.getElementById('employeeName').value = '';
    document.getElementById('employeeCount').value = '';
    document.getElementById('siteName').value = '';
    document.getElementById('parkingFee').value = '';
    document.getElementById('highwayFee').value = '';
}

// 刷新记录表格
function refreshRecordsTable() {
    const tbody = document.getElementById('recordsTableBody');
    const userRecords = attendanceRecords.filter(record => record.userId === currentUser.id);
    
    tbody.innerHTML = '';
    
    userRecords.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(record => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${record.date}</td>
            <td>${record.name}</td>
            <td>${record.count}</td>
            <td>${record.site}</td>
            <td>¥${record.parkingFee.toLocaleString()}</td>
            <td>¥${record.highwayFee.toLocaleString()}</td>
            <td>
                <button class="delete-btn" onclick="deleteRecord('${record.id}')">删除</button>
            </td>
        `;
    });
}

// 删除记录
function deleteRecord(recordId) {
    if (confirm('确定要删除这条记录吗？')) {
        const index = attendanceRecords.findIndex(record => record.id === recordId);
        if (index !== -1) {
            attendanceRecords.splice(index, 1);
            saveToStorage();
            refreshRecordsTable();
            showMessage('记录已删除', 'success');
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

// 生成统计
function generateStatistics() {
    const month = document.getElementById('statsMonth').value;
    if (!month) {
        showMessage('请选择要统计的月份', 'error');
        return;
    }
    
    const userRecords = attendanceRecords.filter(record => 
        record.userId === currentUser.id && record.date.startsWith(month)
    );
    
    if (userRecords.length === 0) {
        document.getElementById('statisticsResults').innerHTML = `
            <div class="stats-card">
                <h3>${month} 月统计结果</h3>
                <p>该月份暂无考勤记录</p>
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
    
    // 生成统计结果HTML
    let html = `
        <div class="stats-card">
            <h3>${month} 月统计概览</h3>
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
                            <th>费用小计</th>
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
                            <th>费用小计</th>
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
    `;
    
    document.getElementById('statisticsResults').innerHTML = html;
}

// 导出PDF
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
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // 设置中文字体（需要额外的字体库支持）
    doc.setFont('helvetica');
    
    // 标题
    doc.setFontSize(16);
    doc.text(`${month} Attendance Report`, 20, 20);
    
    // 统计概览
    const totalPeople = userRecords.reduce((sum, record) => sum + record.count, 0);
    const totalParkingFee = userRecords.reduce((sum, record) => sum + record.parkingFee, 0);
    const totalHighwayFee = userRecords.reduce((sum, record) => sum + record.highwayFee, 0);
    
    doc.setFontSize(12);
    doc.text(`Total Records: ${userRecords.length}`, 20, 40);
    doc.text(`Total People: ${totalPeople}`, 20, 50);
    doc.text(`Total Parking Fee: ¥${totalParkingFee.toLocaleString()}`, 20, 60);
    doc.text(`Total Highway Fee: ¥${totalHighwayFee.toLocaleString()}`, 20, 70);
    doc.text(`Total Fees: ¥${(totalParkingFee + totalHighwayFee).toLocaleString()}`, 20, 80);
    
    // 详细记录表格
    const tableData = userRecords.map(record => [
        record.date,
        record.name,
        record.count.toString(),
        record.site,
        `¥${record.parkingFee.toLocaleString()}`,
        `¥${record.highwayFee.toLocaleString()}`
    ]);
    
    doc.autoTable({
        startY: 100,
        head: [['Date', 'Name', 'Count', 'Site', 'Parking Fee', 'Highway Fee']],
        body: tableData,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [102, 126, 234] }
    });
    
    doc.save(`attendance-report-${month}.pdf`);
    showMessage('PDF文件已下载', 'success');
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
    csvContent += '日期,姓名,人数,现场名称,停车费,高速费\n';
    
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
    
    showMessage('CSV文件已下载', 'success');
}

// 从本地存储加载数据
function loadFromStorage() {
    try {
        const userData = localStorage.getItem('attendanceSystemUsers');
        if (userData) {
            users = JSON.parse(userData);
        }
        
        const recordData = localStorage.getItem('attendanceSystemRecords');
        if (recordData) {
            attendanceRecords = JSON.parse(recordData);
        }
        
        const currentUserData = localStorage.getItem('attendanceSystemCurrentUser');
        if (currentUserData) {
            currentUser = JSON.parse(currentUserData);
        }
    } catch (error) {
        console.error('Error loading data from storage:', error);
        showMessage('数据加载失败', 'error');
    }
}

// 保存数据到本地存储
function saveToStorage() {
    try {
        localStorage.setItem('attendanceSystemUsers', JSON.stringify(users));
        localStorage.setItem('attendanceSystemRecords', JSON.stringify(attendanceRecords));
        localStorage.setItem('attendanceSystemCurrentUser', JSON.stringify(currentUser));
    } catch (error) {
        console.error('Error saving data to storage:', error);
        showMessage('数据保存失败', 'error');
    }
}