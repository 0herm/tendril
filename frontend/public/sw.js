self.addEventListener('install', function (event) {
    self.skipWaiting()
})

self.addEventListener('activate', function (event) {
    event.waitUntil(clients.claim())
})

self.addEventListener('push', function (event) {
    if (event.data) {
        const data = event.data.json()
        const options = {
            body: data.body,
            icon: data.icon || '/images/logo/logo_192.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: '2',
                url: data.url,
            },
        }
        event.waitUntil(self.registration.showNotification(data.title, options))
    }
})

self.addEventListener('notificationclick', function (event) {
    event.notification.close()
    const pushUrl = event.notification.data.url
    if (pushUrl) {
        event.waitUntil(clients.openWindow(pushUrl))
    }
})