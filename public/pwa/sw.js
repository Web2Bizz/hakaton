/**
 * Версия кэша автоматически обновляется при каждой сборке через Vite плагин.
 * Не нужно обновлять вручную - версия генерируется на основе timestamp сборки.
 */
const CACHE_VERSION = 'v20251124.183925' // Автоматически заменяется при сборке
const CACHE_NAME = `atom-dobro-cache-${CACHE_VERSION}`
const urlsToCache = ['/', '/pwa/manifest.json']

// Стратегия: NetworkFirst - сначала пытаемся загрузить из сети, если не получается - из кэша
// Это обеспечивает актуальность контента при наличии сети
async function networkFirst(request) {
	try {
		const networkResponse = await fetch(request)

		// Если запрос успешен, обновляем кэш
		if (networkResponse && networkResponse.status === 200) {
			const cache = await caches.open(CACHE_NAME)
			cache.put(request, networkResponse.clone())
		}

		return networkResponse
	} catch (error) {
		// Если сеть недоступна, пытаемся получить из кэша
		const cachedResponse = await caches.match(request)
		if (cachedResponse) {
			return cachedResponse
		}

		// Если нет в кэше, возвращаем ошибку
		throw error
	}
}

// Установка Service Worker
self.addEventListener('install', event => {
	console.log('[SW] Installing Service Worker...', CACHE_NAME)

	event.waitUntil(
		caches.open(CACHE_NAME).then(cache => {
			console.log('[SW] Opened cache:', CACHE_NAME)
			// Кэшируем только критичные ресурсы
			return cache.addAll(urlsToCache).catch(error => {
				console.error('[SW] Cache addAll failed:', error)
			})
		})
	)

	// Немедленно активируем новый Service Worker
	globalThis.skipWaiting()
})

// Активация Service Worker
self.addEventListener('activate', event => {
	console.log('[SW] Activating Service Worker...', CACHE_NAME)

	event.waitUntil(
		caches
			.keys()
			.then(cacheNames => {
				return Promise.all(
					cacheNames.map(cacheName => {
						// Удаляем все старые кэши
						if (cacheName !== CACHE_NAME) {
							console.log('[SW] Deleting old cache:', cacheName)
							return caches.delete(cacheName)
						}
					})
				)
			})
			.then(() => {
				// Немедленно берем контроль над всеми клиентами
				return globalThis.clients.claim()
			})
	)
})

// Обработка запросов
self.addEventListener('fetch', event => {
	const { request } = event
	const url = new URL(request.url)

	// Пропускаем запросы к внешним доменам (кроме API)
	if (url.origin !== self.location.origin) {
		// Для API запросов используем только сеть
		if (url.pathname.startsWith('/api/')) {
			return
		}
		// Для других внешних ресурсов - только сеть
		return
	}

	// Пропускаем Swagger UI и все API пути (включая /api#/)
	// Swagger находится по пути /api#/, поэтому исключаем все пути начинающиеся с /api
	if (url.pathname.startsWith('/api')) {
		return // Пропускаем обработку, используем только сеть
	}

	// Для GET запросов используем стратегию NetworkFirst
	if (request.method === 'GET') {
		event.respondWith(networkFirst(request))
	}
})

// Обработка сообщений от клиента
self.addEventListener('message', event => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		console.log('[SW] Received SKIP_WAITING message')
		globalThis.skipWaiting()
	}

	// Запрос на проверку обновлений
	if (event.data && event.data.type === 'CHECK_UPDATE') {
		event.waitUntil(
			self.registration.update().then(() => {
				event.ports[0].postMessage({ updated: true })
			})
		)
	}
})

// Периодическая проверка обновлений отключена
// Проверка обновлений выполняется только по запросу от клиента через PWAContext
// Это предотвращает превышение лимита самообновления Service Worker
