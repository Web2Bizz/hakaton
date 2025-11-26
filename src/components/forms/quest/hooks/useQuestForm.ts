import { useUser } from '@/hooks/useUser'
import type { CityResponse } from '@/store/entities/city'
import { useGetCitiesQuery } from '@/store/entities/city'
import { logger } from '@/utils/logger'
import { zodResolver } from '@hookform/resolvers/zod'
import type React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
	questFormSchema,
	type QuestFormData,
} from '../schemas/quest-form.schema'
import { useQuestAchievement } from './useQuestAchievement'
import { useQuestContactSync } from './useQuestContactSync'
import { useQuestImageUpload } from './useQuestImageUpload'
import { useQuestSubmission } from './useQuestSubmission'

export function useQuestForm(onSuccess?: (questId: string) => void) {
	const { user } = useUser()

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
					requirementType: 'no_required',
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

	// Синхронизация между контактами и полями куратора
	useQuestContactSync(form)

	// Хуки для обработки данных
	const { uploadImages, isUploadingImages } = useQuestImageUpload()
	const { createAchievement } = useQuestAchievement()
	const { submitQuest, isCreating } = useQuestSubmission({
		onSuccess,
		uploadImages,
		createAchievement,
	})

	const { data: citiesData = [] } = useGetCitiesQuery()

	const handleCityChange = (cityName: string) => {
		const city = citiesData.find((c: CityResponse) => c.name === cityName)
		if (city) {
			form.setValue('cityId', city.id)
		}
	}

	const handleSubmit = (e?: React.BaseSyntheticEvent) => {
		return form.handleSubmit(
			async data => {
				await submitQuest(data)
			},
			errors => {
				logger.error('Form validation errors:', errors)
				const firstError = Object.values(errors)[0]
				if (firstError && 'message' in firstError) {
					toast.error(String(firstError.message))
				} else {
					toast.error('Пожалуйста, заполните все обязательные поля')
				}
			}
		)(e)
	}

	const isSubmitting =
		isCreating || isUploadingImages || form.formState.isSubmitting

	return {
		form,
		isSubmitting,
		onSubmit: handleSubmit,
		handleCityChange,
	}
}
