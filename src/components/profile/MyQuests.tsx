import { useUser } from '@/hooks/useUser'
import { useGetQuestsQuery } from '@/store/entities/quest'
import { transformApiQuestsToComponentQuests } from '@/utils/quest'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import type { Quest } from '@/components/map/types/quest-types'
import { Target, ArrowRight, MapPin, TrendingUp, Map } from 'lucide-react'

export function MyQuests() {
	const { user } = useUser()
	const navigate = useNavigate()
	const { data: questsResponse, isLoading } = useGetQuestsQuery()

	// Преобразуем квесты с сервера в формат компонентов
	const apiQuests = useMemo(() => {
		if (!questsResponse?.data?.quests) return []
		return transformApiQuestsToComponentQuests(questsResponse.data.quests)
	}, [questsResponse])

	// Фильтруем только мои квесты (созданные пользователем)
	const myQuests = useMemo(() => {
		if (!user?.createdQuestId) return []
		return apiQuests.filter(q => {
			const questId = typeof q.id === 'string' ? Number.parseInt(q.id, 10) : q.id
			const createdId = Number.parseInt(user.createdQuestId || '', 10)
			return questId === createdId || q.id === user.createdQuestId
		})
	}, [apiQuests, user?.createdQuestId])

	if (isLoading) {
		return (
			<div className='bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8'>
				<div className='flex items-center justify-center py-8'>
					<Spinner />
				</div>
			</div>
		)
	}

	if (myQuests.length === 0) {
		return (
			<div className='bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8'>
				<div className='flex items-center justify-between mb-4 sm:mb-6'>
					<h2 className='text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2'>
						<Target className='h-5 w-5 sm:h-6 sm:w-6 text-orange-600 shrink-0' />
						Мои квесты
					</h2>
				</div>
				<div className='text-center py-8 sm:py-12'>
					<div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4'>
						<Target className='h-8 w-8 text-slate-400' />
					</div>
					<p className='text-sm sm:text-base text-slate-500 mb-4'>
						У вас пока нет созданных квестов
					</p>
					<Button asChild className='bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700'>
						<a href='/add-quest'>
							Создать квест
							<ArrowRight className='h-4 w-4 ml-2' />
						</a>
					</Button>
				</div>
			</div>
		)
	}

	// Показываем только первый квест (или максимум 1)
	const displayedQuest = myQuests[0]

	return (
		<div className='bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8'>
			<div className='flex items-center justify-between mb-4 sm:mb-6'>
				<h2 className='text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2'>
					<Target className='h-5 w-5 sm:h-6 sm:w-6 text-orange-600 shrink-0' />
					Мои квесты
				</h2>
				<Button
					variant='outline'
					size='sm'
					onClick={() => navigate('/manage')}
					className='text-orange-600 border-orange-200 hover:bg-orange-50'
				>
					Посмотреть все
					<ArrowRight className='h-4 w-4 ml-2' />
				</Button>
			</div>

			<div className='space-y-4'>
				<QuestCard
					quest={displayedQuest}
					onClick={() => {
						const questId = typeof displayedQuest.id === 'string' 
							? Number.parseInt(displayedQuest.id, 10) 
							: displayedQuest.id
						navigate(`/quests/${questId}/manage`)
					}}
				/>
			</div>
		</div>
	)
}

interface QuestCardProps {
	quest: Quest
	onClick: () => void
}

function QuestCard({ quest, onClick }: QuestCardProps) {
	const progressColor = quest.overallProgress === 100 
		? 'from-green-500 to-emerald-600'
		: quest.overallProgress >= 50
		? 'from-orange-500 to-amber-600'
		: 'from-orange-400 to-orange-500'

	return (
		<article
			onClick={onClick}
			onKeyDown={e => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault()
					onClick()
				}
			}}
			role='button'
			tabIndex={0}
			className='group relative p-4 sm:p-6 rounded-xl border border-slate-200 hover:border-orange-300 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-white to-orange-50/30'
		>
			<div className='flex flex-col sm:flex-row items-start gap-4'>
				{/* Иконка */}
				<div className='w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg flex-shrink-0'>
					<Target className='h-8 w-8 text-white' />
				</div>

				<div className='flex-1 min-w-0 w-full'>
					<div className='flex items-center gap-2 mb-2'>
						<MapPin className='h-4 w-4 text-orange-600 flex-shrink-0' />
						<span className='text-xs font-semibold text-orange-600 uppercase tracking-wider'>
							{quest.city}
						</span>
					</div>
					<h3 className='text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors'>
						{quest.title}
					</h3>
					<p className='text-sm text-slate-600 mb-4 line-clamp-2'>
						{quest.story}
					</p>

					{/* Прогресс */}
					<div className='mb-4'>
						<div className='flex items-center justify-between mb-2'>
							<div className='flex items-center gap-2'>
								<TrendingUp className='h-4 w-4 text-slate-500' />
								<span className='text-xs font-medium text-slate-600'>Прогресс</span>
							</div>
							<span className='text-sm font-bold text-slate-900'>{quest.overallProgress}%</span>
						</div>
						<div className='h-2 bg-slate-200 rounded-full overflow-hidden'>
							<div
								className={`h-full bg-gradient-to-r ${progressColor} rounded-full transition-all duration-500`}
								style={{ width: `${quest.overallProgress}%` }}
							/>
						</div>
					</div>

					<div className='flex flex-col sm:flex-row gap-2'>
						<Button
							variant='outline'
							size='sm'
							onClick={e => {
								e.stopPropagation()
								const questId = typeof quest.id === 'string' 
									? quest.id 
									: String(quest.id)
								
								// Сохраняем координаты для зума на карте
								if (quest.coordinates && quest.coordinates.length === 2) {
									localStorage.setItem(
										'zoomToCoordinates',
										JSON.stringify({
											lat: quest.coordinates[0],
											lng: quest.coordinates[1],
											zoom: 15,
										})
									)
								}
								
								window.location.href = `/map?quest=${questId}`
							}}
							className='flex-1 sm:flex-none text-orange-600 border-orange-200 hover:bg-orange-50'
						>
							<Map className='h-4 w-4 mr-2' />
							Показать на карте
						</Button>
						<Button
							variant='outline'
							size='sm'
							className='flex-1 sm:flex-none text-orange-600 border-orange-200 hover:bg-orange-50'
						>
							Управлять
							<ArrowRight className='h-4 w-4 ml-2' />
						</Button>
					</div>
				</div>
			</div>
		</article>
	)
}

