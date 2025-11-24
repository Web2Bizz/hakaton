import { baseQueryWithReauth } from '@/store/baseQueryWithReauth'
import { createApi } from '@reduxjs/toolkit/query/react'
import type { CategoriesResponse, CategoryResponse } from './type'

export const categoryService = createApi({
	reducerPath: 'categoryApi',
	baseQuery: baseQueryWithReauth,
	tagTypes: ['Category'],
	endpoints: builder => ({
		// GET /v1/categories - Получить список категорий квестов
		getCategories: builder.query<CategoryResponse[], void>({
			query: () => '/v1/categories',
			transformResponse: (response: unknown): CategoryResponse[] => {
				// Если ответ - это массив, возвращаем его напрямую
				if (Array.isArray(response)) {
					return response as CategoryResponse[]
				}
				// Если ответ - это объект с полем categories, возвращаем массив
				if (
					response &&
					typeof response === 'object' &&
					'categories' in response
				) {
					return (response as CategoriesResponse).categories || []
				}
				return []
			},
		}),
	}),
})

export const { useGetCategoriesQuery, useLazyGetCategoriesQuery } =
	categoryService
