import { API_BASE_URL } from '@/constants'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { OrganizationTypeResponse } from './type'

// Функция для получения токена из localStorage
const getToken = () => {
	if (globalThis.window !== undefined) {
		return localStorage.getItem('authToken') || null
	}
	return null
}

export const organizationTypeService = createApi({
	reducerPath: 'organizationTypeApi',
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
	tagTypes: ['OrganizationType'],
	endpoints: builder => ({
		// GET /organization-types - Получить список типов организаций
		getOrganizationTypes: builder.query<OrganizationTypeResponse[], void>({
			query: () => '/organization-types',
		}),
	}),
})

export const {
	useGetOrganizationTypesQuery,
	useLazyGetOrganizationTypesQuery,
} = organizationTypeService

