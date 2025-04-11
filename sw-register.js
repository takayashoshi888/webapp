// 注册服务工作线程
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("ServiceWorker 注册成功: ", registration.scope)

        // 设置每日提醒
        setupDailyReminder()
      })
      .catch((error) => {
        console.log("ServiceWorker 注册失败: ", error)
      })
  })
}

// 设置每日提醒
function setupDailyReminder() {
  // 检查是否启用提醒
  const enableReminder = localStorage.getItem("enableReminder") !== "false"
  if (!enableReminder) return

  // 获取提醒时间
  const reminderTime = localStorage.getItem("reminderTime") || "08:00"
  const [hours, minutes] = reminderTime.split(":").map(Number)

  // 计算下一次提醒时间
  const now = new Date()
  const reminderDate = new Date()
  reminderDate.setHours(hours, minutes, 0, 0)

  // 如果今天的提醒时间已过，设置为明天
  if (reminderDate <= now) {
    reminderDate.setDate(reminderDate.getDate() + 1)
  }

  // 计算延迟时间（毫秒）
  const delay = reminderDate.getTime() - now.getTime()

  // 设置定时器
  setTimeout(() => {
    // 发送提醒
    if (Notification.permission === "granted") {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification("工作记录提醒", {
          body: "请记得记录今天的工作信息",
          icon: "/images/icon-192x192.png",
          vibrate: [100, 50, 100],
          data: {
            dateOfArrival: Date.now(),
            primaryKey: 1,
          },
          actions: [
            {
              action: "open",
              title: "打开应用",
            },
          ],
        })
      })
    }

    // 设置下一天的提醒
    setupDailyReminder()
  }, delay)
}
