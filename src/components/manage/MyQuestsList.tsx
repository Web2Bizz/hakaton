import { useUser } from '@/hooks/useUser'
import { useGetQuestsQuery } from '@/store/entities/quest'
import { transformApiQuestsToComponentQuests } from '@/utils/quest'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spinner } from '@/components/ui/spinner'
import type { Quest } from '@/components/map/types/quest-types'
import { Target, MapPin, TrendingUp, ArrowRight, Map } from 'lucide-react'

export function MyQuestsList() {
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
		// Ищем квест по ID из createdQuestId
		// createdQuestId может быть строкой, а ID квеста - числом
		return apiQuests.filter(q => {
			const questId = typeof q.id === 'string' ? Number.parseInt(q.id, 10) : q.id
			const createdId = Number.parseInt(user.createdQuestId || '', 10)
			return questId === createdId || q.id === user.createdQuestId
		})
	}, [apiQuests, user?.createdQuestId])

	if (isLoading) {
		return (
			<div className='flex items-center justify-center py-20'>
				<div className='flex flex-col items-center gap-4'>
					<Spinner />
					<p className='text-sm text-slate-500'>Загрузка квестов...</p>
				</div>
			</div>
		)
	}

	if (myQuests.length === 0) {
		return (
			<div className='bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center'>
				<div className='max-w-md mx-auto'>
					<div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-200 mb-4'>
						<Target className='h-8 w-8 text-slate-400' />
					</div>
					<h3 className='text-xl font-semibold text-slate-700 mb-2'>
						Пока нет квестов
					</h3>
					<p className='text-slate-600 mb-6'>
						Создайте свой первый квест, чтобы начать управлять им и отслеживать прогресс
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
			{myQuests.map(quest => (
				<QuestCard
					key={quest.id}
					quest={quest}
					onClick={() => {
						const questId = typeof quest.id === 'string' 
							? Number.parseInt(quest.id, 10) 
							: quest.id
						navigate(`/quests/${questId}/manage`)
					}}
				/>
			))}
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
			className='group relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1'
		>
			{/* Градиентная полоса сверху */}
			<div className={`h-1.5 bg-gradient-to-r ${progressColor}`} />

			<div className='p-6'>
				{/* Header */}
				<div className='flex items-start justify-between gap-3 mb-4'>
					<div className='flex-1 min-w-0'>
						<div className='flex items-center gap-2 mb-2'>
							<MapPin className='h-4 w-4 text-orange-600 flex-shrink-0' />
							<span className='text-xs font-semibold text-orange-600 uppercase tracking-wider truncate'>
								{quest.city}
							</span>
						</div>
						<h3 className='text-lg font-bold text-slate-900 mb-2 line-clamp-2 break-words group-hover:text-orange-600 transition-colors'>
							{quest.title}
						</h3>
					</div>
					<div className='flex-shrink-0'>
						<div className='w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/30'>
							<Target className='h-6 w-6 text-white' />
						</div>
					</div>
				</div>

				{/* Описание */}
				<p className='text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed'>
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

				{/* Footer */}
				<div className='pt-4 border-t border-slate-100'>
					<div className='flex items-center justify-between mb-3'>
						<span className='text-xs font-medium text-slate-500 px-2.5 py-1 bg-slate-100 rounded-full'>
							{quest.type}
						</span>
						<div className='flex items-center gap-1 text-orange-600 font-semibold text-sm group-hover:gap-2 transition-all'>
							<span>Управлять</span>
							<ArrowRight className='h-4 w-4' />
						</div>
					</div>
					<button
						type='button'
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
						className='w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors'
					>
						<Map className='h-4 w-4' />
						Показать на карте
					</button>
				</div>
				</div>

				{/* Hover эффект */}
				<div className='absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none' />
		</article>
	)
}

