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
	id?: number
	title: string
	description: string
	icon?: string
}

// Владелец квеста
export interface QuestOwner {
	id: number
	firstName: string
	lastName: string
	email: string
}

// Город квеста
export interface QuestCity {
	id: number
	name: string
}

// Тип организации квеста
export interface QuestOrganizationType {
	id: number
	name: string
}

// Требование для шага квеста
export interface QuestStepRequirement {
	currentValue: number
	targetValue: number
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
	achievementId?: number // ID достижения (если есть)
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
	achievementId?: number | null // ID достижения (если есть, null для удаления)
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
	achievementId: number | null
	ownerId: number
	cityId: number
	organizationTypeId: number
	latitude: string // Приходит как строка с сервера
	longitude: string // Приходит как строка с сервера
	address: string
	contacts: QuestContact[]
	coverImage?: string
	gallery?: string[]
	steps: QuestStep[]
	categories: Category[]
	createdAt?: string
	updatedAt?: string
	// Дополнительные поля, которые приходят с сервера
	achievement?: QuestAchievement | null
	owner?: QuestOwner
	city?: QuestCity
	organizationType?: QuestOrganizationType
}

export interface Category {
	id: number
	name: string
	createdAt?: string
	updatedAt?: string
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

// Типы для обновлений квеста
export interface QuestUpdate {
	id: number
	questId: number
	title: string
	text: string
	photos: string[]
	createdAt?: string
	updatedAt?: string
}

export interface CreateQuestUpdateRequest {
	questId: number
	title: string
	text: string
	photos: string[]
}

export interface UpdateQuestUpdateRequest {
	questId?: number
	title?: string
	text?: string
	photos?: string[]
}

export interface QuestUpdateResponse {
	data: {
		update: QuestUpdate
		message?: string
	}
}

export interface DeleteQuestUpdateResponse {
	message: string
}
