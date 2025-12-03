import { cityService } from '@/store/entities/city/model/city-service'
import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it, vi, beforeEach } from 'vitest'

// Мокируем baseQueryWithReauth
const mockBaseQuery = vi.fn()
vi.mock('@/store/baseQueryWithReauth', () => ({
	baseQueryWithReauth: (...args: unknown[]) => mockBaseQuery(...args),
}))

describe('city-service', () => {
	const store = configureStore({
		reducer: {
			[cityService.reducerPath]: cityService.reducer,
		},
		middleware: getDefaultMiddleware =>
			getDefaultMiddleware().concat(cityService.middleware),
	})

	beforeEach(() => {
		vi.clearAllMocks()
		// Сбрасываем кэш RTK Query между тестами
		store.dispatch(cityService.util.resetApiState())
	})

	describe('getCities query', () => {
		it('должен отправлять GET запрос на /v1/cities', async () => {
			const mockCities = [
				{ id: 1, name: 'Moscow' },
				{ id: 2, name: 'Saint Petersburg' },
			]

			mockBaseQuery.mockResolvedValue({ data: mockCities })

			const result = await store.dispatch(
				cityService.endpoints.getCities.initiate(undefined)
			)

			expect(mockBaseQuery).toHaveBeenCalled()
			// query возвращает строку, а не объект
			expect(mockBaseQuery.mock.calls[0][0]).toBe('/v1/cities')

			expect(result.data).toEqual(mockCities)
			expect(result.error).toBeUndefined()
		})

		it('должен обрабатывать пустой массив', async () => {
			mockBaseQuery.mockResolvedValue({ data: [] })

			const result = await store.dispatch(
				cityService.endpoints.getCities.initiate(undefined)
			)

			expect(result.data).toEqual([])
			expect(result.error).toBeUndefined()
		})

		it('должен обрабатывать ошибку', async () => {
			const mockError = {
				status: 500,
				data: { message: 'Internal server error' },
			}

			mockBaseQuery.mockResolvedValue({ error: mockError })

			const result = await store.dispatch(
				cityService.endpoints.getCities.initiate(undefined)
			)

			expect(result.error).toBeDefined()
			expect(result.error).toEqual(mockError)
		})
	})
})

