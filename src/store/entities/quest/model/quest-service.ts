import { API_BASE_URL } from '@/constants'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
	CreateQuestRequest,
	CreateQuestResponse,
	CreateQuestUpdateRequest,
	DeleteQuestResponse,
	DeleteQuestUpdateResponse,
	GetQuestsParams,
	JoinQuestResponse,
	Quest,
	QuestUpdate,
	QuestUpdateResponse,
	QuestsListResponse,
	UpdateQuestRequest,
	UpdateQuestResponse,
	UpdateQuestUpdateRequest,
} from './type'

// Функция для получения токена из localStorage
const getToken = () => {
	if (globalThis.window !== undefined) {
		return localStorage.getItem('authToken') || null
	}
	return null
}

export const questService = createApi({
	reducerPath: 'questApi',
	baseQuery: fetchBaseQuery({
		baseUrl: API_BASE_URL,
		prepareHeaders: headers => {
			const token = getToken()
			if (token) {
				headers.set('authorization', `Bearer ${token}`)
			}
			return headers
		},
	}),
	tagTypes: ['Quest', 'QuestList', 'QuestUpdate'],
	endpoints: builder => ({
		// GET /quests - Получить список квестов с фильтрацией
		getQuests: builder.query<QuestsListResponse, GetQuestsParams | void>({
			query: params => {
				if (!params) return '/quests'
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
				return queryString ? `/quests?${queryString}` : '/quests'
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

		// GET /quests/:id - Получить детальную информацию о квесте
		getQuest: builder.query<Quest, number | string>({
			query: id => `/quests/${id}`,
			providesTags: (_result, _error, id) => [
				{ type: 'Quest', id: String(id) },
			],
		}),

		// POST /quests - Создать новый квест
		createQuest: builder.mutation<CreateQuestResponse, CreateQuestRequest>({
			query: body => ({
				url: '/quests',
				method: 'POST',
				body,
			}),
			invalidatesTags: ['QuestList'],
		}),

		// PATCH /quests/:id - Обновить квест
		updateQuest: builder.mutation<
			UpdateQuestResponse,
			{ id: number | string; data: UpdateQuestRequest }
		>({
			query: ({ id, data }) => ({
				url: `/quests/${id}`,
				method: 'PATCH',
				body: data,
			}),
			invalidatesTags: (_result, _error, { id }) => [
				'QuestList',
				{ type: 'Quest', id: String(id) },
			],
		}),

		// DELETE /quests/:id - Удалить квест
		deleteQuest: builder.mutation<DeleteQuestResponse, number | string>({
			query: id => ({
				url: `/quests/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: (_result, _error, id) => [
				'QuestList',
				{ type: 'Quest', id: String(id) },
			],
		}),

		// POST /quests/:id/join/:userId - Присоединиться к квесту
		joinQuest: builder.mutation<
			JoinQuestResponse,
			{ id: number | string; userId: number | string }
		>({
			query: ({ id, userId }) => ({
				url: `/quests/${id}/join/${userId}`,
				method: 'POST',
			}),
			invalidatesTags: (_result, _error, { id }) => [
				'QuestList',
				{ type: 'Quest', id: String(id) },
			],
		}),

		// POST /api/v1/quest-updates - Создать обновление квеста
		createQuestUpdate: builder.mutation<
			QuestUpdateResponse,
			CreateQuestUpdateRequest
		>({
			query: body => ({
				url: '/quest-updates',
				method: 'POST',
				body,
			}),
			invalidatesTags: (_result, _error, { questId }) => [
				{ type: 'Quest', id: String(questId) },
				'QuestUpdate',
			],
		}),

		// GET /api/v1/quest-updates/:id - Получить обновление квеста
		getQuestUpdate: builder.query<QuestUpdate, number | string>({
			query: id => `/quest-updates/${id}`,
			providesTags: (_result, _error, id) => [
				{ type: 'QuestUpdate', id: String(id) },
			],
		}),

		// GET /api/v1/quest-updates?questId=... - Получить все обновления квеста
		getQuestUpdates: builder.query<QuestUpdate[], number | string>({
			query: questId => `/quest-updates?questId=${questId}`,
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

		// PATCH /api/v1/quest-updates/:id - Обновить обновление квеста
		updateQuestUpdate: builder.mutation<
			QuestUpdateResponse,
			{ id: number | string; data: UpdateQuestUpdateRequest }
		>({
			query: ({ id, data }) => ({
				url: `/quest-updates/${id}`,
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

		// DELETE /quest-updates/:id - Удалить обновление квеста
		deleteQuestUpdate: builder.mutation<
			DeleteQuestUpdateResponse,
			number | string
		>({
			query: id => ({
				url: `/quest-updates/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: (_result, _error, id) => [
				{ type: 'QuestUpdate', id: String(id) },
				'QuestUpdate',
			],
		}),
	}),
})

export const {
	useGetQuestsQuery,
	useLazyGetQuestsQuery,
	useGetQuestQuery,
	useLazyGetQuestQuery,
	useCreateQuestMutation,
	useUpdateQuestMutation,
	useDeleteQuestMutation,
	useJoinQuestMutation,
	useCreateQuestUpdateMutation,
	useGetQuestUpdateQuery,
	useLazyGetQuestUpdateQuery,
	useGetQuestUpdatesQuery,
	useLazyGetQuestUpdatesQuery,
	useUpdateQuestUpdateMutation,
	useDeleteQuestUpdateMutation,
} = questService
