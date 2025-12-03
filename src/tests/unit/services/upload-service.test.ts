import { uploadService } from '@/store/entities/upload/model/upload-service'
import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it, vi, beforeEach } from 'vitest'

// Мокируем baseQueryWithReauth
const mockBaseQuery = vi.fn()
vi.mock('@/store/baseQueryWithReauth', () => ({
	baseQueryWithReauth: (...args: unknown[]) => mockBaseQuery(...args),
}))

describe('upload-service', () => {
	const store = configureStore({
		reducer: {
			[uploadService.reducerPath]: uploadService.reducer,
		},
		middleware: getDefaultMiddleware =>
			getDefaultMiddleware().concat(uploadService.middleware),
	})

	beforeEach(() => {
		vi.clearAllMocks()
		// Сбрасываем кэш RTK Query между тестами
		store.dispatch(uploadService.util.resetApiState())
	})

	describe('uploadImages mutation', () => {
		it('должен отправлять POST запрос на /v1/upload/images с FormData', async () => {
			const formData = new FormData()
			const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
			formData.append('images', file)

			const mockResponse = [
				{
					url: 'https://example.com/image1.jpg',
					key: 'image1.jpg',
				},
			]

			mockBaseQuery.mockResolvedValue({ data: mockResponse })

			const result = await store.dispatch(
				uploadService.endpoints.uploadImages.initiate(formData)
			)

			expect(mockBaseQuery).toHaveBeenCalled()
expect(mockBaseQuery.mock.calls[0][0]).toEqual({
					url: '/v1/upload/images',
					method: 'POST',
					body: formData,
				})

			expect(result.data).toEqual(mockResponse)
			expect(result.error).toBeUndefined()
		})

		it('должен обрабатывать множественные изображения', async () => {
			const formData = new FormData()
			const file1 = new File(['test1'], 'test1.jpg', { type: 'image/jpeg' })
			const file2 = new File(['test2'], 'test2.jpg', { type: 'image/jpeg' })
			formData.append('images', file1)
			formData.append('images', file2)

			const mockResponse = [
				{
					url: 'https://example.com/image1.jpg',
					key: 'image1.jpg',
				},
				{
					url: 'https://example.com/image2.jpg',
					key: 'image2.jpg',
				},
			]

			mockBaseQuery.mockResolvedValue({ data: mockResponse })

			const result = await store.dispatch(
				uploadService.endpoints.uploadImages.initiate(formData)
			)

			expect(result.data).toEqual(mockResponse)
			expect(result.error).toBeUndefined()
		})

		it('должен обрабатывать ошибку при невалидном файле', async () => {
			const formData = new FormData()
			const file = new File(['test'], 'test.txt', { type: 'text/plain' })
			formData.append('images', file)

			const mockError = {
				status: 400,
				data: { message: 'Invalid file type' },
			}

			mockBaseQuery.mockResolvedValue({ error: mockError })

			const result = await store.dispatch(
				uploadService.endpoints.uploadImages.initiate(formData)
			)

			expect(result.error).toBeDefined()
			expect(result.error).toEqual(mockError)
		})

		it('должен обрабатывать ошибку при превышении размера файла', async () => {
			const formData = new FormData()
			// Создаем большой файл (симуляция)
			const largeFile = new File(['x'.repeat(10 * 1024 * 1024)], 'large.jpg', {
				type: 'image/jpeg',
			})
			formData.append('images', largeFile)

			const mockError = {
				status: 413,
				data: { message: 'File too large' },
			}

			mockBaseQuery.mockResolvedValue({ error: mockError })

			const result = await store.dispatch(
				uploadService.endpoints.uploadImages.initiate(formData)
			)

			expect(result.error).toBeDefined()
			expect(result.error).toEqual(mockError)
		})

		it('должен обрабатывать пустой FormData', async () => {
			const formData = new FormData()

			const mockError = {
				status: 400,
				data: { message: 'No files provided' },
			}

			mockBaseQuery.mockResolvedValue({ error: mockError })

			const result = await store.dispatch(
				uploadService.endpoints.uploadImages.initiate(formData)
			)

			expect(result.error).toBeDefined()
			expect(result.error).toEqual(mockError)
		})
	})
})

