import { API_BASE_URL } from '@/constants'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { CityResponse } from './type'

// Функция для получения токена из localStorage
const getToken = () => {
	if (globalThis.window !== undefined) {
		return localStorage.getItem('authToken') || null
	}
	return null
}

export const cityService = createApi({
	reducerPath: 'cityApi',
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
	tagTypes: ['City'],
	endpoints: builder => ({
		// GET /cities - Получить список городов
		getCities: builder.query<CityResponse[], void>({
			query: () => '/cities',
		}),
	}),
})

export const { useGetCitiesQuery, useLazyGetCitiesQuery } = cityService
