import { API_BASE_URL } from '@/constants'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { HelpTypeResponse } from './type'

// Функция для получения токена из localStorage
const getToken = () => {
	if (globalThis.window !== undefined) {
		return localStorage.getItem('authToken') || null
	}
	return null
}

export const helpTypeService = createApi({
	reducerPath: 'helpTypeApi',
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
	tagTypes: ['HelpType'],
	endpoints: builder => ({
		// GET /help-types - Получить список видов помощи
		getHelpTypes: builder.query<HelpTypeResponse[], void>({
			query: () => '/help-types',
		}),
	}),
})

export const { useGetHelpTypesQuery, useLazyGetHelpTypesQuery } =
	helpTypeService

