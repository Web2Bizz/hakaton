import type { Quest } from '@/components/map/types/quest-types'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useUser } from '@/hooks/useUser'
import { useGetUserQuestsQuery } from '@/store/entities/quest'
import { logger } from '@/utils/logger'
import { transformApiQuestsToComponentQuests } from '@/utils/quest'
import { ArrowRight, Map, MapPin, Target, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

export function MyQuests() {
	const { user } = useUser()
	const navigate = useNavigate()

	const { data: questsResponse, isLoading } = useGetUserQuestsQuery(
		user?.id || '',
		{
			skip: !user?.id,
		}
	)

	const myQuests = useMemo(() => {
		logger.debug('questsResponse', questsResponse)
		if (!questsResponse?.data?.quests) return []
		const allQuests = transformApiQuestsToComponentQuests(
			questsResponse.data.quests
		)
		return allQuests.filter(quest => quest.status !== 'archived')
	}, [questsResponse])

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
					<Button
						asChild
						className='bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700'
					>
						<a href='/add-quest'>
							Создать квест
							<ArrowRight className='h-4 w-4 ml-2' />
						</a>
					</Button>
				</div>
			</div>
		)
	}

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
						const questId =
							typeof displayedQuest.id === 'string'
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
	const isArchived = quest.status === 'archived'
	const isCompleted = quest.status === 'completed'

	const progressColor = isArchived
		? 'from-slate-400 to-slate-500'
		: quest.overallProgress === 100
		? 'from-green-500 to-emerald-600'
		: quest.overallProgress >= 50
		? 'from-orange-500 to-amber-600'
		: 'from-orange-400 to-orange-500'

	const iconBg = isArchived
		? 'from-slate-400 to-slate-500'
		: isCompleted
		? 'from-green-500 to-emerald-600'
		: 'from-orange-500 to-amber-600'

	const cityColor = isArchived
		? 'text-slate-500'
		: isCompleted
		? 'text-green-600'
		: 'text-orange-600'

	const titleHoverColor = isArchived
		? 'group-hover:text-slate-600'
		: isCompleted
		? 'group-hover:text-green-600'
		: 'group-hover:text-orange-600'

	const borderHoverColor = isArchived
		? 'hover:border-slate-300'
		: isCompleted
		? 'hover:border-green-300'
		: 'hover:border-orange-300'

	const bgGradient = isArchived
		? 'from-white to-slate-50/30'
		: isCompleted
		? 'from-white to-green-50/30'
		: 'from-white to-orange-50/30'

	const buttonColor = isArchived
		? 'text-slate-600 border-slate-200 hover:bg-slate-50'
		: isCompleted
		? 'text-green-600 border-green-200 hover:bg-green-50'
		: 'text-orange-600 border-orange-200 hover:bg-orange-50'

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
			className={`group relative p-4 sm:p-6 rounded-xl border border-slate-200 ${borderHoverColor} hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br ${bgGradient}`}
		>
			<div className='flex flex-col sm:flex-row items-start gap-4'>
				{/* Иконка */}
				<div
					className={`w-16 h-16 rounded-xl bg-gradient-to-br ${iconBg} flex items-center justify-center shadow-lg flex-shrink-0`}
				>
					<Target className='h-8 w-8 text-white' />
				</div>

				<div className='flex-1 min-w-0 w-full'>
					<div className='flex items-center gap-2 mb-2'>
						<MapPin className={`h-4 w-4 ${cityColor} flex-shrink-0`} />
						<span
							className={`text-xs font-semibold ${cityColor} uppercase tracking-wider`}
						>
							{quest.city}
						</span>
					</div>
					<h3
						className={`text-lg font-bold text-slate-900 mb-2 line-clamp-2 ${titleHoverColor} transition-colors`}
					>
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
								<span className='text-xs font-medium text-slate-600'>
									Прогресс
								</span>
							</div>
							<span className='text-sm font-bold text-slate-900'>
								{quest.overallProgress}%
							</span>
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
								const questId =
									typeof quest.id === 'string' ? quest.id : String(quest.id)

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
							className={`flex-1 sm:flex-none ${buttonColor}`}
						>
							<Map className='h-4 w-4 mr-2' />
							Показать на карте
						</Button>
						<Button
							variant='outline'
							size='sm'
							className={`flex-1 sm:flex-none ${buttonColor}`}
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
