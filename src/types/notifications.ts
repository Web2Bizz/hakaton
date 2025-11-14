// Типы для системы уведомлений

export type NotificationType =
	| 'quest_completed'
	| 'stage_completed'
	| 'achievement_unlocked'
	| 'donation_received'
	| 'volunteer_registered'
	| 'quest_update'
	| 'milestone_reached'

export interface Notification {
	id: string
	type: NotificationType
	title: string
	message: string
	questId?: string
	stageId?: string
	achievementId?: string
	read: boolean
	createdAt: string
	actionUrl?: string
	icon?: string
}

