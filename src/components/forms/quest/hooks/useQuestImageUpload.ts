import { useUploadImagesMutation } from '@/store/entities/upload'
import { getErrorMessage } from '@/utils/error'
import { logger } from '@/utils/logger'
import { toast } from 'sonner'
import type { QuestFormData } from '../schemas/quest-form.schema'

interface ImageUploadResult {
	storyImageUrl: string | undefined
	galleryUrls: string[]
}

/**
 * Хук для загрузки изображений квеста
 * Обрабатывает base64 изображения и загружает их на сервер
 */
export function useQuestImageUpload() {
	const [uploadImagesMutation, { isLoading: isUploadingImages }] =
		useUploadImagesMutation()

	const uploadImages = async (
		data: QuestFormData
	): Promise<ImageUploadResult> => {
		let storyImageUrl: string | undefined = data.storyImage
		let galleryUrls: string[] = []
		const newImages: string[] = []

		// Обрабатываем storyImage
		if (data.storyImage) {
			if (
				data.storyImage.startsWith('http://') ||
				data.storyImage.startsWith('https://')
			) {
				storyImageUrl = data.storyImage
			} else if (data.storyImage.startsWith('data:')) {
				newImages.push(data.storyImage)
			}
		}

		// Обрабатываем gallery
		if (data.gallery && data.gallery.length > 0) {
			for (let i = 0; i < data.gallery.length; i++) {
				const image = data.gallery[i]

				if (typeof image !== 'string') {
					logger.warn(`Image ${i + 1} is not a string:`, typeof image)
					continue
				}

				if (image.startsWith('http://') || image.startsWith('https://')) {
					galleryUrls.push(image)
				} else if (image.startsWith('data:')) {
					newImages.push(image)
				}
			}
		}

		// Загружаем новые изображения
		if (newImages.length > 0) {
			try {
				const formData = new FormData()

				for (let i = 0; i < newImages.length; i++) {
					const base64String = newImages[i]

					const matches = base64String.match(
						/^data:([A-Za-z-+/]+);base64,(.+)$/
					)
					if (!matches || matches.length !== 3) {
						logger.error(`Invalid base64 format for image ${i + 1}`)
						throw new Error(`Неверный формат base64 изображения ${i + 1}`)
					}

					const mimeType = matches[1]
					const base64Data = matches[2]

					const byteCharacters = atob(base64Data)
					const byteNumbers = new Array(byteCharacters.length)
					for (let j = 0; j < byteCharacters.length; j++) {
						byteNumbers[j] = byteCharacters.charCodeAt(j)
					}
					const byteArray = new Uint8Array(byteNumbers)
					const blob = new Blob([byteArray], { type: mimeType })

					const extension = mimeType.split('/')[1] || 'jpg'
					const fileName = `image-${i + 1}.${extension}`

					formData.append('images', blob, fileName)
				}

				const uploadResult = await uploadImagesMutation(formData).unwrap()

				const uploadedUrls = uploadResult.map(img => img.url)

				// Первое изображение - это storyImage, остальные - gallery
				if (data.storyImage && data.storyImage.startsWith('data:')) {
					storyImageUrl = uploadedUrls[0]
					galleryUrls = [...galleryUrls, ...uploadedUrls.slice(1)]
				} else {
					galleryUrls = [...galleryUrls, ...uploadedUrls]
				}
			} catch (uploadError) {
				logger.error('Error uploading images:', uploadError)

				const errorMessage = getErrorMessage(
					uploadError,
					'Не удалось загрузить изображения. Попробуйте еще раз.'
				)

				toast.error(errorMessage)
				throw uploadError
			}
		}

		return {
			storyImageUrl,
			galleryUrls,
		}
	}

	return {
		uploadImages,
		isUploadingImages,
	}
}

