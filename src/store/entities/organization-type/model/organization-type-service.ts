import { baseQueryWithReauth } from '@/store/baseQueryWithReauth'
import { createApi } from '@reduxjs/toolkit/query/react'
import type { OrganizationTypeResponse } from './type'

export const organizationTypeService = createApi({
	reducerPath: 'organizationTypeApi',
	baseQuery: baseQueryWithReauth,
	tagTypes: ['OrganizationType'],
	endpoints: builder => ({
		// GET /v1/organization-types - Получить список типов организаций
		getOrganizationTypes: builder.query<OrganizationTypeResponse[], void>({
			query: () => '/v1/organization-types',
		}),
	}),
})

export const {
	useGetOrganizationTypesQuery,
	useLazyGetOrganizationTypesQuery,
} = organizationTypeService
