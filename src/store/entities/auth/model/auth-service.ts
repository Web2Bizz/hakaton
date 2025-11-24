import { baseQueryWithReauth } from '@/store/baseQueryWithReauth'
import { createApi } from '@reduxjs/toolkit/query/react'
import type {
	AuthResponse,
	ForgotPasswordRequest,
	LoginRequest,
	RefreshTokenResponse,
	RegisterRequest,
	ResetPasswordRequest,
	UpdateUserRequest,
	UserFullData,
} from './type'

export const authService = createApi({
	reducerPath: 'authApi',
	baseQuery: baseQueryWithReauth,
	tagTypes: ['Auth', 'User'],
	endpoints: builder => ({
		// POST /v1/auth/register - Регистрация нового пользователя
		register: builder.mutation<AuthResponse, RegisterRequest>({
			query: credentials => ({
				url: '/v1/auth/register',
				method: 'POST',
				body: credentials,
			}),
			invalidatesTags: ['Auth'],
		}),

		// POST /v1/auth/login - Вход в систему
		login: builder.mutation<AuthResponse, LoginRequest>({
			query: credentials => ({
				url: '/v1/auth/login',
				method: 'POST',
				body: credentials,
			}),
			invalidatesTags: ['Auth'],
		}),

		// POST /v1/auth/forgot-password - Запрос на восстановление пароля
		forgotPassword: builder.mutation<
			{ message: string },
			ForgotPasswordRequest
		>({
			query: data => ({
				url: '/v1/auth/forgot-password',
				method: 'POST',
				body: data,
			}),
		}),

		// POST /v1/auth/reset-password - Сброс пароля
		resetPassword: builder.mutation<{ message: string }, ResetPasswordRequest>({
			query: data => ({
				url: '/v1/auth/reset-password',
				method: 'POST',
				body: data,
			}),
		}),

		// POST /v1/auth/refresh - Обновление токена
		refreshToken: builder.mutation<
			RefreshTokenResponse,
			{ refresh_token: string }
		>({
			query: data => ({
				url: '/v1/auth/refresh',
				method: 'POST',
				body: data,
			}),
		}),

		// POST /auth/logout - Выход из системы

		// GET /v1/users/:userId - Получить информацию о пользователе
		getUser: builder.query<UserFullData, string>({
			query: userId => `/v1/users/${userId}`,
			providesTags: (_result, _error, userId) => [{ type: 'User', id: userId }],
		}),

		// PATCH /v1/users/:userId - Обновить информацию о пользователе
		updateUser: builder.mutation<
			UserFullData,
			{ userId: string; data: UpdateUserRequest }
		>({
			query: ({ userId, data }) => ({
				url: `/v1/users/${userId}`,
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
	useForgotPasswordMutation,
	useResetPasswordMutation,
	useGetUserQuery,
	useLazyGetUserQuery,
	useUpdateUserMutation,
} = authService
