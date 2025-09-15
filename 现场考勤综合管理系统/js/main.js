// 模拟数据存储
const sites = JSON.parse(localStorage.getItem('sites')) || [];
const employees = JSON.parse(localStorage.getItem('employees')) || [];
const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];

// 默认管理员密码
const ADMIN_PASSWORD = "admin123";

// 初始化数据
function initStorage() {
    if (sites.length === 0) {
        const defaultSites = ['项目现场A', '项目现场B', '项目现场C'];
        localStorage.setItem('sites', JSON.stringify(defaultSites));
    }
    
    if (employees.length === 0) {
        const defaultEmployees = ['张三', '李四', '王五'];
        localStorage.setItem('employees', JSON.stringify(defaultEmployees));
    }
}

// 加载现场选项
function loadSites() {
    const siteSelect = document.getElementById('siteSelect');
    siteSelect.innerHTML = '<option value="">请选择现场</option>';
    
    const sites = JSON.parse(localStorage.getItem('sites')) || [];
    sites.forEach(site => {
        const option = document.createElement('option');
        option.value = site;
        option.textContent = site;
        siteSelect.appendChild(option);
    });
}

// 加载员工选项
function loadEmployees() {
    const nameSelect = document.getElementById('nameSelect');
    nameSelect.innerHTML = '<option value="">请选择姓名</option>';
    
    const employees = JSON.parse(localStorage.getItem('employees')) || [];
    employees.forEach(employee => {
        const option = document.createElement('option');
        option.value = employee;
        option.textContent = employee;
        nameSelect.appendChild(option);
    });
}

// 提交出勤表单
document.getElementById('attendanceForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const site = document.getElementById('siteSelect').value;
    const name = document.getElementById('nameSelect').value;
    const tollFee = parseFloat(document.getElementById('tollFee').value) || 0;
    const parkingFee = parseFloat(document.getElementById('parkingFee').value) || 0;
    
    if (!site || !name) {
        alert('请选择现场和姓名');
        return;
    }
    
    // 创建出勤记录
    const record = {
        id: Date.now(),
        site: site,
        name: name,
        tollFee: tollFee,
        parkingFee: parkingFee,
        date: new Date().toISOString()
    };
    
    // 保存记录
    const records = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
    records.push(record);
    localStorage.setItem('attendanceRecords', JSON.stringify(records));
    
    // 重置表单
    document.getElementById('attendanceForm').reset();
    
    alert('出勤登记成功！');
});

// 管理员登录相关功能
document.getElementById('adminLoginBtn').addEventListener('click', function() {
    document.getElementById('adminLoginModal').style.display = 'block';
});

document.querySelector('#adminLoginModal .close').addEventListener('click', function() {
    document.getElementById('adminLoginModal').style.display = 'none';
});

window.addEventListener('click', function(event) {
    const modal = document.getElementById('adminLoginModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
});

document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const password = document.getElementById('adminPassword').value;
    
    if (password === ADMIN_PASSWORD) {
        // 设置管理员登录状态
        sessionStorage.setItem('isAdminLoggedIn', 'true');
        // 登录成功，跳转到管理页面
        window.location.href = 'admin.html';
    } else {
        alert('密码错误，请重新输入！');
    }
    
    // 清空密码输入框
    document.getElementById('adminPassword').value = '';
});

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initStorage();
    loadSites();
    loadEmployees();
});