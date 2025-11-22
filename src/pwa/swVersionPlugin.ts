import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Plugin } from 'vite'

/**
 * Плагин для автоматического обновления версии кэша в Service Worker
 * Генерирует новую версию на основе даты и времени сборки
 */
export function swVersionPlugin(): Plugin {
	return {
		name: 'sw-version-plugin',
		buildStart() {
			// Генерируем версию на основе даты и времени сборки
			// Формат: vYYYYMMDD.HHmmss (например: v20240115.143022)
			const now = new Date()
			const year = now.getFullYear()
			const month = String(now.getMonth() + 1).padStart(2, '0')
			const day = String(now.getDate()).padStart(2, '0')
			const hours = String(now.getHours()).padStart(2, '0')
			const minutes = String(now.getMinutes()).padStart(2, '0')
			const seconds = String(now.getSeconds()).padStart(2, '0')

			const version = `v${year}${month}${day}.${hours}${minutes}${seconds}`

			// Получаем путь к корню проекта
			const __filename = fileURLToPath(import.meta.url)
			const __dirname = path.dirname(__filename)
			const swPath = path.resolve(__dirname, '../../public/pwa/sw.js')

			try {
				// Читаем текущий файл
				let swContent = readFileSync(swPath, 'utf-8')

				// Заменяем версию кэша
				swContent = swContent.replace(
					/const CACHE_VERSION = ['"](.*?)['"]/,
					`const CACHE_VERSION = '${version}'`
				)

				// Записываем обратно
				writeFileSync(swPath, swContent, 'utf-8')

				// Logger не доступен в vite plugin контексте, используем console
				// eslint-disable-next-line no-console
				console.log(
					`[SW Version Plugin] ✅ Updated cache version to: ${version}`
				)
			} catch (error) {
				// eslint-disable-next-line no-console
				console.error('[SW Version Plugin] ❌ Failed to update version:', error)
			}
		},
	}
}
