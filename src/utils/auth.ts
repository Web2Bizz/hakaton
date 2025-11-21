// Утилиты для работы с авторизацией

import { API_BASE_URL } from '@/constants'
import type { UserFullData } from '@/store/entities/auth/model/type'
import type { User } from '@/types/user'
import {
	calculateExperienceToNext,
	getLevelTitle,
	normalizeUserLevel,
} from '@/utils/level'

/**
 * Получает URL аватара из avatarUrls или avatar
 */
function getAvatarUrl(
	avatar?: string | number,
	avatarUrls?: Record<number, string>
): string | undefined {
	// Если есть avatarUrls, берем последний ID (самый новый)
	if (avatarUrls && Object.keys(avatarUrls).length > 0) {
		const avatarIds = Object.keys(avatarUrls)
			.map(Number)
			.sort((a, b) => b - a) // Сортируем по убыванию, чтобы взять последний
		const lastId = avatarIds[0]
		if (lastId) {
			const urlValue = avatarUrls[lastId]
			// Если значение уже является URL, используем его
			if (urlValue && (urlValue.startsWith('http://') || urlValue.startsWith('https://'))) {
				return urlValue
			}
			// Иначе формируем URL по ID
			return `${API_BASE_URL}/upload/images/${lastId}`
		}
	}

	// Если avatar - это число (ID), формируем URL
	if (avatar !== undefined && avatar !== null) {
		if (typeof avatar === 'number') {
			return `${API_BASE_URL}/upload/images/${avatar}`
		}
		// Если avatar - это строка и это число (ID), формируем URL
		if (typeof avatar === 'string') {
			const avatarId = Number(avatar)
			if (!isNaN(avatarId) && avatarId > 0) {
				// Проверяем, не является ли это уже URL
				if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
					return avatar
				}
				return `${API_BASE_URL}/upload/images/${avatarId}`
			}
			// Если это уже URL, возвращаем как есть
			if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
				return avatar
			}
		}
	}

	return undefined
}

/**
 * Преобразует данные пользователя из API в формат для локального состояния
 */
export function transformUserFromAPI(apiUser: UserFullData): User {
	// Нормализуем уровень из API
	const normalized = normalizeUserLevel(
		apiUser.level,
		apiUser.experience,
		calculateExperienceToNext(apiUser.level)
	)

	const avatarUrl = getAvatarUrl(apiUser.avatar, apiUser.avatarUrls)

	return {
		id: apiUser.id,
		name: `${apiUser.firstName} ${apiUser.lastName}`.trim() || apiUser.email,
		email: apiUser.email,
		avatar: avatarUrl,
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
		createdQuestId: apiUser.questId || undefined, // Преобразуем questId -> createdQuestId
		createdOrganizationId:
			apiUser.organisationId !== null && apiUser.organisationId !== undefined
				? String(apiUser.organisationId)
				: undefined, // Преобразуем organisationId -> createdOrganizationId, обрабатываем null
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
