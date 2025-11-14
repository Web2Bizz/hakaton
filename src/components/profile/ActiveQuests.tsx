import { ArrowRight, Clock } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { getAllQuests } from '@/utils/userData'
import { quests as baseQuests } from '@/components/map/data/quests'
import { Button } from '@/components/ui/button'

export function ActiveQuests() {
	const { user } = useUser()

	if (!user) {
		return null
	}

	// Получаем все квесты (включая созданные пользователями)
	const allQuests = getAllQuests(baseQuests)

	// Фильтруем квесты, в которых участвует пользователь
	const participatingQuests = allQuests.filter(q =>
		user.participatingQuests.includes(q.id)
	)

	if (participatingQuests.length === 0) {
		return (
			<div className='bg-white rounded-2xl shadow-lg p-8'>
				<h2 className='text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2'>
					<Clock className='h-6 w-6 text-blue-600' />
					Последняя активность
				</h2>
				<div className='text-center py-12'>
					<p className='text-slate-500 mb-4'>
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
		<div className='bg-white rounded-2xl shadow-lg p-8'>
			<div className='mb-6'>
				<h2 className='text-2xl font-bold text-slate-900 flex items-center gap-2'>
					<Clock className='h-6 w-6 text-blue-600' />
					Последняя активность
				</h2>
			</div>

			<div className='space-y-4'>
				{participatingQuests.map(quest => {
					return (
						<div
							key={quest.id}
							className='p-6 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all bg-slate-50'
						>
							<div className='flex items-start gap-4'>
								{quest.storyMedia?.image ? (
									<img
										src={quest.storyMedia.image}
										alt={quest.title}
										className='w-24 h-24 rounded-lg object-cover shrink-0'
									/>
								) : (
									<div className='w-24 h-24 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-2xl font-bold shrink-0'>
										{quest.title.charAt(0)}
									</div>
								)}
								<div className='flex-1 min-w-0'>
									<div className='flex items-start justify-between gap-4 mb-2'>
										<div className='flex-1 min-w-0'>
											<div className='flex items-center gap-2 mb-1'>
												<span className='text-xs font-medium text-blue-600 uppercase tracking-wider'>
													{quest.city}
												</span>
												<span className='text-xs font-medium text-slate-500'>
													{quest.type}
												</span>
											</div>
											<h3 className='text-lg font-bold text-slate-900 mb-1 line-clamp-1'>
												{quest.title}
											</h3>
											<p className='text-sm text-slate-600 mb-3 line-clamp-2'>
												{quest.story}
											</p>
										</div>
									</div>

									{/* Прогресс */}
									<div className='mb-4'>
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

									<Button variant='outline' size='sm' asChild>
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

