/**
 * Минимальный Service Worker для PWA
 * 
 * Этот SW регистрируется только для того, чтобы браузер разрешил установку PWA
 * (современные браузеры требуют наличие SW для установки).
 * 
 * SW НЕ перехватывает запросы - все запросы идут напрямую в сеть.
 * Это гарантирует, что админка и другие части приложения всегда получают
 * актуальные данные без кеширования.
 */
const CACHE_VERSION = 'v20251124.192451' // Автоматически заменяется при сборке

// Установка Service Worker
self.addEventListener('install', event => {
	console.log('[SW] Installing minimal Service Worker...', CACHE_VERSION)
	// Немедленно активируем новый Service Worker
	globalThis.skipWaiting()
	// Пропускаем установку без ожидания
	event.waitUntil(Promise.resolve())
})

// Активация Service Worker
self.addEventListener('activate', event => {
	console.log('[SW] Activating Service Worker...', CACHE_VERSION)

	event.waitUntil(
		// Очищаем все старые кэши (если они есть)
		caches
			.keys()
			.then(cacheNames => {
				return Promise.all(
					cacheNames.map(cacheName => {
						console.log('[SW] Deleting old cache:', cacheName)
						return caches.delete(cacheName)
					})
				)
			})
			.then(() => {
				// Немедленно берем контроль над всеми клиентами
				return globalThis.clients.claim()
			})
	)
})

// Обработка запросов - НЕ ПЕРЕХВАТЫВАЕМ
// Все запросы идут напрямую в сеть, без кеширования
// Это гарантирует, что админка и другие части всегда получают актуальные данные
// self.addEventListener('fetch', ...) - НЕ РЕГИСТРИРУЕМ

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
