import { API_BASE_URL } from '@/constants'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { AchievementsListResponse, UserAchievementsResponse } from './type'

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
		// GET /achievements - Получить список всех достижений
		getAchievements: builder.query<AchievementsListResponse, void>({
			query: () => '/achievements',
			providesTags: ['Achievement'],
		}),

		// GET /users/:userId/achievements - Получить достижения пользователя
		getUserAchievements: builder.query<UserAchievementsResponse, string>({
			query: userId => `/users/${userId}/achievements`,
			providesTags: (_result, _error, userId) => [
				{ type: 'UserAchievement', id: userId },
			],
		}),
	}),
})

export const {
	useGetAchievementsQuery,
	useLazyGetAchievementsQuery,
	useGetUserAchievementsQuery,
	useLazyGetUserAchievementsQuery,
} = achievementService
