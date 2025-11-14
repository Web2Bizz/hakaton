/**
 * Утилиты для работы с хранилищем данных
 * Использует IndexedDB для больших файлов и localStorage для метаданных
 */

const DB_NAME = 'questMediaDB'
const DB_VERSION = 1
const STORE_NAME = 'media'

interface MediaData {
	id: string
	data: string
	type: 'image' | 'video'
}

/**
 * Инициализация IndexedDB
 */
function initDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION)

		request.onerror = () => reject(request.error)
		request.onsuccess = () => resolve(request.result)

		request.onupgradeneeded = event => {
			const db = (event.target as IDBOpenDBRequest).result
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME, { keyPath: 'id' })
			}
		}
	})
}

/**
 * Сохраняет медиафайл в IndexedDB
 */
export async function saveMediaToIndexedDB(
	id: string,
	data: string,
	type: 'image' | 'video'
): Promise<void> {
	try {
		const db = await initDB()
		const transaction = db.transaction([STORE_NAME], 'readwrite')
		const store = transaction.objectStore(STORE_NAME)

		await new Promise<void>((resolve, reject) => {
			const request = store.put({ id, data, type })
			request.onsuccess = () => resolve()
			request.onerror = () => reject(request.error)
		})
	} catch (error) {
		if (import.meta.env.DEV) {
			console.error('Error saving media to IndexedDB:', error)
		}
		throw error
	}
}

/**
 * Получает медиафайл из IndexedDB
 */
export async function getMediaFromIndexedDB(id: string): Promise<string | null> {
	try {
		const db = await initDB()
		const transaction = db.transaction([STORE_NAME], 'readonly')
		const store = transaction.objectStore(STORE_NAME)

		return new Promise((resolve, reject) => {
			const request = store.get(id)
			request.onsuccess = () => {
				const result = request.result as MediaData | undefined
				resolve(result?.data || null)
			}
			request.onerror = () => reject(request.error)
		})
	} catch (error) {
		if (import.meta.env.DEV) {
			console.error('Error getting media from IndexedDB:', error)
		}
		return null
	}
}

/**
 * Удаляет медиафайл из IndexedDB
 */
export async function deleteMediaFromIndexedDB(id: string): Promise<void> {
	try {
		const db = await initDB()
		const transaction = db.transaction([STORE_NAME], 'readwrite')
		const store = transaction.objectStore(STORE_NAME)

		await new Promise<void>((resolve, reject) => {
			const request = store.delete(id)
			request.onsuccess = () => resolve()
			request.onerror = () => reject(request.error)
		})
	} catch (error) {
		if (import.meta.env.DEV) {
			console.error('Error deleting media from IndexedDB:', error)
		}
	}
}

/**
 * Сжимает изображение
 */
export function compressImage(
	file: File,
	maxWidth: number = 1920,
	maxHeight: number = 1080,
	quality: number = 0.8
): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = e => {
			const img = new Image()
			img.onload = () => {
				const canvas = document.createElement('canvas')
				let width = img.width
				let height = img.height

				// Вычисляем новые размеры
				if (width > height) {
					if (width > maxWidth) {
						height = (height * maxWidth) / width
						width = maxWidth
					}
				} else {
					if (height > maxHeight) {
						width = (width * maxHeight) / height
						height = maxHeight
					}
				}

				canvas.width = width
				canvas.height = height

				const ctx = canvas.getContext('2d')
				if (!ctx) {
					reject(new Error('Не удалось создать контекст canvas'))
					return
				}

				ctx.drawImage(img, 0, 0, width, height)

				// Конвертируем в base64 с качеством
				const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
				resolve(compressedDataUrl)
			}
			img.onerror = () => reject(new Error('Ошибка загрузки изображения'))
			img.src = e.target?.result as string
		}
		reader.onerror = () => reject(new Error('Ошибка чтения файла'))
		reader.readAsDataURL(file)
	})
}

/**
 * Проверяет размер данных перед сохранением в localStorage
 */
export function checkLocalStorageSize(data: string): boolean {
	try {
		// localStorage обычно имеет лимит ~5-10 МБ
		// Проверяем, что данные не превышают ~4 МБ для безопасности
		const sizeInBytes = new Blob([data]).size
		const sizeInMB = sizeInBytes / (1024 * 1024)
		return sizeInMB < 4
	} catch {
		return false
	}
}

/**
 * Генерирует ID для медиафайла
 */
export function generateMediaId(questId: string, index: number, type: 'image' | 'video'): string {
	return `${questId}-${type}-${index}-${Date.now()}`
}

