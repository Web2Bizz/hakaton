import type { Quest } from '@/components/map/types/quest-types'
import type { Organization } from '@/components/map/types/types'
import { logger } from './logger'

export function getUserCreatedQuests(): Quest[] {
	try {
		const stored = localStorage.getItem('user_created_quests')
		if (!stored) return []
		return JSON.parse(stored) as Quest[]
	} catch (error) {
		logger.error('Error loading user created quests:', error)
		return []
	}
}

export function getUserCreatedOrganizations(): Organization[] {
	try {
		const stored = localStorage.getItem('user_created_organizations')
		if (!stored) return []
		return JSON.parse(stored) as Organization[]
	} catch (error) {
		logger.error('Error loading user created organizations:', error)
		return []
	}
}

export function getUserQuest(questId: string): Quest | null {
	const quests = getUserCreatedQuests()
	return quests.find(q => String(q.id) === questId) || null
}

export function getUserOrganization(organizationId: string): Organization | null {
	const organizations = getUserCreatedOrganizations()
	return organizations.find(o => String(o.id) === organizationId) || null
}

export function updateUserQuest(quest: Quest): void {
	try {
		const existingQuests = getUserCreatedQuests()
		const existingIndex = existingQuests.findIndex(q => String(q.id) === String(quest.id))
		
		let updatedQuests: Quest[]
		if (existingIndex >= 0) {
			// Обновляем существующий квест
			updatedQuests = existingQuests.map(q => (String(q.id) === String(quest.id) ? quest : q))
		} else {
			// Добавляем новый квест
			updatedQuests = [...existingQuests, quest]
		}
		
		const questsJson = JSON.stringify(updatedQuests)
		
		// Проверяем размер перед сохранением
		const sizeInBytes = new Blob([questsJson]).size
		const sizeInMB = sizeInBytes / (1024 * 1024)
		if (sizeInMB > 4) {
			throw new DOMException('QuotaExceededError')
		}
		
		localStorage.setItem('user_created_quests', questsJson)
	} catch (error) {
		if (error instanceof DOMException && error.name === 'QuotaExceededError') {
			throw error
		}
		logger.error('Error updating quest:', error)
		throw error
	}
}

export function updateUserOrganization(organization: Organization): void {
	try {
		const existingOrganizations = getUserCreatedOrganizations()
		const existingIndex = existingOrganizations.findIndex(
			o => o.id === organization.id
		)
		
		let updatedOrganizations: Organization[]
		if (existingIndex >= 0) {
			// Обновляем существующую организацию
			updatedOrganizations = existingOrganizations.map(o =>
				o.id === organization.id ? organization : o
			)
		} else {
			// Добавляем новую организацию
			updatedOrganizations = [...existingOrganizations, organization]
		}
		
		localStorage.setItem('user_created_organizations', JSON.stringify(updatedOrganizations))
	} catch (error) {
		logger.error('Error updating organization:', error)
	}
}

export function getAllQuests(baseQuests: Quest[]): Quest[] {
	const userQuests = getUserCreatedQuests()
	return [...baseQuests, ...userQuests]
}

export function getAllOrganizations(baseOrganizations: Organization[]): Organization[] {
	const userOrganizations = getUserCreatedOrganizations()
	return [...baseOrganizations, ...userOrganizations]
}
