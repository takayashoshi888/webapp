// 全局变量
let currentUser = null;
let attendanceRecords = [];
let users = [];
let isSupabaseEnabled = false; // Supabase连接状态

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    // 从本地存储加载数据
    loadFromStorage();
    
    // 检查Supabase连接状态
    setTimeout(async () => {
        if (typeof SupabaseDB !== 'undefined' && checkSupabaseConfig()) {
            isSupabaseEnabled = true;
            // 如果有当前用户，重新加载他们的数据
            if (currentUser && currentUser.id) {
                await loadUserRecordsFromSupabase();
            }
        }
    }, 2000);
    
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
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        showMessage('请输入用户名和密码', 'error');
        return;
    }
    
    try {
        if (isSupabaseEnabled) {
            // 使用Supabase登录
            const result = await SupabaseDB.getUserByCredentials(username, password);
            
            if (result.success) {
                currentUser = {
                    id: result.data.id,
                    username: result.data.username,
                    email: result.data.email
                };
                
                saveToStorage();
                await loadUserRecordsFromSupabase();
                showMainPage();
                showMessage('登录成功！', 'success');
            } else {
                showMessage('用户名或密码错误', 'error');
            }
        } else {
            // 使用本地存储登录
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
    } catch (error) {
        console.error('登录失败:', error);
        showMessage('登录失败，请稍后重试', 'error');
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
        if (isSupabaseEnabled) {
            // 使用Supabase注册
            // 先检查用户是否已存在
            const checkResult = await SupabaseDB.checkUserExists(username, email);
            
            if (checkResult.success && checkResult.data.length > 0) {
                const existingUser = checkResult.data[0];
                if (existingUser.username === username) {
                    showMessage('用户名已存在', 'error');
                    return;
                }
                if (existingUser.email === email) {
                    showMessage('邮箱已被注册', 'error');
                    return;
                }
            }
            
            // 创建新用户
            const result = await SupabaseDB.createUser({
                username: username,
                email: email,
                password: password
            });
            
            if (result.success) {
                showMessage('注册成功！请登录', 'success');
                
                // 清空表单
                document.getElementById('registerForm').reset();
                
                // 跳转到登录页面
                setTimeout(() => {
                    showPage('loginPage');
                }, 1500);
            } else {
                showMessage('注册失败: ' + result.error, 'error');
            }
        } else {
            // 使用本地存储注册
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
    } catch (error) {
        console.error('注册失败:', error);
        showMessage('注册失败，请稍后重试', 'error');
    }
}

// 处理密码修改
async function handlePasswordChange(event) {
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
    
    try {
        if (isSupabaseEnabled) {
            // 使用Supabase修改密码
            const result = await SupabaseDB.getUserByUsernameAndEmail(username, email);
            
            if (result.success) {
                const updateResult = await SupabaseDB.updateUserPassword(result.data.id, newPassword);
                
                if (updateResult.success) {
                    showMessage('密码修改成功！请使用新密码登录', 'success');
                    
                    // 清空表单
                    document.getElementById('forgotPasswordForm').reset();
                    
                    // 跳转到登录页面
                    setTimeout(() => {
                        showPage('loginPage');
                    }, 1500);
                } else {
                    showMessage('密码修改失败: ' + updateResult.error, 'error');
                }
            } else {
                showMessage('用户名或邮箱不正确', 'error');
            }
        } else {
            // 使用本地存储修改密码
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
    } catch (error) {
        console.error('密码修改失败:', error);
        showMessage('密码修改失败，请稍后重试', 'error');
    }
}

// 显示主页面
function showMainPage() {
    showPage('mainPage');
    document.getElementById('currentUser').textContent = currentUser.username;
    refreshRecordsTable();
    updateConnectionStatus();
}

// 更新连接状态
function updateConnectionStatus() {
    const statusElement = document.getElementById('connectionStatus');
    const syncButton = document.getElementById('syncButton');
    
    if (isSupabaseEnabled) {
        statusElement.textContent = '云端模式';
        statusElement.className = 'connection-status online';
        if (syncButton) {
            syncButton.style.display = 'inline-block';
        }
    } else {
        statusElement.textContent = '本地模式';
        statusElement.className = 'connection-status offline';
        if (syncButton) {
            syncButton.style.display = 'none';
        }
    }
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
async function handleAddRecord(event) {
    event.preventDefault();
    
    const date = document.getElementById('recordDate').value;
    const name = document.getElementById('employeeName').value.trim();
    const count = parseInt(document.getElementById('employeeCount').value);
    const site = document.getElementById('siteName').value.trim();
    const parkingFee = parseFloat(document.getElementById('parkingFee').value) || 0;
    const highwayFee = parseFloat(document.getElementById('highwayFee').value) || 0;
    const roomType = document.getElementById('roomType').value;
    
    if (!date || !name || !count || !site) {
        showMessage('请填写所有必填字段', 'error');
        return;
    }
    
    try {
        if (isSupabaseEnabled) {
            // 使用Supabase保存记录
            const result = await SupabaseDB.createRecord({
                userId: currentUser.id,
                date: date,
                name: name,
                count: count,
                site: site,
                parkingFee: parkingFee,
                highwayFee: highwayFee,
                roomType: roomType
            });
            
            if (result.success) {
                // 将新记录添加到本地数组
                const newRecord = {
                    id: result.data.id,
                    date: result.data.date,
                    name: result.data.name,
                    count: result.data.count,
                    site: result.data.site,
                    parkingFee: result.data.parking_fee,
                    highwayFee: result.data.highway_fee,
                    roomType: result.data.room_type,
                    userId: result.data.user_id,
                    createdAt: result.data.created_at
                };
                
                attendanceRecords.push(newRecord);
                saveToStorage();
                refreshRecordsTable();
                
                showMessage('考勤记录添加成功！', 'success');
            } else {
                showMessage('添加记录失败: ' + result.error, 'error');
            }
        } else {
            // 使用本地存储
            const record = {
                id: Date.now().toString(),
                date: date,
                name: name,
                count: count,
                site: site,
                parkingFee: parkingFee,
                highwayFee: highwayFee,
                roomType: roomType,
                userId: currentUser.id,
                createdAt: new Date().toISOString()
            };
            
            attendanceRecords.push(record);
            saveToStorage();
            refreshRecordsTable();
            
            showMessage('考勤记录添加成功！', 'success');
        }
        
        // 清空表单（保留日期）
        document.getElementById('employeeName').value = '';
        document.getElementById('employeeCount').value = '';
        document.getElementById('siteName').value = '';
        document.getElementById('roomType').value = '';
        document.getElementById('parkingFee').value = '';
        document.getElementById('highwayFee').value = '';
        
    } catch (error) {
        console.error('添加记录失败:', error);
        showMessage('添加记录失败，请稍后重试', 'error');
    }
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
            <td>${getRoomTypeLabel(record.roomType)}</td>
            <td>¥${record.parkingFee.toLocaleString()}</td>
            <td>¥${record.highwayFee.toLocaleString()}</td>
            <td>
                <button class="edit-btn" onclick="editRecord('${record.id}')">编辑</button>
                <button class="delete-btn" onclick="deleteRecord('${record.id}')">删除</button>
            </td>
        `;
    });
}

// 获取部屋タイプの表示标签
function getRoomTypeLabel(type) {
    const typeMap = {
        'A': 'Aタイプ',
        'B': 'Bタイプ',
        'C': 'Cタイプ',
        'D': 'Dタイプ',
        'E': 'Eタイプ',
        'F': 'Fタイプ'
    };
    return typeMap[type] || type;
}

// 编辑记录
function editRecord(recordId) {
    const record = attendanceRecords.find(r => r.id === recordId);
    if (!record) return;
    
    // 填充表单数据
    document.getElementById('recordDate').value = record.date;
    document.getElementById('employeeName').value = record.name;
    document.getElementById('employeeCount').value = record.count;
    document.getElementById('siteName').value = record.site;
    document.getElementById('roomType').value = record.roomType;
    document.getElementById('parkingFee').value = record.parkingFee;
    document.getElementById('highwayFee').value = record.highwayFee;
    
    // 更改表单提交处理函数
    document.getElementById('attendanceForm').removeEventListener('submit', handleAddRecord);
    document.getElementById('attendanceForm').addEventListener('submit', function editHandler(e) {
        e.preventDefault();
        updateRecord(recordId);
        // 恢复原始提交处理函数
        document.getElementById('attendanceForm').removeEventListener('submit', editHandler);
        document.getElementById('attendanceForm').addEventListener('submit', handleAddRecord);
    });
    
    // 滚动到表单顶部
    document.querySelector('.record-form').scrollIntoView({ behavior: 'smooth' });
    
    showMessage('正在编辑记录，请修改后重新提交', 'info');
}

// 更新记录
async function updateRecord(recordId) {
    const date = document.getElementById('recordDate').value;
    const name = document.getElementById('employeeName').value.trim();
    const count = parseInt(document.getElementById('employeeCount').value);
    const site = document.getElementById('siteName').value.trim();
    const parkingFee = parseFloat(document.getElementById('parkingFee').value) || 0;
    const highwayFee = parseFloat(document.getElementById('highwayFee').value) || 0;
    const roomType = document.getElementById('roomType').value;
    
    if (!date || !name || !count || !site) {
        showMessage('请填写所有必填字段', 'error');
        return;
    }
    
    try {
        // 查找要更新的记录
        const recordIndex = attendanceRecords.findIndex(r => r.id === recordId);
        if (recordIndex === -1) {
            showMessage('未找到要更新的记录', 'error');
            return;
        }
        
        if (isSupabaseEnabled) {
            // 使用Supabase更新记录
            const result = await SupabaseDB.updateRecord(recordId, {
                date: date,
                name: name,
                count: count,
                site: site,
                parkingFee: parkingFee,
                highwayFee: highwayFee,
                roomType: roomType
            });
            
            if (result.success) {
                // 更新本地数组
                attendanceRecords[recordIndex] = {
                    ...attendanceRecords[recordIndex],
                    date: date,
                    name: name,
                    count: count,
                    site: site,
                    parkingFee: parkingFee,
                    highwayFee: highwayFee,
                    roomType: roomType
                };
                
                saveToStorage();
                refreshRecordsTable();
                
                showMessage('考勤记录更新成功！', 'success');
            } else {
                showMessage('更新记录失败: ' + result.error, 'error');
            }
        } else {
            // 使用本地存储更新
            attendanceRecords[recordIndex] = {
                ...attendanceRecords[recordIndex],
                date: date,
                name: name,
                count: count,
                site: site,
                parkingFee: parkingFee,
                highwayFee: highwayFee,
                roomType: roomType
            };
            
            saveToStorage();
            refreshRecordsTable();
            
            showMessage('考勤记录更新成功！', 'success');
        }
        
        // 清空表单
        document.getElementById('attendanceForm').reset();
        const today = new Date();
        document.getElementById('recordDate').value = today.toISOString().split('T')[0];
        
    } catch (error) {
        console.error('更新记录失败:', error);
        showMessage('更新记录失败，请稍后重试', 'error');
    }
}

// 删除记录
async function deleteRecord(recordId) {
    if (confirm('确定要删除这条记录吗？')) {
        try {
            if (isSupabaseEnabled) {
                // 使用Supabase删除记录
                const result = await SupabaseDB.deleteRecord(recordId);
                
                if (result.success) {
                    // 从本地数组中删除
                    const index = attendanceRecords.findIndex(record => record.id === recordId);
                    if (index !== -1) {
                        attendanceRecords.splice(index, 1);
                        saveToStorage();
                        refreshRecordsTable();
                        showMessage('记录已删除', 'success');
                    }
                } else {
                    showMessage('删除失败: ' + result.error, 'error');
                }
            } else {
                // 使用本地存储删除
                const index = attendanceRecords.findIndex(record => record.id === recordId);
                if (index !== -1) {
                    attendanceRecords.splice(index, 1);
                    saveToStorage();
                    refreshRecordsTable();
                    showMessage('记录已删除', 'success');
                }
            }
        } catch (error) {
            console.error('删除记录失败:', error);
            showMessage('删除失败，请稍后重试', 'error');
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
    
    // 按部屋タイプ分组统计
    const roomTypeStats = {};
    userRecords.forEach(record => {
        const roomTypeLabel = getRoomTypeLabel(record.roomType);
        if (!roomTypeStats[roomTypeLabel]) {
            roomTypeStats[roomTypeLabel] = {
                records: 0,
                totalPeople: 0,
                totalParkingFee: 0,
                totalHighwayFee: 0
            };
        }
        roomTypeStats[roomTypeLabel].records++;
        roomTypeStats[roomTypeLabel].totalPeople += record.count;
        roomTypeStats[roomTypeLabel].totalParkingFee += record.parkingFee;
        roomTypeStats[roomTypeLabel].totalHighwayFee += record.highwayFee;
    });
    
    // 生成统计结果HTML
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
                            <th>高速费</th>
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
        getRoomTypeLabel(record.roomType),
        `¥${record.parkingFee.toLocaleString()}`,
        `¥${record.highwayFee.toLocaleString()}`
    ]);
    
    doc.autoTable({
        startY: yPos + 20,
        head: [['Date', 'Name', 'Count', 'Site', 'Room Type', 'Parking Fee', 'Highway Fee']],
        body: tableData,
        styles: { fontSize: 9, cellPadding: 3, halign: 'center' },
        headStyles: { fillColor: [102, 126, 234], textColor: [255, 255, 255] },
        columnStyles: {
            0: { cellWidth: 20 }, 1: { cellWidth: 25 }, 2: { cellWidth: 15 },
            3: { cellWidth: 30 }, 4: { cellWidth: 25 }, 5: { cellWidth: 25 }, 6: { cellWidth: 25 }
        }
    });
    
    doc.save(`attendance-report-${month}.pdf`);
    showMessage('PDF文件已成功导出！', 'success');
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
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">部屋タイプ</th>
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
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${getRoomTypeLabel(record.roomType)}</td>
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
            <div><h3 style="margin: 0 0 15px 0; color: #333;">詳細記錄</h3>${tableHTML}</div>
            <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">生成時間：${new Date().toLocaleString('zh-CN')}</div>`;
        
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
        showMessage('PDF文件已成功导出！完美支持中文和日文显示', 'success');
        
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
    csvContent += '日期,姓名,人数,现场名称,部屋タイプ,停车费,高速费\n';
    
    userRecords.forEach(record => {
        csvContent += `${record.date},${record.name},${record.count},${record.site},${getRoomTypeLabel(record.roomType)},${record.parkingFee},${record.highwayFee}\n`;
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

// 从 Supabase 加载用户记录
async function loadUserRecordsFromSupabase() {
    if (!isSupabaseEnabled || !currentUser || !currentUser.id) {
        return;
    }
    
    try {
        const result = await SupabaseDB.getRecordsByUserId(currentUser.id);
        
        if (result.success) {
            // 转换数据格式以匹配本地结构
            attendanceRecords = result.data.map(record => ({
                id: record.id,
                date: record.date,
                name: record.name,
                count: record.count,
                site: record.site,
                parkingFee: parseFloat(record.parking_fee) || 0,
                highwayFee: parseFloat(record.highway_fee) || 0,
                userId: record.user_id,
                createdAt: record.created_at
            }));
            
            saveToStorage();
            refreshRecordsTable();
        }
    } catch (error) {
        console.error('加载用户记录失败:', error);
        showMessage('加载云端数据失败', 'error');
    }
}

// 同步本地数据到 Supabase
async function syncLocalDataToSupabase() {
    if (!isSupabaseEnabled || !currentUser) {
        return;
    }
    
    try {
        // 同步考勤记录
        const localRecords = attendanceRecords.filter(record => record.userId === currentUser.id);
        
        for (const record of localRecords) {
            // 检查记录是否已存在于Supabase中
            if (typeof record.id === 'string' && record.id.length < 20) {
                // 这是本地生成的ID，需要上传
                await SupabaseDB.createRecord({
                    userId: currentUser.id,
                    date: record.date,
                    name: record.name,
                    count: record.count,
                    site: record.site,
                    parkingFee: record.parkingFee,
                    highwayFee: record.highwayFee
                });
            }
        }
        
        // 重新加载云端数据
        await loadUserRecordsFromSupabase();
        
        showMessage('数据同步完成', 'success');
        
    } catch (error) {
        console.error('同步数据失败:', error);
        showMessage('数据同步失败', 'error');
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