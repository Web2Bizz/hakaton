import { API_BASE_URL } from '@/constants'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
	AuthResponse,
	LoginRequest,
	RegisterRequest,
	UpdateUserRequest,
	UserFullData,
} from './type'

// Функция для получения токена из localStorage
const getToken = () => {
	if (globalThis.window !== undefined) {
		return localStorage.getItem('authToken') || null
	}
	return null
}

export const authService = createApi({
	reducerPath: 'authApi',

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
	tagTypes: ['Auth', 'User'],
	endpoints: builder => ({
		// POST /auth/register - Регистрация нового пользователя
		register: builder.mutation<AuthResponse, RegisterRequest>({
			query: credentials => ({
				url: '/auth/register',
				method: 'POST',
				body: credentials,
			}),
			invalidatesTags: ['Auth'],
		}),

		// POST /auth/login - Вход в систему
		login: builder.mutation<AuthResponse, LoginRequest>({
			query: credentials => ({
				url: '/auth/login',
				method: 'POST',
				body: credentials,
			}),
			invalidatesTags: ['Auth'],
		}),

		// POST /auth/logout - Выход из системы

		// GET /users/:userId - Получить информацию о пользователе
		getUser: builder.query<UserFullData, string>({
			query: userId => `/users/${userId}`,
			providesTags: (_result, _error, userId) => [{ type: 'User', id: userId }],
		}),

		// PATCH /users/:userId - Обновить информацию о пользователе
		updateUser: builder.mutation<
			UserFullData,
			{ userId: string; data: UpdateUserRequest }
		>({
			query: ({ userId, data }) => ({
				url: `/users/${userId}`,
				method: 'PATCH',
				body: data,
			}),
			invalidatesTags: (_result, _error, { userId }) => [
				'User',
				{ type: 'User', id: userId },
				'Auth',
			],
		}),
	}),
})

export const {
	useRegisterMutation,
	useLoginMutation,
	useGetUserQuery,
	useLazyGetUserQuery,
	useUpdateUserMutation,
} = authService
