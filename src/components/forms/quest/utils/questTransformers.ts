import type {
	CreateQuestRequest,
	Quest,
	QuestContact,
	QuestStep,
	UpdateQuestRequest,
} from '@/store/entities/quest/model/type'
import { logger } from '@/utils/logger'
import type { QuestFormData } from '../schemas/quest-form.schema'

const CATEGORY_TO_ID_MAP: Record<string, number> = {
	environment: 1,
	animals: 2,
	people: 3,
	education: 4,
	other: 5,
}

const ID_TO_CATEGORY_MAP: Record<number, string> = {
	1: 'environment',
	2: 'animals',
	3: 'people',
	4: 'education',
	5: 'other',
}

/**
 * Преобразует дату из формата "YYYY-MM-DD" в ISO datetime формат
 * @param dateString - строка даты в формате "YYYY-MM-DD"
 * @returns строка в формате ISO datetime (например, "2025-12-20T00:00:00.000Z")
 */
function convertDateToISODatetime(dateString: string | undefined): string | undefined {
	if (!dateString) {
		return undefined
	}

	// Если дата уже в формате ISO datetime, возвращаем как есть
	if (dateString.includes('T')) {
		return dateString
	}

	// Преобразуем "YYYY-MM-DD" в ISO datetime
	// Создаем Date объект в UTC, чтобы избежать проблем с часовыми поясами
	const date = new Date(dateString + 'T00:00:00.000Z')
	return date.toISOString()
}

export function transformFormDataToCreateRequest(
	data: QuestFormData
): CreateQuestRequest {
	const steps: QuestStep[] = data.stages
		.filter(stage => stage.title.trim() !== '')
		.map(stage => {
			const step: QuestStep = {
				title: stage.title,
				description: stage.description,
				status: stage.status,
				progress: stage.progress,
			}

			// Добавляем type если есть требования
			if (stage.requirementType && stage.requirementType !== 'no_required') {
				const requirementType = stage.requirementType
				if (
					requirementType === 'finance' ||
					requirementType === 'contributers' ||
					requirementType === 'material'
				) {
					step.type = requirementType
				}
			}

			// Добавляем requirement если есть требования и значение
			if (
				stage.requirementType &&
				stage.requirementType !== 'no_required' &&
				stage.requirementValue
			) {
				step.requirement = {
					currentValue: 0,
					targetValue: stage.requirementValue,
				}
			}

			if (stage.deadline) {
				step.deadline = convertDateToISODatetime(stage.deadline)
			}

			return step
		})

	// Преобразуем contacts из формы в формат API
	const contacts: QuestContact[] = data.contacts
		.filter(c => c.value.trim() !== '')
		.map(c => ({ name: c.name, value: c.value.trim() }))

	const categoryId = CATEGORY_TO_ID_MAP[data.category] || 5

	const latitude = Number.parseFloat(data.latitude)
	const longitude = Number.parseFloat(data.longitude)

	let cityId: number
	if (data.cityId === null) {
		cityId = Number.NaN
	} else if (
		typeof data.cityId === 'object' &&
		data.cityId !== null &&
		'id' in data.cityId &&
		typeof (data.cityId as { id: unknown }).id === 'number'
	) {
		cityId = Number((data.cityId as { id: number }).id)
	} else {
		cityId = Number(data.cityId)
	}

	let organizationTypeId: number
	if (data.organizationTypeId === null) {
		organizationTypeId = Number.NaN
	} else if (
		typeof data.organizationTypeId === 'object' &&
		data.organizationTypeId !== null &&
		'id' in data.organizationTypeId &&
		typeof (data.organizationTypeId as { id: unknown }).id === 'number'
	) {
		organizationTypeId = Number((data.organizationTypeId as { id: number }).id)
	} else {
		organizationTypeId = Number(data.organizationTypeId)
	}

	const request: CreateQuestRequest = {
		title: data.title,
		description: data.story,
		status: 'active',
		experienceReward: 100,
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

	// При создании передаем объект achievement, если указано пользовательское достижение
	if (data.customAchievement) {
		request.achievement = {
			title: data.customAchievement.title,
			description: data.customAchievement.description,
			icon: data.customAchievement.icon,
		}
		logger.debug(
			'Adding achievement object to create request:',
			request.achievement
		)
	} else {
		logger.debug('No customAchievement in data')
	}

	return request
}

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

			// Добавляем type если есть требования
			if (stage.requirementType && stage.requirementType !== 'no_required') {
				const requirementType = stage.requirementType
				if (
					requirementType === 'finance' ||
					requirementType === 'contributers' ||
					requirementType === 'material'
				) {
					step.type = requirementType
				}
			}

			// Добавляем requirement если есть требования и значение
			if (
				stage.requirementType &&
				stage.requirementType !== 'no_required' &&
				stage.requirementValue
			) {
				step.requirement = {
					currentValue: 0,
					targetValue: stage.requirementValue,
				}
			}

			if (stage.deadline) {
				step.deadline = convertDateToISODatetime(stage.deadline)
			}

			return step
		})

	// Преобразуем contacts из формы в формат API
	const contacts: QuestContact[] = data.contacts
		.filter(c => c.value.trim() !== '')
		.map(c => ({ name: c.name, value: c.value.trim() }))

	const categoryId = CATEGORY_TO_ID_MAP[data.category] || 5

	const latitude = Number.parseFloat(data.latitude)
	const longitude = Number.parseFloat(data.longitude)

	let cityId: number
	if (data.cityId === null) {
		cityId = Number.NaN
	} else if (
		typeof data.cityId === 'object' &&
		data.cityId !== null &&
		'id' in data.cityId &&
		typeof (data.cityId as { id: unknown }).id === 'number'
	) {
		cityId = Number((data.cityId as { id: number }).id)
	} else {
		cityId = Number(data.cityId)
	}

	let organizationTypeId: number
	if (data.organizationTypeId === null) {
		organizationTypeId = Number.NaN
	} else if (
		typeof data.organizationTypeId === 'object' &&
		data.organizationTypeId !== null &&
		'id' in data.organizationTypeId &&
		typeof (data.organizationTypeId as { id: unknown }).id === 'number'
	) {
		organizationTypeId = Number((data.organizationTypeId as { id: number }).id)
	} else {
		organizationTypeId = Number(data.organizationTypeId)
	}

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
	}

	if (data.achievementId !== undefined) {
		request.achievementId = data.achievementId || null
	}

	return request
}

export function transformApiResponseToFormData(
	quest: Quest
): Partial<QuestFormData> {
	logger.debug('Transforming quest to form data:', quest)

	const categoryId = quest.categories[0].id || 5
	const category = ID_TO_CATEGORY_MAP[categoryId] || 'other'

	const contacts =
		quest.contacts
			?.filter(c => c.value && c.value.trim() !== '')
			.map(c => ({
				name: c.name,
				value: c.value.trim(),
			})) || []

	const curatorContact = contacts.find(
		c => c.name === 'Куратор' || c.name.toLowerCase() === 'куратор'
	)
	const phoneContact = contacts.find(
		c => c.name === 'Телефон' || c.name.toLowerCase() === 'телефон'
	)
	const emailContact = contacts.find(
		c => c.name === 'Email' || c.name.toLowerCase() === 'email'
	)

	const stages = quest.steps.map(step => ({
		title: step.title,
		description: step.description,
		status: step.status,
		progress: step.progress,
		requirementType: step.type || ('no_required' as const),
		requirementValue: step.requirement?.targetValue,
		itemName: undefined,
		// Преобразуем ISO datetime обратно в формат "YYYY-MM-DD" для input type="date"
		deadline: step.deadline
			? new Date(step.deadline).toISOString().split('T')[0]
			: undefined,
	}))

	const customAchievement =
		quest.achievement?.icon &&
		quest.achievement.title &&
		quest.achievement.description
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
		customAchievement,
		achievementId: quest.achievementId || undefined,
		curatorName: curatorContact?.value || '',
		curatorPhone: phoneContact?.value || '',
		curatorEmail: emailContact?.value || '',
		socials: [],
	}
}
