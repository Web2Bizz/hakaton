/**
 * Утилиты для работы с изображениями
 */

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
				// Квадратные изображения обрабатываются как горизонтальные
				if (width >= height) {
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

