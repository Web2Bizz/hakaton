// Типы для работы с квестами через API

import type {
	Quest,
	QuestStage,
	QuestUpdate,
} from '@/components/map/types/quest-types'

// Типы для запросов
export interface GetQuestsParams {
	city?: string
	type?: string
	category?: 'environment' | 'animals' | 'people' | 'education' | 'other'
	status?: 'active' | 'completed' | 'archived'
	assistance?: string[]
	search?: string
	page?: number
	limit?: number
	sort?: 'newest' | 'oldest' | 'progress' | 'popular'
}

export interface CreateQuestRequest {
	title: string
	city: string
	type: string
	category: 'environment' | 'animals' | 'people' | 'education' | 'other'
	story: string
	storyMedia?: {
		image?: string
		video?: string
	}
	stages: Array<{
		title: string
		description: string
		requirements?: {
			financial?: {
				needed: number
				currency: string
			}
			volunteers?: {
				needed: number
			}
			items?: {
				needed: number
				itemName: string
			}
		}
		deadline?: string
	}>
	coordinates: [number, number] // [lat, lng]
	address: string
	curator: {
		name: string
		phone: string
		email?: string
		organization?: string
	}
	socials?: Array<{
		name: string
		url: string
	}>
	// Пользовательское достижение (опционально)
	// Выдается участникам при завершении квеста на 100%
	customAchievement?: {
		icon: string // Эмодзи
		title: string
		description: string
	}
}

export interface UpdateQuestRequest {
	title?: string
	story?: string
	stages?: QuestStage[]
}

export interface ParticipateRequest {
	role: 'financial' | 'volunteer' | 'ambassador'
}

export interface ContributeRequest {
	stageId: string
	role: 'financial' | 'volunteer'
	amount?: number // для financial
	action?: string // для volunteer
}

export interface VolunteerRegistrationRequest {
	name: string
	phone: string
	email: string
}

export interface CreateUpdateRequest {
	title: string
	content: string
	images?: string[]
	video?: string
	stageId?: string
}

// Типы для ответов API
export interface QuestsListResponse {
	data: {
		quests: Quest[]
		pagination: {
			page: number
			limit: number
			total: number
			totalPages: number
		}
	}
}

export interface QuestResponse {
	data: {
		quest: Quest
	}
}

export interface CreateQuestResponse {
	data: {
		quest: Quest
		message: string
	}
}

export interface ParticipateResponse {
	data: {
		participation: {
			userId: string
			questId: string
			role: string
			joinedAt: string
		}
		user: unknown // UserFullData
		message: string
	}
}

export interface ContributeResponse {
	data: {
		contribution: {
			id: string
			questId: string
			stageId: string
			userId: string
			role: string
			amount?: number
			contributedAt: string
			impact: string
		}
		user: unknown // UserFullData
		quest: Quest
		achievements?: unknown[]
		levelUp?: {
			newLevel: number
			title: string
			experienceGain: number
		}
	}
}

export interface VolunteerRegistrationResponse {
	data: {
		registration: {
			id: string
			userId: string
			questId: string
			stageId: string
			name: string
			phone: string
			email: string
			registeredAt: string
		}
		quest: Quest
		message: string
	}
}

export interface CreateUpdateResponse {
	data: {
		update: QuestUpdate
		quest: Quest
		message: string
	}
}

export interface DeleteQuestResponse {
	message: string
}
