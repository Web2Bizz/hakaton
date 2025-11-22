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
	return quests.find(q => q.id === questId) || null
}

export function getUserOrganization(organizationId: string): Organization | null {
	const organizations = getUserCreatedOrganizations()
	return organizations.find(o => o.id === organizationId) || null
}

export function updateUserQuest(quest: Quest): void {
	try {
		const existingQuests = getUserCreatedQuests()
		const updatedQuests = existingQuests.map(q => (q.id === quest.id ? quest : q))
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
		const updatedOrganizations = existingOrganizations.map(o =>
			o.id === organization.id ? organization : o
		)
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
