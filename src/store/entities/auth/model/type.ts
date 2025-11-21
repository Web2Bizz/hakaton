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

export interface ForgotPasswordRequest {
	email: string
}

export interface ResetPasswordRequest {
	token: string
	password: string
	confirmPassword: string
}

export interface UpdateUserRequest {
	firstName?: string
	lastName?: string
	middleName?: string
	email?: string
	avatar?: string
	avatarUrls?: Record<number, string>
	questId?: number
	organisationId?: number | string | null
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
	avatarUrls?: Record<number, string>
}
// Тип пользователя (соответствует API)
export type UserFullData = UserShortData & {
	level: number
	experience: number
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
	questId?: string | null
	organisationId?: string | null
	createdAt: string
	updatedAt: string
}

export interface LoginErrorResponse {
	message: string
	statusCode: number
}
