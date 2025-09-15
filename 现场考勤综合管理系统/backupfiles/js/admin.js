// 当前编辑的项目ID
let editingSite = null;
let editingEmployee = null;

// 检查管理员登录状态
function checkAdminLogin() {
    const isAdminLoggedIn = sessionStorage.getItem('isAdminLoggedIn');
    if (!isAdminLoggedIn) {
        // 未登录，重定向到主页
        alert('请先登录管理员账户');
        window.location.href = 'index.html';
    }
}

// 退出登录
function logout() {
    sessionStorage.removeItem('isAdminLoggedIn');
    window.location.href = 'index.html';
}

// 加载现场列表
function loadSites() {
    const sites = JSON.parse(localStorage.getItem('sites')) || [];
    const tbody = document.querySelector('#siteTable tbody');
    tbody.innerHTML = '';
    
    sites.forEach((site, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${site}</td>
            <td class="action-buttons">
                <button class="edit-btn" onclick="editSite(${index})">编辑</button>
                <button class="delete-btn" onclick="deleteSite(${index})">删除</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 加载员工列表
function loadEmployees() {
    const employees = JSON.parse(localStorage.getItem('employees')) || [];
    const tbody = document.querySelector('#employeeTable tbody');
    tbody.innerHTML = '';
    
    employees.forEach((employee, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee}</td>
            <td class="action-buttons">
                <button class="edit-btn" onclick="editEmployee(${index})">编辑</button>
                <button class="delete-btn" onclick="deleteEmployee(${index})">删除</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 添加或更新现场
document.getElementById('siteForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const siteName = document.getElementById('siteName').value.trim();
    if (!siteName) {
        alert('请输入现场名称');
        return;
    }
    
    const sites = JSON.parse(localStorage.getItem('sites')) || [];
    
    if (editingSite !== null) {
        // 更新现场
        sites[editingSite] = siteName;
    } else {
        // 添加新现场
        if (sites.includes(siteName)) {
            alert('该现场已存在');
            return;
        }
        sites.push(siteName);
    }
    
    localStorage.setItem('sites', JSON.stringify(sites));
    loadSites();
    resetSiteForm();
});

// 添加或更新员工
document.getElementById('employeeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const employeeName = document.getElementById('employeeName').value.trim();
    if (!employeeName) {
        alert('请输入员工姓名');
        return;
    }
    
    const employees = JSON.parse(localStorage.getItem('employees')) || [];
    
    if (editingEmployee !== null) {
        // 更新员工
        employees[editingEmployee] = employeeName;
    } else {
        // 添加新员工
        if (employees.includes(employeeName)) {
            alert('该员工已存在');
            return;
        }
        employees.push(employeeName);
    }
    
    localStorage.setItem('employees', JSON.stringify(employees));
    loadEmployees();
    resetEmployeeForm();
});

// 编辑现场
function editSite(index) {
    const sites = JSON.parse(localStorage.getItem('sites')) || [];
    document.getElementById('siteName').value = sites[index];
    editingSite = index;
    
    document.querySelector('#siteForm button[type="submit"]').style.display = 'none';
    document.getElementById('updateSiteBtn').style.display = 'inline-block';
    document.getElementById('cancelSiteBtn').style.display = 'inline-block';
}

// 更新现场按钮事件
document.getElementById('updateSiteBtn').addEventListener('click', function() {
    document.getElementById('siteForm').dispatchEvent(new Event('submit'));
});

// 取消编辑现场
document.getElementById('cancelSiteBtn').addEventListener('click', function() {
    resetSiteForm();
});

// 删除现场
function deleteSite(index) {
    if (confirm('确定要删除这个现场吗？')) {
        const sites = JSON.parse(localStorage.getItem('sites')) || [];
        sites.splice(index, 1);
        localStorage.setItem('sites', JSON.stringify(sites));
        loadSites();
    }
}

// 重置现场表单
function resetSiteForm() {
    document.getElementById('siteForm').reset();
    editingSite = null;
    document.querySelector('#siteForm button[type="submit"]').style.display = 'inline-block';
    document.getElementById('updateSiteBtn').style.display = 'none';
    document.getElementById('cancelSiteBtn').style.display = 'none';
}

// 编辑员工
function editEmployee(index) {
    const employees = JSON.parse(localStorage.getItem('employees')) || [];
    document.getElementById('employeeName').value = employees[index];
    editingEmployee = index;
    
    document.querySelector('#employeeForm button[type="submit"]').style.display = 'none';
    document.getElementById('updateEmployeeBtn').style.display = 'inline-block';
    document.getElementById('cancelEmployeeBtn').style.display = 'inline-block';
}

// 更新员工按钮事件
document.getElementById('updateEmployeeBtn').addEventListener('click', function() {
    document.getElementById('employeeForm').dispatchEvent(new Event('submit'));
});

// 取消编辑员工
document.getElementById('cancelEmployeeBtn').addEventListener('click', function() {
    resetEmployeeForm();
});

// 删除员工
function deleteEmployee(index) {
    if (confirm('确定要删除这个员工吗？')) {
        const employees = JSON.parse(localStorage.getItem('employees')) || [];
        employees.splice(index, 1);
        localStorage.setItem('employees', JSON.stringify(employees));
        loadEmployees();
    }
}

// 重置员工表单
function resetEmployeeForm() {
    document.getElementById('employeeForm').reset();
    editingEmployee = null;
    document.querySelector('#employeeForm button[type="submit"]').style.display = 'inline-block';
    document.getElementById('updateEmployeeBtn').style.display = 'none';
    document.getElementById('cancelEmployeeBtn').style.display = 'none';
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查管理员登录状态
    checkAdminLogin();
    
    loadSites();
    loadEmployees();
    
    // 绑定退出按钮事件
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // 绑定取消按钮事件
    document.getElementById('cancelSiteBtn').addEventListener('click', resetSiteForm);
    document.getElementById('cancelEmployeeBtn').addEventListener('click', resetEmployeeForm);
});