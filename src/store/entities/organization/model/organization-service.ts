import { baseQueryWithReauth } from '@/store/baseQueryWithReauth'
import { createApi } from '@reduxjs/toolkit/query/react'
import type {
	CreateOrganizationRequest,
	CreateOrganizationResponse,
	CreateOrganizationUpdateRequest,
	DeleteOrganizationResponse,
	DeleteOrganizationUpdateResponse,
	Organization,
	OrganizationUpdate,
	OrganizationUpdateResponse,
	UpdateOrganizationRequest,
	UpdateOrganizationResponse,
	UpdateOrganizationUpdateRequest,
} from './type'

export const organizationService = createApi({
	reducerPath: 'organizationApi',
	baseQuery: baseQueryWithReauth,
	tagTypes: ['Organization', 'OrganizationList', 'OrganizationUpdate'],
	endpoints: builder => ({
		// GET /v1/organizations - Получить список всех организаций
		getOrganizations: builder.query<Organization[], void>({
			query: () => '/v1/organizations?onlyApproved=true',
			providesTags: ['OrganizationList'],
		}),

		// GET /v1/organizations/my - Получить организации пользователя
		getMyOrganizations: builder.query<Organization[], void>({
			query: () => '/v1/organizations/my',
			transformResponse: (
				response: { data?: Organization[] } | Organization[]
			) => {
				// Обрабатываем оба формата ответа: { data: [...] } или [...]
				if (Array.isArray(response)) {
					return response
				}
				return response.data || []
			},
			providesTags: ['OrganizationList'],
		}),

		// GET /v1/organizations/:organizationId - Получить детальную информацию об организации
		getOrganization: builder.query<Organization, string>({
			query: organizationId => `/v1/organizations/${organizationId}`,
			providesTags: (_result, _error, organizationId) => [
				{ type: 'Organization', id: organizationId },
			],
		}),

		// POST /v1/organizations - Создать новую организацию
		createOrganization: builder.mutation<
			CreateOrganizationResponse,
			CreateOrganizationRequest
		>({
			query: body => ({
				url: '/v1/organizations',
				method: 'POST',
				body,
			}),
			invalidatesTags: ['OrganizationList'],
		}),

		// PATCH /v1/organizations/:organizationId - Обновить организацию
		updateOrganization: builder.mutation<
			UpdateOrganizationResponse,
			{ organizationId: string; data: UpdateOrganizationRequest }
		>({
			query: ({ organizationId, data }) => ({
				url: `/v1/organizations/${organizationId}`,
				method: 'PATCH',
				body: data,
			}),
			invalidatesTags: (_result, _error, { organizationId }) => [
				'OrganizationList',
				{ type: 'Organization', id: organizationId },
			],
		}),

		// DELETE /v1/organizations/:organizationId - Удалить организацию
		deleteOrganization: builder.mutation<DeleteOrganizationResponse, string>({
			query: organizationId => ({
				url: `/v1/organizations/${organizationId}`,
				method: 'DELETE',
			}),
			invalidatesTags: (_result, _error, organizationId) => [
				'OrganizationList',
				{ type: 'Organization', id: organizationId },
			],
		}),

		// POST /v1/organization-updates - Создать обновление организации
		createOrganizationUpdate: builder.mutation<
			OrganizationUpdateResponse,
			CreateOrganizationUpdateRequest
		>({
			query: body => ({
				url: '/v1/organization-updates',
				method: 'POST',
				body,
			}),
			invalidatesTags: (_result, _error, { organizationId }) => [
				{ type: 'Organization', id: String(organizationId) },
				{ type: 'OrganizationUpdate', id: `list-${organizationId}` },
				'OrganizationUpdate',
			],
		}),

		// GET /v1/organization-updates/:id - Получить обновление организации
		getOrganizationUpdate: builder.query<OrganizationUpdate, number | string>({
			query: id => `/v1/organization-updates/${id}`,
			providesTags: (_result, _error, id) => [
				{ type: 'OrganizationUpdate', id: String(id) },
			],
		}),

		// GET /v1/organization-updates?organizationId=... - Получить все обновления организации
		getOrganizationUpdates: builder.query<
			OrganizationUpdate[],
			number | string
		>({
			query: organizationId =>
				`/v1/organization-updates?organizationId=${organizationId}`,
			transformResponse: (
				response: { data?: OrganizationUpdate[] } | OrganizationUpdate[]
			) => {
				// Обрабатываем оба формата ответа: { data: [...] } или [...]
				if (Array.isArray(response)) {
					return response
				}
				return response.data || []
			},
			providesTags: (_result, _error, organizationId) => [
				{ type: 'OrganizationUpdate', id: `list-${organizationId}` },
			],
		}),

		// PATCH /v1/organization-updates/:id - Обновить обновление организации
		updateOrganizationUpdate: builder.mutation<
			OrganizationUpdateResponse,
			{ id: number | string; data: UpdateOrganizationUpdateRequest }
		>({
			query: ({ id, data }) => ({
				url: `/v1/organization-updates/${id}`,
				method: 'PATCH',
				body: data,
			}),
			invalidatesTags: (_result, _error, { id, data }) => {
				const tags: Array<
					| { type: 'OrganizationUpdate'; id: string }
					| { type: 'Organization'; id: string }
				> = [{ type: 'OrganizationUpdate', id: String(id) }]
				if (data.organizationId) {
					tags.push(
						{ type: 'Organization', id: String(data.organizationId) },
						{
							type: 'OrganizationUpdate',
							id: `list-${data.organizationId}`,
						}
					)
				}
				return tags
			},
		}),

		// DELETE /v1/organization-updates/:id - Удалить обновление организации
		deleteOrganizationUpdate: builder.mutation<
			DeleteOrganizationUpdateResponse,
			number | string
		>({
			query: id => ({
				url: `/v1/organization-updates/${id}`,
				method: 'DELETE',
			}),
			// Инвалидируем все теги OrganizationUpdate, чтобы обновить все списки
			invalidatesTags: () => ['OrganizationUpdate'],
		}),
	}),
})

export const {
	useGetOrganizationsQuery,
	useLazyGetOrganizationsQuery,
	useGetMyOrganizationsQuery,
	useLazyGetMyOrganizationsQuery,
	useGetOrganizationQuery,
	useLazyGetOrganizationQuery,
	useCreateOrganizationMutation,
	useUpdateOrganizationMutation,
	useDeleteOrganizationMutation,
	useCreateOrganizationUpdateMutation,
	useGetOrganizationUpdateQuery,
	useLazyGetOrganizationUpdateQuery,
	useGetOrganizationUpdatesQuery,
	useLazyGetOrganizationUpdatesQuery,
	useUpdateOrganizationUpdateMutation,
	useDeleteOrganizationUpdateMutation,
} = organizationService
