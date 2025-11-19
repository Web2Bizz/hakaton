import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { CategoriesResponse, CategoryResponse } from './type'

// Функция для получения токена из localStorage
const getToken = () => {
	if (globalThis.window !== undefined) {
		return localStorage.getItem('authToken') || null
	}
	return null
}

export const categoryService = createApi({
	reducerPath: 'categoryApi',
	baseQuery: fetchBaseQuery({
		baseUrl: 'http://82.202.140.37:3000/api/v1',
		prepareHeaders: headers => {
			const token = getToken()
			if (token) {
				headers.set('authorization', `Bearer ${token}`)
			}
			return headers
		},
	}),
	tagTypes: ['Category'],
	endpoints: builder => ({
		// GET /categories - Получить список категорий квестов
		getCategories: builder.query<CategoryResponse[], void>({
			query: () => '/categories',
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
