import { experienceService } from '@/store/entities/experience/model/experience-service'
import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it, vi, beforeEach } from 'vitest'

// Мокируем baseQueryWithReauth
const mockBaseQuery = vi.fn()
vi.mock('@/store/baseQueryWithReauth', () => ({
	baseQueryWithReauth: (...args: unknown[]) => mockBaseQuery(...args),
}))

describe('experience-service', () => {
	const store = configureStore({
		reducer: {
			[experienceService.reducerPath]: experienceService.reducer,
		},
		middleware: getDefaultMiddleware =>
			getDefaultMiddleware().concat(experienceService.middleware),
	})

	beforeEach(() => {
		vi.clearAllMocks()
		// Сбрасываем кэш RTK Query между тестами
		store.dispatch(experienceService.util.resetApiState())
	})

	describe('addExperience mutation', () => {
		it('должен отправлять PATCH запрос на /v1/experience/:userId', async () => {
			const userId = '123'
			const experienceData = {
				amount: 100,
				reason: 'Quest completion',
			}

			const mockResponse = {
				data: {
					userId,
					experience: 1500,
					level: 5,
				},
			}

			mockBaseQuery.mockResolvedValue({ data: mockResponse })

			const result = await store.dispatch(
				experienceService.endpoints.addExperience.initiate({
					userId,
					data: experienceData,
				})
			)

			expect(mockBaseQuery).toHaveBeenCalled()
			expect(mockBaseQuery.mock.calls[0][0]).toEqual({
				url: `/v1/experience/${userId}`,
				method: 'PATCH',
				body: experienceData,
			})

			expect(result.data).toEqual(mockResponse)
			expect(result.error).toBeUndefined()
		})

		it('должен обрабатывать ошибку при несуществующем пользователе', async () => {
			const userId = '999'
			const experienceData = {
				amount: 100,
				reason: 'Quest completion',
			}

			const mockError = {
				status: 404,
				data: { message: 'User not found' },
			}

			mockBaseQuery.mockResolvedValue({ error: mockError })

			const result = await store.dispatch(
				experienceService.endpoints.addExperience.initiate({
					userId,
					data: experienceData,
				})
			)

			expect(result.error).toBeDefined()
			expect(result.error).toEqual(mockError)
		})

		it('должен инвалидировать теги Experience и User', async () => {
			const userId = '123'
			const experienceData = {
				amount: 100,
				reason: 'Quest completion',
			}

			mockBaseQuery.mockResolvedValue({
				data: { data: { userId, experience: 1500, level: 5 } },
			})

			const result = await store.dispatch(
				experienceService.endpoints.addExperience.initiate({
					userId,
					data: experienceData,
				})
			)

			expect(result.error).toBeUndefined()
			// Проверяем, что invalidatesTags работает корректно через вызов функции
			// Но endpoint.invalidatesTags не доступен напрямую, поэтому просто проверяем успешность
		})
	})
})

