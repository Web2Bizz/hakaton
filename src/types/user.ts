// Типы для системы пользователей и геймификации

export type AchievementId =
	| 'first_quest'
	| 'lake_saver'
	| 'volunteer_month'
	| 'crowdfunding_master'
	| 'tree_planter'
	| 'wildlife_protector'
	| 'eco_warrior'
	| 'community_hero'
	| 'donation_champion'
	| 'quest_completer'
	| 'social_ambassador'

export interface Achievement {
	id: AchievementId
	title: string
	description: string
	icon: string
	rarity: 'common' | 'rare' | 'epic' | 'legendary'
	unlockedAt?: string // ISO date
}

export interface UserStats {
	totalQuests: number
	completedQuests: number
	totalDonations: number
	totalVolunteerHours: number
	totalImpact: {
		treesPlanted: number
		animalsHelped: number
		areasCleaned: number
		livesChanged: number
	}
}

export interface UserLevel {
	level: number
	experience: number
	experienceToNext: number
	title: string
}

export interface User {
	id: string
	name: string
	email?: string
	avatar?: string
	level: UserLevel
	stats: UserStats
	achievements: Achievement[]
	participatingQuests: string[] // Quest IDs
	createdQuestId?: string // ID созданного квеста (один пользователь может создать один квест)
	createdOrganizationId?: string // ID созданной организации (один пользователь может создать одну организацию)
	createdAt: string
}

export interface QuestContribution {
	questId: string
	stageId: string
	amount?: number // для финансовых взносов
	action?: string // для других действий
	contributedAt: string
	impact?: string // описание вклада
}

