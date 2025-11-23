import { Button } from '@/components/ui/button'
import { useNotifications } from '@/hooks/useNotifications'
import { useQuestActions } from '@/hooks/useQuestActions'
import { useUser } from '@/hooks/useUser'
import { useGetUserQuestsQuery } from '@/store/entities/quest'
import { transformApiQuestsToComponentQuests } from '@/utils/quest'
import { ArrowRight, Clock } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { toast } from 'sonner'

export function ActiveQuests() {
	const { user } = useUser()
	const { checkQuestCompletion } = useQuestActions()
	const { addNotification } = useNotifications()

	// Загружаем квесты пользователя с сервера
	const { data: userQuestsResponse } = useGetUserQuestsQuery(user?.id ?? '', {
		skip: !user?.id,
	})

	// Преобразуем квесты пользователя с сервера в формат компонентов
	// Исключаем архивированные квесты
	const participatingQuests = useMemo(() => {
		if (!userQuestsResponse?.data?.quests) return []
		const quests = transformApiQuestsToComponentQuests(
			userQuestsResponse.data.quests
		)
		return quests.filter(q => q.status !== 'archived')
	}, [userQuestsResponse])

	// Отслеживаем уже обработанные квесты, чтобы не отправлять уведомления повторно
	const processedQuestsRef = useRef<Set<string>>(new Set())

	// Проверка завершения квестов и отправка уведомлений
	useEffect(() => {
		if (!user || participatingQuests.length === 0) return

		// Получаем существующие уведомления из localStorage
		const existingNotifications = JSON.parse(
			localStorage.getItem('ecoquest_notifications') || '[]'
		) as Array<{ type: string; questId?: string; achievementId?: string }>

		participatingQuests.forEach(quest => {
			// Проверяем завершение квеста (когда куратор нажал кнопку "Завершить квест")
			if (quest.status === 'completed') {
				const questKey = `quest_completed_${quest.id}`

				// Пропускаем, если уже обработали этот квест
				if (processedQuestsRef.current.has(questKey)) {
					return
				}

				// Проверяем, было ли уже отправлено уведомление о завершении этого квеста
				const hasQuestNotification = existingNotifications.some(
					n => n.type === 'quest_completed' && n.questId === quest.id
				)

				// Уведомление о завершении квеста (отправляем только один раз)
				if (!hasQuestNotification) {
					// Помечаем квест как обработанный сразу, чтобы не обрабатывать его повторно
					processedQuestsRef.current.add(questKey)
					checkQuestCompletion(
						quest,
						// Callback для уведомления о завершении квеста
						completedQuest => {
							// Дополнительная проверка перед добавлением
							const currentNotifications = JSON.parse(
								localStorage.getItem('ecoquest_notifications') || '[]'
							) as Array<{ type: string; questId?: string }>

							const alreadyExists = currentNotifications.some(
								n =>
									n.type === 'quest_completed' &&
									n.questId === completedQuest.id
							)

							if (!alreadyExists) {
								addNotification({
									type: 'quest_completed',
									title: '🎉 Квест завершен!',
									message: `Квест "${completedQuest.title}" успешно завершен!`,
									questId: completedQuest.id,
									icon: '🎉',
									actionUrl: `/map?quest=${completedQuest.id}`,
								})
							}
						},
						// Callback для уведомления о разблокировке достижения
						achievement => {
							// Проверяем, было ли уже отправлено уведомление об этом достижении
							const currentNotifications = JSON.parse(
								localStorage.getItem('ecoquest_notifications') || '[]'
							) as Array<{ type: string; achievementId?: string }>

							const alreadyExists = currentNotifications.some(
								n =>
									n.type === 'achievement_unlocked' &&
									n.achievementId === achievement.id
							)

							if (!alreadyExists) {
								addNotification({
									type: 'achievement_unlocked',
									title: '🏆 Достижение разблокировано!',
									message: `${achievement.icon} "${achievement.title}" - Вы получили пользовательское достижение за завершение квеста!`,
									questId: quest.id,
									achievementId: achievement.id,
									icon: achievement.icon,
									actionUrl: '/profile',
								})

								// Показываем toast уведомление
								toast.success('🏆 Достижение разблокировано!', {
									description: `${achievement.icon} "${achievement.title}"`,
									duration: 5000,
								})
							}
						}
					)
				} else {
					// Если уведомление уже существует, тоже помечаем как обработанное
					processedQuestsRef.current.add(questKey)
				}
			}
		})
	}, [user, participatingQuests, checkQuestCompletion, addNotification])

	if (participatingQuests.length === 0) {
		return (
			<div className='bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8'>
				<h2 className='text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6 flex items-center gap-2'>
					<Clock className='h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0' />
					Последняя активность
				</h2>
				<div className='text-center py-8 sm:py-12'>
					<p className='text-sm sm:text-base text-slate-500 mb-4'>
						Вы еще не участвуете ни в одном квесте
					</p>
					<Button asChild>
						<a href='/map'>
							Найти квест
							<ArrowRight className='h-4 w-4 ml-2' />
						</a>
					</Button>
				</div>
			</div>
		)
	}

	return (
		<div className='bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8'>
			<div className='mb-4 sm:mb-6'>
				<h2 className='text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2'>
					<Clock className='h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0' />
					Последняя активность
				</h2>
			</div>

			<div className='space-y-3 sm:space-y-4'>
				{participatingQuests.map(quest => {
					return (
						<div
							key={quest.id}
							className='p-4 sm:p-6 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all bg-slate-50'
						>
							<div className='flex flex-col sm:flex-row items-start gap-3 sm:gap-4'>
								{quest.storyMedia?.image ? (
									<img
										src={quest.storyMedia.image}
										alt={quest.title}
										className='w-full sm:w-24 sm:h-24 h-40 rounded-lg object-cover shrink-0'
									/>
								) : (
									<div className='w-full sm:w-24 sm:h-24 h-40 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-3xl sm:text-2xl font-bold shrink-0'>
										{quest.title.charAt(0)}
									</div>
								)}
								<div className='flex-1 min-w-0 w-full'>
									<div className='flex items-start justify-between gap-2 sm:gap-4 mb-2'>
										<div className='flex-1 min-w-0'>
											<div className='flex items-center gap-2 mb-1 flex-wrap'>
												<span className='text-xs font-medium text-blue-600 uppercase tracking-wider'>
													{quest.city}
												</span>
											</div>
											<h3 className='text-base sm:text-lg font-bold text-slate-900 mb-1 line-clamp-2 break-words'>
												{quest.title}
											</h3>
											{quest.customAchievement && (
												<div className='mb-2'>
													<span
														className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium border border-amber-200 shrink-0 whitespace-nowrap'
														title={`Достижение: ${quest.customAchievement.title} - ${quest.customAchievement.description}`}
													>
														🏆 Есть достижение
													</span>
												</div>
											)}
											<p className='text-xs sm:text-sm text-slate-600 mb-3 line-clamp-2 sm:line-clamp-2'>
												{quest.story}
											</p>
										</div>
									</div>
									{/* Прогресс */}
									<div className='mb-3 sm:mb-4'>
										<div className='flex items-center justify-between mb-1'>
											<span className='text-xs font-medium text-slate-600'>
												Прогресс
											</span>
											<span className='text-xs font-bold text-blue-600'>
												{quest.overallProgress}%
											</span>
										</div>
										<div className='h-2 bg-slate-200 rounded-full overflow-hidden'>
											<div
												className='h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300'
												style={{ width: `${quest.overallProgress}%` }}
											/>
										</div>
									</div>
									<Button
										variant='outline'
										size='sm'
										asChild
										className='w-full sm:w-auto'
									>
										<a href={`/map?quest=${quest.id}`}>
											Открыть детали
											<ArrowRight className='h-4 w-4 ml-2' />
										</a>
									</Button>
								</div>
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}
