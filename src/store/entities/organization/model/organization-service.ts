import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
	CityResponse,
	CreateOrganizationRequest,
	CreateOrganizationResponse,
	DeleteOrganizationResponse,
	HelpTypeResponse,
	Organization,
	OrganizationResponse,
	OrganizationTypeResponse,
	UpdateOrganizationRequest,
	UpdateOrganizationResponse,
	UploadImageResponse,
} from './type'

// Функция для получения токена из localStorage
const getToken = () => {
	if (globalThis.window !== undefined) {
		return localStorage.getItem('authToken') || null
	}
	return null
}

export const organizationService = createApi({
	reducerPath: 'organizationApi',
	baseQuery: fetchBaseQuery({
		baseUrl: 'http://82.202.140.37:3000/api/v1',
		prepareHeaders: headers => {
			const token = getToken()
			if (token) {
				headers.set('authorization', `Bearer ${token}`)
			}
			// Не устанавливаем Content-Type для FormData - браузер установит его автоматически
			return headers
		},
	}),
	tagTypes: ['Organization', 'OrganizationList'],
	endpoints: builder => ({
		// GET /organizations - Получить список всех организаций
		getOrganizations: builder.query<Organization[], void>({
			query: () => '/organizations',
			providesTags: ['OrganizationList'],
		}),

		// GET /organizations/:organizationId - Получить детальную информацию об организации
		getOrganization: builder.query<OrganizationResponse, string>({
			query: organizationId => `/organizations/${organizationId}`,
			providesTags: (_result, _error, organizationId) => [
				{ type: 'Organization', id: organizationId },
			],
		}),

		// POST /organizations - Создать новую организацию
		createOrganization: builder.mutation<
			CreateOrganizationResponse,
			CreateOrganizationRequest
		>({
			query: body => ({
				url: '/organizations',
				method: 'POST',
				body,
			}),
			invalidatesTags: ['OrganizationList'],
		}),

		// PATCH /organizations/:organizationId - Обновить организацию
		updateOrganization: builder.mutation<
			UpdateOrganizationResponse,
			{ organizationId: string; data: UpdateOrganizationRequest }
		>({
			query: ({ organizationId, data }) => ({
				url: `/organizations/${organizationId}`,
				method: 'PATCH',
				body: data,
			}),
			invalidatesTags: (_result, _error, { organizationId }) => [
				'OrganizationList',
				{ type: 'Organization', id: organizationId },
			],
		}),

		// DELETE /organizations/:organizationId - Удалить организацию
		deleteOrganization: builder.mutation<DeleteOrganizationResponse, string>({
			query: organizationId => ({
				url: `/organizations/${organizationId}`,
				method: 'DELETE',
			}),
			invalidatesTags: ['OrganizationList'],
		}),

		// GET /organization-types - Получить список типов организаций
		getOrganizationTypes: builder.query<OrganizationTypeResponse[], void>({
			query: () => '/organization-types',
		}),

		// GET /help-types - Получить список видов помощи
		getHelpTypes: builder.query<HelpTypeResponse[], void>({
			query: () => '/help-types',
		}),

		// GET /cities - Получить список городов
		getCities: builder.query<CityResponse[], void>({
			query: () => '/cities',
		}),

		// POST /upload/images - Загрузить изображения
		uploadImages: builder.mutation<UploadImageResponse[], FormData>({
			query: formData => ({
				url: '/upload/images',
				method: 'POST',
				body: formData,
			}),
		}),
	}),
})

export const {
	useGetOrganizationsQuery,
	useLazyGetOrganizationsQuery,
	useGetOrganizationQuery,
	useLazyGetOrganizationQuery,
	useCreateOrganizationMutation,
	useUpdateOrganizationMutation,
	useDeleteOrganizationMutation,
	useGetOrganizationTypesQuery,
	useGetHelpTypesQuery,
	useGetCitiesQuery,
	useUploadImagesMutation,
} = organizationService
