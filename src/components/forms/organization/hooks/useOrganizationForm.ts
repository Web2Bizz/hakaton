import { useUser } from '@/hooks/useUser'
import { useUpdateUserMutation } from '@/store/entities'
import {
	useCreateOrganizationMutation,
	useDeleteOrganizationMutation,
	useGetCitiesQuery,
	useGetOrganizationQuery,
	useUpdateOrganizationMutation,
	useUploadImagesMutation,
	type CityResponse,
	type CreateOrganizationRequest,
	type UpdateOrganizationRequest,
} from '@/store/entities/organization'
import { transformUserFromAPI } from '@/utils/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
	organizationFormSchema,
	type OrganizationFormData,
} from '../schemas/organization-form.schema'

export function useOrganizationForm(
	onSuccess?: (organizationId: string) => void
) {
	const {
		user,
		setUser,
		createOrganization: setUserOrganizationId,
		canCreateOrganization,
		deleteOrganization: removeUserOrganizationId,
		getUserOrganization: getUserOrgId,
	} = useUser()

	const existingOrgId = getUserOrgId()

	// Загружаем организацию из API если есть ID
	const { data: organizationResponse, isLoading: isLoadingOrganization } =
		useGetOrganizationQuery(existingOrgId || '', {
			skip: !existingOrgId,
		})

	const existingOrg = organizationResponse?.data?.organization || null
	const isEditMode = !!existingOrg

	const [createOrgMutation, { isLoading: isCreating }] =
		useCreateOrganizationMutation()
	const [updateOrgMutation, { isLoading: isUpdating }] =
		useUpdateOrganizationMutation()
	const [deleteOrgMutation, { isLoading: isDeleting }] =
		useDeleteOrganizationMutation()
	const [uploadImagesMutation, { isLoading: isUploadingImages }] =
		useUploadImagesMutation()
	const [updateUserMutation] = useUpdateUserMutation()

	const form = useForm<OrganizationFormData>({
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		resolver: zodResolver(organizationFormSchema) as any,
		defaultValues: {
			name: '',
			cityId: 0,
			organizationTypeId: 0,
			helpTypeIds: [],
			summary: '',
			description: '',
			mission: '',
			goals: [''],
			needs: [''],
			address: '',
			contacts: [
				{ name: 'Телефон', value: '' },
				...(user?.email ? [{ name: 'Email', value: user.email }] : []),
			],
			latitude: '',
			longitude: '',
			gallery: [],
		},
		mode: 'onChange',
	})

	// Загружаем данные существующей организации при редактировании
	useEffect(() => {
		if (existingOrg && !form.formState.isDirty && !isLoadingOrganization) {
			const phoneContact = existingOrg.contacts.find(c => c.name === 'Телефон')
			const emailContact = existingOrg.contacts.find(c => c.name === 'Email')

			form.reset({
				name: existingOrg.name || '',
				cityId: existingOrg.city.id || 0,
				organizationTypeId: existingOrg.organizationTypes[0]?.id || 0,
				helpTypeIds: existingOrg.helpTypes.map(ht => ht.id),
				summary: existingOrg.summary || '',
				description: existingOrg.description || '',
				mission: existingOrg.mission || '',
				goals:
					existingOrg.goals && existingOrg.goals.length > 0
						? existingOrg.goals
						: [''],
				needs:
					existingOrg.needs && existingOrg.needs.length > 0
						? existingOrg.needs
						: [''],
				address: existingOrg.address || '',
				contacts: [
					...(phoneContact ? [phoneContact] : [{ name: 'Телефон', value: '' }]),
					...(emailContact
						? [emailContact]
						: user?.email
						? [{ name: 'Email', value: user.email }]
						: []),
				],
				latitude: existingOrg.latitude || '',
				longitude: existingOrg.longitude || '',
				gallery: existingOrg.gallery || [],
			})
		}
	}, [existingOrg, user?.email, form, isLoadingOrganization])

	const onSubmit = async (data: OrganizationFormData) => {
		if (!isEditMode && !canCreateOrganization()) {
			toast.error(
				'Вы уже создали организацию. Один пользователь может создать только одну организацию.'
			)
			return
		}

		if (!data.latitude || !data.longitude) {
			toast.error('Пожалуйста, выберите местоположение на карте.')
			return
		}

		try {
			// Сначала загружаем изображения, если они есть
			let imageUrls: string[] = []
			if (data.gallery && data.gallery.length > 0) {
				if (import.meta.env.DEV) {
					console.log('Uploading images:', data.gallery.length)
				}

				try {
					// Конвертируем base64 строки в Blob и создаем FormData
					const formData = new FormData()

					for (let i = 0; i < data.gallery.length; i++) {
						const base64String = data.gallery[i]

						// Извлекаем MIME type и данные из base64 строки
						const matches = base64String.match(
							/^data:([A-Za-z-+/]+);base64,(.+)$/
						)
						if (!matches || matches.length !== 3) {
							throw new Error(`Неверный формат base64 изображения ${i + 1}`)
						}

						const mimeType = matches[1]
						const base64Data = matches[2]

						// Конвертируем base64 в бинарные данные
						const byteCharacters = atob(base64Data)
						const byteNumbers = new Array(byteCharacters.length)
						for (let j = 0; j < byteCharacters.length; j++) {
							byteNumbers[j] = byteCharacters.charCodeAt(j)
						}
						const byteArray = new Uint8Array(byteNumbers)
						const blob = new Blob([byteArray], { type: mimeType })

						// Определяем расширение файла из MIME type
						const extension = mimeType.split('/')[1] || 'jpg'
						const fileName = `image-${i + 1}.${extension}`

						// Добавляем файл в FormData
						formData.append('images', blob, fileName)
					}

					const uploadResult = await uploadImagesMutation(formData).unwrap()

					imageUrls = uploadResult.map(img => img.url)

					if (import.meta.env.DEV) {
						console.log('Images uploaded, URLs:', imageUrls)
					}
				} catch (uploadError) {
					if (import.meta.env.DEV) {
						console.error('Error uploading images:', uploadError)
					}

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

			// Подготавливаем данные для API
			const requestData: CreateOrganizationRequest | UpdateOrganizationRequest =
				{
					name: data.name,
					latitude: Number.parseFloat(data.latitude),
					longitude: Number.parseFloat(data.longitude),
					summary: data.summary,
					mission: data.mission,
					description: data.description,
					goals: data.goals.filter(g => g.trim() !== ''),
					needs: data.needs.filter(n => n.trim() !== ''),
					address: data.address,
					contacts: data.contacts.filter(c => c.value.trim() !== ''),
					typeId: data.organizationTypeId,
					helpTypeIds: data.helpTypeIds.map(id => id as number),
					cityId: data.cityId,
					gallery: imageUrls.length > 0 ? imageUrls : undefined,
				}

			if (import.meta.env.DEV) {
				console.log('Request data:', requestData)
				console.log('Request data gallery:', requestData.gallery)
			}
			if (isEditMode && existingOrgId) {
				// Обновление существующей организации
				const result = await updateOrgMutation({
					organizationId: String(existingOrgId),
					data: requestData,
				}).unwrap()

				// Проверяем успешность запроса - если нет ошибки, значит успешно
				if (result && !('error' in result)) {
					toast.success('Организация успешно обновлена!')

					// Сохраняем координаты для зума на карте
					if (data.latitude && data.longitude) {
						localStorage.setItem(
							'zoomToCoordinates',
							JSON.stringify({
								lat: Number.parseFloat(data.latitude),
								lng: Number.parseFloat(data.longitude),
								zoom: 15,
							})
						)
					}

					if (result.data?.organization && onSuccess) {
						onSuccess(String(result.data.organization.id))
					}
				}
			} else {
				// Создание новой организации
				const result = await createOrgMutation(
					requestData as CreateOrganizationRequest
				).unwrap()
				console.log(result)
				// Берем ID организации из ответа
				if (!result) {
					throw new Error('Организация не была создана')
				}

				const createdOrganization = result
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const organizationId = (createdOrganization as any).id
				const organizationIdString = String(organizationId)

				toast.success('Организация успешно создана!')

				// Обновляем organisationId пользователя через API
				if (!user?.id) {
					throw new Error('ID пользователя не найден')
				}

				try {
					if (import.meta.env.DEV) {
						console.log('Updating user with organisationId:', {
							userId: user.id,
							organizationId,
							organizationIdType: typeof organizationId,
						})
					}

					// Передаем ID организации (как число, если это число, иначе как строку)
					const organisationIdValue =
						typeof organizationId === 'number'
							? organizationId
							: organizationIdString

					// Обновляем пользователя через PATCH /api/v1/users/{id}
					const updateResult = await updateUserMutation({
						userId: String(user.id),
						data: { organisationId: organisationIdValue },
					}).unwrap()

					if (import.meta.env.DEV) {
						console.log('User updated successfully:', updateResult)
					}

					// Обновляем локальное состояние пользователя с данными из API
					if (updateResult && setUser) {
						const updatedUser = transformUserFromAPI(updateResult)
						setUser(updatedUser)

						if (import.meta.env.DEV) {
							console.log(
								'Local user state updated. organisationId:',
								updatedUser.createdOrganizationId
							)
						}
					}
				} catch (error) {
					if (import.meta.env.DEV) {
						console.error('Error updating user organisationId:', error)
						if (error && typeof error === 'object' && 'data' in error) {
							console.error('Error details:', error.data)
						}
					}
					// Показываем ошибку, но не блокируем процесс полностью
					toast.error('Не удалось обновить ID организации у пользователя')
				}

				// Сохраняем ID организации в контексте пользователя (для обратной совместимости)
				setUserOrganizationId(organizationIdString)

				// Сохраняем координаты для зума на карте
				if (data.latitude && data.longitude) {
					localStorage.setItem(
						'zoomToCoordinates',
						JSON.stringify({
							lat: Number.parseFloat(data.latitude),
							lng: Number.parseFloat(data.longitude),
							zoom: 15,
						})
					)
				}

				if (onSuccess) {
					onSuccess(organizationIdString)
				}
			}
		} catch (error: unknown) {
			if (import.meta.env.DEV) {
				console.error('Error saving organization:', error)
			}

			console.log(error)
			const errorMessage =
				error && typeof error === 'object' && 'data' in error
					? (error.data as { message?: string })?.message ||
					  'Не удалось сохранить организацию'
					: 'Не удалось сохранить организацию. Попробуйте еще раз.'

			toast.error(errorMessage)
		}
	}

	const { data: cities = [] } = useGetCitiesQuery()

	const handleCityChange = (cityName: string) => {
		const city = cities.find((c: CityResponse) => c.name === cityName)
		if (city) {
			form.setValue('cityId', city.id)
			// Устанавливаем координаты города для зума, но не перезаписываем координаты организации
			// Координаты организации должны устанавливаться через карту
		}
	}

	const handleDelete = async () => {
		if (!existingOrgId) return

		try {
			await deleteOrgMutation(String(existingOrgId)).unwrap()

			// Удаляем ID организации из контекста пользователя
			removeUserOrganizationId(String(existingOrgId))

			toast.success('Организация успешно удалена.')
			form.reset()
		} catch (error: unknown) {
			if (import.meta.env.DEV) {
				console.error('Error deleting organization:', error)
			}

			const errorMessage =
				error && typeof error === 'object' && 'data' in error
					? (error.data as { message?: string })?.message ||
					  'Не удалось удалить организацию'
					: 'Не удалось удалить организацию. Попробуйте еще раз.'

			toast.error(errorMessage)
		}
	}

	const handleSubmit = form.handleSubmit(onSubmit)

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
		isLoadingOrganization,
		onSubmit: handleSubmit,
		handleCityChange,
		handleDelete,
	}
}
