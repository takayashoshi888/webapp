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
    document.getElementById(pageId).classList.add('active');
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
    
    // 插入到当前活动页面的顶部
    const activePage = document.querySelector('.page.active');
    if (activePage) {
        // 对于主页面，使用主内容区域
        if (activePage.id === 'mainPage') {
            const mainContent = activePage.querySelector('.main-content');
            if (mainContent) {
                mainContent.insertBefore(messageDiv, mainContent.firstChild);
            }
        } else {
            // 对于登录、注册、忘记密码页面
            const container = activePage.querySelector('.container') || activePage.querySelector('.login-container') || activePage;
            if (container) {
                container.insertBefore(messageDiv, container.firstChild);
            }
        }
    } else {
        // 如果找不到活动页面，添加到body
        document.body.appendChild(messageDiv);
    }
    
    // 3秒后自动移除消息
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 3000);
}

// API请求函数
async function apiRequest(endpoint, options = {}) {
    // 构建完整的URL，确保正确添加.php扩展名
    const url = `${API_BASE_URL}/${endpoint}.php`;
    console.log('API Request URL:', url); // 调试信息
    
    // 设置默认选项
    const defaultOptions = {
        credentials: 'omit', // 对于跨域请求，通常需要设置为omit
        timeout: 15000, // 15秒超时
        ...options
    };
    
    // 添加认证头
    if (authToken) {
        defaultOptions.headers = {
            ...defaultOptions.headers,
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    } else {
        defaultOptions.headers = {
            ...defaultOptions.headers,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }
    
    try {
        console.log('Sending request to:', url, defaultOptions); // 调试信息
        
        // 创建一个带有超时的fetch请求
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
            console.error('Request timeout after', defaultOptions.timeout, 'ms');
        }, defaultOptions.timeout);
        
        const response = await fetch(url, {
            ...defaultOptions,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('Response status:', response.status); // 调试信息
        console.log('Response headers:', [...response.headers.entries()]); // 调試情報
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log('Error response text:', errorText); // 调試情報
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch (e) {
                throw new Error(`服务器返回错误 (${response.status}): ${errorText || '未知错误'}`);
            }
            throw new Error(errorData.error || `请求失败 (${response.status}): ${response.statusText}`);
        }
        
        const text = await response.text();
        console.log('Response text:', text); // 调試情報
        
        if (!text) {
            return {};
        }
        
        return JSON.parse(text);
    } catch (error) {
        console.error('API request error:', error);
        
        // 处理不同类型的错误
        if (error.name === 'AbortError') {
            throw new Error('请求超时，请检查网络连接或稍后重试');
        } else if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('网络连接失败，请检查API地址是否正确或网络是否连通。错误详情: ' + error.message);
        } else if (error instanceof TypeError) {
            throw new Error('请求格式错误: ' + error.message);
        }
        
        // 重新抛出其他错误
        throw error;
    }
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

// 打开PDF编辑器
function openPDFEditor() {
    window.open('https://tools.pdf24.org/zh/', '_blank');
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

// 対応中文と日本語のPDFエクスポート
function exportToPDF() {
    const month = document.getElementById('statsMonth').value;
    if (!month) {
        showMessage('まず统计データを生成してください', 'error');
        return;
    }
    
    const userRecords = attendanceRecords.filter(record => 
        record.userId === currentUser.id.toString() && record.date.startsWith(month)
    );
    
    if (userRecords.length === 0) {
        showMessage('该月份暂无数据可导出', 'error');
        return;
    }
    
    // 创建CSV内容
    let csvContent = '\uFEFF'; // BOM for UTF-8
    csvContent += '日期,姓名,人数,现场名称,部屋タイプ,部屋号,停车费,高速费\n';
    
    userRecords.forEach(record => {
        csvContent += `${record.date},${record.name},${record.count},${record.site},${record.roomType || ''},${record.roomNumber || ''},${record.parkingFee},${record.highwayFee}\n`;
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