import type { Quest } from '@/components/map/types/quest-types'
import { UserContext } from '@/contexts/UserContext'
import { allAchievements } from '@/data/achievements'
import {
	useAddExperienceMutation,
	useJoinQuestMutation,
	useLazyGetUserQuery,
} from '@/store/entities'
import type { Achievement, QuestContribution, User } from '@/types/user'
import { logger } from '@/utils'
import { transformUserFromAPI } from '@/utils/auth'
import {
	calculateExperienceToNext,
	getLevelTitle,
	normalizeUserLevel,
} from '@/utils/level'
import { useCallback, useContext } from 'react'
import { toast } from 'sonner'

export function useQuestActions() {
	const context = useContext(UserContext)
	if (context === undefined) {
		throw new Error('useQuestActions must be used within a UserProvider')
	}
	const { setUser, user } = context
	const [addExperience] = useAddExperienceMutation()
	const [joinQuest] = useJoinQuestMutation()
	const [getUser] = useLazyGetUserQuery()

	const participateInQuest = useCallback(
		async (questId: string) => {
			if (!user) return

			const alreadyParticipating = user.participatingQuests.includes(questId)
			if (alreadyParticipating) {
				toast.info('Вы уже участвуете в этом квесте')
				return
			}

			try {
				// Преобразуем questId в число, если нужно
				const questIdNum =
					typeof questId === 'string' ? Number.parseInt(questId, 10) : questId
				const userIdNum =
					typeof user.id === 'string'
						? Number.parseInt(user.id, 10)
						: Number(user.id)

				if (isNaN(questIdNum) || isNaN(userIdNum)) {
					throw new Error('Неверный формат ID квеста или пользователя')
				}

				// Вызываем API для присоединения к квесту
				const joinResult = await joinQuest({
					id: questIdNum,
					userId: userIdNum,
				}).unwrap()

				logger.debug('Join quest result:', joinResult)

				// Обновляем данные пользователя с сервера после успешного присоединения
				try {
					const userResult = await getUser(user.id).unwrap()
					if (userResult) {
						const transformedUser = transformUserFromAPI(userResult)
						setUser(transformedUser)
					}
				} catch (error) {
					logger.error('Error fetching updated user data after join:', error)
					// Если не удалось получить данные с сервера, обновляем локально
					setUser(currentUser => {
						if (!currentUser) return currentUser

						const updatedUser: User = {
							...currentUser,
							participatingQuests: [...currentUser.participatingQuests, questId],
							stats: {
								...(currentUser.stats || {
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
								}),
								totalQuests: (currentUser.stats?.totalQuests ?? 0) + 1,
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
				}

				// Начисляем опыт за участие в квесте (50 опыта)
				const experienceGain = 50
				try {
					const result = await addExperience({
						userId: user.id,
						data: { amount: experienceGain },
					}).unwrap()

					try {
						const userResult = await getUser(user.id).unwrap()
						if (userResult) {
							const transformedUser = transformUserFromAPI(userResult)
							setUser(transformedUser)
						}
					} catch (error) {
						logger.error('Error fetching updated user data:', error)
						// Если не удалось получить данные с сервера, обновляем локально
						setUser(currentUser => {
							if (!currentUser) return currentUser

							const normalized = normalizeUserLevel(
								result.level,
								result.experience,
								calculateExperienceToNext(result.level)
							)

							return {
								...currentUser,
								level: {
									level: normalized.level,
									experience: normalized.experience,
									experienceToNext: normalized.experienceToNext,
									title: getLevelTitle(normalized.level),
								},
							}
						})
					}

					// Показываем уведомление
					if (result.levelUp) {
						toast.success(
							`🎉 Поздравляем! Вы достигли ${result.levelUp.newLevel} уровня!`,
							{
								description: `Получено опыта: +${result.levelUp.experienceGain}`,
								duration: 5000,
							}
						)
					} else {
						toast.success(`Получено опыта: +${experienceGain}`, {
							duration: 3000,
						})
					}
				} catch (error) {
					const errorMessage =
						error instanceof Error
							? error.message
							: 'Не удалось начислить опыт. Попробуйте еще раз.'
					toast.error(errorMessage)
					logger.error('Error adding experience on participate:', error)
				}
			} catch (error) {
				// Обработка ошибок при присоединении к квесту
				let errorMessage =
					'Не удалось присоединиться к квесту. Попробуйте еще раз.'

				if (error && typeof error === 'object') {
					if ('data' in error && error.data) {
						const errorData = error.data as
							| { message?: string }
							| { error?: string }
							| string
						if (typeof errorData === 'string') {
							errorMessage = errorData
						} else if (errorData && typeof errorData === 'object') {
							if (
								'message' in errorData &&
								typeof errorData.message === 'string'
							) {
								errorMessage = errorData.message
							} else if (
								'error' in errorData &&
								typeof errorData.error === 'string'
							) {
								errorMessage = errorData.error
							}
						}
					} else if ('error' in error && typeof error.error === 'string') {
						errorMessage = error.error
					} else if ('message' in error && typeof error.message === 'string') {
						errorMessage = error.message
					}
				} else if (error instanceof Error) {
					errorMessage = error.message
				}

				toast.error(errorMessage)
				logger.error('Error joining quest:', error)
			}
		},
		[setUser, user, addExperience, getUser, joinQuest]
	)

	const contributeToQuest = useCallback(
		async (contribution: QuestContribution) => {
			if (!user) return

			// Вычисляем количество опыта для начисления
			const experienceGain = contribution.amount
				? Math.floor(contribution.amount / 100)
				: 10

			// Обновляем локальное состояние (статистика и достижения)
			setUser(currentUser => {
				if (!currentUser) return currentUser

				const updatedUser: User = {
					...currentUser,
					stats: {
						...(currentUser.stats || {
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
						}),
						totalDonations:
							(currentUser.stats?.totalDonations ?? 0) +
							(contribution.amount || 0),
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

				return updatedUser
			})

			try {
				const result = await addExperience({
					userId: user.id,
					data: { amount: experienceGain },
				}).unwrap()

				try {
					const userResult = await getUser(user.id).unwrap()
					if (userResult) {
						const transformedUser = transformUserFromAPI(userResult)
						setUser(transformedUser)
					}
				} catch (error) {
					logger.error('Error fetching updated user data:', error)
					// Если не удалось получить данные с сервера, обновляем локально
					setUser(currentUser => {
						if (!currentUser) return currentUser

						const normalized = normalizeUserLevel(
							result.level,
							result.experience,
							calculateExperienceToNext(result.level)
						)

						return {
							...currentUser,
							level: {
								level: normalized.level,
								experience: normalized.experience,
								experienceToNext: normalized.experienceToNext,
								title: getLevelTitle(normalized.level),
							},
						}
					})
				}

				// Показываем уведомление о повышении уровня, если произошло
				if (result.levelUp) {
					toast.success(
						`🎉 Поздравляем! Вы достигли ${result.levelUp.newLevel} уровня!`,
						{
							description: `Получено опыта: +${result.levelUp.experienceGain}`,
							duration: 5000,
						}
					)
				} else {
					toast.success(`Получено опыта: +${experienceGain}`, {
						duration: 3000,
					})
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: 'Не удалось начислить опыт. Попробуйте еще раз.'
				toast.error(errorMessage)
				logger.error('Error adding experience:', error)
			}
		},
		[setUser, user, addExperience, getUser]
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
					!updatedUser.achievements.some(
						(a: Achievement) => a.id === 'lake_saver'
					)
				) {
					updatedUser.achievements.push({
						...allAchievements.lake_saver,
						unlockedAt: new Date().toISOString(),
					})
					hasNewAchievements = true
				}

				if (
					questId === 'les-1000-derev' &&
					!updatedUser.achievements.some(
						(a: Achievement) => a.id === 'tree_planter'
					)
				) {
					updatedUser.achievements.push({
						...allAchievements.tree_planter,
						unlockedAt: new Date().toISOString(),
					})
					hasNewAchievements = true
				}

				if (
					questId === 'volk-berkut' &&
					!updatedUser.achievements.some(
						(a: Achievement) => a.id === 'wildlife_protector'
					)
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
			onAchievementUnlocked?: (achievement: {
				id: string
				title: string
				icon: string
			}) => void
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
				if (
					currentUser.achievements.some(
						(a: Achievement) => a.id === achievementId
					)
				) {
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
			onAchievementUnlocked?: (achievement: {
				id: string
				title: string
				icon: string
			}) => void
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
					if (
						!updatedUser.achievements.some(
							(a: Achievement) => a.id === achievementId
						)
					) {
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
