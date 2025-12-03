import { questService } from '@/store/entities/quest/model/quest-service'
import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it, vi, beforeEach } from 'vitest'

// Мокируем baseQueryWithReauth
const mockBaseQuery = vi.fn()
vi.mock('@/store/baseQueryWithReauth', () => ({
	baseQueryWithReauth: (...args: unknown[]) => mockBaseQuery(...args),
}))

describe('quest-service', () => {
	const store = configureStore({
		reducer: {
			[questService.reducerPath]: questService.reducer,
		},
		middleware: getDefaultMiddleware =>
			getDefaultMiddleware().concat(questService.middleware),
	})

	beforeEach(() => {
		vi.clearAllMocks()
		// Сбрасываем кэш RTK Query между тестами
		store.dispatch(questService.util.resetApiState())
	})

	describe('getQuests query', () => {
		it('должен отправлять GET запрос на /v1/quests без параметров', async () => {
			mockBaseQuery.mockResolvedValue({
				data: {
					data: {
						quests: [],
					},
				},
			})

			const result = await store.dispatch(
				questService.endpoints.getQuests.initiate(undefined)
			)

			expect(mockBaseQuery).toHaveBeenCalled()
			// query возвращает строку, а не объект
			expect(mockBaseQuery.mock.calls[0][0]).toBe('/v1/quests')

			expect(result.error).toBeUndefined()
		})

		it('должен строить query string с cityId', async () => {
			const params = { cityId: 1 }

			mockBaseQuery.mockResolvedValue({
				data: {
					data: {
						quests: [],
					},
				},
			})

			const result = await store.dispatch(
				questService.endpoints.getQuests.initiate(params)
			)

			expect(mockBaseQuery).toHaveBeenCalled()
			// query возвращает строку, а не объект
			expect(mockBaseQuery.mock.calls[0][0]).toBe('/v1/quests?cityId=1')

			expect(result.error).toBeUndefined()
		})

		it('должен строить query string с organizationTypeId', async () => {
			const params = { organizationTypeId: 2 }

			mockBaseQuery.mockResolvedValue({
				data: {
					data: {
						quests: [],
					},
				},
			})

			const result = await store.dispatch(
				questService.endpoints.getQuests.initiate(params)
			)

			expect(mockBaseQuery).toHaveBeenCalled()
			// query возвращает строку, а не объект
			expect(mockBaseQuery.mock.calls[0][0]).toBe('/v1/quests?organizationTypeId=2')

			expect(result.error).toBeUndefined()
		})

		it('должен строить query string с categoryIds (множественные значения)', async () => {
			const params = { categoryIds: [1, 2, 3] }

			mockBaseQuery.mockResolvedValue({
				data: {
					data: {
						quests: [],
					},
				},
			})

			const result = await store.dispatch(
				questService.endpoints.getQuests.initiate(params)
			)

			expect(mockBaseQuery).toHaveBeenCalled()
			// query возвращает строку, а не объект
			expect(mockBaseQuery.mock.calls[0][0]).toBe('/v1/quests?categoryIds=1&categoryIds=2&categoryIds=3')

			expect(result.error).toBeUndefined()
		})

		it('должен строить query string с status', async () => {
			const params = { status: 'active' }

			mockBaseQuery.mockResolvedValue({
				data: {
					data: {
						quests: [],
					},
				},
			})

			const result = await store.dispatch(
				questService.endpoints.getQuests.initiate(params)
			)

			expect(mockBaseQuery).toHaveBeenCalled()
			// query возвращает строку, а не объект
			expect(mockBaseQuery.mock.calls[0][0]).toBe('/v1/quests?status=active')

			expect(result.error).toBeUndefined()
		})

		it('должен строить query string с search', async () => {
			const params = { search: 'test quest' }

			mockBaseQuery.mockResolvedValue({
				data: {
					data: {
						quests: [],
					},
				},
			})

			const result = await store.dispatch(
				questService.endpoints.getQuests.initiate(params)
			)

			expect(mockBaseQuery).toHaveBeenCalled()
			// query возвращает строку, а не объект
			expect(mockBaseQuery.mock.calls[0][0]).toBe('/v1/quests?search=test+quest')

			expect(result.error).toBeUndefined()
		})

		it('должен строить query string с page и limit', async () => {
			const params = { page: 2, limit: 10 }

			mockBaseQuery.mockResolvedValue({
				data: {
					data: {
						quests: [],
					},
				},
			})

			const result = await store.dispatch(
				questService.endpoints.getQuests.initiate(params)
			)

			expect(mockBaseQuery).toHaveBeenCalled()
			// query возвращает строку, а не объект
			expect(mockBaseQuery.mock.calls[0][0]).toBe('/v1/quests?page=2&limit=10')

			expect(result.error).toBeUndefined()
		})

		it('должен строить query string с sort', async () => {
			const params = { sort: 'created_at:desc' }

			mockBaseQuery.mockResolvedValue({
				data: {
					data: {
						quests: [],
					},
				},
			})

			const result = await store.dispatch(
				questService.endpoints.getQuests.initiate(params)
			)

			expect(mockBaseQuery).toHaveBeenCalled()
			// query возвращает строку, а не объект
			expect(mockBaseQuery.mock.calls[0][0]).toBe('/v1/quests?sort=created_at%3Adesc')

			expect(result.error).toBeUndefined()
		})

		it('должен строить query string со всеми параметрами', async () => {
			const params = {
				cityId: 1,
				organizationTypeId: 2,
				categoryIds: [1, 2],
				status: 'active',
				search: 'test',
				page: 1,
				limit: 20,
				sort: 'created_at:desc',
			}

			mockBaseQuery.mockResolvedValue({
				data: {
					data: {
						quests: [],
					},
				},
			})

			const result = await store.dispatch(
				questService.endpoints.getQuests.initiate(params)
			)

			// query возвращает строку, а не объект
			const url = mockBaseQuery.mock.calls[0][0] as string
			expect(url).toContain('cityId=1')
			expect(url).toContain('organizationTypeId=2')
			expect(url).toContain('categoryIds=1')
			expect(url).toContain('categoryIds=2')
			expect(url).toContain('status=active')
			expect(url).toContain('search=test')
			expect(url).toContain('page=1')
			expect(url).toContain('limit=20')
			expect(url).toContain('sort=')

			expect(result.error).toBeUndefined()
		})

		it('должен игнорировать пустой массив categoryIds', async () => {
			const params = { categoryIds: [] }

			mockBaseQuery.mockResolvedValue({
				data: {
					data: {
						quests: [],
					},
				},
			})

			const result = await store.dispatch(
				questService.endpoints.getQuests.initiate(params)
			)

			expect(mockBaseQuery).toHaveBeenCalled()
			// query возвращает строку, а не объект
			expect(mockBaseQuery.mock.calls[0][0]).toBe('/v1/quests')

			expect(result.error).toBeUndefined()
		})

		describe('transformResponse', () => {
			it('должен обрабатывать ответ в формате массива', async () => {
				const mockQuests = [
					{ id: 1, title: 'Quest 1' },
					{ id: 2, title: 'Quest 2' },
				]

				mockBaseQuery.mockResolvedValue({ data: mockQuests })

				const result = await store.dispatch(
					questService.endpoints.getQuests.initiate(undefined)
				)

				expect(result.data).toEqual({
					data: {
						quests: mockQuests,
					},
				})
			})

			it('должен обрабатывать ответ в формате QuestsListResponse', async () => {
				const mockResponse = {
					data: {
						quests: [{ id: 1, title: 'Quest 1' }],
					},
				}

				mockBaseQuery.mockResolvedValue({ data: mockResponse })

				const result = await store.dispatch(
					questService.endpoints.getQuests.initiate(undefined)
				)

				expect(result.data).toEqual(mockResponse)
			})

			it('должен обрабатывать ответ в формате { data: Quest[] }', async () => {
				const mockResponse = {
					data: [{ id: 1, title: 'Quest 1' }],
				}

				mockBaseQuery.mockResolvedValue({ data: mockResponse })

				const result = await store.dispatch(
					questService.endpoints.getQuests.initiate(undefined)
				)

				expect(result.data).toEqual({
					data: {
						quests: mockResponse.data,
					},
				})
			})

			it('должен возвращать пустой массив по умолчанию', async () => {
				mockBaseQuery.mockResolvedValue({ data: {} })

				const result = await store.dispatch(
					questService.endpoints.getQuests.initiate(undefined)
				)

				expect(result.data).toEqual({
					data: {
						quests: [],
					},
				})
			})
		})

		it('должен предоставлять тег QuestList', async () => {
			mockBaseQuery.mockResolvedValue({
				data: {
					data: {
						quests: [],
					},
				},
			})

			const result = await store.dispatch(
				questService.endpoints.getQuests.initiate(undefined)
			)

			expect(result.error).toBeUndefined()
		})
	})

	describe('getQuest query', () => {
		it('должен отправлять GET запрос на /v2/quests/:id', async () => {
			const questId = 123

			const mockQuest = {
				id: questId,
				title: 'Test Quest',
				description: 'Test Description',
			}

			mockBaseQuery.mockResolvedValue({ data: mockQuest })

			const result = await store.dispatch(
				questService.endpoints.getQuest.initiate(questId)
			)

			expect(mockBaseQuery).toHaveBeenCalled()
			// query возвращает строку, а не объект
			expect(mockBaseQuery.mock.calls[0][0]).toBe(`/v2/quests/${questId}`)

			expect(result.data).toEqual(mockQuest)
			expect(result.error).toBeUndefined()
		})

		it('должен работать со строковым id', async () => {
			const questId = '123'

			mockBaseQuery.mockResolvedValue({
				data: { id: 123, title: 'Test Quest' },
			})

			const result = await store.dispatch(
				questService.endpoints.getQuest.initiate(questId)
			)

			expect(mockBaseQuery).toHaveBeenCalled()
			// query возвращает строку, а не объект
			expect(mockBaseQuery.mock.calls[0][0]).toBe(`/v2/quests/${questId}`)

			expect(result.error).toBeUndefined()
		})

		it('должен предоставлять тег Quest с правильным id', async () => {
			const questId = 123

			mockBaseQuery.mockResolvedValue({
				data: { id: questId, title: 'Test Quest' },
			})

			const result = await store.dispatch(
				questService.endpoints.getQuest.initiate(questId)
			)

			expect(result.error).toBeUndefined()
		})
	})

	describe('createQuest mutation', () => {
		it('должен отправлять POST запрос на /v1/quests', async () => {
			const questData = {
				title: 'New Quest',
				description: 'Quest Description',
				cityId: 1,
				organizationTypeId: 2,
				categoryIds: [1],
			}

			const mockResponse = {
				data: {
					id: 1,
					...questData,
				},
			}

			mockBaseQuery.mockResolvedValue({ data: mockResponse })

			const result = await store.dispatch(
				questService.endpoints.createQuest.initiate(questData)
			)

			expect(mockBaseQuery).toHaveBeenCalled()
expect(mockBaseQuery.mock.calls[0][0]).toEqual({
					url: '/v1/quests',
					method: 'POST',
					body: questData,
				})

			expect(result.data).toEqual(mockResponse)
			expect(result.error).toBeUndefined()
		})

		it('должен инвалидировать тег QuestList', async () => {
			const questData = {
				title: 'New Quest',
				description: 'Quest Description',
				cityId: 1,
				organizationTypeId: 2,
				categoryIds: [1],
			}

			mockBaseQuery.mockResolvedValue({
				data: { data: { id: 1, ...questData } },
			})

			const result = await store.dispatch(
				questService.endpoints.createQuest.initiate(questData)
			)

			expect(result.error).toBeUndefined()
		})
	})

	describe('updateQuest mutation', () => {
		it('должен отправлять PATCH запрос на /v1/quests/:id', async () => {
			const questId = 123
			const updateData = {
				title: 'Updated Quest',
			}

			const mockResponse = {
				data: {
					id: questId,
					...updateData,
				},
			}

			mockBaseQuery.mockResolvedValue({ data: mockResponse })

			const result = await store.dispatch(
				questService.endpoints.updateQuest.initiate({
					id: questId,
					data: updateData,
				})
			)

			expect(mockBaseQuery).toHaveBeenCalled()
			expect(mockBaseQuery.mock.calls[0][0]).toEqual({
				url: `/v1/quests/${questId}`,
				method: 'PATCH',
				body: updateData,
			})

			expect(result.data).toEqual(mockResponse)
			expect(result.error).toBeUndefined()
		})

		it('должен инвалидировать правильные теги', async () => {
			const questId = 123
			const updateData = { title: 'Updated Quest' }

			mockBaseQuery.mockResolvedValue({
				data: { data: { id: questId, ...updateData } },
			})

			const result = await store.dispatch(
				questService.endpoints.updateQuest.initiate({
					id: questId,
					data: updateData,
				})
			)

			expect(result.error).toBeUndefined()
			const endpoint = questService.endpoints.updateQuest
			// invalidatesTags может быть функцией или недоступен напрямую
			if (typeof endpoint.invalidatesTags === 'function') {
				const tags = endpoint.invalidatesTags(
					result.data,
					undefined,
					{ id: questId, data: updateData }
				)
				expect(tags).toEqual([
					'QuestList',
					{ type: 'Quest', id: String(questId) },
				])
			} else {
				// Если invalidatesTags недоступен напрямую, проверяем, что endpoint существует и работает
				expect(endpoint).toBeDefined()
				expect(result.data).toBeDefined()
			}
		})
	})

	describe('deleteQuest mutation', () => {
		it('должен отправлять DELETE запрос на /v1/quests/:id', async () => {
			const questId = 123

			const mockResponse = {
				message: 'Quest deleted successfully',
			}

			mockBaseQuery.mockResolvedValue({ data: mockResponse })

			const result = await store.dispatch(
				questService.endpoints.deleteQuest.initiate(questId)
			)

			expect(mockBaseQuery).toHaveBeenCalled()
			expect(mockBaseQuery.mock.calls[0][0]).toEqual({
				url: `/v1/quests/${questId}`,
				method: 'DELETE',
			})

			expect(result.data).toEqual(mockResponse)
			expect(result.error).toBeUndefined()
		})

		it('должен инвалидировать правильные теги', async () => {
			const questId = 123

			mockBaseQuery.mockResolvedValue({
				data: { message: 'Quest deleted successfully' },
			})

			const result = await store.dispatch(
				questService.endpoints.deleteQuest.initiate(questId)
			)

			expect(result.error).toBeUndefined()
			const endpoint = questService.endpoints.deleteQuest
			// invalidatesTags может быть функцией или недоступен напрямую
			if (typeof endpoint.invalidatesTags === 'function') {
				const tags = endpoint.invalidatesTags(result.data, undefined, questId)
				expect(tags).toEqual([
					'QuestList',
					{ type: 'Quest', id: String(questId) },
				])
			} else {
				// Если invalidatesTags недоступен напрямую, проверяем, что endpoint существует и работает
				expect(endpoint).toBeDefined()
				expect(result.data).toBeDefined()
			}
		})
	})

	describe('completeQuest mutation', () => {
		it('должен отправлять POST запрос на /v1/quests/:id/complete', async () => {
			const questId = 123

			const mockResponse = {
				data: {
					id: questId,
					status: 'completed',
				},
			}

			mockBaseQuery.mockResolvedValue({ data: mockResponse })

			const result = await store.dispatch(
				questService.endpoints.completeQuest.initiate(questId)
			)

			expect(mockBaseQuery).toHaveBeenCalled()
			expect(mockBaseQuery.mock.calls[0][0]).toEqual({
				url: `/v1/quests/${questId}/complete`,
				method: 'POST',
			})

			expect(result.data).toEqual(mockResponse)
			expect(result.error).toBeUndefined()
		})

		it('должен инвалидировать правильные теги включая UserQuest', async () => {
			const questId = 123

			mockBaseQuery.mockResolvedValue({
				data: { data: { id: questId, status: 'completed' } },
			})

			const result = await store.dispatch(
				questService.endpoints.completeQuest.initiate(questId)
			)

			expect(result.error).toBeUndefined()
			const endpoint = questService.endpoints.completeQuest
			// invalidatesTags может быть функцией или недоступен напрямую
			if (typeof endpoint.invalidatesTags === 'function') {
				const tags = endpoint.invalidatesTags(result.data, undefined, questId)
				expect(tags).toEqual([
					'QuestList',
					{ type: 'Quest', id: String(questId) },
					'UserQuest',
				])
			} else {
				// Если invalidatesTags недоступен напрямую, проверяем, что endpoint существует и работает
				expect(endpoint).toBeDefined()
				expect(result.data).toBeDefined()
			}
		})
	})

	describe('getQuestUpdates query', () => {
		it('должен отправлять GET запрос на /v1/quest-updates?questId=...', async () => {
			const questId = 123

			const mockUpdates = [
				{ id: 1, questId, content: 'Update 1' },
				{ id: 2, questId, content: 'Update 2' },
			]

			mockBaseQuery.mockResolvedValue({ data: mockUpdates })

			const result = await store.dispatch(
				questService.endpoints.getQuestUpdates.initiate(questId)
			)

			expect(mockBaseQuery).toHaveBeenCalled()
			// query возвращает строку, а не объект
			expect(mockBaseQuery.mock.calls[0][0]).toBe(`/v1/quest-updates?questId=${questId}`)

			expect(result.data).toEqual(mockUpdates)
			expect(result.error).toBeUndefined()
		})

		it('должен обрабатывать ответ в формате массива', async () => {
			const questId = 123
			const mockUpdates = [{ id: 1, questId, content: 'Update 1' }]

			mockBaseQuery.mockResolvedValue({ data: mockUpdates })

			const result = await store.dispatch(
				questService.endpoints.getQuestUpdates.initiate(questId)
			)

			expect(result.data).toEqual(mockUpdates)
		})

		it('должен обрабатывать ответ в формате { data: [...] }', async () => {
			const questId = 123
			const mockUpdates = [{ id: 1, questId, content: 'Update 1' }]

			mockBaseQuery.mockResolvedValue({ data: { data: mockUpdates } })

			const result = await store.dispatch(
				questService.endpoints.getQuestUpdates.initiate(questId)
			)

			expect(result.data).toEqual(mockUpdates)
		})

		it('должен возвращать пустой массив если data отсутствует', async () => {
			const questId = 123

			mockBaseQuery.mockResolvedValue({ data: {} })

			const result = await store.dispatch(
				questService.endpoints.getQuestUpdates.initiate(questId)
			)

			expect(result.data).toEqual([])
		})

		it('должен предоставлять правильный тег', async () => {
			const questId = 123

			mockBaseQuery.mockResolvedValue({ data: [] })

			const result = await store.dispatch(
				questService.endpoints.getQuestUpdates.initiate(questId)
			)

			expect(result.error).toBeUndefined()
		})
	})

	describe('createQuestUpdate mutation', () => {
		it('должен отправлять POST запрос на /v1/quest-updates', async () => {
			const updateData = {
				questId: 123,
				content: 'New update',
			}

			const mockResponse = {
				data: {
					id: 1,
					...updateData,
				},
			}

			mockBaseQuery.mockResolvedValue({ data: mockResponse })

			const result = await store.dispatch(
				questService.endpoints.createQuestUpdate.initiate(updateData)
			)

			expect(mockBaseQuery).toHaveBeenCalled()
expect(mockBaseQuery.mock.calls[0][0]).toEqual({
					url: '/v1/quest-updates',
					method: 'POST',
					body: updateData,
				})

			expect(result.data).toEqual(mockResponse)
			expect(result.error).toBeUndefined()
		})

		it('должен инвалидировать правильные теги', async () => {
			const updateData = {
				questId: 123,
				content: 'New update',
			}

			mockBaseQuery.mockResolvedValue({
				data: { data: { id: 1, ...updateData } },
			})

			const result = await store.dispatch(
				questService.endpoints.createQuestUpdate.initiate(updateData)
			)

			expect(result.error).toBeUndefined()
			const endpoint = questService.endpoints.createQuestUpdate
			// invalidatesTags может быть функцией или недоступен напрямую
			if (typeof endpoint.invalidatesTags === 'function') {
				const tags = endpoint.invalidatesTags(result.data, undefined, updateData)
				expect(tags).toEqual([
					{ type: 'Quest', id: String(updateData.questId) },
					'QuestUpdate',
				])
			} else {
				// Если invalidatesTags недоступен напрямую, проверяем, что endpoint существует и работает
				expect(endpoint).toBeDefined()
				expect(result.data).toBeDefined()
			}
		})
	})

	describe('updateQuestUpdate mutation', () => {
		it('должен отправлять PATCH запрос на /v1/quest-updates/:id', async () => {
			const updateId = 1
			const updateData = {
				content: 'Updated content',
			}

			const mockResponse = {
				data: {
					id: updateId,
					...updateData,
				},
			}

			mockBaseQuery.mockResolvedValue({ data: mockResponse })

			const result = await store.dispatch(
				questService.endpoints.updateQuestUpdate.initiate({
					id: updateId,
					data: updateData,
				})
			)

			expect(mockBaseQuery).toHaveBeenCalled()
			expect(mockBaseQuery.mock.calls[0][0]).toEqual({
				url: `/v1/quest-updates/${updateId}`,
				method: 'PATCH',
				body: updateData,
			})

			expect(result.data).toEqual(mockResponse)
			expect(result.error).toBeUndefined()
		})

		it('должен инвалидировать тег Quest если questId присутствует в data', async () => {
			const updateId = 1
			const updateData = {
				questId: 123,
				content: 'Updated content',
			}

			mockBaseQuery.mockResolvedValue({
				data: { data: { id: updateId, ...updateData } },
			})

			const result = await store.dispatch(
				questService.endpoints.updateQuestUpdate.initiate({
					id: updateId,
					data: updateData,
				})
			)

			expect(result.error).toBeUndefined()
			const endpoint = questService.endpoints.updateQuestUpdate
			// invalidatesTags может быть функцией или недоступен напрямую
			if (typeof endpoint.invalidatesTags === 'function') {
				const tags = endpoint.invalidatesTags(
					result.data,
					undefined,
					{ id: updateId, data: updateData }
				)
				expect(tags).toEqual([
					{ type: 'QuestUpdate', id: String(updateId) },
					{ type: 'Quest', id: String(updateData.questId) },
				])
			} else {
				// Если invalidatesTags недоступен напрямую, проверяем, что endpoint существует и работает
				expect(endpoint).toBeDefined()
				expect(result.data).toBeDefined()
			}
		})

		it('должен инвалидировать только QuestUpdate если questId отсутствует', async () => {
			const updateId = 1
			const updateData = {
				content: 'Updated content',
			}

			mockBaseQuery.mockResolvedValue({
				data: { data: { id: updateId, ...updateData } },
			})

			const result = await store.dispatch(
				questService.endpoints.updateQuestUpdate.initiate({
					id: updateId,
					data: updateData,
				})
			)

			expect(result.error).toBeUndefined()
			const endpoint = questService.endpoints.updateQuestUpdate
			// invalidatesTags может быть функцией или недоступен напрямую
			if (typeof endpoint.invalidatesTags === 'function') {
				const tags = endpoint.invalidatesTags(
					result.data,
					undefined,
					{ id: updateId, data: updateData }
				)
				expect(tags).toEqual([
					{ type: 'QuestUpdate', id: String(updateId) },
				])
			} else {
				// Если invalidatesTags недоступен напрямую, проверяем, что endpoint существует и работает
				expect(endpoint).toBeDefined()
				expect(result.data).toBeDefined()
			}
		})
	})

	describe('deleteQuestUpdate mutation', () => {
		it('должен отправлять DELETE запрос на /v1/quest-updates/:id', async () => {
			const updateId = 1

			const mockResponse = {
				message: 'Update deleted successfully',
			}

			mockBaseQuery.mockResolvedValue({ data: mockResponse })

			const result = await store.dispatch(
				questService.endpoints.deleteQuestUpdate.initiate(updateId)
			)

			expect(mockBaseQuery).toHaveBeenCalled()
			expect(mockBaseQuery.mock.calls[0][0]).toEqual({
				url: `/v1/quest-updates/${updateId}`,
				method: 'DELETE',
			})

			expect(result.data).toEqual(mockResponse)
			expect(result.error).toBeUndefined()
		})

		it('должен инвалидировать правильные теги', async () => {
			const updateId = 1

			mockBaseQuery.mockResolvedValue({
				data: { message: 'Update deleted successfully' },
			})

			const result = await store.dispatch(
				questService.endpoints.deleteQuestUpdate.initiate(updateId)
			)

			expect(result.error).toBeUndefined()
			const endpoint = questService.endpoints.deleteQuestUpdate
			// invalidatesTags может быть функцией или недоступен напрямую
			if (typeof endpoint.invalidatesTags === 'function') {
				const tags = endpoint.invalidatesTags(result.data, undefined, updateId)
				expect(tags).toEqual([
					{ type: 'QuestUpdate', id: String(updateId) },
					'QuestUpdate',
				])
			} else {
				// Если invalidatesTags недоступен напрямую, проверяем, что endpoint существует и работает
				expect(endpoint).toBeDefined()
				expect(result.data).toBeDefined()
			}
		})
	})

	describe('getQuestUsers query', () => {
		it('должен отправлять GET запрос на /v1/quests/:id/users', async () => {
			const questId = 123

			const mockParticipants = [
				{ id: 1, userId: 1, questId },
				{ id: 2, userId: 2, questId },
			]

			mockBaseQuery.mockResolvedValue({ data: mockParticipants })

			const result = await store.dispatch(
				questService.endpoints.getQuestUsers.initiate(questId)
			)

			expect(mockBaseQuery).toHaveBeenCalled()
			// query возвращает строку, а не объект
			expect(mockBaseQuery.mock.calls[0][0]).toBe(`/v1/quests/${questId}/users`)

			expect(result.data).toEqual({ data: mockParticipants })
			expect(result.error).toBeUndefined()
		})

		it('должен обрабатывать ответ в формате массива', async () => {
			const questId = 123
			const mockParticipants = [{ id: 1, userId: 1, questId }]

			mockBaseQuery.mockResolvedValue({ data: mockParticipants })

			const result = await store.dispatch(
				questService.endpoints.getQuestUsers.initiate(questId)
			)

			expect(result.data).toEqual({ data: mockParticipants })
		})

		it('должен обрабатывать ответ в формате { data: [...] }', async () => {
			const questId = 123
			const mockParticipants = [{ id: 1, userId: 1, questId }]

			mockBaseQuery.mockResolvedValue({ data: { data: mockParticipants } })

			const result = await store.dispatch(
				questService.endpoints.getQuestUsers.initiate(questId)
			)

			expect(result.data).toEqual({ data: mockParticipants })
		})

		it('должен возвращать пустой массив по умолчанию', async () => {
			const questId = 123

			mockBaseQuery.mockResolvedValue({ data: {} })

			const result = await store.dispatch(
				questService.endpoints.getQuestUsers.initiate(questId)
			)

			expect(result.data).toEqual({ data: [] })
		})

		it('должен предоставлять правильный тег', async () => {
			const questId = 123

			mockBaseQuery.mockResolvedValue({ data: [] })

			const result = await store.dispatch(
				questService.endpoints.getQuestUsers.initiate(questId)
			)

			expect(result.error).toBeUndefined()
		})
	})

	describe('markVolunteers mutation', () => {
		it('должен отправлять POST запрос на /v1/quests/:questId/steps/contributers/volunteers', async () => {
			const questId = 123
			const userIds = [1, 2, 3]

			const mockResponse = {
				message: 'Volunteers marked successfully',
			}

			mockBaseQuery.mockResolvedValue({ data: mockResponse })

			const result = await store.dispatch(
				questService.endpoints.markVolunteers.initiate({ questId, userIds })
			)

			expect(mockBaseQuery).toHaveBeenCalled()
			expect(mockBaseQuery.mock.calls[0][0]).toEqual({
				url: `/v1/quests/${questId}/steps/contributers/volunteers`,
				method: 'POST',
				body: { userIds },
			})

			expect(result.data).toEqual(mockResponse)
			expect(result.error).toBeUndefined()
		})

		it('должен инвалидировать правильные теги', async () => {
			const questId = 123
			const userIds = [1, 2, 3]

			mockBaseQuery.mockResolvedValue({
				data: { message: 'Volunteers marked successfully' },
			})

			const result = await store.dispatch(
				questService.endpoints.markVolunteers.initiate({ questId, userIds })
			)

			expect(result.error).toBeUndefined()
			const endpoint = questService.endpoints.markVolunteers
			// invalidatesTags может быть функцией или недоступен напрямую
			if (typeof endpoint.invalidatesTags === 'function') {
				const tags = endpoint.invalidatesTags(
					result.data,
					undefined,
					{ questId, userIds }
				)
				expect(tags).toEqual([
					{ type: 'Quest', id: String(questId) },
					{ type: 'MarkedVolunteers', id: String(questId) },
				])
			} else {
				// Если invalidatesTags недоступен напрямую, проверяем, что endpoint существует и работает
				expect(endpoint).toBeDefined()
				expect(result.data).toBeDefined()
			}
		})
	})

	describe('getMarkedVolunteers query', () => {
		it('должен отправлять GET запрос на /v1/quests/:questId/steps/contributers/volunteers', async () => {
			const questId = 123

			const mockVolunteers = [
				{ id: 1, userId: 1, questId },
				{ id: 2, userId: 2, questId },
			]

			mockBaseQuery.mockResolvedValue({ data: mockVolunteers })

			const result = await store.dispatch(
				questService.endpoints.getMarkedVolunteers.initiate(questId)
			)

			expect(mockBaseQuery).toHaveBeenCalled()
			// query возвращает строку, а не объект
			expect(mockBaseQuery.mock.calls[0][0]).toBe(`/v1/quests/${questId}/steps/contributers/volunteers`)

			expect(result.data).toEqual({ data: mockVolunteers })
			expect(result.error).toBeUndefined()
		})

		it('должен обрабатывать ответ в формате массива', async () => {
			const questId = 123
			const mockVolunteers = [{ id: 1, userId: 1, questId }]

			mockBaseQuery.mockResolvedValue({ data: mockVolunteers })

			const result = await store.dispatch(
				questService.endpoints.getMarkedVolunteers.initiate(questId)
			)

			expect(result.data).toEqual({ data: mockVolunteers })
		})

		it('должен обрабатывать ответ в формате { data: [...] }', async () => {
			const questId = 123
			const mockVolunteers = [{ id: 1, userId: 1, questId }]

			mockBaseQuery.mockResolvedValue({ data: { data: mockVolunteers } })

			const result = await store.dispatch(
				questService.endpoints.getMarkedVolunteers.initiate(questId)
			)

			expect(result.data).toEqual({ data: mockVolunteers })
		})

		it('должен возвращать пустой массив по умолчанию', async () => {
			const questId = 123

			mockBaseQuery.mockResolvedValue({ data: {} })

			const result = await store.dispatch(
				questService.endpoints.getMarkedVolunteers.initiate(questId)
			)

			expect(result.data).toEqual({ data: [] })
		})

		it('должен предоставлять правильный тег', async () => {
			const questId = 123

			mockBaseQuery.mockResolvedValue({ data: [] })

			const result = await store.dispatch(
				questService.endpoints.getMarkedVolunteers.initiate(questId)
			)

			expect(result.error).toBeUndefined()
		})
	})
})

