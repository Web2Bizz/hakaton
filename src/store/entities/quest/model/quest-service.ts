import { API_BASE_URL } from '@/constants'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
	CreateQuestRequest,
	CreateQuestResponse,
	DeleteQuestResponse,
	GetQuestsParams,
	JoinQuestResponse,
	Quest,
	QuestsListResponse,
	UpdateQuestRequest,
	UpdateQuestResponse,
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
	tagTypes: ['Quest', 'QuestList'],
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
} = questService
