// Типы для работы с квестами через API

// Типы для запросов
export interface GetQuestsParams {
	cityId?: number
	organizationTypeId?: number
	categoryIds?: number[]
	status?: 'active' | 'completed' | 'archived'
	search?: string
	page?: number
	limit?: number
	sort?: 'newest' | 'oldest' | 'progress' | 'popular'
}

// Контакт для квеста
export interface QuestContact {
	name: string
	value: string
}

// Достижение для квеста
export interface QuestAchievement {
	title: string
	description: string
	icon: string
}

// Требование для шага квеста
export interface QuestStepRequirement {
	value: number
}

// Шаг квеста
export interface QuestStep {
	title: string
	description: string
	status: 'pending' | 'in_progress' | 'completed'
	progress: number // 0-100
	requirement?: QuestStepRequirement
	deadline?: string // ISO date string
}

// Запрос на создание квеста
export interface CreateQuestRequest {
	title: string
	description: string
	status: 'active' | 'completed' | 'archived'
	experienceReward: number
	achievement: QuestAchievement
	cityId: number
	organizationTypeId: number
	latitude: number
	longitude: number
	address: string
	contacts: QuestContact[]
	coverImage?: string
	gallery?: string[]
	steps: QuestStep[]
	categoryIds: number[]
}

// Запрос на обновление квеста
export interface UpdateQuestRequest {
	title?: string
	description?: string
	status?: 'active' | 'completed' | 'archived'
	experienceReward?: number
	achievement?: QuestAchievement
	cityId?: number
	organizationTypeId?: number
	latitude?: number
	longitude?: number
	address?: string
	contacts?: QuestContact[]
	coverImage?: string
	gallery?: string[]
	steps?: QuestStep[]
	categoryIds?: number[]
}

// Тип квеста (ответ от API)
export interface Quest {
	id: number
	title: string
	description: string
	status: 'active' | 'completed' | 'archived'
	experienceReward: number
	achievement: QuestAchievement
	cityId: number
	organizationTypeId: number
	latitude: number
	longitude: number
	address: string
	contacts: QuestContact[]
	coverImage?: string
	gallery?: string[]
	steps: QuestStep[]
	categories: Category[]
	createdAt?: string
	updatedAt?: string
}

export interface Category {
	id: number
	name: string
	createdAt: string
	updatedAt: string
}

// Типы для ответов API
export interface QuestsListResponse {
	data: {
		quests: Quest[]
		pagination?: {
			page: number
			limit: number
			total: number
			totalPages: number
		}
	}
}

export interface CreateQuestResponse {
	data: {
		quest: Quest
		message?: string
	}
}

export interface UpdateQuestResponse {
	data: {
		quest: Quest
		message?: string
	}
}

export interface DeleteQuestResponse {
	message: string
}

export interface JoinQuestResponse {
	data: {
		message: string
		quest: Quest
	}
}
