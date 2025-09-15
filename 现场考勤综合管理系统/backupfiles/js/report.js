// 生成报表
document.getElementById('generateReport').addEventListener('click', function() {
    const selectedMonth = document.getElementById('reportMonth').value;
    if (!selectedMonth) {
        alert('请选择月份');
        return;
    }
    
    generateAttendanceReport(selectedMonth);
});

// 导出报表
document.getElementById('exportReport').addEventListener('click', function() {
    const selectedMonth = document.getElementById('reportMonth').value;
    if (!selectedMonth) {
        alert('请选择月份');
        return;
    }
    
    exportReportToCSV(selectedMonth);
});

// 生成出勤报表
function generateAttendanceReport(month) {
    const records = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
    const reportTable = document.querySelector('#attendanceReport tbody');
    reportTable.innerHTML = '';
    
    // 过滤指定月份的记录
    const filteredRecords = records.filter(record => {
        const recordDate = new Date(record.date);
        const recordMonth = `${recordDate.getFullYear()}-${(recordDate.getMonth() + 1).toString().padStart(2, '0')}`;
        return recordMonth === month;
    });
    
    // 按日期排序
    filteredRecords.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // 显示报表数据
    filteredRecords.forEach(record => {
        const recordDate = new Date(record.date);
        const formattedDate = `${recordDate.getFullYear()}-${(recordDate.getMonth() + 1).toString().padStart(2, '0')}-${recordDate.getDate().toString().padStart(2, '0')}`;
        const totalFee = record.tollFee + record.parkingFee;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.name}</td>
            <td>${record.site}</td>
            <td>${formattedDate}</td>
            <td>¥${record.tollFee.toFixed(2)}</td>
            <td>¥${record.parkingFee.toFixed(2)}</td>
            <td>¥${totalFee.toFixed(2)}</td>
            <td class="action-buttons">
                <button class="delete-btn" onclick="deleteRecord(${record.id})">删除</button>
            </td>
        `;
        reportTable.appendChild(row);
    });
    
    if (filteredRecords.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="7" style="text-align: center;">该月份暂无出勤记录</td>';
        reportTable.appendChild(row);
    }
}

// 删除记录
function deleteRecord(recordId) {
    if (confirm('确定要删除这条记录吗？')) {
        let records = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
        records = records.filter(record => record.id !== recordId);
        localStorage.setItem('attendanceRecords', JSON.stringify(records));
        
        // 重新生成报表
        const selectedMonth = document.getElementById('reportMonth').value;
        if (selectedMonth) {
            generateAttendanceReport(selectedMonth);
        }
    }
}

// 导出报表为CSV
function exportReportToCSV(month) {
    const records = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
    
    // 过滤指定月份的记录
    const filteredRecords = records.filter(record => {
        const recordDate = new Date(record.date);
        const recordMonth = `${recordDate.getFullYear()}-${(recordDate.getMonth() + 1).toString().padStart(2, '0')}`;
        return recordMonth === month;
    });
    
    // 按日期排序
    filteredRecords.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // 构造CSV内容
    let csvContent = '姓名,现场,日期,高速费,停车费,费用总计\n';
    filteredRecords.forEach(record => {
        const recordDate = new Date(record.date);
        const formattedDate = `${recordDate.getFullYear()}-${(recordDate.getMonth() + 1).toString().padStart(2, '0')}-${recordDate.getDate().toString().padStart(2, '0')}`;
        const totalFee = record.tollFee + record.parkingFee;
        csvContent += `${record.name},${record.site},${formattedDate},${record.tollFee.toFixed(2)},${record.parkingFee.toFixed(2)},${totalFee.toFixed(2)}\n`;
    });
    
    if (filteredRecords.length === 0) {
        csvContent += '暂无数据\n';
    }
    
    // 下载CSV文件
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `考勤报表_${month}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 设置默认月份为当前月份
document.addEventListener('DOMContentLoaded', function() {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    document.getElementById('reportMonth').value = currentMonth;
});