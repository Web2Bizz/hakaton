import { API_BASE_URL } from '@/constants'
import {
	getRefreshToken,
	getToken,
	removeToken,
	saveRefreshToken,
	saveToken,
} from '@/utils/auth'
import { logger } from '@/utils/logger'
import type { FetchArgs } from '@reduxjs/toolkit/query'
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'

interface RefreshTokenResponse {
	access_token: string
	refresh_token?: string
}

// Базовый запрос с автоматическим обновлением токена
const baseQuery = fetchBaseQuery({
	baseUrl: API_BASE_URL,
	prepareHeaders: headers => {
		const token = getToken()
		if (token) {
			headers.set('authorization', `Bearer ${token}`)
		}
		return headers
	},
})

// Интерсептор для автоматического обновления токена при 401
export const baseQueryWithReauth = async (
	args: string | FetchArgs,
	api: Parameters<typeof baseQuery>[1],
	extraOptions: Parameters<typeof baseQuery>[2]
) => {
	const url = typeof args === 'string' ? args : args.url
	logger.info('[baseQueryWithReauth] Запрос:', url)

	let result = await baseQuery(args, api, extraOptions)

	// Логируем структуру результата для отладки
	if (result?.error) {
		logger.info('[baseQueryWithReauth] Структура ошибки:', {
			error: result.error,
			hasStatus: 'status' in result.error,
			status: 'status' in result.error ? result.error.status : 'нет статуса',
			errorKeys: Object.keys(result.error),
		})
	}

	// Если получили 401 (Unauthorized), пытаемся обновить токен
	// Проверяем разные варианты структуры ошибки RTK Query
	const error = result?.error
	let is401Error = false

	if (error && typeof error === 'object') {
		// Стандартный формат RTK Query: { status: 401, data: ... }
		if ('status' in error && error.status === 401) {
			is401Error = true
		}
		// Альтернативный формат: { data: { statusCode: 401 } }
		else if (
			'data' in error &&
			error.data &&
			typeof error.data === 'object' &&
			'statusCode' in error.data &&
			error.data.statusCode === 401
		) {
			is401Error = true
		}
	}

	if (is401Error) {
		logger.warn('[baseQueryWithReauth] Получен 401, пытаемся обновить токен')

		const refreshToken = getRefreshToken()

		if (refreshToken) {
			logger.info(
				'[baseQueryWithReauth] Отправляем запрос на обновление токена'
			)
			// Пытаемся обновить токен
			const refreshResult = await baseQuery(
				{
					url: '/v1/auth/refresh',
					method: 'POST',
					body: { refresh_token: refreshToken },
				},
				api,
				extraOptions
			)

			if (refreshResult.data) {
				const refreshData = refreshResult.data as RefreshTokenResponse

				logger.info('[baseQueryWithReauth] Токен успешно обновлен')

				// Сохраняем новые токены
				if (refreshData.access_token) {
					saveToken(refreshData.access_token)
					logger.info('[baseQueryWithReauth] Новый access token сохранен')

					// Проверяем, что токен действительно сохранился
					const savedToken = getToken()
					logger.info('[baseQueryWithReauth] Проверка сохраненного токена:', {
						tokenExists: !!savedToken,
						tokenLength: savedToken?.length,
						tokenMatch: savedToken === refreshData.access_token,
					})
				}
				if (refreshData.refresh_token) {
					saveRefreshToken(refreshData.refresh_token)
					logger.info('[baseQueryWithReauth] Новый refresh token сохранен')
				}

				// Повторяем оригинальный запрос с новым токеном
				// baseQuery использует prepareHeaders, который вызывается каждый раз
				// и получает актуальный токен через getToken()
				logger.info('[baseQueryWithReauth] Повторяем оригинальный запрос:', url)
				logger.info('[baseQueryWithReauth] Токен перед повторным запросом:', {
					token: getToken()?.substring(0, 20) + '...',
				})

				// Небольшая задержка, чтобы убедиться, что токен сохранен
				await new Promise(resolve => setTimeout(resolve, 10))

				result = await baseQuery(args, api, extraOptions)

				logger.info('[baseQueryWithReauth] Результат повторного запроса:', {
					hasError: !!result?.error,
					hasData: !!result?.data,
					errorStatus:
						result?.error && 'status' in result.error
							? result.error.status
							: null,
				})

				if (result?.error) {
					logger.error(
						'[baseQueryWithReauth] Ошибка при повторном запросе:',
						result.error
					)
				} else {
					logger.info('[baseQueryWithReauth] Повторный запрос успешен')
				}
			} else {
				// Если refresh не удался, очищаем токены
				logger.error(
					'[baseQueryWithReauth] Не удалось обновить токен, очищаем токены'
				)
				removeToken()
			}
		} else {
			// Если нет refresh token, очищаем токены
			logger.warn(
				'[baseQueryWithReauth] Refresh token отсутствует, очищаем токены'
			)
			removeToken()
		}
	} else if (result?.error) {
		logger.error('[baseQueryWithReauth] Ошибка запроса:', result.error)
	} else {
		logger.info('[baseQueryWithReauth] Запрос успешен:', url)
	}

	return result
}
