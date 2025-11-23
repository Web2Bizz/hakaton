import { API_BASE_URL } from '@/constants'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
	AchievementsListResponse,
	AssignAchievementResponse,
	CreateAchievementRequest,
	CreateAchievementResponse,
	DeleteAchievementResponse,
	GetAchievementResponse,
	UpdateAchievementRequest,
	UpdateAchievementResponse,
	UserAchievementsByUserIdResponse,
	UserAchievementsResponse,
} from './type'

// Функция для получения токена из localStorage
const getToken = () => {
	if (globalThis.window !== undefined) {
		return localStorage.getItem('authToken') || null
	}
	return null
}

export const achievementService = createApi({
	reducerPath: 'achievementApi',
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
	tagTypes: ['Achievement', 'UserAchievement'],
	endpoints: builder => ({
		// GET /v1/achievements - Получить список всех достижений
		getAchievements: builder.query<AchievementsListResponse, void>({
			query: () => '/v1/achievements',
			providesTags: ['Achievement'],
		}),

		// GET /v1/achievements/:id - Получить одно достижение
		getAchievement: builder.query<GetAchievementResponse, number | string>({
			query: id => `/v1/achievements/${id}`,
			providesTags: (_result, _error, id) => [
				{ type: 'Achievement', id: String(id) },
			],
		}),

		// POST /v1/achievements - Создать достижение
		createAchievement: builder.mutation<
			CreateAchievementResponse,
			CreateAchievementRequest
		>({
			query: body => ({
				url: '/v1/achievements',
				method: 'POST',
				body,
			}),
			transformResponse: (
				response:
					| CreateAchievementResponse
					| { data: CreateAchievementResponse }
			): CreateAchievementResponse => {
				// Обрабатываем оба формата ответа: прямой объект или обернутый в data
				if ('data' in response && response.data) {
					return response.data
				}
				return response as CreateAchievementResponse
			},
			invalidatesTags: ['Achievement'],
		}),

		// PATCH /v1/achievements/:id - Обновить достижение
		updateAchievement: builder.mutation<
			UpdateAchievementResponse,
			{ id: number | string; data: UpdateAchievementRequest }
		>({
			query: ({ id, data }) => ({
				url: `/v1/achievements/${id}`,
				method: 'PATCH',
				body: data,
			}),
			transformResponse: (
				response:
					| UpdateAchievementResponse
					| { data: UpdateAchievementResponse }
			): UpdateAchievementResponse => {
				// Обрабатываем оба формата ответа: прямой объект или обернутый в data
				if ('data' in response && response.data) {
					return response.data
				}
				return response as UpdateAchievementResponse
			},
			invalidatesTags: (_result, _error, { id }) => [
				'Achievement',
				{ type: 'Achievement', id: String(id) },
			],
		}),

		// DELETE /v1/achievements/:id - Удалить достижение
		deleteAchievement: builder.mutation<
			DeleteAchievementResponse,
			number | string
		>({
			query: id => ({
				url: `/v1/achievements/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: (_result, _error, id) => [
				'Achievement',
				{ type: 'Achievement', id: String(id) },
			],
		}),

		// GET /v1/users/:userId/achievements - Получить достижения пользователя
		getUserAchievements: builder.query<UserAchievementsResponse, string>({
			query: userId => `/v1/users/${userId}/achievements`,
			providesTags: (_result, _error, userId) => [
				{ type: 'UserAchievement', id: userId },
			],
		}),

		// POST /v1/achievements/:id/assign/:userId - Назначить достижение пользователю
		assignAchievement: builder.mutation<
			AssignAchievementResponse,
			{ id: number | string; userId: number | string }
		>({
			query: ({ id, userId }) => ({
				url: `/v1/achievements/${id}/assign/${userId}`,
				method: 'POST',
			}),
			invalidatesTags: (_result, _error, { userId }) => [
				{ type: 'UserAchievement', id: String(userId) },
			],
		}),

		// GET /v1/achievements/user/:userId - Получить достижения пользователя
		getUserAchievementsByUserId: builder.query<
			UserAchievementsByUserIdResponse,
			number | string
		>({
			query: userId => `/v1/achievements/user/${userId}`,
			transformResponse: (
				response:
					| UserAchievementsByUserIdResponse
					| { data: UserAchievementsByUserIdResponse }
					| UserAchievementsByUserIdResponse['data']
			): UserAchievementsByUserIdResponse => {
				// Обрабатываем разные форматы ответа API
				// Если ответ уже в правильном формате
				if (
					'data' in response &&
					response.data &&
					'achievements' in response.data
				) {
					return response as UserAchievementsByUserIdResponse
				}
				// Если data - это массив achievements
				if ('data' in response && Array.isArray(response.data)) {
					return {
						data: {
							achievements: response.data,
						},
					}
				}
				// Если ответ - это массив achievements напрямую
				if (Array.isArray(response)) {
					return {
						data: {
							achievements: response,
						},
					}
				}
				// Если achievements на верхнем уровне
				if (
					'achievements' in response &&
					Array.isArray(response.achievements)
				) {
					return {
						data: {
							achievements: response.achievements,
						},
					}
				}
				// Возвращаем как есть, если формат правильный
				return response as UserAchievementsByUserIdResponse
			},
			providesTags: (_result, _error, userId) => [
				{ type: 'UserAchievement', id: String(userId) },
			],
		}),
	}),
})

export const {
	useGetAchievementsQuery,
	useLazyGetAchievementsQuery,
	useGetAchievementQuery,
	useLazyGetAchievementQuery,
	useCreateAchievementMutation,
	useUpdateAchievementMutation,
	useDeleteAchievementMutation,
	useGetUserAchievementsQuery,
	useLazyGetUserAchievementsQuery,
	useAssignAchievementMutation,
	useGetUserAchievementsByUserIdQuery,
	useLazyGetUserAchievementsByUserIdQuery,
} = achievementService
