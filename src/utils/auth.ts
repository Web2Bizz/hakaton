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
	avatarUrls?: Record<string, string> | Record<number, string>
): string | undefined {
	// Если есть avatarUrls, берем последний размер (самый новый)
	if (avatarUrls && Object.keys(avatarUrls).length > 0) {
		// Обрабатываем оба формата: Record<string, string> (ключи "size_4") и Record<number, string> (для обратной совместимости)
		const keys = Object.keys(avatarUrls)

		// Извлекаем размеры из ключей вида "size_4", "size_5" или числовых ключей
		const sizes = keys
			.map(key => {
				// Если ключ в формате "size_X"
				const sizeMatch = key.match(/^size_(\d+)$/)
				if (sizeMatch) {
					return { key, size: Number(sizeMatch[1]) }
				}
				// Если ключ числовой (для обратной совместимости)
				const numKey = Number(key)
				if (!isNaN(numKey)) {
					return { key, size: numKey }
				}
				return null
			})
			.filter((item): item is { key: string; size: number } => item !== null)
			.sort((a, b) => b.size - a.size) // Сортируем по убыванию, чтобы взять последний

		if (sizes.length > 0) {
			const lastItem = sizes[0]
			const urlValue = avatarUrls[lastItem.key as keyof typeof avatarUrls] as
				| string
				| undefined
			// Если значение уже является URL, используем его
			if (
				urlValue &&
				(urlValue.startsWith('http://') || urlValue.startsWith('https://'))
			) {
				return urlValue
			}
			// Иначе формируем URL по размеру (для обратной совместимости)
			// В новом формате значение уже должно быть URL
			return urlValue
		}
	}

	// Если avatar - это число (ID), формируем URL
	if (avatar !== undefined && avatar !== null) {
		if (typeof avatar === 'number') {
			return `${API_BASE_URL}/v1/upload/images/${avatar}`
		}
		// Если avatar - это строка и это число (ID), формируем URL
		if (typeof avatar === 'string') {
			const avatarId = Number(avatar)
			if (!isNaN(avatarId) && avatarId > 0) {
				// Проверяем, не является ли это уже URL
				if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
					return avatar
				}
				return `${API_BASE_URL}/v1/upload/images/${avatarId}`
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
		name:
			`${apiUser.firstName?.trim() || ''} ${apiUser.lastName?.trim() || ''}`.trim() ||
			apiUser.email,
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
 * Сохраняет access token в localStorage
 */
export function saveToken(token: string): void {
	if (globalThis.window !== undefined) {
		localStorage.setItem('authToken', token)
	}
}

/**
 * Сохраняет refresh token в localStorage
 */
export function saveRefreshToken(token: string): void {
	if (globalThis.window !== undefined) {
		localStorage.setItem('refreshToken', token)
	}
}

/**
 * Удаляет токены из localStorage
 */
export function removeToken(): void {
	if (globalThis.window !== undefined) {
		localStorage.removeItem('authToken')
		localStorage.removeItem('refreshToken')
	}
}

/**
 * Получает access token из localStorage
 */
export function getToken(): string | null {
	if (globalThis.window !== undefined) {
		return localStorage.getItem('authToken')
	}
	return null
}

/**
 * Получает refresh token из localStorage
 */
export function getRefreshToken(): string | null {
	if (globalThis.window !== undefined) {
		return localStorage.getItem('refreshToken')
	}
	return null
}
