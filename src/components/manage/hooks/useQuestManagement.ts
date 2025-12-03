import { allAchievements } from '@/data/achievements'
import { useUser } from '@/hooks/useUser'
import {
	useLazyGetUserAchievementsByUserIdQuery,
	useLazyGetUserQuery,
} from '@/store/entities'
import {
	useCompleteQuestMutation,
	useGenerateCheckInTokenMutation,
	useUpdateQuestMutation,
} from '@/store/entities/quest'
import type { Quest } from '@/store/entities/quest/model/type'
import { transformUserFromAPI } from '@/utils/auth'
import { getErrorMessage } from '@/utils/error'
import { logger } from '@/utils/logger'
import { useState } from 'react'
import { toast } from 'sonner'

interface UseQuestManagementProps {
	questId: number
	currentQuest: Quest | undefined
	refetch: () => void
}

export function useQuestManagement({
	questId,
	currentQuest,
	refetch,
}: UseQuestManagementProps) {
	const [updateQuest, { isLoading: isUpdating }] = useUpdateQuestMutation()
	const [completeQuest] = useCompleteQuestMutation()
	const [generateCheckInToken, { isLoading: isGeneratingQR }] =
		useGenerateCheckInTokenMutation()
	const { user, setUser } = useUser()
	const [getUser] = useLazyGetUserQuery()
	const [getUserAchievements] = useLazyGetUserAchievementsByUserIdQuery()
	const [showQRCode, setShowQRCode] = useState(false)
	const [qrCodeData, setQrCodeData] = useState<string>('')
	const [showArchiveDialog, setShowArchiveDialog] = useState(false)
	const [isArchiving, setIsArchiving] = useState(false)
	const [isCompleting, setIsCompleting] = useState(false)

	const handleUpdateRequirement = async (
		stepIndex: number,
		newCurrentValue: number
	) => {
		if (!currentQuest?.steps || !currentQuest.steps[stepIndex]) return

		const updatedSteps = [...currentQuest.steps]
		const step = updatedSteps[stepIndex]

		if (step.requirement) {
			step.requirement.currentValue = Math.max(
				0,
				Math.min(newCurrentValue, step.requirement.targetValue)
			)

			// Пересчитываем прогресс этапа
			const progress = Math.round(
				(step.requirement.currentValue / step.requirement.targetValue) * 100
			)
			step.progress = Math.min(100, Math.max(0, progress))

			// Если собрано достаточно, помечаем как завершенный
			if (step.requirement.currentValue >= step.requirement.targetValue) {
				step.status = 'completed'
			} else if (step.requirement.currentValue > 0) {
				step.status = 'in_progress'
			}
		}

		try {
			await updateQuest({
				id: questId,
				data: {
					steps: updatedSteps,
				},
			}).unwrap()
			toast.success('Требования успешно обновлены')
			refetch()
		} catch (error) {
			logger.error('Error updating quest:', error)
			const errorMessage = getErrorMessage(
				error,
				'Не удалось обновить требования. Попробуйте еще раз.'
			)
			toast.error(errorMessage)
		}
	}

	const handleAddAmount = (
		stepIndex: number,
		amount: number,
		userId?: string,
		isAnonymous?: boolean
	) => {
		const step = currentQuest?.steps?.[stepIndex]
		if (!step?.requirement) return

		const newValue = step.requirement.currentValue + amount

		// TODO: Отправить информацию о пользователе и инкогнито на сервер
		// if (userId) {
		//   await recordContribution(questId, stepIndex, { userId, amount, isAnonymous })
		// }

		handleUpdateRequirement(stepIndex, newValue)

		if (userId && !isAnonymous) {
			toast.success(`Вклад засчитан участнику`)
		} else if (isAnonymous) {
			toast.success(`Вклад засчитан (анонимно)`)
		}
	}

	const handleComplete = async () => {
		setIsCompleting(true)
		try {
			// Сохраняем текущие достижения пользователя для сравнения
			const previousAchievements = user?.achievements || []
			const previousAchievementIds = new Set(
				previousAchievements.map(a => String(a.id))
			)

			await completeQuest(questId).unwrap()
			toast.success('Квест успешно завершен!')

			// Обновляем данные квеста
			refetch()

			// Обновляем данные пользователя и проверяем новые достижения
			if (user?.id && setUser) {
				try {
					// Обновляем данные пользователя
					const userResult = await getUser(user.id).unwrap()
					if (userResult && setUser) {
						const transformedUser = transformUserFromAPI(userResult)
						setUser(transformedUser)
					}

					// Также проверяем достижения через API
					const achievementsResult = await getUserAchievements(user.id).unwrap()
					if (achievementsResult?.data?.achievements) {
						const apiAchievements = achievementsResult.data.achievements
						const newApiAchievements = apiAchievements.filter(
							a => !previousAchievementIds.has(String(a.id))
						)

						for (const achievement of newApiAchievements) {
							const achievementData =
								allAchievements[achievement.id as keyof typeof allAchievements]
							const title = achievementData?.title || achievement.title
							const icon = achievementData?.icon || achievement.icon

							toast.success('🏆 Достижение разблокировано!', {
								description: `${icon} "${title}"`,
								duration: 5000,
							})
						}
					}
				} catch (error) {
					logger.error(
						'Error fetching user data after quest completion:',
						error
					)
					// Не показываем ошибку пользователю, чтобы не мешать UX
				}
			}
		} catch (error) {
			logger.error('Error completing quest:', error)
			const errorMessage = getErrorMessage(
				error,
				'Не удалось завершить квест. Попробуйте еще раз.'
			)
			toast.error(errorMessage)
		} finally {
			setIsCompleting(false)
		}
	}

	const handleArchive = async () => {
		if (currentQuest?.status !== 'completed') {
			toast.error('Квест можно архивировать только если он завершен')
			return
		}

		setIsArchiving(true)
		try {
			await updateQuest({
				id: questId,
				data: {
					status: 'archived',
				},
			}).unwrap()
			toast.success('Квест успешно архивирован')
			setShowArchiveDialog(false)
			refetch()
		} catch (error) {
			logger.error('Error archiving quest:', error)
			const errorMessage = getErrorMessage(
				error,
				'Не удалось архивировать квест. Попробуйте еще раз.'
			)
			toast.error(errorMessage)
		} finally {
			setIsArchiving(false)
		}
	}

	const generateQRCode = async (stepIndex: number) => {
		const step = currentQuest?.steps?.[stepIndex]
		if (!step) return

		try {
			// Отправляем запрос на генерацию токена
			const response = await generateCheckInToken({
				questId,
				type: 'contributers',
			}).unwrap()

			const token = response.token

			// Создаем URL для страницы checkin
			// Страница затем сделает GET запрос на API /v1/checkin
			const checkInUrl = new URL('/checkin', globalThis.location.origin)
			checkInUrl.searchParams.set('questId', String(questId))
			checkInUrl.searchParams.set('type', 'contributers')
			checkInUrl.searchParams.set('token', token)

			// Используем URL для QR кода
			const qrData = checkInUrl.toString()

			setQrCodeData(qrData)
			setShowQRCode(true)
		} catch (error) {
			logger.error('Error generating checkin token:', error)
			const errorMessage = getErrorMessage(
				error,
				'Не удалось сгенерировать QR код. Попробуйте еще раз.'
			)
			toast.error(errorMessage)
		}
	}

	return {
		handleUpdateRequirement,
		handleAddAmount,
		handleComplete,
		handleArchive,
		generateQRCode,
		isUpdating,
		isGeneratingQR,
		showQRCode,
		setShowQRCode,
		qrCodeData,
		showArchiveDialog,
		setShowArchiveDialog,
		isArchiving,
		isCompleting,
	}
}

