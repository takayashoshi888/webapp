// PDF导出工具函数

// 简化的中文字符转换函数
function convertChineseToAscii(text) {
    // 创建一个映射表，将常用中文字符转换为拼音或英文
    const chineseMap = {
        '每日考勤记录': 'Daily Attendance Records',
        '导出时间': 'Export Time',
        '用户': 'User',
        '统计摘要': 'Summary',
        '总人数': 'Total People',
        '总停车费': 'Total Parking Fee',
        '总高速费': 'Total Highway Fee', 
        '总费用': 'Total Cost',
        '日期': 'Date',
        '姓名': 'Name',
        '人数': 'People',
        '现场名称': 'Site Name',
        '停车费': 'Parking Fee',
        '高速费': 'Highway Fee',
        '円': 'JPY'
    };
    
    // 替换已知的中文字符
    let result = text;
    for (const [chinese, english] of Object.entries(chineseMap)) {
        result = result.replace(new RegExp(chinese, 'g'), english);
    }
    
    return result;
}

// 增强的PDF导出函数
function createPDFWithChineseSupport(records, currentUser) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // 使用默认字体
    doc.setFont('helvetica');
    
    // 标题
    doc.setFontSize(18);
    doc.text('Daily Attendance Records', 105, 20, { align: 'center' });
    
    // 基本信息
    doc.setFontSize(10);
    const exportTime = new Date().toLocaleDateString();
    doc.text(`Export Date: ${exportTime}`, 20, 35);
    doc.text(`User: ${currentUser.username}`, 20, 45);
    
    // 计算统计数据
    const totalPeople = records.reduce((sum, record) => sum + record.people_count, 0);
    const totalParking = records.reduce((sum, record) => sum + record.parking_fee, 0);
    const totalHighway = records.reduce((sum, record) => sum + record.highway_fee, 0);
    const totalFee = totalParking + totalHighway;
    
    // 统计摘要
    doc.setFontSize(12);
    doc.text('Summary:', 20, 60);
    doc.setFontSize(10);
    doc.text(`Total People: ${totalPeople}`, 30, 70);
    doc.text(`Total Parking Fee: ${totalParking.toFixed(2)} JPY`, 30, 80);
    doc.text(`Total Highway Fee: ${totalHighway.toFixed(2)} JPY`, 30, 90);
    doc.text(`Total Cost: ${totalFee.toFixed(2)} JPY`, 30, 100);
    
    // 准备表格数据 - 处理中文字符
    const tableData = records.map(record => [
        record.date,
        record.name, // 保留中文姓名
        record.people_count.toString(),
        record.site_name, // 保留中文现场名称
        `${record.parking_fee.toFixed(2)} JPY`,
        `${record.highway_fee.toFixed(2)} JPY`
    ]);
    
    // 创建表格
    doc.autoTable({
        head: [['Date', 'Name', 'People', 'Site Name', 'Parking Fee', 'Highway Fee']],
        body: tableData,
        startY: 110,
        styles: {
            fontSize: 8,
            cellPadding: 3,
            font: 'helvetica'
        },
        headStyles: {
            fillColor: [52, 152, 219],
            textColor: 255,
            fontSize: 9,
            font: 'helvetica'
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        },
        margin: { left: 20, right: 20 },
        // 处理表格中的中文字符显示问题
        didParseCell: function(data) {
            // 对于包含中文字符的单元格，保持原样显示
            if (data.cell.text && Array.isArray(data.cell.text)) {
                data.cell.text = data.cell.text.map(text => text.toString());
            }
        }
    });
    
    return doc;
}