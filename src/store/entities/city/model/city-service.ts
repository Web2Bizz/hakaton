import { baseQueryWithReauth } from '@/store/baseQueryWithReauth'
import { createApi } from '@reduxjs/toolkit/query/react'
import type { CityResponse } from './type'

export const cityService = createApi({
	reducerPath: 'cityApi',
	baseQuery: baseQueryWithReauth,
	tagTypes: ['City'],
	endpoints: builder => ({
		// GET /v1/cities - Получить список городов
		getCities: builder.query<CityResponse[], void>({
			query: () => '/v1/cities',
		}),
	}),
})

export const { useGetCitiesQuery, useLazyGetCitiesQuery } = cityService
