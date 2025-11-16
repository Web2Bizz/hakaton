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

	const [forceEditMode, setForceEditMode] = useState<boolean | null>(null)

	const { data: organizationResponse, isLoading: isLoadingOrganization } =
		useGetOrganizationQuery(existingOrgId || '', {
			skip: !existingOrgId,
		})

	const existingOrg = (organizationResponse as unknown as Organization) || null

	const isEditMode = forceEditMode ?? !!(existingOrgId && existingOrg)

	useEffect(() => {
		if (forceEditMode === null) {
			const shouldBeEditMode = !!(existingOrgId && existingOrg)
			setForceEditMode(shouldBeEditMode)
		} else if (forceEditMode === false && existingOrgId && existingOrg) {
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

	useEffect(() => {
		if (existingOrg && !form.formState.isDirty && !isLoadingOrganization) {
			const organizationTypeId =
				existingOrg.organizationTypes?.[0]?.id ||
				(existingOrg as Organization & { type?: { id: number } }).type?.id ||
				0

			let contactsToLoad: Array<{ name: string; value: string }> = []

			if (existingOrg.contacts && existingOrg.contacts.length > 0) {
				contactsToLoad = existingOrg.contacts.map(contact => ({
					name: contact.name || '',
					value: contact.value || '',
				}))
			} else {
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
			let imageUrls: string[] = []
			const newImages: string[] = []

			if (data.gallery && data.gallery.length > 0) {
				for (let i = 0; i < data.gallery.length; i++) {
					const image = data.gallery[i]

					if (typeof image !== 'string') {
						console.warn(`Image ${i + 1} is not a string:`, typeof image)
						continue
					}

					if (image.startsWith('http://') || image.startsWith('https://')) {
						imageUrls.push(image)
					} else if (image.startsWith('data:')) {
						newImages.push(image)
					} else if (image.length > 100 && /^[A-Za-z0-9+/=]+$/.test(image)) {
						const base64WithPrefix = `data:image/jpeg;base64,${image}`
						newImages.push(base64WithPrefix)
					} else {
						console.warn(`Image ${i + 1} has unknown format:`, {
							length: image.length,
							preview: image.substring(0, 50),
							isBase64Like: /^[A-Za-z0-9+/=]+$/.test(image),
						})
					}
				}

				if (newImages.length > 0) {
					try {
						const formData = new FormData()

						for (let i = 0; i < newImages.length; i++) {
							const base64String = newImages[i]

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
						imageUrls = [...imageUrls, ...uploadedUrls]
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
				}
			}

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

			if (isEditMode && existingOrgId) {
				const result = await updateOrgMutation({
					organizationId: String(existingOrgId),
					data: requestData,
				}).unwrap()

				if (result && !('error' in result)) {
					toast.success('Организация успешно обновлена!')

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
				const result = await createOrgMutation(
					requestData as CreateOrganizationRequest
				).unwrap()

				if (!result) {
					throw new Error('Организация не была создана')
				}

				const createdOrganization = result
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const organizationId = (createdOrganization as any).id
				const organizationIdString = String(organizationId)

				toast.success('Организация успешно создана!')

				if (!user?.id) {
					throw new Error('ID пользователя не найден')
				}

				try {
					const organisationIdValue =
						typeof organizationId === 'number'
							? organizationId
							: organizationIdString

					const updateResult = await updateUserMutation({
						userId: String(user.id),
						data: { organisationId: organisationIdValue },
					}).unwrap()

					if (updateResult && setUser) {
						const updatedUser = transformUserFromAPI(updateResult)
						setUser(updatedUser)
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

				setUserOrganizationId(organizationIdString)
				setForceEditMode(null)

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

			await deleteOrgMutation(orgIdToDelete).unwrap()

			removeUserOrganizationId(orgIdToDelete)
			setForceEditMode(false)

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

			if (user?.id) {
				try {
					const updateResult = await updateUserMutation({
						userId: String(user.id),
						data: { organisationId: null },
					}).unwrap()

					if (updateResult && setUser) {
						const updatedUser = transformUserFromAPI(updateResult)
						setUser(updatedUser)
					}
				} catch (updateError) {
					if (import.meta.env.DEV) {
						console.error(
							'Error updating user after organization deletion:',
							updateError
						)
					}
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
		return form.handleSubmit(onSubmit, errors => {
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
