// 随机背景
const backgrounds = ['login-background-1', 'login-background-2', 'login-background-3'];
const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];
document.addEventListener('DOMContentLoaded', function() {
    // 设置随机登录背景
    if (window.location.pathname.includes('index.html')) {
        const loginBackground = document.getElementById('loginBackground');
        if (loginBackground) {
            loginBackground.className = 'login-background ' + randomBackground;
        }
    }
});

// 用户认证相关功能
document.addEventListener('DOMContentLoaded', function() {
    // 初始化用户数据
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }
    
    // 登录表单提交
    if (document.getElementById('loginForm')) {
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            loginUser();
        });
    }
    
    // 注册按钮点击
    if (document.getElementById('registerBtn')) {
        document.getElementById('registerBtn').addEventListener('click', function() {
            showRegisterModal();
        });
    }
    
    // 退出登录
    if (document.getElementById('logoutBtn')) {
        document.getElementById('logoutBtn').addEventListener('click', logoutUser);
    }
    
    // 检查登录状态
    checkLoginStatus();
    
    // 注册模态框关闭
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });
    
    // 注册表单提交
    if (document.getElementById('registerForm')) {
        document.getElementById('registerForm').addEventListener('submit', function(e) {
            e.preventDefault();
            registerUser();
        });
    }
    
    // 点击模态框外部关闭
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
});

// 登录用户
function loginUser() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (!username || !password) {
        alert('请输入用户名和密码');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // 创建会话
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        // 重定向到主页面
        window.location.href = 'dashboard.html';
    } else {
        alert('用户名或密码错误');
    }
}

// 注册新用户
function registerUser() {
    const username = document.getElementById('newUsername').value.trim();
    const password = document.getElementById('newPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    
    if (!username || !password || !confirmPassword) {
        alert('请填写所有字段');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('两次输入的密码不一致');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users'));
    
    // 检查用户名是否已存在
    if (users.some(u => u.username === username)) {
        alert('用户名已存在');
        return;
    }
    
    // 添加新用户
    const newUser = {
        username,
        password,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('注册成功！请登录');
    document.getElementById('registerForm').reset();
    document.getElementById('registerModal').style.display = 'none';
}

// 显示注册模态框
function showRegisterModal() {
    document.getElementById('registerModal').style.display = 'block';
}

// 检查登录状态
function checkLoginStatus() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    if (window.location.pathname.endsWith('dashboard.html')) {
        if (!currentUser) {
            window.location.href = 'index.html';
        } else {
            document.getElementById('currentUser').textContent = `欢迎，${currentUser.username}`;
        }
    } else if (currentUser) {
        window.location.href = 'dashboard.html';
    }
}

// 退出登录
function logoutUser() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// 登录函数
async function login(username, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: username,
        password: password,
    });

    if (error) {
        alert('登录失败: ' + error.message);
        return false;
    }

    sessionStorage.setItem('currentUser', JSON.stringify(data.user));
    return true;
}

// 注册函数
async function register(username, password) {
    const { data, error } = await supabaseClient.auth.signUp({
        email: username,
        password: password,
    });

    if (error) {
        alert('注册失败: ' + error.message);
        return false;
    }

    alert('注册成功，请登录');
    return true;
}

// 登录功能
function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (!username || !password) {
        alert('请输入用户名和密码');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // 创建会话
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        // 重定向到主页面
        window.location.href = 'dashboard.html';
    } else {
        alert('用户名或密码错误');
    }
}
