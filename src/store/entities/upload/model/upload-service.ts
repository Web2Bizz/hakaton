import { baseQueryWithReauth } from '@/store/baseQueryWithReauth'
import { createApi } from '@reduxjs/toolkit/query/react'
import type { UploadImageResponse } from './type'

export const uploadService = createApi({
	reducerPath: 'uploadApi',
	baseQuery: baseQueryWithReauth,
	tagTypes: ['Upload'],
	endpoints: builder => ({
		// POST /v1/upload/images - Загрузить изображения
		uploadImages: builder.mutation<UploadImageResponse[], FormData>({
			query: formData => ({
				url: '/v1/upload/images',
				method: 'POST',
				body: formData,
			}),
		}),
	}),
})

export const { useUploadImagesMutation } = uploadService
