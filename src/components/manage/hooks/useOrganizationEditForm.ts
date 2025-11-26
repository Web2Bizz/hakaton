import {
	organizationFormSchema,
	type OrganizationFormData,
} from '@/components/forms/organization/schemas/organization-form.schema'
import type { Organization } from '@/components/map/types/types'
import { useUser } from '@/hooks/useUser'
import { useGetCitiesQuery } from '@/store/entities/city'
import type { CityResponse } from '@/store/entities/city'
import {
	useDeleteOrganizationMutation,
	useGetOrganizationQuery,
	useUpdateOrganizationMutation,
} from '@/store/entities/organization'
import { useUploadImagesMutation } from '@/store/entities/upload'
import { getErrorMessage } from '@/utils/error'
import { logger } from '@/utils/logger'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

export function useOrganizationEditForm(
	organizationId: string,
	onSuccess?: () => void
) {
	const { user, deleteOrganization: removeUserOrganizationId } = useUser()

	const { data: organizationResponse, isLoading: isLoadingOrganization } =
		useGetOrganizationQuery(organizationId, {
			skip: !organizationId,
		})

	const { data: cities = [] } = useGetCitiesQuery()

	const [updateOrgMutation, { isLoading: isUpdating }] =
		useUpdateOrganizationMutation()
	const [deleteOrgMutation, { isLoading: isDeleting }] =
		useDeleteOrganizationMutation()
	const [uploadImagesMutation, { isLoading: isUploadingImages }] =
		useUploadImagesMutation()

	const existingOrg = (organizationResponse as unknown as Organization) || null

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

	// Загружаем данные существующей организации для редактирования
	useEffect(() => {
		if (existingOrg && !isLoadingOrganization) {
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

			// Обрабатываем goals и needs - если они пустые или undefined, устанавливаем массив с одной пустой строкой
			const goalsToLoad =
				existingOrg.goals && Array.isArray(existingOrg.goals) && existingOrg.goals.length > 0
					? existingOrg.goals.filter(g => g && g.trim() !== '')
					: ['']
			
			const needsToLoad =
				existingOrg.needs && Array.isArray(existingOrg.needs) && existingOrg.needs.length > 0
					? existingOrg.needs.filter(n => n && n.trim() !== '')
					: ['']

			form.reset({
				name: existingOrg.name || '',
				cityId: existingOrg.city?.id || 0,
				organizationTypeId,
				helpTypeIds:
					existingOrg.helpTypes?.map(ht => ht.id) ||
					(existingOrg as Organization & { helpTypeIds?: number[] })
						.helpTypeIds ||
					[],
				summary: existingOrg.summary || '',
				description: existingOrg.description || '',
				mission: existingOrg.mission || '',
				goals: goalsToLoad.length > 0 ? goalsToLoad : [''],
				needs: needsToLoad.length > 0 ? needsToLoad : [''],
				address: existingOrg.address || '',
				contacts: contactsToLoad,
				latitude: existingOrg.latitude?.toString() || '',
				longitude: existingOrg.longitude?.toString() || '',
				gallery: existingOrg.gallery || [],
			}, {
				keepDirty: false,
				keepErrors: false,
			})
		}
	}, [existingOrg, isLoadingOrganization, user?.email, form])

	const onSubmit = async (data: OrganizationFormData) => {
		if (!data.latitude || !data.longitude) {
			toast.error('Пожалуйста, выберите местоположение на карте.')
			return
		}

		try {
			let galleryUrls: string[] = []
			const newImages: string[] = []

			// Обрабатываем gallery
			if (data.gallery && data.gallery.length > 0) {
				for (let i = 0; i < data.gallery.length; i++) {
					const image = data.gallery[i]

					if (typeof image !== 'string') {
						logger.warn(`Image ${i + 1} is not a string:`, typeof image)
						continue
					}

					if (image.startsWith('http://') || image.startsWith('https://')) {
						galleryUrls.push(image)
					} else if (image.startsWith('data:')) {
						newImages.push(image)
					}
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
							logger.error(`Invalid base64 format for image ${i + 1}`)
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
					galleryUrls = [...galleryUrls, ...uploadedUrls]
				} catch (uploadError) {
					logger.error('Error uploading images:', uploadError)
					const errorMessage = getErrorMessage(
						uploadError,
						'Не удалось загрузить изображения. Попробуйте еще раз.'
					)
					toast.error(errorMessage)
					return
				}
			}

			const requestData = {
				name: data.name,
				cityId: data.cityId,
				typeId: data.organizationTypeId,
				helpTypeIds: data.helpTypeIds,
				summary: data.summary,
				description: data.description,
				mission: data.mission,
				goals: data.goals.filter(g => g.trim() !== ''),
				needs: data.needs.filter(n => n.trim() !== ''),
				address: data.address,
				contacts: data.contacts.filter(
					c => c.name.trim() !== '' && c.value.trim() !== ''
				),
				latitude: parseFloat(data.latitude),
				longitude: parseFloat(data.longitude),
				gallery: galleryUrls.length > 0 ? galleryUrls : undefined,
			}

			const result = await updateOrgMutation({
				organizationId: String(organizationId),
				data: requestData,
			}).unwrap()

			if (result && !('error' in result)) {
				toast.success('Организация успешно обновлена!')

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
			logger.error('Error saving organization:', error)
			const errorMessage = getErrorMessage(
				error,
				'Не удалось сохранить организацию. Попробуйте еще раз.'
			)
			toast.error(errorMessage)
		}
	}

	const handleCityChange = (cityName: string) => {
		const city = cities.find((c: CityResponse) => c.name === cityName)
		if (city) {
			form.setValue('cityId', city.id)
		}
	}

	const handleDelete = async () => {
		if (!organizationId) return

		try {
			const orgIdToDelete = String(organizationId)

			await deleteOrgMutation(orgIdToDelete).unwrap()

			removeUserOrganizationId(orgIdToDelete)

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
		} catch (error: unknown) {
			logger.error('Error deleting organization:', error)
			const errorMessage = getErrorMessage(
				error,
				'Не удалось удалить организацию. Попробуйте еще раз.'
			)
			toast.error(errorMessage)
			throw error
		}
	}

	const handleSubmit = (e?: React.BaseSyntheticEvent) => {
		return form.handleSubmit(onSubmit, errors => {
			logger.error('Form validation errors:', errors)
			const firstError = Object.values(errors)[0]
			if (firstError && 'message' in firstError) {
				toast.error(String(firstError.message))
			} else {
				toast.error('Пожалуйста, заполните все обязательные поля')
			}
		})(e)
	}

	const isSubmitting =
		isUpdating || isDeleting || isUploadingImages || form.formState.isSubmitting

	return {
		form,
		isSubmitting,
		isLoadingOrganization,
		onSubmit: handleSubmit,
		handleCityChange,
		handleDelete,
	}
}
