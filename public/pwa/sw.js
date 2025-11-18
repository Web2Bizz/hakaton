const CACHE_NAME = 'atom-dobro-cache-v1.0.0'
const urlsToCache = [
	'/',
	'/pwa/manifest.json',
]

self.addEventListener('install', event => {
	console.log('Service Worker installing...')
	event.waitUntil(
		caches.open(CACHE_NAME).then(cache => {
			console.log('Opened cache')
			return cache.addAll(urlsToCache)
		})
	)
	globalThis.skipWaiting()
})

self.addEventListener('fetch', event => {
	event.respondWith(
		caches.match(event.request).then(response => {
			if (response) {
				return response
			}
			return fetch(event.request)
		})
	)
})

self.addEventListener('activate', event => {
	console.log('Service Worker activating...')
	event.waitUntil(
		caches.keys().then(cacheNames => {
			return Promise.all(
				cacheNames.map(cacheName => {
					if (cacheName !== CACHE_NAME) {
						console.log('Deleting old cache:', cacheName)
						return caches.delete(cacheName)
					}
				})
			)
		})
	)
	globalThis.clients.claim()
})

self.addEventListener('message', event => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		globalThis.skipWaiting()
	}
})
