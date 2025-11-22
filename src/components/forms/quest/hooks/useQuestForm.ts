import { MAX_QUESTS_PER_USER } from '@/constants'
import { useUser } from '@/hooks/useUser'
import {
	useCreateAchievementMutation,
	useDeleteAchievementMutation,
	useUpdateAchievementMutation,
} from '@/store/entities/achievement'
import {
	useCreateQuestMutation,
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
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
	questFormSchema,
	type QuestFormData,
} from '../schemas/quest-form.schema'
import {
	transformApiResponseToFormData,
	transformFormDataToCreateRequest,
	transformFormDataToUpdateRequest,
} from '../utils/questTransformers'

export function useQuestForm(
	onSuccess?: (questId: string) => void,
	disableEditMode?: boolean
) {
	const {
		user,
		setUser,
		createQuest: setUserQuestId,
		canCreateQuest,
		deleteQuest: removeUserQuestId,
		getUserQuest: getUserQuestId,
	} = useUser()

	const existingQuestId = disableEditMode ? null : getUserQuestId()

	const [forceEditMode, setForceEditMode] = useState<boolean | null>(null)

	const { data: questResponse, isLoading: isLoadingQuest } = useGetQuestQuery(
		existingQuestId || '',
		{
			skip: !existingQuestId || disableEditMode === true,
		}
	)

	const { data: cities = [] } = useGetCitiesQuery()
	const { data: organizationTypes = [] } = useGetOrganizationTypesQuery()

	const existingQuest = questResponse || null

	const isEditMode = disableEditMode
		? false
		: forceEditMode ?? !!(existingQuestId && existingQuest)

	useEffect(() => {
		if (disableEditMode) {
			setForceEditMode(false)
			return
		}
		if (forceEditMode === null) {
			const shouldBeEditMode = !!(existingQuestId && existingQuest)
			setForceEditMode(shouldBeEditMode)
		} else if (forceEditMode === false && existingQuest) {
			setForceEditMode(null)
		}
	}, [existingQuest, existingQuestId, forceEditMode, disableEditMode])

	const [createQuestMutation, { isLoading: isCreating }] =
		useCreateQuestMutation()
	const [updateQuestMutation, { isLoading: isUpdating }] =
		useUpdateQuestMutation()
	const [deleteQuestMutation, { isLoading: isDeleting }] =
		useDeleteQuestMutation()
	const [uploadImagesMutation, { isLoading: isUploadingImages }] =
		useUploadImagesMutation()
	const [updateUserMutation] = useUpdateUserMutation()
	const [createAchievementMutation] = useCreateAchievementMutation()
	const [updateAchievementMutation] = useUpdateAchievementMutation()
	const [deleteAchievementMutation] = useDeleteAchievementMutation()

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
		if (
			!disableEditMode &&
			questResponse &&
			!form.formState.isDirty &&
			!isLoadingQuest
		) {
			const formData = transformApiResponseToFormData(questResponse)
			form.reset(formData as QuestFormData)

			// Синхронизируем поля куратора после загрузки данных
			const contacts = formData.contacts || []
			const curatorContact = contacts.find(
				c => c && (c.name === 'Куратор' || c.name?.toLowerCase() === 'куратор')
			)
			const phoneContact = contacts.find(
				c => c && (c.name === 'Телефон' || c.name?.toLowerCase() === 'телефон')
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
	}, [questResponse, cities, organizationTypes, form, isLoadingQuest, disableEditMode])

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
		if (!isEditMode && !canCreateQuest()) {
			const questWord = MAX_QUESTS_PER_USER === 1 ? 'квест' : 'квестов'
			toast.error(
				`Вы уже создали максимальное количество квестов. Один пользователь может создать максимум ${MAX_QUESTS_PER_USER} ${questWord}.`
			)
			return
		}

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

			// Обрабатываем achievement
			let achievementId: number | undefined = data.achievementId || undefined
			
			if (data.customAchievement) {
				// Если есть customAchievement
				if (data.achievementId) {
					// Обновляем существующее achievement
					try {
						const updateResult = await updateAchievementMutation({
							id: data.achievementId,
							data: {
								title: data.customAchievement.title,
								description: data.customAchievement.description,
								icon: data.customAchievement.icon,
								rarity: 'common', // По умолчанию common для пользовательских достижений
							},
						}).unwrap()
						achievementId = updateResult.id
						console.log('Achievement updated:', updateResult)
					} catch (error) {
						console.error('Error updating achievement:', error)
						toast.error('Не удалось обновить достижение')
						return
					}
				} else {
					// Создаем новое achievement
					try {
						const createResult = await createAchievementMutation({
							title: data.customAchievement.title,
							description: data.customAchievement.description,
							icon: data.customAchievement.icon,
							rarity: 'common', // По умолчанию common для пользовательских достижений
						}).unwrap()
						console.log('Achievement created:', createResult)
						// API возвращает объект с полем id
						achievementId = createResult.id
						console.log('Achievement ID:', achievementId)
					} catch (error) {
						console.error('Error creating achievement:', error)
						if (import.meta.env.DEV) {
							console.error('Full error:', error)
						}
						toast.error('Не удалось создать достижение')
						return
					}
				}
			} else if (data.achievementId && !data.customAchievement) {
				// Если achievementId есть, но customAchievement удалено - удаляем achievement
				try {
					await deleteAchievementMutation(data.achievementId).unwrap()
					achievementId = undefined
				} catch (error) {
					console.error('Error deleting achievement:', error)
					// Не прерываем процесс, просто логируем ошибку
				}
			}

			// Обновляем данные формы с загруженными URL и achievementId
			const updatedData = {
				...data,
				storyImage: storyImageUrl,
				gallery: galleryUrls,
				achievementId,
			}
			
			console.log('Updated data with achievementId:', updatedData.achievementId)

			if (isEditMode && existingQuestId) {
				const requestData = transformFormDataToUpdateRequest(updatedData)
				console.log('Update request data:', requestData)

				const result = await updateQuestMutation({
					id: String(existingQuestId),
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

					if (result.data?.quest && onSuccess) {
						onSuccess(String(result.data.quest.id))
					}
				}
			} else {
				const requestData = transformFormDataToCreateRequest(updatedData)
				console.log('Create request data:', requestData)
				console.log('AchievementId in request:', requestData.achievementId)

				const result = await createQuestMutation(requestData).unwrap()

				if (!result) {
					throw new Error('Квест не был создан')
				}

				const createdQuest = result
				if (!createdQuest) {
					throw new Error('Квест не был создан')
				}
				// @ts-expect-error - quest id is not defined in the result type
				const questId = String(createdQuest.id)

				toast.success('Квест успешно создан!')

				if (!user?.id) {
					throw new Error('ID пользователя не найден')
				}

				try {
					const questIdNumber = Number(questId)
					const updateResult = await updateUserMutation({
						userId: String(user.id),
						data: { questId: questIdNumber },
					}).unwrap()

					if (updateResult && setUser) {
						const updatedUser = transformUserFromAPI(updateResult)
						setUser(updatedUser)
					}
				} catch (error) {
					if (import.meta.env.DEV) {
						console.error('Error updating user questId:', error)
						if (error && typeof error === 'object' && 'data' in error) {
							console.error('Error details:', error.data)
						}
					}
					toast.error('Не удалось обновить ID квеста у пользователя')
				}

				setUserQuestId(questId)
				setForceEditMode(null)

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
					onSuccess(questId)
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
		if (!existingQuestId) return

		try {
			const questIdToDelete = String(existingQuestId)

			await deleteQuestMutation(questIdToDelete).unwrap()

			removeUserQuestId(questIdToDelete)
			setForceEditMode(false)

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
					},
				],
				customAchievement: undefined,
				achievementId: undefined,
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

			toast.success('Квест успешно удален.')
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
		isCreating ||
		isUpdating ||
		isDeleting ||
		isUploadingImages ||
		form.formState.isSubmitting

	return {
		form,
		isSubmitting,
		isEditMode,
		isLoadingQuest,
		onSubmit: handleSubmit,
		handleCityChange,
		handleDelete,
		questId: existingQuest?.id,
	}
}
