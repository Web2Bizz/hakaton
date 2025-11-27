import type { Quest } from '@/components/map/types/quest-types'
import { Spinner } from '@/components/ui/spinner'
import { useUser } from '@/hooks/useUser'
import { useGetQuestsQuery } from '@/store/entities/quest'
import { logger } from '@/utils/logger'
import { transformApiQuestsToComponentQuests } from '@/utils/quest'
import {
	Archive,
	ArrowRight,
	Map,
	MapPin,
	Target,
	TrendingUp,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type QuestFilter = 'all' | 'active' | 'completed' | 'archived'

export function MyQuestsList() {
	const { user } = useUser()
	const navigate = useNavigate()
	const [filter, setFilter] = useState<QuestFilter>('all')

	// Загружаем все квесты для фильтрации по ownerId
	const { data: questsResponse, isLoading } = useGetQuestsQuery()

	// Преобразуем квесты с сервера в формат компонентов
	// Фильтруем только квесты, созданные текущим пользователем
	const allQuests = useMemo(() => {
		if (!questsResponse?.data?.quests || !user?.id) return []

		// Фильтруем квесты, созданные текущим пользователем (по ownerId)
		const userIdNum =
			typeof user.id === 'string'
				? Number.parseInt(user.id, 10)
				: Number(user.id)

		const createdQuests = questsResponse.data.quests.filter(
			quest => quest.ownerId === userIdNum
		)

		logger.debug('Created quests:', createdQuests)
		return transformApiQuestsToComponentQuests(createdQuests)
	}, [questsResponse, user?.id])

	logger.debug('All quests:', allQuests)
	// Фильтруем квесты по выбранному фильтру
	const myQuests = useMemo(() => {
		return allQuests.filter(quest => {
			// Используем статус из преобразованного квеста, который уже учитывает статус участия пользователя
			if (filter === 'all') return true // Показываем все квесты, включая архивированные
			if (filter === 'active') return quest.status === 'active'
			if (filter === 'completed') return quest.status === 'completed'
			if (filter === 'archived') return quest.status === 'archived'
			return true
		})
	}, [allQuests, filter])

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

	return (
		<div className='space-y-4 sm:space-y-6'>
			{/* Фильтры */}
			<div className='flex flex-wrap gap-2'>
				<button
					type='button'
					onClick={() => setFilter('all')}
					className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
						filter === 'all'
							? 'bg-orange-500 text-white shadow-md'
							: 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
					}`}
				>
					Все ({allQuests.length})
				</button>
				<button
					type='button'
					onClick={() => setFilter('active')}
					className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
						filter === 'active'
							? 'bg-orange-500 text-white shadow-md'
							: 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
					}`}
				>
					Активные ({allQuests.filter(q => q.status === 'active').length})
				</button>
				<button
					type='button'
					onClick={() => setFilter('completed')}
					className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
						filter === 'completed'
							? 'bg-green-500 text-white shadow-md'
							: 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
					}`}
				>
					Завершенные ({allQuests.filter(q => q.status === 'completed').length})
				</button>
				<button
					type='button'
					onClick={() => setFilter('archived')}
					className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 ${
						filter === 'archived'
							? 'bg-slate-600 text-white shadow-md'
							: 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
					}`}
				>
					<Archive className='h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0' />
					<span className='whitespace-nowrap'>
						Архив ({allQuests.filter(q => q.status === 'archived').length})
					</span>
				</button>
			</div>

			{/* Список квестов */}
			{myQuests.length === 0 ? (
				<div className='bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center'>
					<div className='max-w-md mx-auto'>
						<div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-200 mb-4'>
							{filter === 'archived' ? (
								<Archive className='h-8 w-8 text-slate-400' />
							) : (
								<Target className='h-8 w-8 text-slate-400' />
							)}
						</div>
						<h3 className='text-xl font-semibold text-slate-700 mb-2'>
							{filter === 'archived'
								? 'Архив пуст'
								: filter === 'completed'
								? 'Нет завершенных квестов'
								: filter === 'active'
								? 'Нет активных квестов'
								: 'Пока нет квестов'}
						</h3>
						<p className='text-slate-600 mb-6'>
							{filter === 'archived'
								? 'Здесь будут отображаться архивированные квесты'
								: 'Создайте свой первый квест, чтобы начать управлять им и отслеживать прогресс'}
						</p>
					</div>
				</div>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
					{myQuests.map(quest => (
						<QuestCard
							key={quest.id}
							quest={quest}
							onClick={() => {
								const questId =
									typeof quest.id === 'string'
										? Number.parseInt(quest.id, 10)
										: quest.id
								navigate(`/quests/${questId}/manage`)
							}}
						/>
					))}
				</div>
			)}
		</div>
	)
}

interface QuestCardProps {
	quest: Quest
	onClick: () => void
}

function QuestCard({ quest, onClick }: QuestCardProps) {
	// Определяем цвета в зависимости от статуса квеста
	const isArchived = quest.status === 'archived'
	const isCompleted = quest.status === 'completed'

	logger.debug('Quest card:', quest)
	const progressColor = isArchived
		? 'from-slate-400 to-slate-500'
		: isCompleted
		? 'from-green-500 to-emerald-600'
		: quest.overallProgress >= 50
		? 'from-orange-500 to-amber-600'
		: 'from-orange-400 to-orange-500'

	const headerIconBg = isArchived
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

	const manageTextColor = isArchived
		? 'text-slate-600'
		: isCompleted
		? 'text-green-600'
		: 'text-orange-600'

	const mapButtonBg = isArchived
		? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'
		: isCompleted
		? 'bg-green-50 border-green-200 hover:bg-green-100 text-green-600'
		: 'bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-600'

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
			className='group relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 flex flex-col h-full'
		>
			{/* Градиентная полоса сверху */}
			<div className={`h-1.5 bg-gradient-to-r ${progressColor}`} />

			<div className='p-4 sm:p-6 flex flex-col h-full'>
				{/* Header */}
				<div className='flex  flex-1'>
					<div className='flex  items-start justify-between gap-3 mb-3 sm:mb-4'>
						<div className='flex-1 min-w-0'>
							<div className='flex items-center gap-2 mb-2'>
								<MapPin className={`h-4 w-4 ${cityColor} flex-shrink-0`} />
								<span
									className={`text-xs font-semibold ${cityColor} uppercase tracking-wider truncate`}
								>
									{quest.city}
								</span>
							</div>
							<h3
								className={`text-lg font-bold text-slate-900 mb-2 line-clamp-2 break-words ${titleHoverColor} transition-colors`}
							>
								{quest.title}
							</h3>
						</div>
						<div className='flex-shrink-0'>
							<div
								className={`w-12 h-12 rounded-xl bg-gradient-to-br ${headerIconBg} flex items-center justify-center shadow-lg ${
									isArchived
										? 'shadow-slate-400/30'
										: isCompleted
										? 'shadow-green-500/30'
										: 'shadow-orange-500/30'
								}`}
							>
								<Target className='h-6 w-6 text-white' />
							</div>
						</div>
					</div>
				</div>
				{/* Контент с растягиванием */}
				<div className='flex flex-col flex-1'>
					{/* Описание */}
					<p className='text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed'>
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
				</div>

				{/* Footer */}
				<div className='pt-4 border-t border-slate-100'>
					<div className='flex items-center justify-between mb-3'>
						{quest.type && quest.type !== 'Не указан' && (
							<span className='text-xs font-medium text-slate-500 px-2.5 py-1 bg-slate-100 rounded-full'>
								{quest.type}
							</span>
						)}
						{(!quest.type || quest.type === 'Не указан') && <div />}
						<div
							className={`flex items-center gap-1 ${manageTextColor} font-semibold text-sm group-hover:gap-2 transition-all`}
						>
							<span>Управлять</span>
							<ArrowRight className='h-4 w-4' />
						</div>
					</div>
					<button
						type='button'
						onClick={e => {
							e.stopPropagation()
							const questId =
								typeof quest.id === 'string' ? quest.id : String(quest.id)

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
						className={`w-full flex items-center justify-center gap-2 px-4 py-3 sm:py-2 text-sm sm:text-sm font-medium rounded-lg transition-colors cursor-pointer h-12 sm:h-auto ${mapButtonBg}`}
					>
						<Map className='h-5 w-5 sm:h-4 sm:w-4' />
						Показать на карте
					</button>
				</div>
			</div>

			{/* Hover эффект */}
			<div
				className={`absolute inset-0 bg-gradient-to-br ${
					isArchived
						? 'from-slate-400/5 to-slate-500/5'
						: isCompleted
						? 'from-green-500/5 to-emerald-500/5'
						: 'from-orange-500/5 to-amber-500/5'
				} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
			/>
		</article>
	)
}
