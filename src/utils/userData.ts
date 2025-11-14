import type { Quest } from '@/components/map/types/quest-types'
import type { Organization } from '@/components/map/types/types'

/**
 * Загружает квесты, созданные пользователями
 */
export function getUserCreatedQuests(): Quest[] {
	try {
		const stored = localStorage.getItem('user_created_quests')
		if (!stored) return []
		return JSON.parse(stored) as Quest[]
	} catch (error) {
		console.error('Error loading user created quests:', error)
		return []
	}
}

/**
 * Загружает организации, созданные пользователями
 */
export function getUserCreatedOrganizations(): Organization[] {
	try {
		const stored = localStorage.getItem('user_created_organizations')
		if (!stored) return []
		return JSON.parse(stored) as Organization[]
	} catch (error) {
		console.error('Error loading user created organizations:', error)
		return []
	}
}

/**
 * Получает квест пользователя по ID
 */
export function getUserQuest(questId: string): Quest | null {
	const quests = getUserCreatedQuests()
	return quests.find(q => q.id === questId) || null
}

/**
 * Получает организацию пользователя по ID
 */
export function getUserOrganization(organizationId: string): Organization | null {
	const organizations = getUserCreatedOrganizations()
	return organizations.find(o => o.id === organizationId) || null
}

/**
 * Сохраняет обновленный квест
 */
export function updateUserQuest(quest: Quest): void {
	try {
		const existingQuests = getUserCreatedQuests()
		const updatedQuests = existingQuests.map(q => (q.id === quest.id ? quest : q))
		localStorage.setItem('user_created_quests', JSON.stringify(updatedQuests))
	} catch (error) {
		console.error('Error updating quest:', error)
	}
}

/**
 * Сохраняет обновленную организацию
 */
export function updateUserOrganization(organization: Organization): void {
	try {
		const existingOrganizations = getUserCreatedOrganizations()
		const updatedOrganizations = existingOrganizations.map(o =>
			o.id === organization.id ? organization : o
		)
		localStorage.setItem('user_created_organizations', JSON.stringify(updatedOrganizations))
	} catch (error) {
		console.error('Error updating organization:', error)
	}
}

/**
 * Объединяет базовые квесты с созданными пользователями
 */
export function getAllQuests(baseQuests: Quest[]): Quest[] {
	const userQuests = getUserCreatedQuests()
	return [...baseQuests, ...userQuests]
}

/**
 * Объединяет базовые организации с созданными пользователями
 */
export function getAllOrganizations(baseOrganizations: Organization[]): Organization[] {
	const userOrganizations = getUserCreatedOrganizations()
	return [...baseOrganizations, ...userOrganizations]
}
