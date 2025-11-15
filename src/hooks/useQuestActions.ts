import { UserContext } from '@/contexts/UserContext'
import { allAchievements } from '@/data/achievements'
import type { Achievement, QuestContribution, User } from '@/types/user'
import { getLevelTitle, MAX_LEVEL, normalizeUserLevel } from '@/utils/level'
import { useCallback, useContext } from 'react'
import type { Quest } from '@/components/map/types/quest-types'

export function useQuestActions() {
	const context = useContext(UserContext)
	if (context === undefined) {
		throw new Error('useQuestActions must be used within a UserProvider')
	}
	const { setUser } = context

	const participateInQuest = useCallback(
		(questId: string) => {
			setUser(currentUser => {
				if (!currentUser) {
					return currentUser
				}

				const alreadyParticipating =
					currentUser.participatingQuests.includes(questId)

				if (alreadyParticipating) {
					return currentUser
				}

				const updatedUser: User = {
					...currentUser,
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
					!updatedUser.achievements.some((a: Achievement) => a.id === 'lake_saver')
				) {
					updatedUser.achievements.push({
						...allAchievements.lake_saver,
						unlockedAt: new Date().toISOString(),
					})
					hasNewAchievements = true
				}

				if (
					questId === 'les-1000-derev' &&
					!updatedUser.achievements.some((a: Achievement) => a.id === 'tree_planter')
				) {
					updatedUser.achievements.push({
						...allAchievements.tree_planter,
						unlockedAt: new Date().toISOString(),
					})
					hasNewAchievements = true
				}

				if (
					questId === 'volk-berkut' &&
					!updatedUser.achievements.some((a: Achievement) => a.id === 'wildlife_protector')
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

	// Проверка пользовательского достижения при завершении квеста на 100%
	const checkCustomAchievement = useCallback(
		(
			questId: string,
			questProgress: number,
			customAchievement?: { icon: string; title: string; description: string },
			onAchievementUnlocked?: (achievement: { id: string; title: string; icon: string }) => void
		) => {
			setUser(currentUser => {
				if (!currentUser || !customAchievement || questProgress < 100) {
					return currentUser
				}

				// Проверяем, что пользователь участвует в квесте
				if (!currentUser.participatingQuests.includes(questId)) {
					return currentUser
				}

				// Проверяем, что достижение еще не разблокировано
				const achievementId = `custom-${questId}`
				if (currentUser.achievements.some((a: Achievement) => a.id === achievementId)) {
					return currentUser
				}

				// Разблокируем пользовательское достижение
				const updatedUser = {
					...currentUser,
					achievements: [
						...currentUser.achievements,
						{
							id: achievementId,
							title: customAchievement.title,
							description: customAchievement.description,
							icon: customAchievement.icon,
							rarity: 'common' as const, // Пользовательские достижения всегда common
							unlockedAt: new Date().toISOString(),
						},
					],
				}

				// Вызываем callback для уведомления
				if (onAchievementUnlocked) {
					onAchievementUnlocked({
						id: achievementId,
						title: customAchievement.title,
						icon: customAchievement.icon,
					})
				}

				return updatedUser
			})
		},
		[setUser]
	)

	// Проверка завершения квеста и отправка уведомлений
	const checkQuestCompletion = useCallback(
		(
			quest: Quest,
			onQuestCompleted?: (quest: Quest) => void,
			onAchievementUnlocked?: (achievement: { id: string; title: string; icon: string }) => void
		) => {
			setUser(currentUser => {
				if (!currentUser) return currentUser

				// Проверяем, что пользователь участвует в квесте
				if (!currentUser.participatingQuests.includes(quest.id)) {
					return currentUser
				}

				// Проверяем, что квест завершен на 100%
				if (quest.overallProgress < 100) {
					return currentUser
				}

				let updatedUser = currentUser

				// Проверяем пользовательское достижение и добавляем его, если нужно
				if (quest.customAchievement) {
					const achievementId = `custom-${quest.id}`
					
					// Проверяем, что достижение еще не разблокировано
					if (!updatedUser.achievements.some((a: Achievement) => a.id === achievementId)) {
						// Разблокируем пользовательское достижение
						updatedUser = {
							...updatedUser,
							achievements: [
								...updatedUser.achievements,
								{
									id: achievementId,
									title: quest.customAchievement.title,
									description: quest.customAchievement.description,
									icon: quest.customAchievement.icon,
									rarity: 'common' as const,
									unlockedAt: new Date().toISOString(),
								},
							],
						}

						// Вызываем callback для уведомления о разблокировке
						if (onAchievementUnlocked) {
							onAchievementUnlocked({
								id: achievementId,
								title: quest.customAchievement.title,
								icon: quest.customAchievement.icon,
							})
						}
					}
				}

				// Вызываем callback для уведомления о завершении
				// (проверка на дубликаты выполняется в компонентах через useRef)
				if (onQuestCompleted) {
					onQuestCompleted(quest)
				}

				return updatedUser
			})
		},
		[setUser]
	)

	return {
		participateInQuest,
		contributeToQuest,
		checkAndUnlockAchievements,
		checkCustomAchievement,
		checkQuestCompletion,
	}
}
