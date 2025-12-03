import { categoryService } from '@/store/entities/category/model/category-service'
import { configureStore } from '@reduxjs/toolkit'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Мокируем baseQueryWithReauth
const mockBaseQuery = vi.fn()
vi.mock('@/store/baseQueryWithReauth', () => ({
	baseQueryWithReauth: (...args: unknown[]) => mockBaseQuery(...args),
}))

describe('category-service', () => {
	const store = configureStore({
		reducer: {
			[categoryService.reducerPath]: categoryService.reducer,
		},
		middleware: getDefaultMiddleware =>
			getDefaultMiddleware().concat(categoryService.middleware),
	})

	beforeEach(() => {
		vi.clearAllMocks()
		// Сбрасываем кэш RTK Query между тестами
		store.dispatch(categoryService.util.resetApiState())
	})

	describe('getCategories query', () => {
		it('должен отправлять GET запрос на /v1/categories', async () => {
			const mockCategories = [
				{ id: 1, name: 'Environment', slug: 'environment' },
				{ id: 2, name: 'Animals', slug: 'animals' },
			]

			mockBaseQuery.mockResolvedValue({ data: mockCategories })

			const result = await store.dispatch(
				categoryService.endpoints.getCategories.initiate(undefined)
			)

			expect(mockBaseQuery).toHaveBeenCalled()
			// query возвращает строку, а не объект
			expect(mockBaseQuery.mock.calls[0][0]).toBe('/v1/categories')

			expect(result.data).toEqual(mockCategories)
			expect(result.error).toBeUndefined()
		})

		it('должен обрабатывать ответ в формате массива', async () => {
			const mockCategories = [
				{ id: 1, name: 'Environment', slug: 'environment' },
			]

			mockBaseQuery.mockResolvedValue({ data: mockCategories })

			const result = await store.dispatch(
				categoryService.endpoints.getCategories.initiate(undefined)
			)

			expect(result.data).toEqual(mockCategories)
		})

		it('должен обрабатывать ответ в формате { categories: [...] }', async () => {
			const mockCategories = [
				{ id: 1, name: 'Environment', slug: 'environment' },
			]

			mockBaseQuery.mockResolvedValue({
				data: { categories: mockCategories },
			})

			const result = await store.dispatch(
				categoryService.endpoints.getCategories.initiate(undefined)
			)

			expect(result.data).toEqual(mockCategories)
		})

		it('должен возвращать пустой массив если categories отсутствует', async () => {
			mockBaseQuery.mockResolvedValue({ data: { categories: null } })

			const result = await store.dispatch(
				categoryService.endpoints.getCategories.initiate(undefined)
			)

			expect(result.data).toEqual([])
		})

		it('должен возвращать пустой массив для неизвестного формата ответа', async () => {
			mockBaseQuery.mockResolvedValue({ data: {} })

			const result = await store.dispatch(
				categoryService.endpoints.getCategories.initiate(undefined)
			)

			expect(result.data).toEqual([])
		})

		it('должен обрабатывать ошибку', async () => {
			const mockError = {
				status: 500,
				data: { message: 'Internal server error' },
			}

			mockBaseQuery.mockResolvedValue({ error: mockError })

			const result = await store.dispatch(
				categoryService.endpoints.getCategories.initiate(undefined)
			)

			expect(result.error).toBeDefined()
			expect(result.error).toEqual(mockError)
		})
	})
})
