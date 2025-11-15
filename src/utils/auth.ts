// Утилиты для работы с авторизацией

import type { UserFullData } from '@/store/entities/auth/model/type'
import type { User } from '@/types/user'
import {
	calculateExperienceToNext,
	getLevelTitle,
	normalizeUserLevel,
} from '@/utils/level'

/**
 * Преобразует данные пользователя из API в формат для локального состояния
 */
export function transformUserFromAPI(apiUser: UserFullData): User {
	console.log(apiUser)

	// Нормализуем уровень из API
	const normalized = normalizeUserLevel(
		apiUser.level,
		apiUser.experience,
		calculateExperienceToNext(apiUser.level)
	)

	return {
		id: apiUser.id,
		name: `${apiUser.firstName} ${apiUser.lastName}`.trim() || apiUser.email,
		email: apiUser.email,
		avatar: apiUser.avatar || undefined,
		level: {
			level: normalized.level,
			experience: normalized.experience,
			experienceToNext: normalized.experienceToNext,
			title: getLevelTitle(normalized.level),
		},
		stats: {
			totalQuests: apiUser.stats?.totalQuests ?? 0,
			completedQuests: apiUser.stats?.completedQuests ?? 0,
			totalDonations: apiUser.stats?.totalDonations ?? 0,
			totalVolunteerHours: apiUser.stats?.totalVolunteerHours ?? 0,
			totalImpact: {
				treesPlanted: 0,
				animalsHelped: 0,
				areasCleaned: 0,
				livesChanged: 0,
			},
		},
		achievements: apiUser.achievements || [],
		participatingQuests: apiUser.participatingQuests || [],
		createdAt: apiUser.createdAt,
	}
}

/**
 * Сохраняет токен в localStorage
 */
export function saveToken(token: string): void {
	if (globalThis.window !== undefined) {
		localStorage.setItem('authToken', token)
	}
}

/**
 * Удаляет токен из localStorage
 */
export function removeToken(): void {
	if (globalThis.window !== undefined) {
		localStorage.removeItem('authToken')
	}
}

/**
 * Получает токен из localStorage
 */
export function getToken(): string | null {
	if (globalThis.window !== undefined) {
		return localStorage.getItem('authToken')
	}
	return null
}
