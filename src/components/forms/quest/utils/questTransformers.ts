import type { QuestFormData } from '../schemas/quest-form.schema'
import type {
	CreateQuestRequest,
	UpdateQuestRequest,
	QuestStep,
	QuestContact,
	QuestAchievement,
} from '@/store/entities/quest/model/type'
import type { QuestResponse } from '@/store/entities/quest/model/type'

// Маппинг категорий в ID на основе API
// Эти значения должны соответствовать ID категорий из API
const CATEGORY_TO_ID_MAP: Record<string, number> = {
	environment: 1, // Экология
	animals: 2, // Животные
	people: 3, // Люди
	education: 4, // Образование
	other: 5, // Другое
}

const ID_TO_CATEGORY_MAP: Record<number, string> = {
	1: 'environment',
	2: 'animals',
	3: 'people',
	4: 'education',
	5: 'other',
}

/**
 * Преобразует данные формы в формат API для создания квеста
 */
export function transformFormDataToCreateRequest(
	data: QuestFormData
): CreateQuestRequest {
	// Преобразуем stages в steps
	const steps: QuestStep[] = data.stages
		.filter(stage => stage.title.trim() !== '')
		.map(stage => {
			const step: QuestStep = {
				title: stage.title,
				description: stage.description,
				status: stage.status,
				progress: stage.progress,
			}

			// Добавляем requirement если есть финансовые требования
			if (stage.hasFinancial && stage.financialNeeded) {
				step.requirement = {
					value: stage.financialNeeded,
				}
			}

			if (stage.deadline) {
				step.deadline = stage.deadline
			}

			return step
		})

	// Преобразуем curator в contacts
	const contacts: QuestContact[] = [
		{ name: 'Имя', value: data.curatorName },
		{ name: 'Телефон', value: data.curatorPhone },
	]
	if (data.curatorEmail) {
		contacts.push({ name: 'Email', value: data.curatorEmail })
	}

	// Преобразуем customAchievement в achievement
	const achievement: QuestAchievement = data.customAchievement
		? {
				icon: data.customAchievement.icon,
				title: data.customAchievement.title,
				description: data.customAchievement.description,
		  }
		: {
				icon: '🏆',
				title: 'Участник квеста',
				description: 'Завершил квест',
		  }

	// Преобразуем category в categoryIds
	const categoryId = CATEGORY_TO_ID_MAP[data.category] || 5

	return {
		title: data.title,
		description: data.story,
		status: 'active',
		experienceReward: 100, // Можно сделать настраиваемым
		achievement,
		cityId: data.cityId,
		organizationTypeId: data.organizationTypeId,
		latitude: parseFloat(data.latitude),
		longitude: parseFloat(data.longitude),
		address: data.address,
		contacts,
		coverImage: data.storyImage,
		gallery: data.gallery.length > 0 ? data.gallery : undefined,
		steps,
		categoryIds: [categoryId],
	}
}

/**
 * Преобразует данные формы в формат API для обновления квеста
 */
export function transformFormDataToUpdateRequest(
	data: QuestFormData
): UpdateQuestRequest {
	const steps: QuestStep[] = data.stages
		.filter(stage => stage.title.trim() !== '')
		.map(stage => {
			const step: QuestStep = {
				title: stage.title,
				description: stage.description,
				status: stage.status,
				progress: stage.progress,
			}

			if (stage.hasFinancial && stage.financialNeeded) {
				step.requirement = {
					value: stage.financialNeeded,
				}
			}

			if (stage.deadline) {
				step.deadline = stage.deadline
			}

			return step
		})

	const contacts: QuestContact[] = [
		{ name: 'Имя', value: data.curatorName },
		{ name: 'Телефон', value: data.curatorPhone },
	]
	if (data.curatorEmail) {
		contacts.push({ name: 'Email', value: data.curatorEmail })
	}

	const achievement: QuestAchievement | undefined = data.customAchievement
		? {
				icon: data.customAchievement.icon,
				title: data.customAchievement.title,
				description: data.customAchievement.description,
		  }
		: undefined

	const categoryId = CATEGORY_TO_ID_MAP[data.category] || 5

	return {
		title: data.title,
		description: data.story,
		cityId: data.cityId,
		organizationTypeId: data.organizationTypeId,
		latitude: parseFloat(data.latitude),
		longitude: parseFloat(data.longitude),
		address: data.address,
		contacts,
		coverImage: data.storyImage,
		gallery: data.gallery.length > 0 ? data.gallery : undefined,
		steps,
		categoryIds: [categoryId],
		achievement,
	}
}

/**
 * Преобразует данные из API в формат формы
 */
export function transformApiResponseToFormData(
	questResponse: QuestResponse,
	_cities: Array<{ id: number; name: string }>,
	_organizationTypes: Array<{ id: number; name: string }>
): Partial<QuestFormData> {
	const quest = questResponse.data.quest

	// Находим категорию по первому categoryId
	// Если categoryIds есть, используем маппинг ID -> строка
	// Если нет, используем значение по умолчанию
	const categoryId = quest.categoryIds?.[0] || 5
	const category = ID_TO_CATEGORY_MAP[categoryId] || 'other'

	// Преобразуем contacts в curator
	const nameContact = quest.contacts.find(c => c.name === 'Имя')
	const phoneContact = quest.contacts.find(c => c.name === 'Телефон')
	const emailContact = quest.contacts.find(c => c.name === 'Email')

	// Преобразуем steps в stages
	const stages = quest.steps.map(step => ({
		title: step.title,
		description: step.description,
		status: step.status,
		progress: step.progress,
		hasFinancial: !!step.requirement,
		financialNeeded: step.requirement?.value,
		hasVolunteers: false,
		hasItems: false,
		deadline: step.deadline,
	}))

	// Преобразуем achievement в customAchievement
	const customAchievement = quest.achievement
		? {
				icon: quest.achievement.icon,
				title: quest.achievement.title,
				description: quest.achievement.description,
		  }
		: undefined

	return {
		title: quest.title,
		cityId: quest.cityId,
		organizationTypeId: quest.organizationTypeId,
		category: category as 'environment' | 'animals' | 'people' | 'education' | 'other',
		story: quest.description,
		storyImage: quest.coverImage,
		gallery: quest.gallery || [],
		address: quest.address,
		curatorName: nameContact?.value || '',
		curatorPhone: phoneContact?.value || '',
		curatorEmail: emailContact?.value || '',
		latitude: quest.latitude.toString(),
		longitude: quest.longitude.toString(),
		stages,
		socials: [], // API не возвращает socials
		updates: [], // API не возвращает updates
		customAchievement,
	}
}

