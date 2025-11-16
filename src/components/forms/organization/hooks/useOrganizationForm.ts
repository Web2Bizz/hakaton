import type { Organization } from '@/components/map/types/types'
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
import type React from 'react'
import { useEffect, useState } from 'react'
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

	// Локальное состояние для отслеживания режима редактирования
	// Это нужно, чтобы принудительно выйти из режима редактирования после удаления
	const [forceEditMode, setForceEditMode] = useState<boolean | null>(null)

	// Загружаем организацию из API если есть ID
	const { data: organizationResponse, isLoading: isLoadingOrganization } =
		useGetOrganizationQuery(existingOrgId || '', {
			skip: !existingOrgId,
		})

	// RTK Query может возвращать данные напрямую как Organization, а не как OrganizationResponse
	// Используем type assertion для корректной типизации
	const existingOrg = (organizationResponse as unknown as Organization) || null

	// Определяем режим редактирования: если forceEditMode установлен явно, используем его,
	// иначе проверяем наличие организации (проверяем и existingOrgId, и existingOrg)
	const isEditMode = forceEditMode ?? !!(existingOrgId && existingOrg)

	// Синхронизируем forceEditMode с фактическим состоянием организации
	useEffect(() => {
		// Если forceEditMode не установлен явно, синхронизируем с наличием организации
		// Проверяем и existingOrgId, и existingOrg для надежности
		if (forceEditMode === null) {
			const shouldBeEditMode = !!(existingOrgId && existingOrg)
			setForceEditMode(shouldBeEditMode)
		} else if (forceEditMode === false && existingOrgId && existingOrg) {
			// Если forceEditMode был принудительно установлен в false, но организация все еще существует,
			// это означает, что удаление не завершилось или произошла ошибка
			// В этом случае возвращаемся к автоматической синхронизации
			setForceEditMode(null)
		}
	}, [existingOrg, existingOrgId, forceEditMode])

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
			// Получаем organizationTypeId из organizationTypes массива или из type (если есть в ответе API)
			const organizationTypeId =
				existingOrg.organizationTypes?.[0]?.id ||
				(existingOrg as Organization & { type?: { id: number } }).type?.id ||
				0

			// Загружаем все контакты динамически
			// Если контактов нет, создаем базовые (телефон и email)
			let contactsToLoad: Array<{ name: string; value: string }> = []

			if (existingOrg.contacts && existingOrg.contacts.length > 0) {
				// Загружаем все контакты из API
				contactsToLoad = existingOrg.contacts.map(contact => ({
					name: contact.name || '',
					value: contact.value || '',
				}))
			} else {
				// Если контактов нет, создаем базовые
				contactsToLoad = [
					{ name: 'Телефон', value: '' },
					...(user?.email ? [{ name: 'Email', value: user.email }] : []),
				]
			}

			form.reset({
				name: existingOrg.name || '',
				cityId: existingOrg.city.id || 0,
				organizationTypeId: organizationTypeId,
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
				contacts: contactsToLoad,
				latitude: existingOrg.latitude.toString() || '',
				longitude: existingOrg.longitude.toString() || '',
				gallery: existingOrg.gallery || [],
			})
		}
	}, [existingOrg, user?.email, form, isLoadingOrganization])

	const onSubmit = async (data: OrganizationFormData) => {
		console.log('=== onSubmit called ===')
		console.log('Form data:', data)
		console.log('Is edit mode:', isEditMode)
		console.log('Existing org ID:', existingOrgId)

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
			// Обрабатываем изображения: разделяем на URL (с сервера) и base64 (новые)
			let imageUrls: string[] = []
			const newImages: string[] = [] // base64 изображения для загрузки

			if (data.gallery && data.gallery.length > 0) {
				console.log('Processing images:', {
					count: data.gallery.length,
					images: data.gallery.map((img, idx) => ({
						index: idx + 1,
						type: typeof img,
						length: typeof img === 'string' ? img.length : 0,
						preview:
							typeof img === 'string' ? img.substring(0, 50) + '...' : img,
						isUrl:
							typeof img === 'string' &&
							(img.startsWith('http://') || img.startsWith('https://')),
						isDataUrl: typeof img === 'string' && img.startsWith('data:'),
						isBase64:
							typeof img === 'string' &&
							!img.startsWith('http') &&
							!img.startsWith('data:') &&
							img.length > 100,
					})),
				})

				// Разделяем изображения на URL и base64
				for (let i = 0; i < data.gallery.length; i++) {
					const image = data.gallery[i]

					if (typeof image !== 'string') {
						console.warn(`Image ${i + 1} is not a string:`, typeof image)
						continue
					}

					// Проверяем, является ли изображение URL (начинается с http:// или https://)
					if (image.startsWith('http://') || image.startsWith('https://')) {
						// Это URL с сервера - просто добавляем в список
						imageUrls.push(image)
						console.log(
							`Image ${i + 1} is URL:`,
							image.substring(0, 50) + '...'
						)
					} else if (image.startsWith('data:')) {
						// Это base64 изображение с префиксом data: - нужно загрузить
						newImages.push(image)
						console.log(
							`Image ${i + 1} is base64 (data:), will upload, length:`,
							image.length
						)
					} else if (image.length > 100 && /^[A-Za-z0-9+/=]+$/.test(image)) {
						// Это может быть base64 без префикса data: - добавляем префикс и загружаем
						// Определяем MIME type по первым символам или используем image/jpeg по умолчанию
						const base64WithPrefix = `data:image/jpeg;base64,${image}`
						newImages.push(base64WithPrefix)
						console.log(
							`Image ${i + 1} is base64 (without prefix), will upload, length:`,
							image.length
						)
					} else {
						console.warn(`Image ${i + 1} has unknown format:`, {
							length: image.length,
							preview: image.substring(0, 50),
							isBase64Like: /^[A-Za-z0-9+/=]+$/.test(image),
						})
					}
				}

				console.log('Images classification:', {
					urls: imageUrls.length,
					newImages: newImages.length,
					total: data.gallery.length,
				})

				// Загружаем только новые base64 изображения
				if (newImages.length > 0) {
					console.log(`Uploading ${newImages.length} new images...`)
					try {
						// Конвертируем base64 строки в Blob и создаем FormData
						const formData = new FormData()

						for (let i = 0; i < newImages.length; i++) {
							const base64String = newImages[i]

							// Извлекаем MIME type и данные из base64 строки
							const matches = base64String.match(
								/^data:([A-Za-z-+/]+);base64,(.+)$/
							)
							if (!matches || matches.length !== 3) {
								console.error(`Invalid base64 format for image ${i + 1}:`, {
									preview: base64String.substring(0, 100),
									hasDataPrefix: base64String.startsWith('data:'),
								})
								throw new Error(`Неверный формат base64 изображения ${i + 1}`)
							}

							const mimeType = matches[1]
							const base64Data = matches[2]

							console.log(`Processing image ${i + 1}:`, {
								mimeType,
								base64Length: base64Data.length,
							})

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
							console.log(
								`Added image ${i + 1} to FormData:`,
								fileName,
								`(${blob.size} bytes)`
							)
						}

						console.log('Uploading FormData with', newImages.length, 'images')
						const uploadResult = await uploadImagesMutation(formData).unwrap()
						console.log('Upload result:', uploadResult)

						// Добавляем загруженные URL к существующим
						const uploadedUrls = uploadResult.map(img => img.url)
						imageUrls = [...imageUrls, ...uploadedUrls]

						console.log('New images uploaded, URLs:', uploadedUrls)
						console.log('All image URLs:', imageUrls)
					} catch (uploadError) {
						console.error('Error uploading images:', uploadError)
						if (
							uploadError &&
							typeof uploadError === 'object' &&
							'data' in uploadError
						) {
							console.error('Upload error details:', uploadError.data)
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
				} else {
					console.log(
						'No new images to upload, using existing URLs:',
						imageUrls
					)
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
				console.log('Is edit mode:', isEditMode)
			}

			if (isEditMode && existingOrgId) {
				// Обновление существующей организации
				console.log('=== Updating organization ===')
				console.log('Organization ID:', existingOrgId)
				console.log('Request data:', requestData)

				const result = await updateOrgMutation({
					organizationId: String(existingOrgId),
					data: requestData,
				}).unwrap()

				console.log('=== Update result from server ===')
				console.log('Full result:', result)
				console.log('Result type:', typeof result)
				console.log('Result keys:', result ? Object.keys(result) : 'null')

				// Проверяем успешность запроса - если нет ошибки, значит успешно
				if (result && !('error' in result)) {
					// Извлекаем организацию из результата
					const updatedOrganization =
						(result as { data?: { organization?: unknown } })?.data
							?.organization ||
						(result as { organization?: unknown })?.organization ||
						result

					console.log('=== Updated organization from server ===')
					console.log('Updated organization:', updatedOrganization)
					console.log('Organization type:', typeof updatedOrganization)
					if (updatedOrganization && typeof updatedOrganization === 'object') {
						console.log('Organization keys:', Object.keys(updatedOrganization))
						console.log(
							'Organization ID:',
							(updatedOrganization as { id?: unknown })?.id
						)
						console.log(
							'Organization name:',
							(updatedOrganization as { name?: unknown })?.name
						)
						console.log(
							'Organization helpTypes:',
							(updatedOrganization as { helpTypes?: unknown })?.helpTypes
						)
						console.log(
							'Organization gallery:',
							(updatedOrganization as { gallery?: unknown })?.gallery
						)
					}

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

				// Сбрасываем forceEditMode, чтобы он снова синхронизировался с фактическим состоянием
				setForceEditMode(null)

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
			const orgIdToDelete = String(existingOrgId)

			// Удаляем организацию через API
			await deleteOrgMutation(orgIdToDelete).unwrap()

			// Сначала удаляем ID организации из контекста пользователя и localStorage
			// Это нужно сделать до обновления пользователя на сервере, чтобы isEditMode стал false
			removeUserOrganizationId(orgIdToDelete)

			// Принудительно выходим из режима редактирования
			// После удаления existingOrgId станет undefined, и блок удаления исчезнет
			setForceEditMode(false)

			// Сбрасываем форму с дефолтными значениями
			form.reset({
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
			})

			// Обновляем пользователя на сервере, устанавливая organisationId в null
			if (user?.id) {
				try {
					const updateResult = await updateUserMutation({
						userId: String(user.id),
						data: { organisationId: null },
					}).unwrap()

					// Обновляем локальное состояние пользователя с данными из API
					if (updateResult && setUser) {
						const updatedUser = transformUserFromAPI(updateResult)
						setUser(updatedUser)

						if (import.meta.env.DEV) {
							console.log(
								'User updated after organization deletion. organisationId:',
								updatedUser.createdOrganizationId
							)
						}
					}
				} catch (updateError) {
					if (import.meta.env.DEV) {
						console.error(
							'Error updating user after organization deletion:',
							updateError
						)
					}
					// Не блокируем процесс, если обновление пользователя не удалось
					// Все равно удаляем из локального состояния
				}
			}

			toast.success('Организация успешно удалена.')
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

	const handleSubmit = (e?: React.BaseSyntheticEvent) => {
		console.log('=== handleSubmit called ===')
		console.log('Event:', e)
		console.log('Form state before submit:', {
			isDirty: form.formState.isDirty,
			isValid: form.formState.isValid,
			errors: form.formState.errors,
			values: form.getValues(),
		})

		return form.handleSubmit(onSubmit, errors => {
			console.log('=== Form validation errors ===')
			console.log('Errors:', errors)
			console.log('Form values:', form.getValues())
			console.log('Form state:', {
				isDirty: form.formState.isDirty,
				isValid: form.formState.isValid,
				errors: form.formState.errors,
			})
			// Показываем первую ошибку валидации
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
		isLoadingOrganization,
		onSubmit: handleSubmit,
		handleCityChange,
		handleDelete,
	}
}
