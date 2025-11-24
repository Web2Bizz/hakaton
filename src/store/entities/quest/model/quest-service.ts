import { baseQueryWithReauth } from '@/store/baseQueryWithReauth'
import { createApi } from '@reduxjs/toolkit/query/react'
import type {
	CreateQuestRequest,
	CreateQuestResponse,
	CreateQuestUpdateRequest,
	DeleteQuestResponse,
	DeleteQuestUpdateResponse,
	GetQuestsParams,
	JoinQuestResponse,
	LeaveQuestResponse,
	Quest,
	QuestParticipant,
	QuestParticipantsResponse,
	QuestUpdate,
	QuestUpdateResponse,
	QuestsListResponse,
	UpdateQuestRequest,
	UpdateQuestResponse,
	UpdateQuestUpdateRequest,
	UserQuestItem,
} from './type'

export const questService = createApi({
	reducerPath: 'questApi',
	baseQuery: baseQueryWithReauth,
	tagTypes: ['Quest', 'QuestList', 'QuestUpdate', 'UserQuest'],
	endpoints: builder => ({
		// GET /quests - Получить список квестов с фильтрацией
		getQuests: builder.query<QuestsListResponse, GetQuestsParams | void>({
			query: params => {
				if (!params) return '/v1/quests'
				const searchParams = new URLSearchParams()
				if (params.cityId) {
					searchParams.append('cityId', params.cityId.toString())
				}
				if (params.organizationTypeId) {
					searchParams.append(
						'organizationTypeId',
						params.organizationTypeId.toString()
					)
				}
				if (params.categoryIds && params.categoryIds.length > 0) {
					for (const id of params.categoryIds) {
						searchParams.append('categoryIds', id.toString())
					}
				}
				if (params.status) {
					searchParams.append('status', params.status)
				}
				if (params.search) {
					searchParams.append('search', params.search)
				}
				if (params.page) {
					searchParams.append('page', params.page.toString())
				}
				if (params.limit) {
					searchParams.append('limit', params.limit.toString())
				}
				if (params.sort) {
					searchParams.append('sort', params.sort)
				}
				const queryString = searchParams.toString()
				return queryString ? `/v1/quests?${queryString}` : '/v1/quests'
			},
			transformResponse: (
				response: Quest[] | QuestsListResponse
			): QuestsListResponse => {
				// Обрабатываем оба формата ответа: массив или объект с data
				if (Array.isArray(response)) {
					return {
						data: {
							quests: response,
						},
					}
				}
				// Если ответ уже в формате QuestsListResponse
				if (response.data && Array.isArray(response.data.quests)) {
					return response
				}
				// Если ответ в формате { data: Quest[] }
				if (response.data && Array.isArray(response.data)) {
					return {
						data: {
							quests: response.data as Quest[],
						},
					}
				}
				// Возвращаем пустой массив по умолчанию
				return {
					data: {
						quests: [],
					},
				}
			},
			providesTags: ['QuestList'],
		}),

		// GET /v2/quests/:id - Получить детальную информацию о квесте
		getQuest: builder.query<Quest, number | string>({
			query: id => `/v2/quests/${id}`,
			providesTags: (_result, _error, id) => [
				{ type: 'Quest', id: String(id) },
			],
		}),

		// GET /v1/quests/user/:userId - Получить квесты пользователя
		getUserQuests: builder.query<QuestsListResponse, number | string>({
			query: userId => `/v1/quests/user/${userId}`,
			transformResponse: (
				response: UserQuestItem[] | QuestsListResponse
			): QuestsListResponse => {
				// Новый endpoint возвращает массив объектов с полем quest
				// Структура: [{ id, questId, userId, status, quest: {...}, achievement: {...}, city: {...} }, ...]
				if (Array.isArray(response)) {
					// Извлекаем квесты из поля quest каждого элемента
					const quests = response
						.map((item: UserQuestItem) => {
							if (!item.quest) return null

							const quest: Quest = { ...item.quest }
							// Сохраняем статус участия пользователя в квесте
							// ВАЖНО: Статус архивации квеста имеет приоритет - если квест archived, он остается archived
							// независимо от статуса участия пользователя
							if (quest.status === 'archived') {
								// Квест архивирован - оставляем статус как есть
								quest.status = 'archived'
							} else if (item.status === 'completed') {
								// Если status === 'completed', то квест завершен для этого пользователя
								quest.status = 'completed'
							} else if (item.status === 'in_progress') {
								// Если квест не завершен пользователем, но он в процессе выполнения
								quest.status = 'active'
							}
							// Если item.status === 'pending' или другой, оставляем исходный статус квеста

							// Объединяем данные из achievement, если они есть и отсутствуют в quest
							if (item.achievement && !quest.achievement) {
								quest.achievement = {
									id: item.achievement.id,
									title: item.achievement.title,
									description: item.achievement.description,
									icon: item.achievement.icon,
								}
							}

							// Объединяем данные из city, если они есть и отсутствуют в quest
							if (item.city && !quest.city) {
								quest.city = {
									id: item.city.id,
									name: item.city.name,
								}
							}

							// Объединяем данные из organizationType, если они есть и отсутствуют в quest
							if (item.organizationType && !quest.organizationType) {
								quest.organizationType = {
									id: item.organizationType.id,
									name: item.organizationType.name,
								}
							}

							return quest
						})
						.filter((quest): quest is Quest => quest !== null)

					return {
						data: {
							quests,
						},
					}
				}

				// Если ответ уже в формате QuestsListResponse
				if (
					!Array.isArray(response) &&
					'data' in response &&
					response.data &&
					Array.isArray(response.data.quests)
				) {
					return response
				}

				// Если ответ в формате { data: Quest[] }
				if (
					!Array.isArray(response) &&
					response.data &&
					Array.isArray(response.data)
				) {
					return {
						data: {
							quests: response.data as Quest[],
						},
					}
				}

				// Возвращаем пустой массив по умолчанию
				return {
					data: {
						quests: [],
					},
				}
			},
			providesTags: (_result, _error, userId) => [
				'QuestList',
				{ type: 'UserQuest', id: String(userId) },
			],
		}),

		// POST /v1/quests - Создать новый квест
		createQuest: builder.mutation<CreateQuestResponse, CreateQuestRequest>({
			query: body => ({
				url: '/v1/quests',
				method: 'POST',
				body,
			}),
			invalidatesTags: ['QuestList'],
		}),

		// PATCH /v1/quests/:id - Обновить квест
		updateQuest: builder.mutation<
			UpdateQuestResponse,
			{ id: number | string; data: UpdateQuestRequest }
		>({
			query: ({ id, data }) => ({
				url: `/v1/quests/${id}`,
				method: 'PATCH',
				body: data,
			}),
			invalidatesTags: (_result, _error, { id }) => [
				'QuestList',
				{ type: 'Quest', id: String(id) },
			],
		}),

		// DELETE /v1/quests/:id - Удалить квест
		deleteQuest: builder.mutation<DeleteQuestResponse, number | string>({
			query: id => ({
				url: `/v1/quests/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: (_result, _error, id) => [
				'QuestList',
				{ type: 'Quest', id: String(id) },
			],
		}),

		// POST /v1/quests/:id/complete - Завершить квест
		completeQuest: builder.mutation<UpdateQuestResponse, number | string>({
			query: id => ({
				url: `/v1/quests/${id}/complete`,
				method: 'POST',
			}),
			invalidatesTags: (_result, _error, id) => [
				'QuestList',
				{ type: 'Quest', id: String(id) },
				'UserQuest', // Инвалидируем квесты пользователя для обновления статуса
			],
		}),

		// POST /v1/quests/:id/join/:userId - Присоединиться к квесту
		joinQuest: builder.mutation<
			JoinQuestResponse,
			{ id: number | string; userId: number | string }
		>({
			query: ({ id, userId }) => ({
				url: `/v1/quests/${id}/join/${userId}`,
				method: 'POST',
			}),
			invalidatesTags: (_result, _error, { id }) => [
				'QuestList',
				{ type: 'Quest', id: String(id) },
			],
		}),

		// POST /v1/quests/:id/leave/:userId - Выйти из квеста
		leaveQuest: builder.mutation<
			LeaveQuestResponse,
			{ id: number | string; userId: number | string }
		>({
			query: ({ id, userId }) => ({
				url: `/v1/quests/${id}/leave/${userId}`,
				method: 'POST',
			}),
			invalidatesTags: (_result, _error, { id }) => [
				'QuestList',
				{ type: 'Quest', id: String(id) },
			],
		}),

		// POST /v1/quest-updates - Создать обновление квеста
		createQuestUpdate: builder.mutation<
			QuestUpdateResponse,
			CreateQuestUpdateRequest
		>({
			query: body => ({
				url: '/v1/quest-updates',
				method: 'POST',
				body,
			}),
			invalidatesTags: (_result, _error, { questId }) => [
				{ type: 'Quest', id: String(questId) },
				'QuestUpdate',
			],
		}),

		// GET /v1/quest-updates/:id - Получить обновление квеста
		getQuestUpdate: builder.query<QuestUpdate, number | string>({
			query: id => `/v1/quest-updates/${id}`,
			providesTags: (_result, _error, id) => [
				{ type: 'QuestUpdate', id: String(id) },
			],
		}),

		// GET /v1/quest-updates?questId=... - Получить все обновления квеста
		getQuestUpdates: builder.query<QuestUpdate[], number | string>({
			query: questId => `/v1/quest-updates?questId=${questId}`,
			transformResponse: (
				response: { data?: QuestUpdate[] } | QuestUpdate[]
			) => {
				// Обрабатываем оба формата ответа: { data: [...] } или [...]
				if (Array.isArray(response)) {
					return response
				}
				return response.data || []
			},
			providesTags: (_result, _error, questId) => [
				{ type: 'QuestUpdate', id: `list-${questId}` },
			],
		}),

		// PATCH /v1/quest-updates/:id - Обновить обновление квеста
		updateQuestUpdate: builder.mutation<
			QuestUpdateResponse,
			{ id: number | string; data: UpdateQuestUpdateRequest }
		>({
			query: ({ id, data }) => ({
				url: `/v1/quest-updates/${id}`,
				method: 'PATCH',
				body: data,
			}),
			invalidatesTags: (_result, _error, { id, data }) => {
				const tags: Array<
					{ type: 'QuestUpdate'; id: string } | { type: 'Quest'; id: string }
				> = [{ type: 'QuestUpdate', id: String(id) }]
				if (data.questId) {
					tags.push({ type: 'Quest', id: String(data.questId) })
				}
				return tags
			},
		}),

		// DELETE /v1/quest-updates/:id - Удалить обновление квеста
		deleteQuestUpdate: builder.mutation<
			DeleteQuestUpdateResponse,
			number | string
		>({
			query: id => ({
				url: `/v1/quest-updates/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: (_result, _error, id) => [
				{ type: 'QuestUpdate', id: String(id) },
				'QuestUpdate',
			],
		}),

		// GET /v1/quests/:id/users - Получить участников квеста
		getQuestUsers: builder.query<QuestParticipantsResponse, number | string>({
			query: id => `/v1/quests/${id}/users`,
			transformResponse: (
				response: QuestParticipant[] | QuestParticipantsResponse
			): QuestParticipantsResponse => {
				// Если ответ - это массив участников напрямую
				if (Array.isArray(response)) {
					return {
						data: response,
					}
				}
				// Если ответ уже в формате { data: [...] }
				if ('data' in response && Array.isArray(response.data)) {
					return response
				}
				// Возвращаем пустой массив по умолчанию
				return {
					data: [],
				}
			},
			providesTags: (_result, _error, id) => [
				{ type: 'Quest', id: String(id) },
			],
		}),
	}),
})

export const {
	useGetQuestsQuery,
	useLazyGetQuestsQuery,
	useGetQuestQuery,
	useLazyGetQuestQuery,
	useGetUserQuestsQuery,
	useLazyGetUserQuestsQuery,
	useCreateQuestMutation,
	useUpdateQuestMutation,
	useDeleteQuestMutation,
	useCompleteQuestMutation,
	useJoinQuestMutation,
	useLeaveQuestMutation,
	useCreateQuestUpdateMutation,
	useGetQuestUpdateQuery,
	useLazyGetQuestUpdateQuery,
	useGetQuestUpdatesQuery,
	useLazyGetQuestUpdatesQuery,
	useUpdateQuestUpdateMutation,
	useDeleteQuestUpdateMutation,
	useGetQuestUsersQuery,
	useLazyGetQuestUsersQuery,
} = questService
