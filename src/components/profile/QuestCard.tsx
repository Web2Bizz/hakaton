import type { Quest } from '@/components/map/types/quest-types'
import { Button } from '@/components/ui/button'
import { ArrowRight, Map, MapPin, Target, TrendingUp } from 'lucide-react'

interface QuestCardProps {
	quest: Quest
	onClick: () => void
}

function getQuestColors(quest: Quest) {
	const isArchived = quest.status === 'archived'
	const isCompleted = quest.status === 'completed'

	return {
		progressColor: isArchived
			? 'from-slate-400 to-slate-500'
			: isCompleted
			? 'from-green-500 to-emerald-600'
			: quest.overallProgress >= 50
			? 'from-orange-500 to-amber-600'
			: 'from-orange-400 to-orange-500',
		iconBg: isArchived
			? 'from-slate-400 to-slate-500'
			: isCompleted
			? 'from-green-500 to-emerald-600'
			: 'from-orange-500 to-amber-600',
		cityColor: isArchived
			? 'text-slate-500'
			: isCompleted
			? 'text-green-600'
			: 'text-orange-600',
		titleHoverColor: isArchived
			? 'group-hover:text-slate-600'
			: isCompleted
			? 'group-hover:text-green-600'
			: 'group-hover:text-orange-600',
		borderHoverColor: isArchived
			? 'hover:border-slate-300'
			: isCompleted
			? 'hover:border-green-300'
			: 'hover:border-orange-300',
		bgGradient: isArchived
			? 'from-white to-slate-50/30'
			: isCompleted
			? 'from-white to-green-50/30'
			: 'from-white to-orange-50/30',
		buttonColor: isArchived
			? 'text-slate-600 border-slate-200 hover:bg-slate-50'
			: isCompleted
			? 'text-green-600 border-green-200 hover:bg-green-50'
			: 'text-orange-600 border-orange-200 hover:bg-orange-50',
	}
}

export function QuestCard({ quest, onClick }: QuestCardProps) {
	const colors = getQuestColors(quest)

	const handleShowOnMap = (e: React.MouseEvent) => {
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
	}

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
			className={`group relative p-4 sm:p-6 rounded-xl border border-slate-200 ${colors.borderHoverColor} hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br ${colors.bgGradient}`}
		>
			<div className='flex flex-col sm:flex-row items-start gap-4'>
				{/* Иконка */}
				<div
					className={`w-16 h-16 rounded-xl bg-gradient-to-br ${colors.iconBg} flex items-center justify-center shadow-lg flex-shrink-0`}
				>
					<Target className='h-8 w-8 text-white' />
				</div>

				<div className='flex-1 min-w-0 w-full'>
					<div className='flex items-center gap-2 mb-2'>
						<MapPin className={`h-4 w-4 ${colors.cityColor} flex-shrink-0`} />
						<span
							className={`text-xs font-semibold ${colors.cityColor} uppercase tracking-wider`}
						>
							{quest.city}
						</span>
					</div>
					<h3
						className={`text-lg font-bold text-slate-900 mb-2 line-clamp-2 ${colors.titleHoverColor} transition-colors`}
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
								className={`h-full bg-gradient-to-r ${colors.progressColor} rounded-full transition-all duration-500`}
								style={{ width: `${quest.overallProgress}%` }}
							/>
						</div>
					</div>

					<div className='flex flex-col sm:flex-row gap-2'>
						<Button
							variant='outline'
							onClick={handleShowOnMap}
							className={`flex-1 sm:flex-none h-12 sm:h-9 text-base sm:text-sm ${colors.buttonColor}`}
						>
							<Map className='h-5 w-5 sm:h-4 sm:w-4 mr-2' />
							Показать на карте
						</Button>
						<Button
							variant='outline'
							className={`flex-1 sm:flex-none h-12 sm:h-9 text-base sm:text-sm ${colors.buttonColor}`}
						>
							Управлять
							<ArrowRight className='h-5 w-5 sm:h-4 sm:w-4 ml-2' />
						</Button>
					</div>
				</div>
			</div>
		</article>
	)
}

