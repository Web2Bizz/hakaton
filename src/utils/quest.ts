// Утилиты для работы с квестами

import type { Quest, QuestStage } from '@/components/map/types/quest-types'
import type { Quest as ApiQuest } from '@/store/entities/quest/model/type'

export function calculateQuestProgress(quest: Quest): number {
	if (quest.stages.length === 0) return 0

	const totalProgress = quest.stages.reduce(
		(sum, stage) => sum + stage.progress,
		0
	)
	return Math.round(totalProgress / quest.stages.length)
}

export function getQuestProgressColor(
	progress: number
): Quest['progressColor'] {
	if (progress === 100) return 'victory'
	if (progress >= 76) return 'green'
	if (progress >= 51) return 'yellow'
	if (progress >= 26) return 'orange'
	return 'red'
}

export function findStageById(
	quest: Quest,
	stageId: string
): QuestStage | undefined {
	return quest.stages.find(stage => stage.id === stageId)
}

export function getActiveStages(quest: Quest): QuestStage[] {
	return quest.stages.filter(stage => stage.status === 'in_progress')
}

export function getCompletedStages(quest: Quest): QuestStage[] {
	return quest.stages.filter(stage => stage.status === 'completed')
}

/**
 * Определяет тип требования на основе targetValue
 * >= 1000 = финансовые средства, < 1000 = волонтеры или материалы
 */
export function getRequirementType(
	targetValue: number
): 'financial' | 'volunteers' | 'items' {
	if (targetValue >= 1000) {
		return 'financial'
	}
	// По умолчанию считаем волонтерами, можно расширить логику для определения материалов
	return 'volunteers'
}

// Маппинг ID категорий в строковые значения
const ID_TO_CATEGORY_MAP: Record<
	number,
	'environment' | 'animals' | 'people' | 'education' | 'other'
> = {
	1: 'environment',
	2: 'animals',
	3: 'people',
	4: 'education',
	5: 'other',
}

/**
 * Преобразует данные квеста с сервера в формат для компонентов
 */
export function transformApiQuestToComponentQuest(apiQuest: ApiQuest): Quest {
	// Проверяем наличие steps, если их нет - используем пустой массив
	const steps = apiQuest.steps || []

	// Вычисляем общий прогресс на основе шагов
	const overallProgress =
		steps.length > 0
			? Math.round(
					steps.reduce((sum, step) => sum + step.progress, 0) / steps.length
			  )
			: 0

	// Преобразуем steps в stages
	const stages: QuestStage[] = steps.map((step, index) => {
		const stage: QuestStage = {
			id: `step-${apiQuest.id}-${index}`,
			title: step.title,
			description: step.description || '',
			status: step.status,
			progress: step.progress,
		}

		// Преобразуем requirement в requirements
		if (step.requirement) {
			// Определяем тип требования на основе текущего значения
			// Если targetValue большое (>= 1000), считаем это финансовым требованием
			if (step.requirement.targetValue >= 1000) {
				stage.requirements = {
					financial: {
						collected: step.requirement.currentValue,
						needed: step.requirement.targetValue,
						currency: 'RUB',
					},
				}
			} else {
				// Иначе считаем это требованием по количеству (волонтеры или предметы)
				stage.requirements = {
					volunteers: {
						registered: step.requirement.currentValue,
						needed: step.requirement.targetValue,
					},
				}
			}
		}

		if (step.deadline) {
			stage.deadline = step.deadline
		}

		return stage
	})

	// Получаем категорию из первой категории квеста
	const category =
		apiQuest.categories && apiQuest.categories.length > 0
			? ID_TO_CATEGORY_MAP[apiQuest.categories[0].id] || 'other'
			: 'other'

	// Извлекаем контакты куратора (проверяем наличие contacts)
	const contacts = apiQuest.contacts || []
	const phoneContact = contacts.find(
		c => c.name === 'Телефон' || c.name.toLowerCase() === 'телефон'
	)
	const emailContact = contacts.find(
		c => c.name === 'Email' || c.name.toLowerCase() === 'email'
	)
	const curatorContact = contacts.find(
		c => c.name === 'Куратор' || c.name.toLowerCase() === 'куратор'
	)

	// Формируем имя куратора
	const curatorName =
		curatorContact?.value ||
		(apiQuest.owner
			? `${apiQuest.owner.firstName} ${apiQuest.owner.lastName}`.trim()
			: 'Не указан')

	// Преобразуем achievement в customAchievement
	const customAchievement = apiQuest.achievement
		? {
				icon: apiQuest.achievement.icon || '🏆',
				title: apiQuest.achievement.title,
				description: apiQuest.achievement.description,
		  }
		: undefined

	// Преобразуем координаты из строк в числа
	const coordinates: [number, number] = [
		Number.parseFloat(apiQuest.latitude) || 0,
		Number.parseFloat(apiQuest.longitude) || 0,
	]

	// Получаем название города
	const cityName = apiQuest.city?.name || 'Не указан'

	// Получаем тип организации
	const organizationTypeName = apiQuest.organizationType?.name || 'Не указан'

	const componentQuest: Quest = {
		id: String(apiQuest.id),
		title: apiQuest.title,
		city: cityName,
		type: organizationTypeName,
		category,
		story: apiQuest.description,
		storyMedia: apiQuest.coverImage
			? { image: apiQuest.coverImage }
			: undefined,
		stages,
		overallProgress,
		status: apiQuest.status,
		progressColor: getQuestProgressColor(overallProgress),
		updates: [], // Обновления будут загружаться отдельно через API
		coordinates,
		address: apiQuest.address,
		curator: {
			name: curatorName,
			phone: phoneContact?.value || 'Не указан',
			email: emailContact?.value,
			organization: organizationTypeName,
		},
		socials: [], // Социальные сети не приходят с сервера в текущем формате
		gallery: apiQuest.gallery || [],
		customAchievement,
		createdAt: apiQuest.createdAt || new Date().toISOString(),
		updatedAt: apiQuest.updatedAt || new Date().toISOString(),
	}

	return componentQuest
}

/**
 * Преобразует массив квестов с сервера в формат для компонентов
 */
export function transformApiQuestsToComponentQuests(
	apiQuests: ApiQuest[]
): Quest[] {
	return apiQuests.map(transformApiQuestToComponentQuest)
}
