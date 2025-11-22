import { useUser } from '@/hooks/useUser'
import { useGetQuestsQuery } from '@/store/entities/quest'
import { transformApiQuestsToComponentQuests } from '@/utils/quest'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spinner } from '@/components/ui/spinner'
import type { Quest } from '@/components/map/types/quest-types'

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
			<div className='flex items-center justify-center py-12'>
				<Spinner />
			</div>
		)
	}

	if (myQuests.length === 0) {
		return (
			<div className='bg-slate-50 border border-slate-200 rounded-lg p-8 text-center'>
				<p className='text-slate-600 mb-4'>
					У вас пока нет созданных квестов. Создайте квест, чтобы начать управлять
					им.
				</p>
			</div>
		)
	}

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
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
			className='p-4 rounded-xl border-2 border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all cursor-pointer'
		>
			<div className='flex items-center justify-between gap-2 mb-2'>
				<span className='text-xs font-medium text-blue-600 uppercase tracking-wider'>
					{quest.city}
				</span>
				<span className='text-xs font-medium text-slate-500'>{quest.type}</span>
			</div>
			<h3 className='text-base font-semibold text-slate-900 m-0 mb-2 line-clamp-2 break-words'>
				{quest.title}
			</h3>
			<p className='text-sm text-slate-600 m-0 mb-3 line-clamp-2'>
				{quest.story}
			</p>
			<div className='flex items-center gap-2 text-xs text-slate-500'>
				<span>Прогресс: {quest.overallProgress}%</span>
			</div>
		</article>
	)
}

