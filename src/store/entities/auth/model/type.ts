// Типы для запросов
export interface RegisterRequest {
	firstName: string
	lastName: string
	middleName: string
	email: string
	password: string
	confirmPassword: string
}

export interface LoginRequest {
	email: string
	password: string
}

export interface UpdateUserRequest {
	name?: string
	avatar?: string
}

// Типы для ответов API
export interface AuthResponse {
	access_token: string
	user: UserShortData
}

export type UserShortData = {
	id: string
	firstName: string
	lastName: string
	middleName: string
	email: string
	avatar?: string
}
// Тип пользователя (соответствует API)
export type UserFullData = UserShortData & {
	level: {
		level: number
		experience: number
	}
	stats: {
		totalQuests: number
		completedQuests: number
		totalDonations: number
		totalVolunteerHours: number
	}
	achievements: Array<{
		id: string
		title: string
		description: string
		icon: string
		rarity: 'common' | 'rare' | 'epic' | 'legendary'
		unlockedAt?: string
	}>
	participatingQuests: string[]
	createdQuestId?: string
	createdOrganizationId?: string | null
	createdAt: string
}

export interface LoginErrorResponse {
	message: string
	statusCode: number
}
