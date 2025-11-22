import { API_BASE_URL } from '@/constants'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { UploadImageResponse } from './type'

// Функция для получения токена из localStorage
const getToken = () => {
	if (globalThis.window !== undefined) {
		return localStorage.getItem('authToken') || null
	}
	return null
}

export const uploadService = createApi({
	reducerPath: 'uploadApi',
	baseQuery: fetchBaseQuery({
		baseUrl: API_BASE_URL,
		prepareHeaders: headers => {
			const token = getToken()
			if (token) {
				headers.set('authorization', `Bearer ${token}`)
			}
			// Не устанавливаем Content-Type для FormData - браузер установит его автоматически
			return headers
		},
	}),
	tagTypes: ['Upload'],
	endpoints: builder => ({
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

export const { useUploadImagesMutation } = uploadService

