import { Calendar, Heart, Users, Share2 } from 'lucide-react'
import { useUser } from '@/contexts/UserContext'
import { quests } from '@/components/map/data/quests'
import { formatDateTime } from '@/utils/format'
import type { QuestContribution } from '@/types/user'

// Моковые данные для демонстрации
const mockContributions: QuestContribution[] = [
	{
		questId: 'ozero-chistoe',
		stageId: 'stage-2',
		role: 'financial',
		amount: 1000,
		contributedAt: '2025-03-05T10:00:00Z',
		impact: 'Внесли 1 000 руб. на этап "Закупка инвентаря"',
	},
	{
		questId: 'volk-berkut',
		stageId: 'stage-2',
		role: 'financial',
		amount: 500,
		contributedAt: '2025-03-01T14:30:00Z',
		impact: 'Внесли 500 руб. на этап "Обеспечение питания"',
	},
]

export function ContributionHistory() {
	const { user } = useUser()

	if (!user) {
		return null
	}

	// В реальном приложении это будет загружаться из API
	const contributions = mockContributions

	const getRoleIcon = (role: string) => {
		switch (role) {
			case 'financial':
				return <Heart className='h-4 w-4 text-green-600' />
			case 'volunteer':
				return <Users className='h-4 w-4 text-blue-600' />
			case 'ambassador':
				return <Share2 className='h-4 w-4 text-purple-600' />
			default:
				return null
		}
	}

	const getRoleLabel = (role: string) => {
		switch (role) {
			case 'financial':
				return 'Финансовый вклад'
			case 'volunteer':
				return 'Волонтерство'
			case 'ambassador':
				return 'Распространение'
			default:
				return role
		}
	}

	return (
		<div className='bg-white rounded-2xl shadow-lg p-8'>
			<h2 className='text-2xl font-bold text-slate-900 mb-6'>
				История участия
			</h2>

			{contributions.length === 0 ? (
				<div className='text-center py-12'>
					<p className='text-slate-500 mb-4'>Вы еще не участвовали в квестах</p>
					<a
						href='/map'
						className='inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors'
					>
						Найти квест
					</a>
				</div>
			) : (
				<div className='space-y-4'>
					{contributions.map((contribution, index) => {
						const quest = quests.find(q => q.id === contribution.questId)
						if (!quest) return null

						return (
							<div
								key={index}
								className='p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all'
							>
								<div className='flex items-start gap-4'>
									<div className='p-2 rounded-lg bg-slate-100'>
										{getRoleIcon(contribution.role)}
									</div>
									<div className='flex-1'>
										<div className='flex items-start justify-between mb-2'>
											<div>
												<h3 className='font-semibold text-slate-900 mb-1'>
													{quest.title}
												</h3>
												<p className='text-sm text-slate-600 mb-1'>
													{getRoleLabel(contribution.role)}
												</p>
											</div>
											{contribution.amount && (
												<span className='text-lg font-bold text-green-600'>
													+{contribution.amount.toLocaleString()} ₽
												</span>
											)}
										</div>
										<p className='text-sm text-slate-700 mb-2'>
											{contribution.impact}
										</p>
										<div className='flex items-center gap-2 text-xs text-slate-500'>
											<Calendar className='h-3 w-3' />
											{formatDateTime(contribution.contributedAt)}
										</div>
									</div>
								</div>
							</div>
						)
					})}
				</div>
			)}
		</div>
	)
}

