import { baseQueryWithReauth } from '@/store/baseQueryWithReauth'
import { createApi } from '@reduxjs/toolkit/query/react'
import type { HelpTypeResponse } from './type'

export const helpTypeService = createApi({
	reducerPath: 'helpTypeApi',
	baseQuery: baseQueryWithReauth,
	tagTypes: ['HelpType'],
	endpoints: builder => ({
		// GET /v1/help-types - Получить список видов помощи
		getHelpTypes: builder.query<HelpTypeResponse[], void>({
			query: () => '/v1/help-types',
		}),
	}),
})

export const { useGetHelpTypesQuery, useLazyGetHelpTypesQuery } =
	helpTypeService
