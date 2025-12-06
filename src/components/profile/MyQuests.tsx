import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useUser } from '@/hooks/useUser'
import { useGetQuestsQuery } from '@/store/entities/quest'
import { logger } from '@/utils/logger'
import { transformApiQuestsToComponentQuests } from '@/utils/quest'
import { ArrowRight, Target } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MyQuestsEmpty } from './MyQuestsEmpty'
import { QuestCard } from './QuestCard'

export function MyQuests() {
	const { user } = useUser()
	const navigate = useNavigate()

	// Загружаем квесты, созданные текущим пользователем, используя фильтр ownerId на сервере
	const userIdNum = useMemo(() => {
		if (!user?.id) return undefined
		return typeof user.id === 'string'
			? Number.parseInt(user.id, 10)
			: Number(user.id)
	}, [user?.id])

	const { data: questsResponse, isLoading } = useGetQuestsQuery(
		userIdNum
			? {
					ownerId: userIdNum,
			  }
			: undefined
	)

	const myQuests = useMemo(() => {
		logger.debug('questsResponse', questsResponse)
		if (!questsResponse?.data?.quests || !user?.id) return []

		// Преобразуем в формат компонентов и исключаем архивированные
		// Фильтрация по ownerId уже выполнена на сервере
		const allQuests = transformApiQuestsToComponentQuests(
			questsResponse.data.quests
		)
		return allQuests.filter(quest => quest.status !== 'archived')
	}, [questsResponse, user?.id])

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
		return <MyQuestsEmpty />
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
