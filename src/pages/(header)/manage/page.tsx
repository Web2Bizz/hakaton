import { Spinner } from '@/components/ui/spinner'
import { useUser } from '@/hooks/useUser'
import { ProtectedRoute } from '@/provider/ProtectedRoute'
import { useState } from 'react'
import { MyQuestsList } from '@/components/manage/MyQuestsList'
import { MyOrganizationsList } from '@/components/manage/MyOrganizationsList'

export default function ManagePage() {
	const { user } = useUser()
	const [activeTab, setActiveTab] = useState<'quests' | 'organizations'>('quests')

	if (!user) {
		return (
			<ProtectedRoute>
				<div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-6 sm:py-12 px-4 mt-16'>
					<div className='max-w-6xl mx-auto'>
						<Spinner />
					</div>
				</div>
			</ProtectedRoute>
		)
	}

	return (
		<ProtectedRoute>
			<div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-6 sm:py-12 px-4 mt-16'>
				<div className='max-w-6xl mx-auto'>
					<div className='bg-white rounded-2xl shadow-lg p-6 mb-6'>
						<h1 className='text-2xl font-bold text-slate-900 mb-6'>
							Управление
						</h1>

						{/* Вкладки */}
						<div className='flex gap-2 border-b border-slate-200 mb-6'>
							<button
								type='button'
								onClick={() => setActiveTab('quests')}
								className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
									activeTab === 'quests'
										? 'border-blue-600 text-blue-600'
										: 'border-transparent text-slate-600 hover:text-slate-900'
								}`}
							>
								Квесты
							</button>
							<button
								type='button'
								onClick={() => setActiveTab('organizations')}
								className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
									activeTab === 'organizations'
										? 'border-blue-600 text-blue-600'
										: 'border-transparent text-slate-600 hover:text-slate-900'
								}`}
							>
								Организации
							</button>
						</div>

						{/* Контент вкладок */}
						{activeTab === 'quests' && <MyQuestsList />}
						{activeTab === 'organizations' && <MyOrganizationsList />}
					</div>
				</div>
			</div>
		</ProtectedRoute>
	)
}

