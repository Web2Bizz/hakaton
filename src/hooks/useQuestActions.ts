import type { Quest } from '@/components/map/types/quest-types'
import { UserContext } from '@/contexts/UserContext'
import {
	useAddExperienceMutation,
	useAssignAchievementMutation,
	useJoinQuestMutation,
	useLazyGetQuestQuery,
	useLazyGetUserQuery,
	useLeaveQuestMutation,
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
	const [leaveQuest] = useLeaveQuestMutation()
	const [getUser] = useLazyGetUserQuery()
	const [getQuest] = useLazyGetQuestQuery()
	const [assignAchievement] = useAssignAchievementMutation()

	const participateInQuest = useCallback(
		async (questId: string) => {
			if (!user) return

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

				// Получаем информацию о квесте, чтобы проверить, создан ли он пользователем
				let questOwnerId: number | null = null
				try {
					const questResult = await getQuest(questIdNum).unwrap()
					if (questResult) {
						questOwnerId = questResult.ownerId
					}
				} catch (error) {
					logger.error('Error fetching quest data:', error)
					// Продолжаем выполнение, даже если не удалось получить данные о квесте
				}

				// Проверяем, что квест не создан текущим пользователем
				const isQuestCreatedByUser =
					questOwnerId !== null && questOwnerId === userIdNum

				// Вызываем API для присоединения к квесту
				const joinResult = await joinQuest({
					id: questIdNum,
					userId: userIdNum,
				}).unwrap()

				logger.debug('Join quest result:', joinResult)

				// Сохраняем количество квестов до присоединения для проверки первого квеста
				const previousParticipatingQuestsCount =
					user.participatingQuests?.length || 0

				// Проверяем, является ли это первым квестом (было 0 квестов)
				const isFirstQuest = previousParticipatingQuestsCount === 0
				const hasFirstQuestAchievementBefore = user.achievements.some(
					(a: Achievement) => String(a.id) === '15'
				)

				// Назначаем достижение за первый квест, если условия выполнены
				if (
					isFirstQuest &&
					!isQuestCreatedByUser &&
					!hasFirstQuestAchievementBefore &&
					user.id
				) {
					try {
						await assignAchievement({
							id: 15,
							userId: user.id,
						}).unwrap()

						// Показываем toast уведомление сразу после успешного назначения
						toast.success('🎯 Достижение разблокировано!', {
							description:
								'Первый шаг - Присоединились к своему первому квесту',
							duration: 5000,
						})
					} catch (error) {
						logger.error('Error assigning first_quest achievement:', error)
					}
				}

				// Обновляем данные пользователя с сервера после успешного присоединения
				try {
					const userResult = await getUser(user.id).unwrap()
					if (userResult) {
						const transformedUser = transformUserFromAPI(userResult)
						setUser(transformedUser)
					}
				} catch (error) {
					logger.error('Error fetching updated user data after join:', error)
				}

				// Показываем уведомление об успешном присоединении
				toast.success('Вы успешно присоединились к квесту!', {
					duration: 3000,
				})
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
		[setUser, user, getUser, getQuest, joinQuest, assignAchievement]
	)

	const leaveQuestAction = useCallback(
		async (questId: string) => {
			if (!user) return

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

				// Вызываем API для выхода из квеста
				const leaveResult = await leaveQuest({
					id: questIdNum,
					userId: userIdNum,
				}).unwrap()

				logger.debug('Leave quest result:', leaveResult)

				// Обновляем данные пользователя с сервера после успешного выхода
				try {
					const userResult = await getUser(user.id).unwrap()
					if (userResult) {
						const transformedUser = transformUserFromAPI(userResult)
						setUser(transformedUser)
					}
				} catch (error) {
					logger.error('Error fetching updated user data after leave:', error)
					// Данные пользователя должны обновляться с сервера, не обновляем локально
				}

				toast.success('Вы успешно вышли из квеста')
			} catch (error) {
				// Обработка ошибок при выходе из квеста
				let errorMessage = 'Не удалось выйти из квеста. Попробуйте еще раз.'

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
				logger.error('Error leaving quest:', error)
			}
		},
		[setUser, user, getUser, leaveQuest]
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

	const checkAndUnlockAchievements = useCallback(() => {
		setUser(currentUser => {
			if (!currentUser) return currentUser

			// Нет предопределенных достижений для проверки
			return currentUser
		})
	}, [setUser])

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
			// Не выполняем действия, если user = null
			if (!user || !customAchievement || questProgress < 100) {
				return
			}

			setUser(currentUser => {
				if (!currentUser) {
					return currentUser
				}

				// Проверка участия пользователя в квесте должна выполняться через API (isParticipating)
				// Здесь просто разблокируем достижение, если квест завершен

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
			// Не выполняем действия, если user = null
			if (!user) {
				return
			}

			setUser(currentUser => {
				if (!currentUser) return currentUser

				// Проверяем, что пользователь участвует в квесте (через isParticipating из API)
				// Если квест не имеет isParticipating, пропускаем проверку

				// Проверяем, что квест завершен куратором (статус completed)
				if (quest.status !== 'completed') {
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
		leaveQuest: leaveQuestAction,
		contributeToQuest,
		checkAndUnlockAchievements,
		checkCustomAchievement,
		checkQuestCompletion,
	}
}
