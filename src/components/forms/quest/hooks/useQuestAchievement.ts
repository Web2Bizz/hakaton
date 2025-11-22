import { useCreateAchievementMutation } from '@/store/entities/achievement'
import { getErrorMessage } from '@/utils/error'
import { logger } from '@/utils/logger'
import { toast } from 'sonner'
import type { QuestFormData } from '../schemas/quest-form.schema'

/**
 * Хук для создания пользовательского достижения квеста
 */
export function useQuestAchievement() {
	const [createAchievementMutation] = useCreateAchievementMutation()

	const createAchievement = async (
		customAchievement: QuestFormData['customAchievement']
	): Promise<number | undefined> => {
		if (!customAchievement) {
			return undefined
		}

		try {
			const createResult = await createAchievementMutation({
				title: customAchievement.title,
				description: customAchievement.description,
				icon: customAchievement.icon,
				rarity: 'common', // По умолчанию common для пользовательских достижений
			}).unwrap()

			logger.debug('Achievement created:', createResult)
			const achievementId = createResult.id
			logger.debug('Achievement ID:', achievementId)

			return achievementId
		} catch (error) {
			logger.error('Error creating achievement:', error)
			const errorMessage = getErrorMessage(
				error,
				'Не удалось создать достижение'
			)
			toast.error(errorMessage)
			throw error
		}
	}

	return {
		createAchievement,
	}
}

