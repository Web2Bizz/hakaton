import { UserContext } from '@/contexts/UserContext'
import { allAchievements } from '@/data/achievements'
import type { QuestContribution, User } from '@/types/user'
import { getLevelTitle, MAX_LEVEL, normalizeUserLevel } from '@/utils/level'
import { useCallback, useContext } from 'react'

export function useQuestActions() {
	const context = useContext(UserContext)
	if (context === undefined) {
		throw new Error('useQuestActions must be used within a UserProvider')
	}
	const { setUser } = context

	const participateInQuest = useCallback(
		(questId: string, role: User['role'][number]) => {
			setUser(currentUser => {
				if (!currentUser) {
					return currentUser
				}

				const alreadyParticipating =
					currentUser.participatingQuests.includes(questId)

				if (alreadyParticipating) {
					if (currentUser.role.includes(role)) {
						return currentUser
					}
					return {
						...currentUser,
						role: [...currentUser.role, role],
					}
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

				// Если уже максимальный уровень, не добавляем опыт
				if (updatedUser.level.level >= MAX_LEVEL) {
					return updatedUser
				}

				updatedUser.level.experience += experienceGain

				// Нормализуем уровень и опыт (обрабатываем избыточный опыт в цикле)
				const normalized = normalizeUserLevel(
					updatedUser.level.level,
					updatedUser.level.experience,
					updatedUser.level.experienceToNext
				)

				updatedUser.level.level = normalized.level
				updatedUser.level.experience = normalized.experience
				updatedUser.level.experienceToNext = normalized.experienceToNext
				updatedUser.level.title = getLevelTitle(updatedUser.level.level)

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

	return {
		participateInQuest,
		contributeToQuest,
		checkAndUnlockAchievements,
	}
}
