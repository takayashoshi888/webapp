// 主应用逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    if (!JSON.parse(sessionStorage.getItem('currentUser'))) {
        window.location.href = 'index.html';
        return;
    }
    
    // 初始化数据
    initUserData();
    
    // 设置默认日期为今天
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('recordDate').value = today;
    
    // 清空表单
    document.getElementById('clearForm').addEventListener('click', function() {
        clearForm();
        showAlert('表单已清空', 'success');
    });
    
    // 查询按钮
    document.getElementById('queryBtn').addEventListener('click', queryRecords);
    
    // 重置查询
    document.getElementById('resetQuery').addEventListener('click', function() {
        document.getElementById('startDate').value = '';
        document.getElementById('endDate').value = '';
        document.getElementById('filterName').value = '';
        document.getElementById('filterSite').value = '';
        loadRecords();
    });
    
    // 导出CSV
    document.getElementById('exportBtn').addEventListener('click', exportToCSV);
    
    // 分页按钮
    document.getElementById('prevPage')?.addEventListener('click', goToPrevPage);
    document.getElementById('nextPage')?.addEventListener('click', goToNextPage);
    
    // 加载记录
    loadRecords();
});

// 初始化用户数据
function initUserData() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const userId = currentUser.username;
    
    if (!localStorage.getItem('attendanceData_' + userId)) {
        localStorage.setItem('attendanceData_' + userId, JSON.stringify({
            records: [],
            settings: {}
        }));
    }
}

// 获取当前用户数据
function getUserData() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const userId = currentUser.username;
    
    let userData = localStorage.getItem('attendanceData_' + userId);
    if (!userData) {
        userData = {
            records: [],
            settings: {}
        };
        localStorage.setItem('attendanceData_' + userId, JSON.stringify(userData));
    } else {
        userData = JSON.parse(userData);
    }
    
    return userData;
}

// 保存用户数据
function saveUserData(data) {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const userId = currentUser.username;
    
    localStorage.setItem('attendanceData_' + userId, JSON.stringify(data));
}

// 分页变量
let currentPage = 1;
const recordsPerPage = 10;

// 获取所有考勤记录（根据用户ID）
function getAllAttendanceRecords(userId) {
    if (!userId) {
        console.error('缺少用户ID参数');
        return [];
    }

    const userData = getUserData();
    return userData.records.filter(record => record.userId === userId);
}

// 根据条件查询考勤记录
function queryAttendanceRecords(filters) {
    if (!filters.userId) {
        console.error('缺少用户ID参数');
        return [];
    }

    const userData = getUserData();
    let records = userData.records.filter(record => record.userId === filters.userId);

    if (filters.startDate && filters.endDate) {
        records = records.filter(record => record.date >= filters.startDate && record.date <= filters.endDate);
    }

    if (filters.name) {
        records = records.filter(record => record.name.toLowerCase().includes(filters.name.toLowerCase()));
    }

    if (filters.site) {
        records = records.filter(record => record.siteName.toLowerCase().includes(filters.site.toLowerCase()));
    }

    return records;
}

// 删除考勤记录
function deleteAttendanceRecord(id) {
    const userData = getUserData();
    // 转换ID为数字类型进行比较，因为HTML属性获取的是字符串
    const recordIndex = userData.records.findIndex(record => record.id == id);
    
    if (recordIndex === -1) {
        console.error('记录不存在，ID:', id, '类型:', typeof id);
        console.log('现有记录:', userData.records.map(r => ({ id: r.id, type: typeof r.id })));
        return false;
    }

    userData.records.splice(recordIndex, 1);
    saveUserData(userData);
    return true;
}

// 插入新的考勤记录
function addAttendanceRecord(record) {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const userId = currentUser.username;
    
    // 添加 user_id 字段到记录中
    record.userId = userId;
    record.id = Date.now(); // 使用时间戳作为简单ID
    
    const userData = getUserData();
    userData.records.push(record);
    saveUserData(userData);
    
    return record;
}

// 保存记录
async function saveRecord(record) {
    try {
        // 获取当前用户信息
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!currentUser) {
            throw new Error('用户未登录');
        }

        // 验证记录数据
        if (!record || typeof record !== 'object') {
            throw new Error('无效的记录数据');
        }

        // 添加唯一ID和用户信息
        record.id = Date.now(); // 使用时间戳作为简单ID
        record.userId = currentUser.username;
        
        // 获取用户数据并添加新记录
        const userData = getUserData();
        userData.records.push(record);
        saveUserData(userData);

        // 返回成功结果
        return { 
            success: true,
            data: record,
            message: '记录保存成功'
        };
    } catch (error) {
        console.error('保存记录失败:', error);
        return { 
            success: false, 
            error: error.message || '保存记录失败',
            rawError: error // 添加原始错误信息用于调试
        };
    }
}

// 更新记录
async function updateRecord(recordId, updatedData) {
    try {
        // 获取当前用户信息
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!currentUser) {
            throw new Error('用户未登录');
        }

        // 验证数据
        if (!updatedData || typeof updatedData !== 'object') {
            throw new Error('无效的更新数据');
        }

        // 获取用户数据
        const userData = getUserData();
        // 使用宽松比较解决ID类型不匹配问题
        const recordIndex = userData.records.findIndex(record => 
            record.id == recordId && record.userId === currentUser.username
        );
        
        if (recordIndex === -1) {
            throw new Error('记录不存在或无权限编辑');
        }

        // 更新记录（保留原有的id和userId）
        const originalRecord = userData.records[recordIndex];
        userData.records[recordIndex] = {
            ...updatedData,
            id: originalRecord.id,
            userId: originalRecord.userId
        };
        
        saveUserData(userData);

        // 返回成功结果
        return { 
            success: true,
            data: userData.records[recordIndex],
            message: '记录更新成功'
        };
    } catch (error) {
        console.error('更新记录失败:', error);
        return { 
            success: false, 
            error: error.message || '更新记录失败',
            rawError: error
        };
    }
}

// 显示提示信息
function showAlert(message, type) {
    const alertBox = document.createElement('div');
    alertBox.className = `alert ${type}`;
    alertBox.textContent = message;
    
    document.body.appendChild(alertBox);
    
    setTimeout(() => {
        alertBox.classList.add('fade-out');
        setTimeout(() => {
            alertBox.remove();
        }, 500);
    }, 3000);
}

// 清空表单
function clearForm() {
    document.getElementById('recordForm').reset();
    document.getElementById('recordDate').value = new Date().toISOString().split('T')[0];
    
    // 重置表单为新增模式
    const submitBtn = document.querySelector('#recordForm .primary-btn');
    if (submitBtn) {
        submitBtn.textContent = '保存记录';
        submitBtn.removeAttribute('data-edit-id');
    }
}

// 加载记录
async function loadRecords() {
    // 获取当前用户ID
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const userId = currentUser.username;
    
    // 调用API查询数据
    try {
        const records = await getAllAttendanceRecords(userId);
        displayRecords(records);
        updateStatistics(records);
        updatePagination(records.length);
    } catch (error) {
        console.error('加载记录失败:', error);
        showAlert('加载记录失败: ' + (error.message || '请稍后重试'), 'error');
    }
}

// 查询记录
function queryRecords() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const filterName = document.getElementById('filterName').value.trim().toLowerCase();
    const filterSite = document.getElementById('filterSite').value.trim().toLowerCase();
    
    // 获取当前用户ID
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const userId = currentUser.username;
    
    // 构建过滤条件
    const filters = {
        startDate,
        endDate,
        name: filterName,
        site: filterSite,
        userId
    };
    
    // 调用API查询数据
    queryAttendanceRecords(filters).then(records => {
        displayRecords(records);
        updateStatistics(records);
        updatePagination(records.length);
    }).catch(error => {
        console.error('查询记录失败:', error);
        showAlert('查询记录失败: ' + (error.message || '请稍后重试'), 'error');
    });
}

// 显示记录
function displayRecords(records) {
    const tbody = document.getElementById('recordsBody');
    tbody.innerHTML = '';

    if (records.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 7;
        cell.textContent = '没有找到记录';
        cell.style.textAlign = 'center';
        row.appendChild(cell);
        tbody.appendChild(row);
        updateStatistics([]); // 没有记录时清空统计信息
        return;
    }

    // 按日期降序排序
    records.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 分页处理
    const startIndex = (currentPage - 1) * recordsPerPage;
    const paginatedRecords = records.slice(startIndex, startIndex + recordsPerPage);

    paginatedRecords.forEach((record, index) => {
        const row = document.createElement('tr');
        const globalIndex = startIndex + index;

        row.innerHTML = `
            <td>${formatDate(record.date)}</td>
            <td>${record.name}</td>
            <td>${record.people_count}</td>
            <td>${record.site_name}</td>
            <td>${record.parking_fee.toFixed(2)}円</td>
            <td>${record.highway_fee.toFixed(2)}円</td>
            <td>
                <button class="delete-btn danger-btn" data-index="${globalIndex}">删除</button>
            </td>
        `;

        tbody.appendChild(row);
    });

    // 添加删除按钮事件
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            deleteRecord(index);
        });
    });

    updateStatistics(paginatedRecords);
}

// 删除记录
async function deleteRecord(recordId) {
    if (!confirm('确定要删除这条记录吗？')) return;

    const success = await deleteAttendanceRecord(recordId);
    if (success) {
        alert('记录删除成功');
        await loadRecords();
    } else {
        alert('删除记录失败，请稍后重试');
    }
}

// 更新统计信息
function updateStatistics(records) {
    const totalPeople = records.reduce((sum, record) => sum + record.people_count, 0);
    const totalParking = records.reduce((sum, record) => sum + record.parking_fee, 0);
    const totalHighway = records.reduce((sum, record) => sum + record.highway_fee, 0);
    const totalFee = totalParking + totalHighway;

    document.getElementById('totalPeople').textContent = totalPeople;
    document.getElementById('totalParking').textContent = totalParking.toFixed(2) + '円';
    document.getElementById('totalHighway').textContent = totalHighway.toFixed(2) + '円';
    document.getElementById('totalFee').textContent = totalFee.toFixed(2) + '円';
}

// 更新分页信息
function updatePagination(totalRecords) {
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    pageInfo.textContent = `第${currentPage}页，共${totalPages}页`;
    
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
}

// 上一页
function goToPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        loadRecords();
    }
}

// 下一页
function goToNextPage() {
    const userData = getUserData();
    const totalPages = Math.ceil(userData.records.length / recordsPerPage);
    
    if (currentPage < totalPages) {
        currentPage++;
        loadRecords();
    }
}

// 导出为CSV
function exportToCSV() {
    const userData = getUserData();
    const records = userData.records;
    
    if (records.length === 0) {
        showAlert('没有记录可导出', 'error');
        return;
    }
    
    // CSV标题行
    let csv = '日期,姓名,人数,现场名称,停车费,高速费\n';
    
    // 添加数据行
    records.forEach(record => {
    csv += `${formatDate(record.date)},${record.name},${record.people_count},${record.site_name},${record.parking_fee},${record.highway_fee}\n`;
    });
    
    // 创建下载链接
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `考勤记录_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showAlert('导出成功', 'success');
}



// 格式化日期显示
function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}