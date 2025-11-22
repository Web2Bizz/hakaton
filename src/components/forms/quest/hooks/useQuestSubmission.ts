import { MAX_QUESTS_PER_USER } from '@/constants'
import { useUser } from '@/hooks/useUser'
import {
	useCreateQuestMutation,
	useGetQuestsQuery,
	useUpdateUserMutation,
} from '@/store/entities'
import { transformUserFromAPI } from '@/utils/auth'
import { getErrorMessage } from '@/utils/error'
import { logger } from '@/utils/logger'
import { toast } from 'sonner'
import type { QuestFormData } from '../schemas/quest-form.schema'
import { transformFormDataToCreateRequest } from '../utils/questTransformers'

interface QuestSubmissionOptions {
	onSuccess?: (questId: string) => void
	uploadImages: (
		data: QuestFormData
	) => Promise<{ storyImageUrl: string | undefined; galleryUrls: string[] }>
	createAchievement: (
		customAchievement: QuestFormData['customAchievement']
	) => Promise<number | undefined>
}

/**
 * Хук для отправки формы квеста
 * Обрабатывает валидацию, загрузку изображений, создание достижения и отправку квеста
 */
export function useQuestSubmission({
	onSuccess,
	uploadImages,
	createAchievement,
}: QuestSubmissionOptions) {
	const { user, setUser, createQuest: setUserQuestId } = useUser()
	const { data: questsResponse } = useGetQuestsQuery()
	const [createQuestMutation, { isLoading: isCreating }] =
		useCreateQuestMutation()
	const [updateUserMutation] = useUpdateUserMutation()

	const validateQuestLimit = (): boolean => {
		const createdQuestsCount =
			user?.id && questsResponse?.data?.quests
				? questsResponse.data.quests.filter(
						quest =>
							quest.ownerId === Number.parseInt(user.id, 10) &&
							quest.status !== 'archived'
				  ).length
				: 0

		if (createdQuestsCount >= MAX_QUESTS_PER_USER) {
			const getQuestWord = (count: number) => {
				if (count === 1) return 'квест'
				if (count >= 2 && count <= 4) return 'квеста'
				return 'квестов'
			}
			const questWord = getQuestWord(MAX_QUESTS_PER_USER)
			toast.error(
				`Вы уже создали максимальное количество квестов. Один пользователь может создать максимум ${MAX_QUESTS_PER_USER} ${questWord}.`
			)
			return false
		}
		return true
	}

	const validateLocation = (data: QuestFormData): boolean => {
		if (!data.latitude || !data.longitude) {
			toast.error('Пожалуйста, выберите местоположение на карте.')
			return false
		}
		return true
	}

	const validateCustomAchievement = (
		customAchievement: QuestFormData['customAchievement']
	): boolean => {
		if (!customAchievement) return true

		if (!customAchievement.icon?.trim()) {
			toast.error('Укажите эмодзи для достижения.')
			return false
		}
		if (!customAchievement.title?.trim()) {
			toast.error('Укажите название достижения.')
			return false
		}
		if (!customAchievement.description?.trim()) {
			toast.error('Укажите описание достижения.')
			return false
		}
		return true
	}

	const submitQuest = async (data: QuestFormData): Promise<void> => {
		// Валидация лимита квестов
		if (!validateQuestLimit()) {
			return
		}

		// Валидация местоположения
		if (!validateLocation(data)) {
			return
		}

		// Валидация пользовательского достижения
		if (!validateCustomAchievement(data.customAchievement)) {
			return
		}

		try {
			// Загружаем изображения
			const { storyImageUrl, galleryUrls } = await uploadImages(data)

			// Создаем достижение, если указано
			let achievementId: number | undefined = data.achievementId || undefined
			if (data.customAchievement) {
				achievementId = await createAchievement(data.customAchievement)
			}

			// Обновляем данные формы с загруженными URL и achievementId
			const updatedData = {
				...data,
				storyImage: storyImageUrl,
				gallery: galleryUrls,
				achievementId,
			}

			logger.debug('Updated data with achievementId:', updatedData.achievementId)

			const requestData = transformFormDataToCreateRequest(updatedData)
			logger.debug('Create request data:', requestData)
			logger.debug('AchievementId in request:', requestData.achievementId)

			// Создаем квест
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

			// Обновляем пользователя с ID квеста
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
				logger.error('Error updating user questId:', error)
				if (error && typeof error === 'object' && 'data' in error) {
					logger.error('Error details:', error.data)
				}
				toast.error('Не удалось обновить ID квеста у пользователя')
			}

			setUserQuestId(questId)

			// Сохраняем координаты для зума на карте
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
		} catch (error: unknown) {
			logger.error('Error saving quest:', error)
			const errorMessage = getErrorMessage(
				error,
				'Не удалось сохранить квест. Попробуйте еще раз.'
			)
			toast.error(errorMessage)
		}
	}

	return {
		submitQuest,
		isCreating,
	}
}

