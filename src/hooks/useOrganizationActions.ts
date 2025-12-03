import { MAX_ORGANIZATIONS_PER_USER } from '@/constants'
import { UserContext } from '@/contexts/UserContext'
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
		return !!user && !user.createdQuestId
	}, [user])

	const canCreateOrganization = useCallback(() => {
		if (MAX_ORGANIZATIONS_PER_USER === 1) {
			return !!user && !user.createdOrganizationId
		}
		return !!user && !user.createdOrganizationId
	}, [user])

	const deleteQuest = useCallback(
		(questId: string) => {
			setUser(currentUser => {
				if (!currentUser) return currentUser
				if (currentUser.createdQuestId !== questId) return currentUser

				// Данные квеста удаляются через API, не нужно удалять из localStorage
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

				// Данные организации удаляются через API, не нужно удалять из localStorage
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
