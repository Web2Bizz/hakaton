import { MAX_ORGANIZATIONS_PER_USER } from '@/constants'
import { UserContext } from '@/contexts/UserContext'
import { logger } from '@/utils/logger'
import { useCallback, useContext } from 'react'

export function useOrganizationActions() {
	const context = useContext(UserContext)
	if (context === undefined) {
		throw new Error('useOrganizationActions must be used within a UserProvider')
	}
	const { user, setUser } = context

	const createQuest = useCallback(
		(questId: string) => {
			setUser(currentUser => {
				if (!currentUser) {
					return currentUser
				}

				if (currentUser.createdQuestId) {
					return currentUser
				}

				return {
					...currentUser,
					createdQuestId: questId,
				}
			})
		},
		[setUser]
	)

	const createOrganization = useCallback(
		(organizationId: string) => {
			setUser(currentUser => {
				if (!currentUser) {
					return currentUser
				}

				if (currentUser.createdOrganizationId) {
					return currentUser
				}

				return {
					...currentUser,
					createdOrganizationId: organizationId,
				}
			})
		},
		[setUser]
	)

	const canCreateQuest = useCallback(() => {
		return !user?.createdQuestId
	}, [user])

	const canCreateOrganization = useCallback(() => {
		if (MAX_ORGANIZATIONS_PER_USER === 1) {
			return !user?.createdOrganizationId
		}
		return !user?.createdOrganizationId
	}, [user])

	const deleteQuest = useCallback(
		(questId: string) => {
			setUser(currentUser => {
				if (!currentUser) return currentUser
				if (currentUser.createdQuestId !== questId) return currentUser

				try {
					const existingQuests = JSON.parse(
						localStorage.getItem('user_created_quests') || '[]'
					)
					const updatedQuests = existingQuests.filter(
						(q: { id: string }) => q.id !== questId
					)
					localStorage.setItem(
						'user_created_quests',
						JSON.stringify(updatedQuests)
					)
				} catch (error) {
					logger.error('Error deleting quest:', error)
				}

				return {
					...currentUser,
					createdQuestId: undefined,
				}
			})
		},
		[setUser]
	)

	const deleteOrganization = useCallback(
		(organizationId: string) => {
			setUser(currentUser => {
				if (!currentUser) return currentUser
				if (currentUser.createdOrganizationId !== organizationId)
					return currentUser

				try {
					const existingOrganizations = JSON.parse(
						localStorage.getItem('user_created_organizations') || '[]'
					)
					const updatedOrganizations = existingOrganizations.filter(
						(o: { id: string }) => o.id !== organizationId
					)
					localStorage.setItem(
						'user_created_organizations',
						JSON.stringify(updatedOrganizations)
					)
				} catch (error) {
					logger.error('Error deleting organization:', error)
				}

				return {
					...currentUser,
					createdOrganizationId: undefined,
				}
			})
		},
		[setUser]
	)

	const getUserQuest = useCallback(() => {
		return user?.createdQuestId
	}, [user])

	const getUserOrganization = useCallback(() => {
		return user?.createdOrganizationId
	}, [user])

	return {
		createQuest,
		createOrganization,
		canCreateQuest,
		canCreateOrganization,
		deleteQuest,
		deleteOrganization,
		getUserQuest,
		getUserOrganization,
	}
}
