import { useUser } from '@/hooks/useUser'
import {
	useDeleteQuestMutation,
	useGetQuestQuery,
	useUpdateQuestMutation,
	useUpdateUserMutation,
} from '@/store/entities'
import {
	useGetCitiesQuery,
	useGetOrganizationTypesQuery,
	useUploadImagesMutation,
	type CityResponse,
} from '@/store/entities/organization'
import { transformUserFromAPI } from '@/utils/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import type React from 'react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
	questFormSchema,
	type QuestFormData,
} from '@/components/forms/quest/schemas/quest-form.schema'
import {
	transformApiResponseToFormData,
	transformFormDataToUpdateRequest,
} from '@/components/forms/quest/utils/questTransformers'

export function useQuestEditForm(
	questId: number,
	onSuccess?: () => void
) {
	const { user, setUser, deleteQuest: removeUserQuestId } = useUser()

	const { data: questResponse, isLoading: isLoadingQuest } = useGetQuestQuery(
		questId,
		{
			skip: !questId,
		}
	)

	const { data: cities = [] } = useGetCitiesQuery()
	const { data: organizationTypes = [] } = useGetOrganizationTypesQuery()

	const [updateQuestMutation, { isLoading: isUpdating }] =
		useUpdateQuestMutation()
	const [deleteQuestMutation, { isLoading: isDeleting }] =
		useDeleteQuestMutation()
	const [uploadImagesMutation, { isLoading: isUploadingImages }] =
		useUploadImagesMutation()
	const [updateUserMutation] = useUpdateUserMutation()

	const form = useForm<QuestFormData>({
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		resolver: zodResolver(questFormSchema) as any,
		defaultValues: {
			title: '',
			cityId: 0,
			organizationTypeId: 0,
			category: 'environment',
			story: '',
			storyImage: undefined,
			gallery: [],
			address: '',
			contacts: [
				{ name: 'Куратор', value: user?.name || '' },
				{ name: 'Телефон', value: '' },
			],
			latitude: '',
			longitude: '',
			stages: [
				{
					title: '',
					description: '',
					status: 'pending',
					progress: 0,
					requirementType: 'none',
					requirementValue: undefined,
					itemName: undefined,
					deadline: undefined,
				},
			],
			customAchievement: undefined,
			curatorName: user?.name || '',
			curatorPhone: '',
			curatorEmail: '',
			socials: [],
		},
		mode: 'onChange',
	})

	// Загружаем данные существующего квеста для редактирования
	useEffect(() => {
		if (questResponse && !form.formState.isDirty && !isLoadingQuest) {
			const formData = transformApiResponseToFormData(questResponse)
			form.reset(formData as QuestFormData)

			// Синхронизируем поля куратора после загрузки данных
			const contacts = formData.contacts || []
			const curatorContact = contacts.find(
				c => c && (c.name === 'Куратор' || c.name?.toLowerCase() === 'куратор')
			)
			const phoneContact = contacts.find(
				c =>
					c && (c.name === 'Телефон' || c.name?.toLowerCase() === 'телефон')
			)
			const emailContact = contacts.find(
				c => c && (c.name === 'Email' || c.name?.toLowerCase() === 'email')
			)

			if (curatorContact?.value) {
				form.setValue('curatorName', curatorContact.value, {
					shouldValidate: false,
				})
			}
			if (phoneContact?.value) {
				form.setValue('curatorPhone', phoneContact.value, {
					shouldValidate: false,
				})
			}
			if (emailContact?.value) {
				form.setValue('curatorEmail', emailContact.value, {
					shouldValidate: false,
				})
			}
		}
	}, [questResponse, cities, organizationTypes, form, isLoadingQuest])

	// Синхронизация между контактами и полями куратора
	useEffect(() => {
		const subscription = form.watch((value, { name }) => {
			const contacts = value.contacts || []

			// Синхронизация из контактов в поля куратора
			if (name?.startsWith('contacts.')) {
				const curatorContact = contacts.find(
					c =>
						c && (c.name === 'Куратор' || c.name?.toLowerCase() === 'куратор')
				)
				const phoneContact = contacts.find(
					c =>
						c && (c.name === 'Телефон' || c.name?.toLowerCase() === 'телефон')
				)
				const emailContact = contacts.find(
					c => c && (c.name === 'Email' || c.name?.toLowerCase() === 'email')
				)

				if (curatorContact && curatorContact.value !== value.curatorName) {
					form.setValue('curatorName', curatorContact.value || '', {
						shouldValidate: false,
					})
				}
				if (phoneContact && phoneContact.value !== value.curatorPhone) {
					form.setValue('curatorPhone', phoneContact.value || '', {
						shouldValidate: false,
					})
				}
				if (emailContact && emailContact.value !== value.curatorEmail) {
					form.setValue('curatorEmail', emailContact.value || '', {
						shouldValidate: false,
					})
				}
			}

			// Синхронизация из полей куратора в контакты
			if (
				name === 'curatorName' ||
				name === 'curatorPhone' ||
				name === 'curatorEmail'
			) {
				const curatorIndex = contacts.findIndex(
					c =>
						c && (c.name === 'Куратор' || c.name?.toLowerCase() === 'куратор')
				)
				const phoneIndex = contacts.findIndex(
					c =>
						c && (c.name === 'Телефон' || c.name?.toLowerCase() === 'телефон')
				)
				const emailIndex = contacts.findIndex(
					c => c && (c.name === 'Email' || c.name?.toLowerCase() === 'email')
				)

				if (name === 'curatorName' && curatorIndex >= 0) {
					form.setValue(
						`contacts.${curatorIndex}.value`,
						value.curatorName || '',
						{
							shouldValidate: false,
						}
					)
				}
				if (name === 'curatorPhone' && phoneIndex >= 0) {
					form.setValue(
						`contacts.${phoneIndex}.value`,
						value.curatorPhone || '',
						{
							shouldValidate: false,
						}
					)
				}
				if (name === 'curatorEmail' && emailIndex >= 0) {
					form.setValue(
						`contacts.${emailIndex}.value`,
						value.curatorEmail || '',
						{
							shouldValidate: false,
						}
					)
				}
			}
		})

		return () => subscription.unsubscribe()
	}, [form])

	const onSubmit = async (data: QuestFormData) => {
		if (!data.latitude || !data.longitude) {
			toast.error('Пожалуйста, выберите местоположение на карте.')
			return
		}

		// Валидация пользовательского достижения
		if (data.customAchievement) {
			if (!data.customAchievement.icon?.trim()) {
				toast.error('Укажите эмодзи для достижения.')
				return
			}
			if (!data.customAchievement.title?.trim()) {
				toast.error('Укажите название достижения.')
				return
			}
			if (!data.customAchievement.description?.trim()) {
				toast.error('Укажите описание достижения.')
				return
			}
		}

		try {
			let storyImageUrl: string | undefined = data.storyImage
			let galleryUrls: string[] = []
			const newImages: string[] = []

			// Обрабатываем storyImage
			if (data.storyImage) {
				if (
					data.storyImage.startsWith('http://') ||
					data.storyImage.startsWith('https://')
				) {
					storyImageUrl = data.storyImage
				} else if (data.storyImage.startsWith('data:')) {
					newImages.push(data.storyImage)
				}
			}

			// Обрабатываем gallery
			if (data.gallery && data.gallery.length > 0) {
				for (let i = 0; i < data.gallery.length; i++) {
					const image = data.gallery[i]

					if (typeof image !== 'string') {
						console.warn(`Image ${i + 1} is not a string:`, typeof image)
						continue
					}

					if (image.startsWith('http://') || image.startsWith('https://')) {
						galleryUrls.push(image)
					} else if (image.startsWith('data:')) {
						newImages.push(image)
					}
				}
			}

			// Загружаем новые изображения
			if (newImages.length > 0) {
				try {
					const formData = new FormData()

					for (let i = 0; i < newImages.length; i++) {
						const base64String = newImages[i]

						const matches = base64String.match(
							/^data:([A-Za-z-+/]+);base64,(.+)$/
						)
						if (!matches || matches.length !== 3) {
							console.error(`Invalid base64 format for image ${i + 1}`)
							throw new Error(`Неверный формат base64 изображения ${i + 1}`)
						}

						const mimeType = matches[1]
						const base64Data = matches[2]

						const byteCharacters = atob(base64Data)
						const byteNumbers = new Array(byteCharacters.length)
						for (let j = 0; j < byteCharacters.length; j++) {
							byteNumbers[j] = byteCharacters.charCodeAt(j)
						}
						const byteArray = new Uint8Array(byteNumbers)
						const blob = new Blob([byteArray], { type: mimeType })

						const extension = mimeType.split('/')[1] || 'jpg'
						const fileName = `image-${i + 1}.${extension}`

						formData.append('images', blob, fileName)
					}

					const uploadResult = await uploadImagesMutation(formData).unwrap()

					const uploadedUrls = uploadResult.map(img => img.url)

					// Первое изображение - это storyImage, остальные - gallery
					if (data.storyImage && data.storyImage.startsWith('data:')) {
						storyImageUrl = uploadedUrls[0]
						galleryUrls = [...galleryUrls, ...uploadedUrls.slice(1)]
					} else {
						galleryUrls = [...galleryUrls, ...uploadedUrls]
					}
				} catch (uploadError) {
					console.error('Error uploading images:', uploadError)

					const errorMessage =
						uploadError &&
						typeof uploadError === 'object' &&
						'data' in uploadError
							? (uploadError.data as { message?: string })?.message ||
							  'Не удалось загрузить изображения'
							: 'Не удалось загрузить изображения. Попробуйте еще раз.'

					toast.error(errorMessage)
					return
				}
			}

			// Обновляем данные формы с загруженными URL
			const updatedData = {
				...data,
				storyImage: storyImageUrl,
				gallery: galleryUrls,
			}

			const requestData = transformFormDataToUpdateRequest(updatedData)

			const result = await updateQuestMutation({
				id: String(questId),
				data: requestData,
			}).unwrap()

			if (result && !('error' in result)) {
				toast.success('Квест успешно обновлен!')

				if (data.latitude && data.longitude) {
					localStorage.setItem(
						'zoomToCoordinates',
						JSON.stringify({
							lat: parseFloat(data.latitude),
							lng: parseFloat(data.longitude),
							zoom: 15,
						})
					)
				}

				if (onSuccess) {
					onSuccess()
				}
			}
		} catch (error: unknown) {
			if (import.meta.env.DEV) {
				console.error('Error saving quest:', error)
			}
			const errorMessage =
				error && typeof error === 'object' && 'data' in error
					? (error.data as { message?: string })?.message ||
					  'Не удалось сохранить квест'
					: 'Не удалось сохранить квест. Попробуйте еще раз.'

			toast.error(errorMessage)
		}
	}

	const { data: citiesData = [] } = useGetCitiesQuery()

	const handleCityChange = (cityName: string) => {
		const city = citiesData.find((c: CityResponse) => c.name === cityName)
		if (city) {
			form.setValue('cityId', city.id)
		}
	}

	const handleDelete = async () => {
		if (!questId) return

		try {
			const questIdToDelete = String(questId)

			await deleteQuestMutation(questIdToDelete).unwrap()

			removeUserQuestId(questIdToDelete)

			form.reset({
				title: '',
				cityId: 0,
				organizationTypeId: 0,
				category: 'environment',
				story: '',
				storyImage: undefined,
				gallery: [],
				address: '',
				contacts: [
					{ name: 'Куратор', value: user?.name || '' },
					{ name: 'Телефон', value: '' },
				],
				latitude: '',
				longitude: '',
				stages: [
					{
						title: '',
						description: '',
						status: 'pending',
						progress: 0,
						requirementType: 'none',
						requirementValue: undefined,
						itemName: undefined,
						deadline: undefined,
					},
				],
				customAchievement: undefined,
				curatorName: user?.name || '',
				curatorPhone: '',
				curatorEmail: '',
				socials: [],
			})

			if (user?.id) {
				try {
					const updateResult = await updateUserMutation({
						userId: String(user.id),
						data: { questId: null as unknown as number },
					}).unwrap()

					if (updateResult && setUser) {
						const updatedUser = transformUserFromAPI(updateResult)
						setUser(updatedUser)
					}
				} catch (updateError) {
					if (import.meta.env.DEV) {
						console.error(
							'Error updating user after quest deletion:',
							updateError
						)
					}
				}
			}
		} catch (error: unknown) {
			if (import.meta.env.DEV) {
				console.error('Error deleting quest:', error)
			}

			const errorMessage =
				error && typeof error === 'object' && 'data' in error
					? (error.data as { message?: string })?.message ||
					  'Не удалось удалить квест'
					: 'Не удалось удалить квест. Попробуйте еще раз.'

			toast.error(errorMessage)
			throw error
		}
	}

	const handleSubmit = (e?: React.BaseSyntheticEvent) => {
		return form.handleSubmit(onSubmit, errors => {
			if (import.meta.env.DEV) {
				console.error('Form validation errors:', errors)
			}
			const firstError = Object.values(errors)[0]
			if (firstError && 'message' in firstError) {
				toast.error(String(firstError.message))
			} else {
				toast.error('Пожалуйста, заполните все обязательные поля')
			}
		})(e)
	}

	const isSubmitting =
		isUpdating ||
		isDeleting ||
		isUploadingImages ||
		form.formState.isSubmitting

	return {
		form,
		isSubmitting,
		isLoadingQuest,
		onSubmit: handleSubmit,
		handleCityChange,
		handleDelete,
	}
}

