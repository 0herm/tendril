const IMAGE_CACHE = 'tmdb-images-v1'
const IMAGE_CACHE_LIMIT = 200

self.addEventListener('install', function (event) {
    self.skipWaiting()
})

self.addEventListener('activate', function (event) {
    event.waitUntil(Promise.all([
        clients.claim(),
        caches.keys().then(function (keys) {
            return Promise.all(
                keys
                    .filter(function (key) { return key.startsWith('tmdb-images-') && key !== IMAGE_CACHE })
                    .map(function (key) { return caches.delete(key) })
            )
        }),
    ]))
})

self.addEventListener('fetch', function (event) {
    const url = new URL(event.request.url)
    if (url.origin !== self.location.origin || url.pathname !== '/_next/image') return
    const target = url.searchParams.get('url')
    if (!target || !target.startsWith('https://image.tmdb.org/')) return

    event.respondWith(
        caches.open(IMAGE_CACHE).then(function (cache) {
            return cache.match(event.request).then(function (cached) {
                if (cached) return cached
                return fetch(event.request).then(function (response) {
                    if (response.ok) {
                        cache.put(event.request, response.clone()).then(function () { trimCache(cache) })
                    }
                    return response
                })
            })
        })
    )
})

function trimCache(cache) {
    cache.keys().then(function (keys) {
        if (keys.length <= IMAGE_CACHE_LIMIT) return
        cache.delete(keys[0]).then(function () { trimCache(cache) })
    })
}

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