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
	type?: 'finance' | 'contributers' | 'material'
	requirement?: QuestStepRequirement
	deadline?: string // ISO date string
}

// Запрос на создание квеста
export interface CreateQuestRequest {
	title: string
	description: string
	status: 'active' | 'completed' | 'archived'
	experienceReward: number
	achievement?: {
		title: string
		description: string
		icon: string
	}
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
	// Поле, указывающее участвует ли текущий пользователь в квесте
	isParticipating?: boolean
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

export interface LeaveQuestResponse {
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

// Тип для ответа getUserQuests
export interface UserQuestItem {
	id: number
	questId: number
	userId: number
	status: 'pending' | 'in_progress' | 'completed'
	quest: Quest
	achievement?: QuestAchievement | null
	city?: QuestCity | null
	organizationType?: QuestOrganizationType | null
}

// Участник квеста
export interface QuestParticipant {
	id: number
	firstName: string
	lastName: string
	middleName?: string | null
}

// Ответ при получении участников квеста
export interface QuestParticipantsResponse {
	data: QuestParticipant[]
}

// Запрос на добавление вклада в этап квеста
export interface AddQuestStepContributionRequest {
	contributeValue: number
}

// Параметры для добавления вклада в этап квеста
export interface AddQuestStepContributionParams {
	questId: number
	stepType: 'finance' | 'material' | 'no_required'
	userId: number
	contributeValue: number
}

// Ответ при добавлении вклада в этап квеста
export interface AddQuestStepContributionResponse {
	data: {
		message?: string
	}
}

// Запрос на генерацию токена для checkin
export interface GenerateCheckInTokenRequest {
	questId: number
	type: 'contributers' | 'finance' | 'material'
}

// Ответ при генерации токена для checkin
export interface GenerateCheckInTokenResponse {
	token: string
}

// Параметры для проверки checkin токена
export interface CheckInParams {
	questId: number
	type: 'contributers' | 'finance' | 'material'
	token: string
}

// Ответ при проверке checkin токена
export interface CheckInResponse {
	data: {
		message?: string
	}
}

// Запрос на отметку волонтеров для этапа квеста
export interface MarkVolunteersRequest {
	userIds: number[]
}

// Параметры для отметки волонтеров
export interface MarkVolunteersParams {
	questId: number
	userIds: number[]
}

// Ответ при отметке волонтеров
export interface MarkVolunteersResponse {
	data: {
		message?: string
	}
}

// Отмеченный волонтер
export interface MarkedVolunteer {
	id: number
	firstName: string
	lastName: string
	middleName?: string | null
	email: string
	joinedAt: string
}

// Ответ при получении отмеченных волонтеров
export interface MarkedVolunteersResponse {
	data: MarkedVolunteer[]
}

// Ответ при получении волонтеров квеста (новый endpoint)
export interface QuestContributersResponse {
	data: QuestParticipant[]
}

// Запрос на добавление волонтера в квест
export interface AddQuestContributerRequest {
	userIds: number[]
}

// Параметры для добавления волонтера в квест
export interface AddQuestContributerParams {
	questId: number
	userIds: number[]
}

// Ответ при добавлении волонтера в квест
export interface AddQuestContributerResponse {
	data: {
		message?: string
	}
}

// Параметры для удаления волонтера из квеста
export interface DeleteQuestContributerParams {
	questId: number
	userId: number
}

// Ответ при удалении волонтера из квеста
export interface DeleteQuestContributerResponse {
	data: {
		message?: string
	}
}
