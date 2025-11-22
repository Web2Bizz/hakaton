// Типы для работы с достижениями через API

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary'
export type AchievementType = 'system' | 'custom'

// Базовое достижение
export interface Achievement {
	id: string
	title: string
	description: string
	icon: string
	rarity: AchievementRarity
	type: AchievementType
}

// Системное достижение (предопределенное)
export interface SystemAchievement extends Achievement {
	type: 'system'
}

// Пользовательское достижение (создается при создании квеста)
export interface CustomAchievement extends Achievement {
	type: 'custom'
	questId: string // ID квеста, за который выдается достижение
	createdBy: string // ID пользователя, создавшего квест
	createdAt: string // Дата создания
}

// Достижение пользователя (разблокированное)
export interface UserAchievement {
	id: string
	title: string
	description: string
	icon: string
	rarity: AchievementRarity
	type: AchievementType
	unlockedAt: string // ISO date
	questId?: string // Для пользовательских достижений
}

// Типы для ответов API
export interface AchievementsListResponse {
	data: {
		achievements: Achievement[]
	}
}

export interface UserAchievementsResponse {
	data: {
		achievements: UserAchievement[]
		systemAchievements: UserAchievement[]
		customAchievements: UserAchievement[]
		unlockedCount: number
		totalCount: number
	}
}

// Типы для создания и обновления достижений
export interface CreateAchievementRequest {
	title: string
	description: string
	icon: string
	rarity: AchievementRarity
}

export interface UpdateAchievementRequest {
	title?: string
	description?: string
	icon?: string
	rarity?: AchievementRarity
}

// Ответ при создании достижения
export interface CreateAchievementResponse {
	id: number
	title: string
	description: string
	icon: string
	rarity: AchievementRarity
}

// Ответ при получении одного достижения
export interface GetAchievementResponse {
	id: number
	title: string
	description: string
	icon: string
	rarity: AchievementRarity
}

// Ответ при обновлении достижения
export interface UpdateAchievementResponse {
	id: number
	title: string
	description: string
	icon: string
	rarity: AchievementRarity
}

// Ответ при удалении достижения
export interface DeleteAchievementResponse {
	message: string
}