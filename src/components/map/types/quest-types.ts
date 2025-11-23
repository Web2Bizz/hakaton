// Типы для системы квестов EcoQuest

import type { Coordinates, SocialLink } from '@/types/common'

export type QuestStatus = 'active' | 'completed' | 'archived'

export type QuestProgressColor = 'red' | 'orange' | 'yellow' | 'green' | 'victory'

export type StageStatus = 'pending' | 'in_progress' | 'completed'

export interface QuestStage {
	id: string
	title: string
	description: string
	status: StageStatus
	progress: number // 0-100
	requirements?: {
		financial?: {
			collected: number
			needed: number
			currency: string
		}
		volunteers?: {
			registered: number
			needed: number
		}
		items?: {
			collected: number
			needed: number
			itemName: string
		}
	}
	deadline?: string // ISO date
}

export interface QuestUpdate {
	id: string
	date: string // ISO date
	title: string
	content: string
	images?: string[]
	video?: string
	author: string
	stageId?: string // Связь с этапом
}

export interface QuestParticipation {
	userId: string
	joinedAt: string // ISO date
	contributions: {
		stageId: string
		amount?: number
		action?: string
	}[]
}

// Пользовательское достижение для квеста
export interface QuestCustomAchievement {
	icon: string // Эмодзи
	title: string
	description: string
}

export interface Quest {
	id: string
	title: string // Заголовок-проблема
	city: string
	type: string
	category: 'environment' | 'animals' | 'people' | 'education' | 'other'
	
	// История/Лор
	story: string
	storyMedia?: {
		image?: string
		video?: string
	}
	
	// Этапы квеста
	stages: QuestStage[]
	
	// Общий прогресс
	overallProgress: number // 0-100
	
	// Статус и визуализация
	status: QuestStatus
	progressColor: QuestProgressColor
	
	// Лента обновлений
	updates: QuestUpdate[]
	
	// Геолокация
	coordinates: Coordinates
	address: string
	
	// Контакты куратора
	curator: {
		name: string
		phone: string
		email?: string
		organization?: string
	}
	
	// Социальные сети
	socials?: SocialLink[]
	
	// Галерея
	gallery: string[]
	
	// Пользовательское достижение (опционально)
	// Выдается участникам при завершении квеста на 100%
	customAchievement?: QuestCustomAchievement
	
	// Метаданные
	createdAt: string
	updatedAt: string
	
	// Участие пользователя (опционально, для авторизованных)
	userParticipation?: QuestParticipation
	
	// Поле, указывающее участвует ли текущий пользователь в квесте
	isParticipating?: boolean
}

