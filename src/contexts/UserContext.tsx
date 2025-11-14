import { allAchievements } from '@/data/achievements'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import type { QuestContribution, User } from '@/types/user'
import type { ReactNode } from 'react'
import { createContext, useCallback, useMemo } from 'react'

interface UserContextType {
	user: User | null
	setUser: (user: User | null) => void
	participateInQuest: (questId: string, role: User['role'][number]) => void
	contributeToQuest: (contribution: QuestContribution) => void
	checkAndUnlockAchievements: (questId: string) => void
	updateUserStats: () => void
	createQuest: (questId: string) => void
	createOrganization: (organizationId: string) => void
	canCreateQuest: () => boolean
	canCreateOrganization: () => boolean
	deleteQuest: (questId: string) => void
	deleteOrganization: (organizationId: string) => void
	getUserQuest: () => string | undefined
	getUserOrganization: () => string | undefined
}

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext<UserContextType | undefined>(undefined)

// Моковые данные пользователя для демонстрации
const createMockUser = (): User => ({
	id: 'user-1',
	name: 'Иван Иванов',
	email: 'ivan@example.com',
	role: [],
	level: {
		level: 1,
		experience: 0,
		experienceToNext: 100,
		title: 'Новичок',
	},
	stats: {
		totalQuests: 0,
		completedQuests: 0,
		totalDonations: 0,
		totalVolunteerHours: 0,
		totalImpact: {
			treesPlanted: 0,
			animalsHelped: 0,
			areasCleaned: 0,
			livesChanged: 0,
		},
	},
	achievements: [],
	participatingQuests: [],
	createdAt: new Date().toISOString(),
})

export function UserProvider({ children }: Readonly<{ children: ReactNode }>) {
	const [user, setUser] = useLocalStorage<User | null>(
		'ecoquest_user',
		createMockUser()
	)

	// Сохранение пользователя
	const saveUser = useCallback(
		(updatedUser: User | null) => {
			setUser(updatedUser)
		},
		[setUser]
	)

	const participateInQuest = useCallback(
		(questId: string, role: User['role'][number]) => {
			setUser(currentUser => {
				if (!currentUser) {
					console.error('No current user in participateInQuest')
					return currentUser
				}

				// Проверяем, не участвует ли уже пользователь в этом квесте
				const alreadyParticipating =
					currentUser.participatingQuests.includes(questId)

				if (alreadyParticipating) {
					// Если уже участвует, просто добавляем роль, если её нет
					if (currentUser.role.includes(role)) {
						return currentUser
					}
					const updated = {
						...currentUser,
						role: [...currentUser.role, role],
					}
					console.log('Adding role to existing participation:', updated)
					return updated
				}

				const updatedUser: User = {
					...currentUser,
					role: currentUser.role.includes(role)
						? currentUser.role
						: [...currentUser.role, role],
					participatingQuests: [...currentUser.participatingQuests, questId],
					stats: {
						...currentUser.stats,
						totalQuests: currentUser.stats.totalQuests + 1,
					},
				}

				// Разблокируем достижение "Первый шаг"
				if (updatedUser.stats.totalQuests === 1) {
					const firstQuestAchievement = allAchievements.first_quest
					if (!updatedUser.achievements.some(a => a.id === 'first_quest')) {
						updatedUser.achievements.push({
							...firstQuestAchievement,
							unlockedAt: new Date().toISOString(),
						})
					}
				}

				console.log('New participation created:', {
					questId,
					role,
					participatingQuests: updatedUser.participatingQuests,
					totalQuests: updatedUser.stats.totalQuests,
				})
				return updatedUser
			})
		},
		[setUser]
	)

	const contributeToQuest = useCallback(
		(contribution: QuestContribution) => {
			setUser(currentUser => {
				if (!currentUser) return currentUser

				const updatedUser: User = {
					...currentUser,
					stats: {
						...currentUser.stats,
						totalDonations:
							currentUser.stats.totalDonations + (contribution.amount || 0),
						totalVolunteerHours:
							currentUser.stats.totalVolunteerHours +
							(contribution.role === 'volunteer' && contribution.action
								? 1
								: 0),
					},
				}

				// Проверяем достижения
				if (contribution.amount) {
					if (updatedUser.stats.totalDonations >= 100000) {
						const achievement = allAchievements.donation_champion
						if (
							!updatedUser.achievements.some(a => a.id === 'donation_champion')
						) {
							updatedUser.achievements.push({
								...achievement,
								unlockedAt: new Date().toISOString(),
							})
						}
					} else if (updatedUser.stats.totalDonations >= 50000) {
						const achievement = allAchievements.crowdfunding_master
						if (
							!updatedUser.achievements.some(
								a => a.id === 'crowdfunding_master'
							)
						) {
							updatedUser.achievements.push({
								...achievement,
								unlockedAt: new Date().toISOString(),
							})
						}
					}
				}

				// Добавляем опыт
				const experienceGain = contribution.amount
					? Math.floor(contribution.amount / 100)
					: 10
				updatedUser.level.experience += experienceGain

				// Проверяем повышение уровня
				if (
					updatedUser.level.experience >= updatedUser.level.experienceToNext
				) {
					updatedUser.level.level += 1
					updatedUser.level.experience -= updatedUser.level.experienceToNext
					updatedUser.level.experienceToNext = Math.floor(
						updatedUser.level.experienceToNext * 1.5
					)
				}

				return updatedUser
			})
		},
		[setUser]
	)

	const checkAndUnlockAchievements = useCallback(
		(questId: string) => {
			setUser(currentUser => {
				if (!currentUser) return currentUser

				const updatedUser = { ...currentUser }
				let hasNewAchievements = false

				// Проверяем различные достижения на основе квеста
				if (
					questId === 'ozero-chistoe' &&
					!updatedUser.achievements.some(a => a.id === 'lake_saver')
				) {
					updatedUser.achievements.push({
						...allAchievements.lake_saver,
						unlockedAt: new Date().toISOString(),
					})
					hasNewAchievements = true
				}

				if (
					questId === 'les-1000-derev' &&
					!updatedUser.achievements.some(a => a.id === 'tree_planter')
				) {
					updatedUser.achievements.push({
						...allAchievements.tree_planter,
						unlockedAt: new Date().toISOString(),
					})
					hasNewAchievements = true
				}

				if (
					questId === 'volk-berkut' &&
					!updatedUser.achievements.some(a => a.id === 'wildlife_protector')
				) {
					updatedUser.achievements.push({
						...allAchievements.wildlife_protector,
						unlockedAt: new Date().toISOString(),
					})
					hasNewAchievements = true
				}

				return hasNewAchievements ? updatedUser : currentUser
			})
		},
		[setUser]
	)

	const updateUserStats = useCallback(() => {
		if (!user) return
		// Здесь можно обновить статистику из API
		// Пока просто сохраняем текущее состояние
		saveUser(user)
	}, [user, saveUser])

	const createQuest = useCallback(
		(questId: string) => {
			setUser(currentUser => {
				if (!currentUser) {
					console.error('No current user in createQuest')
					return currentUser
				}

				if (currentUser.createdQuestId) {
					console.warn('User already has a created quest')
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
					console.error('No current user in createOrganization')
					return currentUser
				}

				if (currentUser.createdOrganizationId) {
					console.warn('User already has a created organization')
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
		return !user?.createdOrganizationId
	}, [user])

	const deleteQuest = useCallback(
		(questId: string) => {
			setUser(currentUser => {
				if (!currentUser) return currentUser
				if (currentUser.createdQuestId !== questId) return currentUser

				// Удаляем квест из localStorage
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
					console.error('Error deleting quest:', error)
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

				// Удаляем организацию из localStorage
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
					console.error('Error deleting organization:', error)
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

	const value = useMemo(
		() => ({
			user,
			setUser: saveUser,
			participateInQuest,
			contributeToQuest,
			checkAndUnlockAchievements,
			updateUserStats,
			createQuest,
			createOrganization,
			canCreateQuest,
			canCreateOrganization,
			deleteQuest,
			deleteOrganization,
			getUserQuest,
			getUserOrganization,
		}),
		[
			user,
			saveUser,
			participateInQuest,
			contributeToQuest,
			checkAndUnlockAchievements,
			updateUserStats,
			createQuest,
			createOrganization,
			canCreateQuest,
			canCreateOrganization,
			deleteQuest,
			deleteOrganization,
			getUserQuest,
			getUserOrganization,
		]
	)

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

// useUser hook exported from separate file to fix Fast Refresh
