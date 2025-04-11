// 初始化应用
document.addEventListener("DOMContentLoaded", () => {
  // 初始化导航
  initNavigation()

  // 初始化表单
  initForm()

  // 加载数据
  loadData()

  // 初始化统计
  updateStatistics()

  // 初始化月份选择器
  initMonthSelector()

  // 初始化设置
  initSettings()

  // 设置今天的日期为默认值
  document.getElementById("date").valueAsDate = new Date()
})

// 导航功能
function initNavigation() {
  const navLinks = document.querySelectorAll(".nav-link")
  const pages = document.querySelectorAll(".page")

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()

      // 移除所有活动类
      navLinks.forEach((l) => l.classList.remove("active"))
      pages.forEach((p) => p.classList.remove("active"))

      // 添加活动类到当前链接
      this.classList.add("active")

      // 显示对应页面
      const pageName = this.getAttribute("data-page")
      document.getElementById(`${pageName}-page`).classList.add("active")
    })
  })
}

// 初始化表单
function initForm() {
  const form = document.getElementById("record-form")
  const nameInput = document.getElementById("name")

  // 加载默认姓名
  const defaultName = localStorage.getItem("defaultName")
  if (defaultName) {
    nameInput.value = defaultName
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault()

    // 获取表单数据
    const formData = {
      date: document.getElementById("date").value,
      name: document.getElementById("name").value,
      people: Number.parseInt(document.getElementById("people").value),
      location: document.getElementById("location").value,
      highwayFee: Number.parseFloat(document.getElementById("highway-fee").value) || 0,
      parkingFee: Number.parseFloat(document.getElementById("parking-fee").value) || 0,
      timestamp: new Date().getTime(),
    }

    // 保存记录
    saveRecord(formData)

    // 重置表单
    form.reset()

    // 重新设置默认值
    document.getElementById("date").valueAsDate = new Date()
    if (defaultName) {
      nameInput.value = defaultName
    }

    // 显示提示
    showToast("记录已保存")
  })
}

// 保存记录
function saveRecord(record) {
  // 获取现有记录
  const records = JSON.parse(localStorage.getItem("workRecords")) || []

  // 添加新记录
  records.push(record)

  // 保存回本地存储
  localStorage.setItem("workRecords", JSON.stringify(records))

  // 更新显示
  loadData()
  updateStatistics()
}

// 加载数据
function loadData() {
  const recentRecordsContainer = document.getElementById("recent-records")
  const records = JSON.parse(localStorage.getItem("workRecords")) || []

  // 清空容器
  recentRecordsContainer.innerHTML = ""

  if (records.length === 0) {
    recentRecordsContainer.innerHTML = '<div class="empty-state">暂无记录</div>'
    return
  }

  // 按日期排序（最新的在前面）
  records.sort((a, b) => new Date(b.date) - new Date(a.date))

  // 显示最近10条记录
  const recentRecords = records.slice(0, 10)

  recentRecords.forEach((record) => {
    const recordElement = document.createElement("div")
    recordElement.className = "record-item"

    const totalFees = record.highwayFee + record.parkingFee

    recordElement.innerHTML = `
      <div class="record-header">
        <div class="record-date">${formatDate(record.date)}</div>
        <div class="record-location">${record.location}</div>
      </div>
      <div class="record-details">
        <div class="record-people">${record.name} (${record.people}人)</div>
        <div class="record-fees">费用: ${totalFees.toFixed(2)}元</div>
      </div>
    `

    recentRecordsContainer.appendChild(recordElement)
  })
}

// 更新统计信息
function updateStatistics() {
  const records = JSON.parse(localStorage.getItem("workRecords")) || []

  // 计算总计
  const totalDays = records.length
  let totalPeople = 0
  let totalFees = 0

  records.forEach((record) => {
    totalPeople += record.people
    totalFees += record.highwayFee + record.parkingFee
  })

  // 更新UI
  document.getElementById("total-days").textContent = totalDays
  document.getElementById("total-people").textContent = totalPeople
  document.getElementById("total-fees").textContent = totalFees.toFixed(2) + " 元"

  // 更新月度统计
  updateMonthlyStatistics()
}

// 初始化月份选择器
function initMonthSelector() {
  const monthSelect = document.getElementById("month-select")
  const records = JSON.parse(localStorage.getItem("workRecords")) || []

  // 如果没有记录，添加当前月份
  if (records.length === 0) {
    const now = new Date()
    const monthYear = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`
    const option = document.createElement("option")
    option.value = monthYear
    option.textContent = formatMonthYear(monthYear)
    monthSelect.appendChild(option)
  } else {
    // 获取所有不同的年月
    const months = new Set()

    records.forEach((record) => {
      const dateParts = record.date.split("-")
      const monthYear = `${dateParts[0]}-${dateParts[1]}`
      months.add(monthYear)
    })

    // 按时间排序
    const sortedMonths = Array.from(months).sort((a, b) => b.localeCompare(a))

    // 添加到选择器
    sortedMonths.forEach((month) => {
      const option = document.createElement("option")
      option.value = month
      option.textContent = formatMonthYear(month)
      monthSelect.appendChild(option)
    })
  }

  // 监听变化
  monthSelect.addEventListener("change", updateMonthlyStatistics)

  // 导出按钮
  document.getElementById("export-btn").addEventListener("click", exportData)
}

// 更新月度统计
function updateMonthlyStatistics() {
  const monthSelect = document.getElementById("month-select")
  const selectedMonth = monthSelect.value

  if (!selectedMonth) return

  const records = JSON.parse(localStorage.getItem("workRecords")) || []

  // 筛选选定月份的记录
  const monthlyRecords = records.filter((record) => {
    const dateParts = record.date.split("-")
    const recordMonth = `${dateParts[0]}-${dateParts[1]}`
    return recordMonth === selectedMonth
  })

  // 计算统计数据
  const days = monthlyRecords.length
  let people = 0
  let highwayFees = 0
  let parkingFees = 0

  monthlyRecords.forEach((record) => {
    people += record.people
    highwayFees += record.highwayFee
    parkingFees += record.parkingFee
  })

  const totalFees = highwayFees + parkingFees

  // 更新UI
  document.getElementById("monthly-days").textContent = days
  document.getElementById("monthly-people").textContent = people
  document.getElementById("monthly-highway").textContent = highwayFees.toFixed(2) + " 元"
  document.getElementById("monthly-parking").textContent = parkingFees.toFixed(2) + " 元"
  document.getElementById("monthly-total").textContent = totalFees.toFixed(2) + " 元"
}

// 初始化设置
function initSettings() {
  // 加载提醒设置
  const reminderTime = localStorage.getItem("reminderTime") || "08:00"
  const enableReminder = localStorage.getItem("enableReminder") !== "false"

  document.getElementById("reminder-time").value = reminderTime
  document.getElementById("enable-reminder").checked = enableReminder

  // 加载默认姓名
  const defaultName = localStorage.getItem("defaultName") || ""
  document.getElementById("default-name").value = defaultName

  // 保存设置
  document.getElementById("save-settings").addEventListener("click", () => {
    const newReminderTime = document.getElementById("reminder-time").value
    const newEnableReminder = document.getElementById("enable-reminder").checked

    localStorage.setItem("reminderTime", newReminderTime)
    localStorage.setItem("enableReminder", newEnableReminder)

    // 更新提醒
    setupNotifications()

    showToast("设置已保存")
  })

  // 保存默认值
  document.getElementById("save-defaults").addEventListener("click", () => {
    const defaultName = document.getElementById("default-name").value
    localStorage.setItem("defaultName", defaultName)

    showToast("默认值已保存")
  })

  // 清除数据
  document.getElementById("clear-data").addEventListener("click", () => {
    if (confirm("确定要删除所有记录吗？此操作无法恢复！")) {
      localStorage.removeItem("workRecords")
      loadData()
      updateStatistics()
      initMonthSelector()
      showToast("所有数据已清除")
    }
  })

  // 设置通知
  setupNotifications()
}

// 设置通知
function setupNotifications() {
  const notificationStatus = document.getElementById("notification-status")

  // 检查浏览器支持
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    notificationStatus.style.display = "block"
    notificationStatus.textContent = "您的浏览器不支持通知功能"
    return
  }

  // 请求通知权限
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      notificationStatus.style.display = "block"
      notificationStatus.textContent = "通知权限已授予，提醒功能已启用"
    } else {
      notificationStatus.style.display = "block"
      notificationStatus.textContent = "通知权限被拒绝，请在浏览器设置中启用通知"
    }
  })
}

// 导出数据
function exportData() {
  const monthSelect = document.getElementById("month-select")
  const selectedMonth = monthSelect.value

  if (!selectedMonth) return

  const records = JSON.parse(localStorage.getItem("workRecords")) || []

  // 筛选选定月份的记录
  const monthlyRecords = records.filter((record) => {
    const dateParts = record.date.split("-")
    const recordMonth = `${dateParts[0]}-${dateParts[1]}`
    return recordMonth === selectedMonth
  })

  if (monthlyRecords.length === 0) {
    showToast("没有数据可导出")
    return
  }

  // 创建CSV内容
  let csvContent = "日期,姓名,人数,现场名称,高速费,停车费,总费用\n"

  monthlyRecords.forEach((record) => {
    const totalFee = record.highwayFee + record.parkingFee
    csvContent += `${record.date},${record.name},${record.people},${record.location},${record.highwayFee},${record.parkingFee},${totalFee}\n`
  })

  // 创建下载链接
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", `工作记录_${selectedMonth}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  showToast("数据已导出")
}

// 辅助函数：格式化日期
function formatDate(dateString) {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  return `${year}-${month}-${day}`
}

// 辅助函数：格式化年月
function formatMonthYear(monthYear) {
  const [year, month] = monthYear.split("-")
  return `${year}年${month}月`
}

// 显示提示
function showToast(message) {
  const toast = document.getElementById("toast")
  toast.textContent = message
  toast.style.display = "block"

  setTimeout(() => {
    toast.style.display = "none"
  }, 3000)
}
