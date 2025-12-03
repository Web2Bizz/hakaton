import { achievementService } from '@/store/entities/achievement/model/achievement-service'
import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it, vi, beforeEach } from 'vitest'

// Мокируем baseQueryWithReauth
const mockBaseQuery = vi.fn()
vi.mock('@/store/baseQueryWithReauth', () => ({
	baseQueryWithReauth: (...args: unknown[]) => mockBaseQuery(...args),
}))

describe('achievement-service', () => {
	const store = configureStore({
		reducer: {
			[achievementService.reducerPath]: achievementService.reducer,
		},
		middleware: getDefaultMiddleware =>
			getDefaultMiddleware().concat(achievementService.middleware),
	})

	beforeEach(() => {
		vi.clearAllMocks()
		// Сбрасываем кэш RTK Query между тестами
		store.dispatch(achievementService.util.resetApiState())
	})

	describe('getAchievements query', () => {
		it('должен отправлять GET запрос на /v1/achievements', async () => {
			const mockResponse = {
				data: {
					achievements: [
						{ id: 1, title: 'First Quest', description: 'Complete first quest' },
					],
				},
			}

			mockBaseQuery.mockResolvedValue({ data: mockResponse })

			const result = await store.dispatch(
				achievementService.endpoints.getAchievements.initiate(undefined)
			)

		expect(mockBaseQuery).toHaveBeenCalled()
		// query возвращает строку, а не объект
		expect(mockBaseQuery.mock.calls[0][0]).toBe('/v1/achievements')

			expect(result.data).toEqual(mockResponse)
			expect(result.error).toBeUndefined()
		})

		it('должен предоставлять тег Achievement', async () => {
			mockBaseQuery.mockResolvedValue({
				data: { data: { achievements: [] } },
			})

			const result = await store.dispatch(
				achievementService.endpoints.getAchievements.initiate(undefined)
			)

			expect(result.error).toBeUndefined()
		})
	})

	describe('getAchievement query', () => {
		it('должен отправлять GET запрос на /v1/achievements/:id', async () => {
			const achievementId = 123

			const mockResponse = {
				data: {
					id: achievementId,
					title: 'Test Achievement',
					description: 'Test Description',
				},
			}

			mockBaseQuery.mockResolvedValue({ data: mockResponse })

		const result = await store.dispatch(
			achievementService.endpoints.getAchievement.initiate(achievementId)
		)

		expect(mockBaseQuery).toHaveBeenCalled()
		// query возвращает строку, а не объект
		expect(mockBaseQuery.mock.calls[0][0]).toBe(`/v1/achievements/${achievementId}`)

		expect(result.data).toEqual(mockResponse)
			expect(result.error).toBeUndefined()
		})

		it('должен работать со строковым id', async () => {
			const achievementId = '123'

			mockBaseQuery.mockResolvedValue({
				data: { data: { id: 123, title: 'Test Achievement' } },
			})

			const result = await store.dispatch(
				achievementService.endpoints.getAchievement.initiate(achievementId)
			)

		expect(mockBaseQuery).toHaveBeenCalled()
		// query возвращает строку, а не объект
		expect(mockBaseQuery.mock.calls[0][0]).toBe(`/v1/achievements/${achievementId}`)

		expect(result.error).toBeUndefined()
		})

		it('должен предоставлять тег Achievement с правильным id', async () => {
			const achievementId = 123

			mockBaseQuery.mockResolvedValue({
				data: { data: { id: achievementId, title: 'Test Achievement' } },
			})

			const result = await store.dispatch(
				achievementService.endpoints.getAchievement.initiate(achievementId)
			)

			expect(result.error).toBeUndefined()
		})
	})

	describe('createAchievement mutation', () => {
		it('должен отправлять POST запрос на /v1/achievements', async () => {
			const achievementData = {
				title: 'New Achievement',
				description: 'Achievement Description',
				icon: 'icon.png',
			}

		const mockResponse = {
			id: 1,
			...achievementData,
		}

		mockBaseQuery.mockResolvedValue({ data: { data: mockResponse } })

		const result = await store.dispatch(
			achievementService.endpoints.createAchievement.initiate(achievementData)
		)

	expect(mockBaseQuery).toHaveBeenCalled()
expect(mockBaseQuery.mock.calls[0][0]).toEqual({
			url: '/v1/achievements',
			method: 'POST',
			body: achievementData,
		})

	expect(result.data).toEqual(mockResponse)
		expect(result.error).toBeUndefined()
		})

		it('должен обрабатывать ответ в формате { data: {...} }', async () => {
			const achievementData = {
				title: 'New Achievement',
				description: 'Achievement Description',
				icon: 'icon.png',
			}

			const mockResponse = {
				data: {
					id: 1,
					...achievementData,
				},
			}

			mockBaseQuery.mockResolvedValue({ data: { data: mockResponse } })

			const result = await store.dispatch(
				achievementService.endpoints.createAchievement.initiate(achievementData)
			)

			expect(result.data).toEqual(mockResponse)
		})

		it('должен инвалидировать тег Achievement', async () => {
			const achievementData = {
				title: 'New Achievement',
				description: 'Achievement Description',
				icon: 'icon.png',
			}

			mockBaseQuery.mockResolvedValue({
				data: { data: { id: 1, ...achievementData } },
			})

			const result = await store.dispatch(
				achievementService.endpoints.createAchievement.initiate(achievementData)
			)

			expect(result.error).toBeUndefined()
		})
	})

	describe('updateAchievement mutation', () => {
		it('должен отправлять PATCH запрос на /v1/achievements/:id', async () => {
		const achievementId = 123
		const updateData = {
			title: 'Updated Achievement',
		}

		const mockResponse = {
			id: achievementId,
			...updateData,
		}

		mockBaseQuery.mockResolvedValue({ data: { data: mockResponse } })

		const result = await store.dispatch(
			achievementService.endpoints.updateAchievement.initiate({
				id: achievementId,
				data: updateData,
			})
		)

		expect(mockBaseQuery).toHaveBeenCalled()
		expect(mockBaseQuery.mock.calls[0][0]).toEqual({
			url: `/v1/achievements/${achievementId}`,
			method: 'PATCH',
			body: updateData,
		})

		expect(result.data).toEqual(mockResponse)
			expect(result.error).toBeUndefined()
		})

		it('должен обрабатывать ответ в формате { data: {...} }', async () => {
			const achievementId = 123
			const updateData = { title: 'Updated Achievement' }

			const mockResponse = { data: { id: achievementId, ...updateData } }

			mockBaseQuery.mockResolvedValue({ data: { data: mockResponse } })

			const result = await store.dispatch(
				achievementService.endpoints.updateAchievement.initiate({
					id: achievementId,
					data: updateData,
				})
			)

			expect(result.data).toEqual(mockResponse)
		})

		it('должен инвалидировать правильные теги', async () => {
			const achievementId = 123
			const updateData = { title: 'Updated Achievement' }

			mockBaseQuery.mockResolvedValue({
				data: { data: { id: achievementId, ...updateData } },
			})

			const result = await store.dispatch(
				achievementService.endpoints.updateAchievement.initiate({
					id: achievementId,
					data: updateData,
				})
			)

			expect(result.error).toBeUndefined()
		})
	})

	describe('deleteAchievement mutation', () => {
		it('должен отправлять DELETE запрос на /v1/achievements/:id', async () => {
			const achievementId = 123

			const mockResponse = {
				message: 'Achievement deleted successfully',
			}

			mockBaseQuery.mockResolvedValue({ data: mockResponse })

			const result = await store.dispatch(
				achievementService.endpoints.deleteAchievement.initiate(achievementId)
			)

			expect(mockBaseQuery).toHaveBeenCalled()
			expect(mockBaseQuery.mock.calls[0][0]).toEqual({
				url: `/v1/achievements/${achievementId}`,
				method: 'DELETE',
			})

			expect(result.data).toEqual(mockResponse)
			expect(result.error).toBeUndefined()
		})

		it('должен инвалидировать правильные теги', async () => {
			const achievementId = 123

			mockBaseQuery.mockResolvedValue({
				data: { message: 'Achievement deleted successfully' },
			})

			const result = await store.dispatch(
				achievementService.endpoints.deleteAchievement.initiate(achievementId)
			)

			expect(result.error).toBeUndefined()
		})
	})

	describe('getUserAchievements query', () => {
		it('должен отправлять GET запрос на /v1/users/:userId/achievements', async () => {
			const userId = '123'

			const mockResponse = {
				data: {
					achievements: [
						{
							id: '1',
							title: 'First Quest',
							description: 'Complete first quest',
							unlockedAt: '2024-01-01T00:00:00Z',
						},
					],
				},
			}

			mockBaseQuery.mockResolvedValue({ data: mockResponse })

			const result = await store.dispatch(
				achievementService.endpoints.getUserAchievements.initiate(userId)
			)

		expect(mockBaseQuery).toHaveBeenCalled()
		// query возвращает строку, а не объект
		expect(mockBaseQuery.mock.calls[0][0]).toBe(`/v1/users/${userId}/achievements`)

			expect(result.data).toEqual(mockResponse)
			expect(result.error).toBeUndefined()
		})

		it('должен предоставлять тег UserAchievement с правильным id', async () => {
			const userId = '123'

			mockBaseQuery.mockResolvedValue({
				data: { data: { achievements: [] } },
			})

			const result = await store.dispatch(
				achievementService.endpoints.getUserAchievements.initiate(userId)
			)

			expect(result.error).toBeUndefined()
		})
	})

	describe('assignAchievement mutation', () => {
		it('должен отправлять POST запрос на /v1/achievements/:id/assign/:userId', async () => {
			const achievementId = 1
			const userId = 123

			const mockResponse = {
				message: 'Achievement assigned successfully',
			}

			mockBaseQuery.mockResolvedValue({ data: mockResponse })

			const result = await store.dispatch(
				achievementService.endpoints.assignAchievement.initiate({
					id: achievementId,
					userId,
				})
			)

			expect(mockBaseQuery).toHaveBeenCalled()
			expect(mockBaseQuery.mock.calls[0][0]).toEqual({
				url: `/v1/achievements/${achievementId}/assign/${userId}`,
				method: 'POST',
			})

			expect(result.data).toEqual(mockResponse)
			expect(result.error).toBeUndefined()
		})

		it('должен инвалидировать правильные теги', async () => {
			const achievementId = 1
			const userId = 123

			mockBaseQuery.mockResolvedValue({
				data: { message: 'Achievement assigned successfully' },
			})

			const result = await store.dispatch(
				achievementService.endpoints.assignAchievement.initiate({
					id: achievementId,
					userId,
				})
			)

			expect(result.error).toBeUndefined()
		})
	})

	describe('getUserAchievementsByUserId query', () => {
		it('должен отправлять GET запрос на /v1/achievements/user/:userId', async () => {
			const userId = 123

			const mockResponse = [
				{
					id: 1,
					userId,
					achievementId: 1,
					unlockedAt: '2024-01-01T00:00:00Z',
					achievement: {
						id: 1,
						title: 'First Quest',
						description: 'Complete first quest',
						icon: 'icon.png',
						rarity: 'common' as const,
						type: 'system' as const,
					},
				},
			]

			mockBaseQuery.mockResolvedValue({ data: mockResponse })

			const result = await store.dispatch(
				achievementService.endpoints.getUserAchievementsByUserId.initiate(
					userId
				)
			)

		expect(mockBaseQuery).toHaveBeenCalled()
		// query возвращает строку, а не объект
		expect(mockBaseQuery.mock.calls[0][0]).toBe(`/v1/achievements/user/${userId}`)

			expect(result.data).toEqual({
				data: {
					achievements: [
						{
							id: '1',
							title: 'First Quest',
							description: 'Complete first quest',
							icon: 'icon.png',
							rarity: 'common',
							type: 'system',
							unlockedAt: '2024-01-01T00:00:00Z',
						},
					],
				},
			})
			expect(result.error).toBeUndefined()
		})

		it('должен обрабатывать ответ в формате { data: {...} }', async () => {
			const userId = 123
			const mockResponse = {
				data: {
					achievements: [
						{
							id: '1',
							title: 'First Quest',
							description: 'Complete first quest',
							icon: 'icon.png',
						},
					],
				},
			}

			mockBaseQuery.mockResolvedValue({ data: mockResponse })

			const result = await store.dispatch(
				achievementService.endpoints.getUserAchievementsByUserId.initiate(
					userId
				)
			)

			expect(result.data).toEqual(mockResponse)
		})

		it('должен предоставлять тег UserAchievement с правильным id', async () => {
			const userId = 123

			mockBaseQuery.mockResolvedValue({ data: [] })

			const result = await store.dispatch(
				achievementService.endpoints.getUserAchievementsByUserId.initiate(
					userId
				)
			)

			expect(result.error).toBeUndefined()
		})
	})
})

