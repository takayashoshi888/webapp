// 缓存名称
const CACHE_NAME = "work-record-app-v1"

// 需要缓存的资源
const urlsToCache = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/sw-register.js",
  "/manifest.json",
  "/images/icon-192x192.png",
  "/images/icon-512x512.png",
]

// 安装服务工作线程
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("缓存已打开")
      return cache.addAll(urlsToCache)
    }),
  )
})

// 激活服务工作线程
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("删除旧缓存:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      ),
    ),
  )
})

// 拦截网络请求
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 如果找到缓存的响应，则返回缓存
      if (response) {
        return response
      }

      // 否则发起网络请求
      return fetch(event.request).then((response) => {
        // 检查是否收到有效响应
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response
        }

        // 克隆响应
        var responseToCache = response.clone()

        // 将响应添加到缓存
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
    }),
  )
})

// 处理推送通知
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json()

    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon || "/images/icon-192x192.png",
        badge: "/images/icon-192x192.png",
        vibrate: [100, 50, 100],
        data: data.data || {},
      }),
    )
  }
})

// 处理通知点击
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "open" || !event.action) {
    event.waitUntil(
      clients
        .matchAll({
          type: "window",
        })
        .then((clientList) => {
          // 如果已经有打开的窗口，则聚焦到该窗口
          for (var i = 0; i < clientList.length; i++) {
            var client = clientList[i]
            if (client.url === "/" && "focus" in client) {
              return client.focus()
            }
          }

          // 如果没有打开的窗口，则打开新窗口
          if (clients.openWindow) {
            return clients.openWindow("/")
          }
        }),
    )
  }
})
