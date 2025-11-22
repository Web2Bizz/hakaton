import type {
	CreateQuestRequest,
	Quest,
	QuestAchievement,
	QuestContact,
	QuestStep,
	UpdateQuestRequest,
} from '@/store/entities/quest/model/type'
import type { QuestFormData } from '../schemas/quest-form.schema'

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

			// Добавляем requirement если есть требования
			if (
				stage.requirementType &&
				stage.requirementType !== 'none' &&
				stage.requirementValue
			) {
				step.requirement = {
					currentValue: 0,
					targetValue: stage.requirementValue,
				}
			}

			if (stage.deadline) {
				step.deadline = stage.deadline
			}

			return step
		})

	// Преобразуем contacts из формы в формат API
	const contacts: QuestContact[] = data.contacts
		.filter(c => c.value.trim() !== '')
		.map(c => ({ name: c.name, value: c.value.trim() }))

	// Преобразуем customAchievement в achievement (только если заполнено)
	const achievement: QuestAchievement | undefined = data.customAchievement
		? {
				icon: data.customAchievement.icon,
				title: data.customAchievement.title,
				description: data.customAchievement.description,
		  }
		: undefined

	// Преобразуем category в categoryIds
	const categoryId = CATEGORY_TO_ID_MAP[data.category] || 5

	// Убеждаемся, что latitude и longitude - числа
	const latitude = Number.parseFloat(data.latitude)
	const longitude = Number.parseFloat(data.longitude)

	// Убеждаемся, что cityId и organizationTypeId - числа
	// Если это объект, извлекаем ID
	const cityId =
		typeof data.cityId === 'object' &&
		data.cityId !== null &&
		'id' in data.cityId &&
		typeof (data.cityId as { id: unknown }).id === 'number'
			? Number((data.cityId as { id: number }).id)
			: Number(data.cityId)
	const organizationTypeId =
		typeof data.organizationTypeId === 'object' &&
		data.organizationTypeId !== null &&
		'id' in data.organizationTypeId &&
		typeof (data.organizationTypeId as { id: unknown }).id === 'number'
			? Number((data.organizationTypeId as { id: number }).id)
			: Number(data.organizationTypeId)

	// Создаем чистый объект только с нужными полями
	const request: CreateQuestRequest = {
		title: data.title,
		description: data.story,
		status: 'active',
		experienceReward: 100, // Можно сделать настраиваемым
		cityId,
		organizationTypeId,
		latitude,
		longitude,
		address: data.address,
		contacts,
		coverImage: data.storyImage,
		gallery: data.gallery.length > 0 ? data.gallery : undefined,
		steps,
		categoryIds: [categoryId],
	}

	// Добавляем achievement только если customAchievement заполнено
	if (achievement) {
		request.achievement = achievement
	}

	return request
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

			// Добавляем requirement если есть требования
			if (
				stage.requirementType &&
				stage.requirementType !== 'none' &&
				stage.requirementValue
			) {
				step.requirement = {
					currentValue: 0,
					targetValue: stage.requirementValue,
				}
			}

			if (stage.deadline) {
				step.deadline = stage.deadline
			}

			return step
		})

	// Преобразуем contacts из формы в формат API
	const contacts: QuestContact[] = data.contacts
		.filter(c => c.value.trim() !== '')
		.map(c => ({ name: c.name, value: c.value.trim() }))

	const achievement: QuestAchievement | undefined = data.customAchievement
		? {
				icon: data.customAchievement.icon,
				title: data.customAchievement.title,
				description: data.customAchievement.description,
		  }
		: undefined

	const categoryId = CATEGORY_TO_ID_MAP[data.category] || 5

	// Убеждаемся, что latitude и longitude - числа
	const latitude = Number.parseFloat(data.latitude)
	const longitude = Number.parseFloat(data.longitude)

	// Убеждаемся, что cityId и organizationTypeId - числа
	// Если это объект, извлекаем ID
	const cityId =
		typeof data.cityId === 'object' &&
		data.cityId !== null &&
		'id' in data.cityId &&
		typeof (data.cityId as { id: unknown }).id === 'number'
			? Number((data.cityId as { id: number }).id)
			: Number(data.cityId)
	const organizationTypeId =
		typeof data.organizationTypeId === 'object' &&
		data.organizationTypeId !== null &&
		'id' in data.organizationTypeId &&
		typeof (data.organizationTypeId as { id: unknown }).id === 'number'
			? Number((data.organizationTypeId as { id: number }).id)
			: Number(data.organizationTypeId)

	// Создаем чистый объект только с нужными полями
	const request: UpdateQuestRequest = {
		title: data.title,
		description: data.story,
		cityId,
		organizationTypeId,
		latitude,
		longitude,
		address: data.address,
		contacts,
		coverImage: data.storyImage,
		gallery: data.gallery.length > 0 ? data.gallery : undefined,
		steps,
		categoryIds: [categoryId],
		achievement,
	}

	return request
}

/**
 * Преобразует данные из API в формат формы
 */
export function transformApiResponseToFormData(
	quest: Quest
): Partial<QuestFormData> {
	console.log(quest)

	// Находим категорию по первому categoryId
	// Если categoryIds есть, используем маппинг ID -> строка
	// Если нет, используем значение по умолчанию
	const categoryId = quest.categories[0].id || 5
	const category = ID_TO_CATEGORY_MAP[categoryId] || 'other'

	// Преобразуем contacts из API в формат формы
	const contacts =
		quest.contacts
			?.filter(c => c.value && c.value.trim() !== '')
			.map(c => ({
				name: c.name,
				value: c.value.trim(),
			})) || []

	// Извлекаем данные куратора из contacts
	const curatorContact = contacts.find(
		c => c.name === 'Куратор' || c.name.toLowerCase() === 'куратор'
	)
	const phoneContact = contacts.find(
		c => c.name === 'Телефон' || c.name.toLowerCase() === 'телефон'
	)
	const emailContact = contacts.find(
		c => c.name === 'Email' || c.name.toLowerCase() === 'email'
	)

	// Преобразуем steps в stages
	const stages = quest.steps.map(step => ({
		title: step.title,
		description: step.description,
		status: step.status,
		progress: step.progress,
		requirementType: step.requirement
			? ('financial' as const) // По умолчанию financial, так как API не возвращает тип
			: ('none' as const),
		requirementValue: step.requirement?.targetValue,
		itemName: undefined,
		deadline: step.deadline || undefined,
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
		category: category as
			| 'environment'
			| 'animals'
			| 'people'
			| 'education'
			| 'other',
		story: quest.description,
		storyImage: quest.coverImage || undefined,
		gallery: quest.gallery || [],
		address: quest.address,
		contacts: contacts.length > 0 ? contacts : [{ name: 'Куратор', value: '' }],
		latitude: quest.latitude.toString(),
		longitude: quest.longitude.toString(),
		stages,
		updates: [], // API не возвращает updates
		customAchievement,
		curatorName: curatorContact?.value || '',
		curatorPhone: phoneContact?.value || '',
		curatorEmail: emailContact?.value || '',
		socials: [], // API не возвращает socials
	}
}
