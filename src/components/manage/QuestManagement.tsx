import { Spinner } from '@/components/ui/spinner'
import { allAchievements } from '@/data/achievements'
import { useUser } from '@/hooks/useUser'
import {
	useLazyGetUserAchievementsByUserIdQuery,
	useLazyGetUserQuery,
} from '@/store/entities'
import {
	useCompleteQuestMutation,
	useGetQuestQuery,
	useUpdateQuestMutation,
} from '@/store/entities/quest'
import type { Quest } from '@/store/entities/quest/model/type'
import { transformUserFromAPI } from '@/utils/auth'
import { getErrorMessage } from '@/utils/error'
import { logger } from '@/utils/logger'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { QRCodeModal } from './QRCodeModal'
import { QuestArchiveButton } from './QuestArchiveButton'
import { QuestArchiveDialog } from './QuestArchiveDialog'
import { QuestCompleteButton } from './QuestCompleteButton'
import { QuestRequirementManager } from './QuestRequirementManager'

interface QuestManagementProps {
	readonly questId: number
	readonly quest: Quest
}

export function QuestManagement({
	questId,
	quest: initialQuest,
}: QuestManagementProps) {
	const { data: quest, isLoading, refetch } = useGetQuestQuery(questId)
	const [updateQuest, { isLoading: isUpdating }] = useUpdateQuestMutation()
	const [completeQuest] = useCompleteQuestMutation()
	const { user, setUser } = useUser()
	const [getUser] = useLazyGetUserQuery()
	const [getUserAchievements] = useLazyGetUserAchievementsByUserIdQuery()
	const [showQRCode, setShowQRCode] = useState(false)
	const [qrCodeData, setQrCodeData] = useState<string>('')
	const [showArchiveDialog, setShowArchiveDialog] = useState(false)
	const [isArchiving, setIsArchiving] = useState(false)
	const [isCompleting, setIsCompleting] = useState(false)

	// Используем актуальные данные квеста или начальные
	const currentQuest = quest || initialQuest
	const questStatus = quest?.status || initialQuest?.status
	const isArchived = currentQuest?.status === 'archived'

	// Проверяем, можно ли архивировать квест (должен быть завершен)
	const canArchive = useMemo(() => {
		if (!currentQuest) return false
		return currentQuest.status === 'completed'
	}, [currentQuest])

	if (isLoading) {
		return (
			<div className='flex items-center justify-center py-12'>
				<Spinner />
			</div>
		)
	}

	if (!currentQuest) {
		return <div>Квест не найден</div>
	}

	const handleUpdateRequirement = async (
		stepIndex: number,
		newCurrentValue: number
	) => {
		if (!currentQuest.steps || !currentQuest.steps[stepIndex]) return

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
		const step = currentQuest.steps?.[stepIndex]
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
		if (!canArchive) {
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

	const generateQRCode = (stepIndex: number) => {
		const step = currentQuest.steps?.[stepIndex]
		if (!step) return

		// Генерируем уникальный токен для QR кода
		const token = `${questId}-${stepIndex}-${Date.now()}`
		const qrData = JSON.stringify({
			questId,
			stepIndex,
			token,
			type: 'volunteer_checkin',
		})

		setQrCodeData(qrData)
		setShowQRCode(true)
	}

	return (
		<div className={`space-y-6 ${isArchived ? 'opacity-75' : ''}`}>
			<div className='mb-6'>
				<h3
					className={`text-2xl font-bold mb-2 ${
						isArchived ? 'text-slate-600' : 'text-slate-900'
					}`}
				>
					Управление требованиями выполнения
				</h3>
				<p className='text-slate-600 text-sm'>
					Отслеживайте прогресс и управляйте вкладами участников в каждый этап
					квеста
				</p>
			</div>

			{currentQuest.steps?.length > 0 ? (
				<div className='space-y-6'>
					{currentQuest.steps.map((step, stepIndex) => {
						if (!step.requirement) {
							// Не показываем сообщение для архивированных квестов
							if (isArchived) {
								return null
							}
							return (
								<div
									key={stepIndex}
									className='border rounded-lg p-4 border-slate-200 bg-slate-50'
								>
									<h4 className='font-semibold mb-2 text-slate-900'>
										{step.title}
									</h4>
									<p className='text-sm text-slate-600'>
										У этого этапа нет требований выполнения
									</p>
								</div>
							)
						}

						return (
							<QuestRequirementManager
								key={stepIndex}
								step={step}
								stepIndex={stepIndex}
								requirement={step.requirement}
								isUpdating={isUpdating}
								questId={questId}
								onAddAmount={handleAddAmount}
								onGenerateQRCode={generateQRCode}
							/>
						)
					})}
				</div>
			) : (
				<div
					className={`border rounded-lg p-8 text-center ${
						isArchived
							? 'bg-slate-100 border-slate-300'
							: 'bg-slate-50 border-slate-200'
					}`}
				>
					<p className={isArchived ? 'text-slate-500' : 'text-slate-600'}>
						У этого квеста пока нет этапов с требованиями выполнения
					</p>
				</div>
			)}

			{/* Кнопка завершения квеста (только для активных квестов) */}
			{questStatus === 'active' && (
				<QuestCompleteButton
					onComplete={handleComplete}
					isCompleting={isCompleting}
					isUpdating={isUpdating}
				/>
			)}

			{/* Кнопка архивации (только для завершенных квестов) */}
			{currentQuest.status === 'completed' && (
				<QuestArchiveButton onClick={() => setShowArchiveDialog(true)} />
			)}

			{/* Диалог подтверждения архивации */}
			<QuestArchiveDialog
				open={showArchiveDialog}
				onOpenChange={setShowArchiveDialog}
				questTitle={currentQuest.title}
				onArchive={handleArchive}
				isArchiving={isArchiving}
			/>

			{/* Модальное окно с QR кодом */}
			<QRCodeModal
				isOpen={showQRCode}
				onClose={() => setShowQRCode(false)}
				qrCodeData={qrCodeData}
			/>
		</div>
	)
}
