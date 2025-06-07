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
    document.getElementById('clearForm').addEventListener('click', clearForm);
    
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
    
    // 备份数据
    document.getElementById('backupBtn').addEventListener('click', showBackupModal);
    
    // 恢复数据
    document.getElementById('restoreBtn').addEventListener('click', showRestoreModal);
    
    // 复制备份
    document.getElementById('copyBackup')?.addEventListener('click', copyBackupData);
    
    // 确认恢复
    document.getElementById('confirmRestore')?.addEventListener('click', confirmRestoreData);
    
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
    return JSON.parse(localStorage.getItem('attendanceData_' + userId));
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

// 获取所有考勤记录
async function getAllAttendanceRecords() {
    const { data, error } = await supabase
        .from('attendance_records')
        .select('*');

    if (error) {
        console.error('获取记录失败:', error);
        return [];
    }

    return data;
}

// 根据条件查询考勤记录
async function queryAttendanceRecords(filters) {
    let query = supabase.from('attendance_records').select('*');

    if (filters.startDate && filters.endDate) {
        query = query.between('date', filters.startDate, filters.endDate);
    }

    if (filters.name) {
        query = query.ilike('name', `%${filters.name}%`);
    }

    if (filters.site) {
        query = query.ilike('site_name', `%${filters.site}%`);
    }

    const { data, error } = await query;

    if (error) {
        console.error('查询记录失败:', error);
        return [];
    }

    return data;
}

// 删除考勤记录
async function deleteAttendanceRecord(id) {
    const { error } = await supabase
        .from('attendance_records')
        .delete()
        .match({ id: id });

    if (error) {
        console.error('删除记录失败:', error);
        return false;
    }

    return true;
}

// 插入新的考勤记录
async function addAttendanceRecord(record) {
    console.log("Attempting to insert record with Supabase:", record);
    const { data, error: supabaseError } = await supabase // Renamed to avoid confusion
        .from('attendance_records')
        .insert([record]);

    if (supabaseError) {
        console.error('Supabase insert operation failed. Raw error object:', supabaseError);
        let message = supabaseError.message || '未知 Supabase 错误';
        let details = supabaseError.details || '';
        let hint = supabaseError.hint || '';
        let fullErrorMessage = `Supabase 错误: ${message}`;
        if (details) fullErrorMessage += ` | 详情: ${details}`;
        if (hint) fullErrorMessage += ` | 提示: ${hint}`;
        
        console.error('Constructed error message to be thrown:', fullErrorMessage);
        throw new Error(fullErrorMessage);
    }

    console.log("Supabase insert operation successful. Data:", data);
    return data;
}

// 保存记录
function saveRecord() {
    const record = {
        date: document.getElementById('recordDate').value,
        name: document.getElementById('name').value.trim(),
        people_count: parseInt(document.getElementById('peopleCount').value),
        site_name: document.getElementById('siteName').value.trim(),
        parking_fee: parseFloat(document.getElementById('parkingFee').value) || 0,
        highway_fee: parseFloat(document.getElementById('highwayFee').value) || 0
        // 移除 created_at 字段 - Supabase 会自动管理时间戳
    };

    // 验证数据
    if (!record.name || !record.site_name || isNaN(record.people_count)) {
        showAlert('请填写完整的姓名、人数和现场名称', 'error');
        return;
    }

    // 调用 Supabase 插入方法
    addAttendanceRecord(record).then(data => {
        if (data) {
            // 获取现有数据
            const userData = getUserData();

            // 添加新记录 - 使用 Supabase 返回的完整记录数据
            userData.records.push(data[0]);

            // 保存数据
            saveUserData(userData);

            // 重新加载记录
            loadRecords();

            // 清空表单
            clearForm();

            showAlert('记录已保存！', 'success');
        }
    }).catch(error => {
        console.error('保存操作遇到错误:', error); // Log the full error object first
        let finalErrorMessage = '保存记录失败，请稍后重试。'; // Default message

        if (error && typeof error.message === 'string' && error.message.trim() !== '') {
            // If error.message is useful (e.g., "Supabase 错误: actual details")
            finalErrorMessage = `保存记录失败: ${error.message.trim()}`;
        } else if (error && typeof error.toString === 'function') {
            // Fallback to error.toString() if message is not good
            const errorString = error.toString();
            if (errorString !== '[object Object]' && errorString.trim() !== '') {
                 finalErrorMessage = `保存记录失败: ${errorString.trim()}`;
            }
        }
        // For debugging, log what message is being sent to showAlert
        console.log('传递给 showAlert 的消息:', finalErrorMessage);
        showAlert(finalErrorMessage + " 请检查浏览器控制台获取详细错误信息。", 'error');
    });
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
}

// 加载记录
function loadRecords() {
    const userData = getUserData();
    displayRecords(userData.records);
    updateStatistics(userData.records); // 确保统计信息基于完整数据更新
    updatePagination(userData.records.length);
}

// 查询记录
function queryRecords() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const filterName = document.getElementById('filterName').value.trim().toLowerCase();
    const filterSite = document.getElementById('filterSite').value.trim().toLowerCase();
    
    const userData = getUserData();
    let records = userData.records;
    
    // 过滤记录
    let filteredRecords = records.filter(record => {
        // 日期过滤
        if (startDate && record.date < startDate) return false;
        if (endDate && record.date > endDate) return false;
        
        // 姓名过滤
        if (filterName && !record.name.toLowerCase().includes(filterName)) return false;
        
        // 现场过滤
        if (filterSite && !record.site_name.toLowerCase().includes(filterSite)) return false;
        
        return true;
    });
    
    displayRecords(filteredRecords);
    updateStatistics(filteredRecords); // 使用过滤后的记录更新统计信息
    updatePagination(filteredRecords.length);
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
function deleteRecord(index) {
    if (!confirm('确定要删除这条记录吗？')) return;

    const userData = getUserData();
    userData.records.splice(index, 1);
    saveUserData(userData);
    loadRecords();

    showAlert('记录已删除', 'success');
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
        csv += `${formatDate(record.date)},${record.name},${record.peopleCount},${record.siteName},${record.parkingFee},${record.highwayFee}\n`;
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

// 显示备份模态框
function showBackupModal() {
    const userData = getUserData();
    document.getElementById('backupModalTitle').textContent = '备份数据';
    document.getElementById('backupData').value = JSON.stringify(userData, null, 2);
    document.getElementById('backupContent').style.display = 'block';
    document.getElementById('restoreContent').style.display = 'none';
    document.getElementById('backupModal').style.display = 'block';
}

// 显示恢复模态框
function showRestoreModal() {
    document.getElementById('backupModalTitle').textContent = '恢复数据';
    document.getElementById('backupContent').style.display = 'none';
    document.getElementById('restoreContent').style.display = 'block';
    document.getElementById('restoreData').value = '';
    document.getElementById('backupModal').style.display = 'block';
}

// 复制备份数据
function copyBackupData() {
    const backupData = document.getElementById('backupData');
    backupData.select();
    document.execCommand('copy');
    showAlert('已复制到剪贴板', 'success');
}

// 确认恢复数据
function confirmRestoreData() {
    const restoreData = document.getElementById('restoreData').value.trim();
    
    if (!restoreData) {
        showAlert('请输入备份数据', 'error');
        return;
    }
    
    try {
        const parsedData = JSON.parse(restoreData);
        
        if (!parsedData.records || !Array.isArray(parsedData.records)) {
            throw new Error('无效的备份数据格式');
        }
        
        if (confirm('确定要恢复数据吗？这将覆盖当前所有数据！')) {
            saveUserData(parsedData);
            loadRecords();
            document.getElementById('backupModal').style.display = 'none';
            showAlert('数据恢复成功', 'success');
        }
    } catch (e) {
        showAlert('备份数据格式错误: ' + e.message, 'error');
    }
}

// 格式化日期显示
function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}