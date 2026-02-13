// ==================== 
// App State & Data
// ==================== 
let currentUser = null;
let users = [];
let records = [];
let chartInstances = {};
let currentEditRecordId = null; // 当前正在编辑的记录ID

// ==================== 
// Initialization
// ==================== 
document.addEventListener('DOMContentLoaded', () => {
  initializeTheme();
  initializeColorTheme();
  initializeParticles();
  loadFromStorage();
  initializeDates();
  bindEvents();
  checkAuth();
  updateCurrentDate();
  
  // Update date every minute
  setInterval(updateCurrentDate, 60000);
});

// ==================== 
// Theme Management
// ==================== 
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
  
  // Update charts if they exist
  updateChartTheme();
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('themeIcon');
  icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

function updateChartTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#f1f5f9' : '#1a202c';
  const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  
  Object.values(chartInstances).forEach(chart => {
    if (chart) {
      chart.options.plugins.legend.labels.color = textColor;
      if (chart.options.scales.x) {
        chart.options.scales.x.ticks.color = textColor;
        chart.options.scales.x.grid.color = gridColor;
      }
      if (chart.options.scales.y) {
        chart.options.scales.y.ticks.color = textColor;
        chart.options.scales.y.grid.color = gridColor;
      }
      chart.update();
    }
  });
}

// ==================== 
// Color Theme Management
// ==================== 
function initializeColorTheme() {
  const savedColorTheme = localStorage.getItem('colorTheme') || 'default';
  setColorTheme(savedColorTheme, false);
  updateThemeOptionsUI(savedColorTheme);
  
  // 点击外部关闭主题面板
  document.addEventListener('click', (e) => {
    const panel = document.getElementById('colorThemePanel');
    const toggle = document.querySelector('.color-theme-toggle');
    if (panel.classList.contains('show') && 
        !panel.contains(e.target) && 
        !toggle.contains(e.target)) {
      toggleColorThemePanel();
    }
  });
}

function toggleColorThemePanel() {
  const panel = document.getElementById('colorThemePanel');
  const toggle = document.querySelector('.color-theme-toggle');
  
  panel.classList.toggle('show');
  toggle.classList.toggle('active');
}

function setColorTheme(themeName, save = true) {
  const html = document.documentElement;
  
  // 移除所有主题属性
  html.removeAttribute('data-color-theme');
  
  // 应用新主题（默认主题不设置属性）
  if (themeName && themeName !== 'default') {
    html.setAttribute('data-color-theme', themeName);
  }
  
  // 保存到本地存储
  if (save) {
    localStorage.setItem('colorTheme', themeName);
  }
  
  // 更新UI
  updateThemeOptionsUI(themeName);
  
  // 更新图表颜色
  updateChartsColor();
  
  // 更新粒子颜色
  updateParticleColors();
  
  // 显示提示
  if (save) {
    const themeLabels = {
      'default': '默认紫蓝',
      'orange-red': '橘红渐变',
      'blue-gradient': '蓝青渐变',
      'green-gradient': '绿色渐变',
      'pink': '粉红渐变',
      'deep-blue': '深蓝渐变',
      'gold-orange': '金橙渐变'
    };
    showToast(`已切换到${themeLabels[themeName] || '默认'}主题`, 'success');
  }
}

function updateThemeOptionsUI(activeTheme) {
  document.querySelectorAll('.theme-option').forEach(option => {
    option.classList.remove('active');
    if (option.dataset.theme === activeTheme || 
        (activeTheme === 'default' && option.dataset.theme === 'default')) {
      option.classList.add('active');
    }
  });
}

function updateChartsColor() {
  // 获取当前主题的主要颜色
  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--brand-primary').trim();
  const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--brand-secondary').trim();
  
  // 更新所有图表的颜色
  Object.values(chartInstances).forEach(chart => {
    if (chart) {
      // 更新图表数据集颜色
      if (chart.data && chart.data.datasets) {
        chart.data.datasets.forEach((dataset, index) => {
          if (index === 0) {
            dataset.backgroundColor = primaryColor;
            dataset.borderColor = primaryColor;
          } else if (index === 1) {
            dataset.backgroundColor = secondaryColor;
            dataset.borderColor = secondaryColor;
          }
        });
      }
      chart.update('none'); // 无动画更新
    }
  });
}

function updateParticleColors() {
  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--theme-particle').trim();
  
  document.querySelectorAll('.particle').forEach(particle => {
    particle.style.background = primaryColor;
  });
}

// ==================== 
// Particle Background
// ==================== 
function initializeParticles() {
  const container = document.getElementById('particles');
  container.innerHTML = ''; // 清空现有粒子
  
  const particleCount = 25;
  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--theme-particle').trim() || '#667eea';
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDelay = `${Math.random() * 15}s`;
    particle.style.animationDuration = `${15 + Math.random() * 10}s`;
    particle.style.opacity = Math.random() * 0.15;
    particle.style.background = primaryColor;
    container.appendChild(particle);
  }
}

// ==================== 
// Event Bindings
// ==================== 
function bindEvents() {
  // Auth forms
  document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
  document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
  document.getElementById('forgotForm')?.addEventListener('submit', handlePasswordReset);
  
  // Record form
  document.getElementById('addRecordForm')?.addEventListener('submit', handleAddRecord);
  
  // Password strength
  document.getElementById('regPassword')?.addEventListener('input', checkPasswordStrength);
  
  // Close sidebar on outside click (mobile)
  document.addEventListener('click', (e) => {
    const sidebar = document.querySelector('.sidebar');
    const toggle = document.querySelector('.sidebar-toggle');
    if (window.innerWidth <= 992 && 
        sidebar.classList.contains('show') && 
        !sidebar.contains(e.target) && 
        !toggle.contains(e.target)) {
      sidebar.classList.remove('show');
    }
  });
}

// ==================== 
// Auth Functions
// ==================== 
function checkAuth() {
  if (currentUser) {
    showPage('mainPage');
    document.getElementById('userName').textContent = currentUser.username;
    updateDashboard();
  } else {
    showPage('loginPage');
  }
}

function handleLogin(e) {
  e.preventDefault();
  
  const btn = e.target.querySelector('button[type="submit"]');
  setLoading(btn, true);
  
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  const rememberMe = document.getElementById('rememberMe')?.checked;
  
  setTimeout(() => {
    const user = users.find(u => u.username === username && u.password === password);
    
    setLoading(btn, false);
    
    if (user) {
      currentUser = user;
      if (rememberMe) {
        localStorage.setItem('rememberUser', username);
      }
      saveToStorage();
      showPage('mainPage');
      document.getElementById('userName').textContent = user.username;
      updateDashboard();
      showToast('登录成功！欢迎回来', 'success');
      e.target.reset();
    } else {
      showToast('用户名或密码错误', 'error');
      document.getElementById('loginPassword').value = '';
      document.getElementById('loginPassword').focus();
    }
  }, 800);
}

function handleRegister(e) {
  e.preventDefault();
  
  const btn = e.target.querySelector('button[type="submit"]');
  setLoading(btn, true);
  
  const username = document.getElementById('regUsername').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirmPassword = document.getElementById('regConfirmPassword').value;
  
  setTimeout(() => {
    setLoading(btn, false);
    
    // Validation
    if (password !== confirmPassword) {
      showToast('两次输入的密码不一致', 'error');
      return;
    }
    
    if (password.length < 6) {
      showToast('密码长度至少为6位', 'error');
      return;
    }
    
    if (users.some(u => u.username === username)) {
      showToast('用户名已被注册', 'error');
      return;
    }
    
    if (users.some(u => u.email === email)) {
      showToast('邮箱已被注册', 'error');
      return;
    }
    
    // Create user
    const newUser = {
      id: generateId(),
      username,
      email,
      password,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveToStorage();
    
    showToast('注册成功！请登录', 'success');
    e.target.reset();
    resetPasswordStrength();
    
    setTimeout(() => showPage('loginPage'), 1500);
  }, 800);
}

function handlePasswordReset(e) {
  e.preventDefault();
  
  const btn = e.target.querySelector('button[type="submit"]');
  setLoading(btn, true);
  
  const username = document.getElementById('forgotUsername').value.trim();
  const email = document.getElementById('forgotEmail').value.trim();
  const newPassword = document.getElementById('forgotNewPassword').value;
  const confirmPassword = document.getElementById('forgotConfirmPassword').value;
  
  setTimeout(() => {
    setLoading(btn, false);
    
    if (newPassword !== confirmPassword) {
      showToast('两次输入的密码不一致', 'error');
      return;
    }
    
    const userIndex = users.findIndex(u => u.username === username && u.email === email);
    
    if (userIndex === -1) {
      showToast('用户名或邮箱不正确', 'error');
      return;
    }
    
    users[userIndex].password = newPassword;
    saveToStorage();
    
    showToast('密码重置成功！请使用新密码登录', 'success');
    e.target.reset();
    
    setTimeout(() => showPage('loginPage'), 1500);
  }, 800);
}

function logout() {
  if (confirm('确定要退出登录吗？')) {
    currentUser = null;
    saveToStorage();
    showPage('loginPage');
    document.getElementById('loginForm').reset();
    destroyCharts();
    showToast('已成功退出登录', 'info');
  }
}

// ==================== 
// Password Strength
// ==================== 
function checkPasswordStrength() {
  const password = document.getElementById('regPassword').value;
  const strengthBar = document.querySelector('.strength-fill');
  const strengthText = document.querySelector('.strength-text');
  
  let strength = 0;
  
  if (password.length >= 6) strength++;
  if (password.length >= 10) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  
  strengthBar.className = 'strength-fill';
  
  if (password.length === 0) {
    strengthBar.style.width = '0';
    strengthText.textContent = '密码强度';
  } else if (strength <= 2) {
    strengthBar.classList.add('weak');
    strengthText.textContent = '密码强度：弱';
    strengthText.style.color = 'var(--error)';
  } else if (strength <= 4) {
    strengthBar.classList.add('medium');
    strengthText.textContent = '密码强度：中';
    strengthText.style.color = 'var(--warning)';
  } else {
    strengthBar.classList.add('strong');
    strengthText.textContent = '密码强度：强';
    strengthText.style.color = 'var(--success)';
  }
}

function resetPasswordStrength() {
  const strengthBar = document.querySelector('.strength-fill');
  const strengthText = document.querySelector('.strength-text');
  strengthBar.className = 'strength-fill';
  strengthBar.style.width = '0';
  strengthText.textContent = '密码强度';
  strengthText.style.color = 'var(--text-muted)';
}

// ==================== 
// Record Management
// ==================== 
function handleAddRecord(e) {
  e.preventDefault();
  
  // 如果是编辑模式，则调用更新函数
  if (currentEditRecordId) {
    updateRecord();
    return;
  }
  
  const record = {
    id: generateId(),
    date: document.getElementById('recDate').value,
    name: document.getElementById('recName').value.trim(),
    count: parseInt(document.getElementById('recCount').value),
    site: document.getElementById('recSite').value.trim(),
    parkingFee: parseFloat(document.getElementById('recParking').value) || 0,
    highwayFee: parseFloat(document.getElementById('recHighway').value) || 0,
    userId: currentUser.id,
    createdAt: new Date().toISOString()
  };
  
  records.push(record);
  saveToStorage();
  
  // Reset form except date
  document.getElementById('recName').value = '';
  document.getElementById('recCount').value = '';
  document.getElementById('recSite').value = '';
  document.getElementById('recParking').value = '';
  document.getElementById('recHighway').value = '';
  document.getElementById('recName').focus();
  
  refreshRecordList();
  updateDashboard();
  showToast('考勤记录添加成功！', 'success');
}

function resetRecordForm() {
  document.getElementById('addRecordForm').reset();
  initializeDates();
  
  // 重置编辑状态
  currentEditRecordId = null;
  
  // 恢复表单标题和按钮文本
  const formHeader = document.querySelector('#records .form-header h3');
  const submitButton = document.querySelector('#addRecordForm .btn-primary');
  
  if (formHeader) {
    formHeader.innerHTML = '<i class="fas fa-plus-circle"></i> 新增考勤记录';
  }
  
  if (submitButton) {
    submitButton.innerHTML = '<i class="fas fa-plus"></i> 添加记录';
  }
}
function refreshRecordList() {
  const tbody = document.getElementById('recordTableBody');
  const emptyState = document.getElementById('recordEmpty');
  const userRecords = getUserRecords();
  
  if (userRecords.length === 0) {
    tbody.innerHTML = '';
    emptyState.classList.add('show');
    document.getElementById('recordTable').style.display = 'none';
    return;
  }
  
  emptyState.classList.remove('show');
  document.getElementById('recordTable').style.display = 'table';
  
  // Sort by date descending
  const sorted = [...userRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  tbody.innerHTML = sorted.map(record => `
    <tr data-id="${record.id}">
      <td>${formatDate(record.date)}</td>
      <td><strong>${escapeHtml(record.name)}</strong></td>
      <td>${record.count}</td>
      <td>${escapeHtml(record.site)}</td>
      <td>¥${formatNumber(record.parkingFee)}</td>
      <td>¥${formatNumber(record.highwayFee)}</td>
      <td><strong>¥${formatNumber(record.parkingFee + record.highwayFee)}</strong></td>
      <td>
        <button class="btn-icon" onclick="editRecord('${record.id}')" title="编辑">
          <i class="fas fa-edit" style="color: var(--brand-primary);"></i>
        </button>
        <button class="btn-icon" onclick="confirmDelete('${record.id}')" title="删除">
          <i class="fas fa-trash-alt" style="color: var(--error);"></i>
        </button>
      </td>
    </tr>
  `).join('');
  
  // Apply current filters
  filterRecordList();
}

function filterRecordList() {
  const monthFilter = document.getElementById('listFilterMonth').value;
  const nameFilter = document.getElementById('listFilterName').value.toLowerCase().trim();
  const rows = document.querySelectorAll('#recordTableBody tr');
  
  let visibleCount = 0;
  
  rows.forEach(row => {
    const date = row.cells[0].textContent;
    const name = row.cells[1].textContent.toLowerCase();
    
    const matchMonth = !monthFilter || row.dataset.date?.startsWith(monthFilter);
    const matchName = !nameFilter || name.includes(nameFilter);
    
    if (matchMonth && matchName) {
      row.style.display = '';
      visibleCount++;
    } else {
      row.style.display = 'none';
    }
  });
  
  const emptyState = document.getElementById('recordEmpty');
  const table = document.getElementById('recordTable');
  
  if (visibleCount === 0) {
    emptyState.classList.add('show');
    table.style.display = 'none';
    emptyState.querySelector('p').textContent = 
      monthFilter || nameFilter ? '没有找到匹配的记录' : '暂无考勤记录';
  } else {
    emptyState.classList.remove('show');
    table.style.display = 'table';
  }
}

function editRecord(recordId) {
  // 查找要编辑的记录
  const record = records.find(r => r.id === recordId);
  
  if (!record) {
    showToast('未找到该记录', 'error');
    return;
  }
  
  // 设置编辑状态
  currentEditRecordId = recordId;
  
  // 填充表单字段
  document.getElementById('recDate').value = record.date;
  document.getElementById('recName').value = record.name;
  document.getElementById('recCount').value = record.count;
  document.getElementById('recSite').value = record.site;
  document.getElementById('recParking').value = record.parkingFee;
  document.getElementById('recHighway').value = record.highwayFee;
  
  // 更新表单标题和按钮文本
  const formHeader = document.querySelector('#records .form-header h3');
  const submitButton = document.querySelector('#addRecordForm .btn-primary');
  
  if (formHeader) {
    formHeader.innerHTML = '<i class="fas fa-edit"></i> 编辑考勤记录';
  }
  
  if (submitButton) {
    submitButton.innerHTML = '<i class="fas fa-save"></i> 更新记录';
  }
  
  // 滚动到表单位置
  document.querySelector('#records .form-card').scrollIntoView({ 
    behavior: 'smooth', 
    block: 'center' 
  });
  
  // 聚焦到输入框
  document.getElementById('recName').focus();
  
  showToast('已进入编辑模式，请修改记录信息', 'info');
}

function confirmDelete(recordId) {
  const modal = document.getElementById('deleteModal');
  const confirmBtn = document.getElementById('confirmDeleteBtn');
  
  modal.classList.add('show');
  
  confirmBtn.onclick = () => {
    deleteRecord(recordId);
    closeModal('deleteModal');
  };
}

function deleteRecord(recordId) {
  const index = records.findIndex(r => r.id === recordId);
  if (index !== -1) {
    records.splice(index, 1);
    saveToStorage();
    refreshRecordList();
    updateDashboard();
    showToast('记录已删除', 'success');
  }
}

function updateRecord() {
  if (!currentEditRecordId) {
    showToast('没有正在编辑的记录', 'error');
    return;
  }
  
  // 查找要更新的记录
  const recordIndex = records.findIndex(r => r.id === currentEditRecordId);
  
  if (recordIndex === -1) {
    showToast('未找到要更新的记录', 'error');
    return;
  }
  
  // 构造更新后的记录对象
  const updatedRecord = {
    ...records[recordIndex],
    date: document.getElementById('recDate').value,
    name: document.getElementById('recName').value.trim(),
    count: parseInt(document.getElementById('recCount').value),
    site: document.getElementById('recSite').value.trim(),
    parkingFee: parseFloat(document.getElementById('recParking').value) || 0,
    highwayFee: parseFloat(document.getElementById('recHighway').value) || 0,
    updatedAt: new Date().toISOString()
  };
  
  // 更新记录
  records[recordIndex] = updatedRecord;
  
  // 保存到本地存储
  saveToStorage();
  
  // 刷新界面
  refreshRecordList();
  updateDashboard();
  
  // 重置表单和编辑状态
  resetRecordForm();
  
  showToast('考勤记录更新成功！', 'success');
}

// ==================== 
// Dashboard & Charts
// ==================== 
function updateDashboard() {
  const userRecords = getUserRecords();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthRecords = userRecords.filter(r => r.date.startsWith(currentMonth));
  
  // Update stats cards
  const totalRecords = monthRecords.length;
  const totalPeople = monthRecords.reduce((sum, r) => sum + r.count, 0);
  const totalAmount = monthRecords.reduce((sum, r) => sum + r.parkingFee + r.highwayFee, 0);
  const uniqueSites = new Set(monthRecords.map(r => r.site)).size;
  
  animateNumber('dashTotalRecords', totalRecords);
  animateNumber('dashTotalPeople', totalPeople);
  document.getElementById('dashTotalAmount').textContent = `¥${formatNumber(totalAmount)}`;
  animateNumber('dashTotalSites', uniqueSites);
  
  // Update recent records
  updateRecentRecords(userRecords);
  
  // Initialize charts
  setTimeout(() => {
    initTrendChart(userRecords);
    initPieChart(userRecords);
  }, 100);
}

function updateRecentRecords(userRecords) {
  const container = document.getElementById('recentRecords');
  const recent = [...userRecords]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
  
  if (recent.length === 0) {
    container.innerHTML = `
      <div class="recent-item" style="justify-content: center; opacity: 0.5;">
        <span>暂无记录</span>
      </div>
    `;
    return;
  }
  
  container.innerHTML = recent.map(record => `
    <div class="recent-item">
      <div class="recent-icon">
        <i class="fas fa-user-clock"></i>
      </div>
      <div class="recent-info">
        <div class="recent-title">${escapeHtml(record.name)} - ${escapeHtml(record.site)}</div>
        <div class="recent-meta">
          <i class="fas fa-calendar"></i> ${formatDate(record.date)} 
          <i class="fas fa-users" style="margin-left: 8px;"></i> ${record.count}人
        </div>
      </div>
      <div class="recent-amount">¥${formatNumber(record.parkingFee + record.highwayFee)}</div>
    </div>
  `).join('');
}

function initTrendChart(userRecords) {
  const ctx = document.getElementById('trendChart');
  if (!ctx) return;
  
  // Get last 30 days data
  const days = 30;
  const dates = [];
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    dates.push(dateStr.slice(5)); // MM-DD
    
    const dayRecords = userRecords.filter(r => r.date === dateStr);
    const dayAmount = dayRecords.reduce((sum, r) => sum + r.parkingFee + r.highwayFee, 0);
    data.push(dayAmount);
  }
  
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  
  if (chartInstances.trend) {
    chartInstances.trend.destroy();
  }
  
  chartInstances.trend = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: '费用 (¥)',
        data: data,
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#667eea',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          ticks: {
            color: isDark ? '#f1f5f9' : '#1a202c',
            maxTicksLimit: 10
          },
          grid: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
        },
        y: {
          ticks: { color: isDark ? '#f1f5f9' : '#1a202c' },
          grid: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' },
          beginAtZero: true
        }
      }
    }
  });
}

function initPieChart(userRecords) {
  const ctx = document.getElementById('pieChart');
  if (!ctx) return;
  
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthRecords = userRecords.filter(r => r.date.startsWith(currentMonth));
  
  const parkingTotal = monthRecords.reduce((sum, r) => sum + r.parkingFee, 0);
  const highwayTotal = monthRecords.reduce((sum, r) => sum + r.highwayFee, 0);
  
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  
  if (chartInstances.pie) {
    chartInstances.pie.destroy();
  }
  
  chartInstances.pie = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['停车费', '高速费'],
      datasets: [{
        data: [parkingTotal, highwayTotal],
        backgroundColor: ['#667eea', '#48bb78'],
        borderWidth: 0,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: isDark ? '#f1f5f9' : '#1a202c',
            padding: 20,
            usePointStyle: true
          }
        }
      },
      cutout: '60%'
    }
  });
}

function destroyCharts() {
  Object.values(chartInstances).forEach(chart => {
    if (chart) chart.destroy();
  });
  chartInstances = {};
}

// ==================== 
// Statistics Page
// ==================== 
function generateFullStats() {
  const month = document.getElementById('statMonth').value;
  
  if (!month) {
    showToast('请选择统计月份', 'warning');
    return;
  }
  
  const userRecords = getUserRecords().filter(r => r.date.startsWith(month));
  
  if (userRecords.length === 0) {
    document.getElementById('statsResult').classList.remove('show');
    document.getElementById('statsEmpty').style.display = 'block';
    document.getElementById('statsEmpty').querySelector('p').textContent = `${month} 月暂无数据`;
    return;
  }
  
  document.getElementById('statsEmpty').style.display = 'none';
  document.getElementById('statsResult').classList.add('show');
  
  // Calculate stats
  const totalRecords = userRecords.length;
  const totalPeople = userRecords.reduce((sum, r) => sum + r.count, 0);
  const totalAmount = userRecords.reduce((sum, r) => sum + r.parkingFee + r.highwayFee, 0);
  
  // Animate numbers
  animateNumber('statTotalRecords', totalRecords);
  animateNumber('statTotalPeople', totalPeople);
  document.getElementById('statTotalAmount').textContent = `¥${formatNumber(totalAmount)}`;
  
  // Group by person
  const personStats = {};
  userRecords.forEach(r => {
    if (!personStats[r.name]) {
      personStats[r.name] = { count: 0, people: 0, parking: 0, highway: 0 };
    }
    personStats[r.name].count++;
    personStats[r.name].people += r.count;
    personStats[r.name].parking += r.parkingFee;
    personStats[r.name].highway += r.highwayFee;
  });
  
  // Group by site
  const siteStats = {};
  userRecords.forEach(r => {
    if (!siteStats[r.site]) {
      siteStats[r.site] = { count: 0, people: 0, parking: 0, highway: 0 };
    }
    siteStats[r.site].count++;
    siteStats[r.site].people += r.count;
    siteStats[r.site].parking += r.parkingFee;
    siteStats[r.site].highway += r.highwayFee;
  });
  
  // Render person table
  const personTableBody = document.getElementById('personTableBody');
  const sortedPersons = Object.entries(personStats).sort((a, b) => b[1].people - a[1].people);
  personTableBody.innerHTML = sortedPersons.map(([name, stats]) => `
    <tr>
      <td><strong>${escapeHtml(name)}</strong></td>
      <td>${stats.count}</td>
      <td>${stats.people}</td>
      <td>¥${formatNumber(stats.parking)}</td>
      <td>¥${formatNumber(stats.highway)}</td>
      <td><strong>¥${formatNumber(stats.parking + stats.highway)}</strong></td>
    </tr>
  `).join('');
  
  // Render site table
  const siteTableBody = document.getElementById('siteTableBody');
  const sortedSites = Object.entries(siteStats).sort((a, b) => b[1].people - a[1].people);
  siteTableBody.innerHTML = sortedSites.map(([site, stats]) => `
    <tr>
      <td><strong>${escapeHtml(site)}</strong></td>
      <td>${stats.count}</td>
      <td>${stats.people}</td>
      <td>¥${formatNumber(stats.parking)}</td>
      <td>¥${formatNumber(stats.highway)}</td>
      <td><strong>¥${formatNumber(stats.parking + stats.highway)}</strong></td>
    </tr>
  `).join('');
  
  // Render charts
  setTimeout(() => {
    renderPersonChart(sortedPersons);
    renderSiteChart(sortedSites);
  }, 100);
}

function renderPersonChart(personData) {
  const ctx = document.getElementById('personChart');
  if (!ctx) return;
  
  const labels = personData.slice(0, 8).map(([name]) => name);
  const data = personData.slice(0, 8).map(([, stats]) => stats.parking + stats.highway);
  
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  
  if (chartInstances.person) {
    chartInstances.person.destroy();
  }
  
  chartInstances.person = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: '费用 (¥)',
        data: data,
        backgroundColor: '#667eea',
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          ticks: { color: isDark ? '#f1f5f9' : '#1a202c' },
          grid: { display: false }
        },
        y: {
          ticks: { color: isDark ? '#f1f5f9' : '#1a202c' },
          grid: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
        }
      }
    }
  });
}

function renderSiteChart(siteData) {
  const ctx = document.getElementById('siteChart');
  if (!ctx) return;
  
  const labels = siteData.slice(0, 8).map(([site]) => site);
  const data = siteData.slice(0, 8).map(([, stats]) => stats.people);
  
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  
  if (chartInstances.site) {
    chartInstances.site.destroy();
  }
  
  chartInstances.site = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: '人次',
        data: data,
        backgroundColor: '#48bb78',
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          ticks: { color: isDark ? '#f1f5f9' : '#1a202c' },
          grid: { display: false }
        },
        y: {
          ticks: { color: isDark ? '#f1f5f9' : '#1a202c' },
          grid: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
        }
      }
    }
  });
}

// ==================== 
// Export Functions
// ==================== 
async function exportToPDF() {
  const month = document.getElementById('statMonth').value || new Date().toISOString().slice(0, 7);
  const userRecords = getUserRecords().filter(r => r.date.startsWith(month));
  
  if (userRecords.length === 0) {
    showToast('该月份暂无数据可导出', 'error');
    return;
  }
  
  showToast('正在生成PDF，请稍候...', 'info');
  showLoading(true);
  
  try {
    // 使用html2canvas方式导出PDF，完美支持中文和日文
    await exportPDFWithCanvas(userRecords, month);
  } catch (error) {
    console.error('PDF导出错误:', error);
    // 如果canvas方式失败，使用传统方式
    exportPDFTraditional(userRecords, month);
  } finally {
    showLoading(false);
  }
}

// 使用Canvas方式导出PDF - 完美支持中文
async function exportPDFWithCanvas(userRecords, month) {
  const [year, monthNum] = month.split('-');
  const stats = calculateStats(userRecords, month);
  
  // 创建临时HTML容器
  const tempContainer = document.createElement('div');
  tempContainer.style.cssText = `
    position: fixed;
    top: -10000px;
    left: -10000px;
    width: 800px;
    background: white;
    padding: 40px;
    font-family: 'Microsoft YaHei', 'SimHei', 'PingFang SC', sans-serif;
    font-size: 14px;
    line-height: 1.6;
  `;
  
  const sortedRecords = [...userRecords].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // 生成完整的HTML报表内容
  tempContainer.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #1a202c; margin: 0 0 10px 0; font-size: 28px; font-weight: bold;">${year}年${monthNum}月考勤报表</h1>
      <p style="color: #718096; margin: 0; font-size: 14px;">Smart Attendance Report</p>
    </div>
    
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px; color: white;">
      <h3 style="margin: 0 0 16px 0; font-size: 16px;">📊 统计概览</h3>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
        <div style="text-align: center; background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px;">
          <div style="font-size: 12px; opacity: 0.9;">总记录数</div>
          <div style="font-size: 24px; font-weight: bold;">${stats.totalRecords}</div>
        </div>
        <div style="text-align: center; background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px;">
          <div style="font-size: 12px; opacity: 0.9;">总人数</div>
          <div style="font-size: 24px; font-weight: bold;">${stats.totalPeople}</div>
        </div>
        <div style="text-align: center; background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px;">
          <div style="font-size: 12px; opacity: 0.9;">费用总计</div>
          <div style="font-size: 24px; font-weight: bold;">¥${formatNumber(stats.totalFees)}</div>
        </div>
      </div>
    </div>
    
    <h3 style="color: #1a202c; margin: 0 0 16px 0; font-size: 18px; font-weight: bold;">📋 详细记录</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; border: 1px solid #e2e8f0;">
      <thead>
        <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
          <th style="padding: 12px 8px; text-align: center; border: 1px solid #e2e8f0;">日期</th>
          <th style="padding: 12px 8px; text-align: left; border: 1px solid #e2e8f0;">姓名</th>
          <th style="padding: 12px 8px; text-align: center; border: 1px solid #e2e8f0;">人数</th>
          <th style="padding: 12px 8px; text-align: left; border: 1px solid #e2e8f0;">现场</th>
          <th style="padding: 12px 8px; text-align: right; border: 1px solid #e2e8f0;">停车费</th>
          <th style="padding: 12px 8px; text-align: right; border: 1px solid #e2e8f0;">高速费</th>
        </tr>
      </thead>
      <tbody>
        ${sortedRecords.map((record, index) => `
          <tr style="background: ${index % 2 === 0 ? '#f8fafc' : 'white'};">
            <td style="padding: 10px 8px; text-align: center; border: 1px solid #e2e8f0;">${record.date}</td>
            <td style="padding: 10px 8px; border: 1px solid #e2e8f0;">${escapeHtml(record.name)}</td>
            <td style="padding: 10px 8px; text-align: center; border: 1px solid #e2e8f0;">${record.count}</td>
            <td style="padding: 10px 8px; border: 1px solid #e2e8f0;">${escapeHtml(record.site)}</td>
            <td style="padding: 10px 8px; text-align: right; border: 1px solid #e2e8f0;">¥${formatNumber(record.parkingFee)}</td>
            <td style="padding: 10px 8px; text-align: right; border: 1px solid #e2e8f0;">¥${formatNumber(record.highwayFee)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <div style="text-align: center; color: #a0aec0; font-size: 12px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
      生成时间：${new Date().toLocaleString('zh-CN')}
    </div>
  `;
  
  document.body.appendChild(tempContainer);
  
  try {
    // 使用html2canvas将HTML转换为图片
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 800,
      height: tempContainer.scrollHeight
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
    
    // 添加第一页
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // 如果内容超过一页，添加更多页面
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    pdf.save(`考勤报表-${month}.pdf`);
    showToast('PDF导出成功！完美支持中文显示', 'success');
  } catch (error) {
    document.body.removeChild(tempContainer);
    throw error;
  }
}

// 传统方式导出PDF - 使用英文字符（备用方案）
function exportPDFTraditional(userRecords, month) {
  const [year, monthNum] = month.split('-');
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // 使用内置字体，但只能显示英文
  doc.setFont('helvetica');
  doc.setFontSize(18);
  doc.text(`Attendance Report ${year}-${monthNum}`, 20, 25);
  
  const totalAmount = userRecords.reduce((sum, r) => sum + r.parkingFee + r.highwayFee, 0);
  const totalPeople = userRecords.reduce((sum, r) => sum + r.count, 0);
  
  doc.setFontSize(12);
  doc.text(`Total Records: ${userRecords.length}`, 20, 45);
  doc.text(`Total People: ${totalPeople}`, 20, 53);
  doc.text(`Total Amount: ¥${formatNumber(totalAmount)}`, 20, 61);
  
  // 表格数据使用英文表头
  const sorted = [...userRecords].sort((a, b) => new Date(a.date) - new Date(b.date));
  const tableData = sorted.map(r => [
    r.date,
    r.name,
    r.count.toString(),
    r.site,
    `¥${formatNumber(r.parkingFee)}`,
    `¥${formatNumber(r.highwayFee)}`
  ]);
  
  doc.autoTable({
    startY: 70,
    head: [['Date', 'Name', 'Count', 'Site', 'Parking', 'Highway']],
    body: tableData,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [102, 126, 234] }
  });
  
  doc.save(`attendance-report-${month}.pdf`);
  showToast('PDF已导出（备用模式）', 'warning');
}

// 计算统计数据（辅助函数）
function calculateStats(records, month) {
  const [year, monthNum] = month.split('-');
  const totalParkingFee = records.reduce((sum, r) => sum + r.parkingFee, 0);
  const totalHighwayFee = records.reduce((sum, r) => sum + r.highwayFee, 0);
  
  return {
    month: month,
    displayMonth: `${year}年${monthNum}月`,
    totalRecords: records.length,
    totalPeople: records.reduce((sum, r) => sum + r.count, 0),
    totalParkingFee: totalParkingFee,
    totalHighwayFee: totalHighwayFee,
    totalFees: totalParkingFee + totalHighwayFee
  };
}

function exportToCSV() {
  const month = document.getElementById('statMonth').value || new Date().toISOString().slice(0, 7);
  const userRecords = getUserRecords().filter(r => r.date.startsWith(month));
  
  if (userRecords.length === 0) {
    showToast('该月份暂无数据可导出', 'error');
    return;
  }
  
  let csv = '\uFEFF日期,姓名,人数,现场名称,停车费,高速费\n';
  
  userRecords.forEach(r => {
    csv += `${r.date},${r.name},${r.count},${r.site},${r.parkingFee},${r.highwayFee}\n`;
  });
  
  downloadFile(csv, `考勤数据-${month}.csv`, 'text/csv');
  showToast('CSV导出成功！', 'success');
}

function exportToJSON() {
  const data = {
    exportDate: new Date().toISOString(),
    user: currentUser?.username,
    records: getUserRecords()
  };
  
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, `考勤数据备份-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
  showToast('JSON导出成功！', 'success');
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// ==================== 
// UI Helpers
// ==================== 
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
}

function switchTab(tabId) {
  // Update sidebar nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.tab === tabId);
  });
  
  // Update content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(tabId).classList.add('active');
  
  // 切换标签页时重置编辑状态
  if (tabId !== 'records' && currentEditRecordId) {
    resetRecordForm();
  }
  
  // Refresh data if needed
  if (tabId === 'records') {
    refreshRecordList();
  } else if (tabId === 'dashboard') {
    updateDashboard();
  }
}

function toggleSidebar() {
  document.querySelector('.sidebar').classList.toggle('show');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('show');
}

function setLoading(btn, loading) {
  btn.classList.toggle('loading', loading);
  btn.disabled = loading;
}

function showLoading(show) {
  document.getElementById('loadingOverlay').classList.toggle('show', show);
}

function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-times-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };
  
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fas ${icons[type]} toast-icon"></i>
    <div class="toast-content">
      <div class="toast-title">${type === 'success' ? '成功' : type === 'error' ? '错误' : type === 'warning' ? '警告' : '提示'}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const button = input.parentElement.querySelector('.password-toggle i');
  
  if (input.type === 'password') {
    input.type = 'text';
    button.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    input.type = 'password';
    button.classList.replace('fa-eye-slash', 'fa-eye');
  }
}

function updateCurrentDate() {
  const dateEl = document.getElementById('currentDate');
  if (dateEl) {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    dateEl.textContent = now.toLocaleDateString('zh-CN', options);
  }
}

function initializeDates() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('recDate') && (document.getElementById('recDate').value = today);
}

function animateNumber(elementId, targetValue) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const startValue = parseInt(element.textContent) || 0;
  const duration = 800;
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const current = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);
    
    element.textContent = current.toLocaleString();
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

// ==================== 
// Data Helpers
// ==================== 
function getUserRecords() {
  return records.filter(r => r.userId === currentUser?.id);
}

function loadFromStorage() {
  try {
    const usersData = localStorage.getItem('attendance_users');
    const recordsData = localStorage.getItem('attendance_records');
    const currentUserData = localStorage.getItem('attendance_current_user');
    
    if (usersData) users = JSON.parse(usersData);
    if (recordsData) records = JSON.parse(recordsData);
    if (currentUserData) currentUser = JSON.parse(currentUserData);
  } catch (error) {
    console.error('加载数据失败:', error);
  }
}

function saveToStorage() {
  try {
    localStorage.setItem('attendance_users', JSON.stringify(users));
    localStorage.setItem('attendance_records', JSON.stringify(records));
    localStorage.setItem('attendance_current_user', JSON.stringify(currentUser));
  } catch (error) {
    console.error('保存数据失败:', error);
    showToast('数据保存失败', 'error');
  }
}

// ==================== 
// Utility Functions
// ==================== 
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatNumber(num) {
  return num.toLocaleString('ja-JP');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
