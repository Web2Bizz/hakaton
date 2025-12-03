import { organizationTypeService } from '@/store/entities/organization-type/model/organization-type-service'
import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it, vi, beforeEach } from 'vitest'

// Мокируем baseQueryWithReauth
const mockBaseQuery = vi.fn()
vi.mock('@/store/baseQueryWithReauth', () => ({
	baseQueryWithReauth: (...args: unknown[]) => mockBaseQuery(...args),
}))

describe('organization-type-service', () => {
	const store = configureStore({
		reducer: {
			[organizationTypeService.reducerPath]: organizationTypeService.reducer,
		},
		middleware: getDefaultMiddleware =>
			getDefaultMiddleware().concat(organizationTypeService.middleware),
	})

	beforeEach(() => {
		vi.clearAllMocks()
		// Сбрасываем кэш RTK Query между тестами
		store.dispatch(organizationTypeService.util.resetApiState())
	})

	describe('getOrganizationTypes query', () => {
		it('должен отправлять GET запрос на /v1/organization-types', async () => {
			const mockTypes = [
				{ id: 1, name: 'NPO' },
				{ id: 2, name: 'Foundation' },
			]

			mockBaseQuery.mockResolvedValue({ data: mockTypes })

			const result = await store.dispatch(
				organizationTypeService.endpoints.getOrganizationTypes.initiate(
					undefined
				)
			)

			expect(mockBaseQuery).toHaveBeenCalled()
			// query возвращает строку, а не объект
			expect(mockBaseQuery.mock.calls[0][0]).toBe('/v1/organization-types')

			expect(result.data).toEqual(mockTypes)
			expect(result.error).toBeUndefined()
		})

		it('должен обрабатывать пустой массив', async () => {
			mockBaseQuery.mockResolvedValue({ data: [] })

			const result = await store.dispatch(
				organizationTypeService.endpoints.getOrganizationTypes.initiate(
					undefined
				)
			)

			expect(result.data).toEqual([])
			expect(result.error).toBeUndefined()
		})

		it('должен обрабатывать ошибку', async () => {
			const mockError = {
				status: 500,
				data: { message: 'Internal server error' },
			}

			mockBaseQuery.mockResolvedValue({ error: mockError })

			const result = await store.dispatch(
				organizationTypeService.endpoints.getOrganizationTypes.initiate(
					undefined
				)
			)

			expect(result.error).toBeDefined()
			expect(result.error).toEqual(mockError)
		})
	})
})

