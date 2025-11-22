import { Spinner } from '@/components/ui/spinner'
import { useUser } from '@/hooks/useUser'
import { ProtectedRoute } from '@/provider/ProtectedRoute'
import { useState, useEffect } from 'react'
import { MyQuestsList } from '@/components/manage/MyQuestsList'
import { MyOrganizationsList } from '@/components/manage/MyOrganizationsList'
import { Target, Building2 } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

export default function ManagePage() {
	const { user } = useUser()
	const [searchParams, setSearchParams] = useSearchParams()
	const tabParam = searchParams.get('tab')
	
	// Определяем начальную вкладку из URL параметра
	const initialTab = (tabParam === 'organizations' ? 'organizations' : 'quests') as 'quests' | 'organizations'
	const [activeTab, setActiveTab] = useState<'quests' | 'organizations'>(initialTab)

	// Обновляем вкладку при изменении URL параметра
	useEffect(() => {
		if (tabParam === 'organizations') {
			setActiveTab('organizations')
		} else if (tabParam === 'quests' || !tabParam) {
			setActiveTab('quests')
		}
	}, [tabParam])

	// Обновляем URL при изменении вкладки
	const handleTabChange = (tab: 'quests' | 'organizations') => {
		setActiveTab(tab)
		setSearchParams({ tab })
	}

	if (!user) {
		return (
			<ProtectedRoute>
				<div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-6 sm:py-12 px-4 mt-16'>
					<div className='max-w-7xl mx-auto'>
						<div className='flex items-center justify-center min-h-[400px]'>
							<Spinner />
						</div>
					</div>
				</div>
			</ProtectedRoute>
		)
	}

	return (
		<ProtectedRoute>
			<div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 mt-16'>
				<div className='max-w-7xl mx-auto'>
					{/* Header */}
					<div className='mb-8'>
						<h1 className='text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2'>
							Панель управления
						</h1>
						<p className='text-slate-600 text-lg'>
							Управляйте своими квестами и организациями
						</p>
					</div>

					{/* Вкладки */}
					<div className='bg-white rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden mb-6'>
						<div className='flex gap-1 p-2 bg-slate-50/50 border-b border-slate-200'>
							<button
								type='button'
								onClick={() => handleTabChange('quests')}
								className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 font-semibold text-sm rounded-xl transition-all duration-200 ${
									activeTab === 'quests'
										? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/30 transform scale-[1.02]'
										: 'text-slate-600 hover:text-slate-900 hover:bg-white'
								}`}
							>
								<Target className={`h-5 w-5 ${activeTab === 'quests' ? 'text-white' : 'text-orange-600'}`} />
								<span>Мои квесты</span>
							</button>
							<button
								type='button'
								onClick={() => handleTabChange('organizations')}
								className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 font-semibold text-sm rounded-xl transition-all duration-200 ${
									activeTab === 'organizations'
										? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 transform scale-[1.02]'
										: 'text-slate-600 hover:text-slate-900 hover:bg-white'
								}`}
							>
								<Building2 className={`h-5 w-5 ${activeTab === 'organizations' ? 'text-white' : 'text-blue-600'}`} />
								<span>Мои организации</span>
							</button>
						</div>

						{/* Контент вкладок */}
						<div className='p-6 sm:p-8'>
							{activeTab === 'quests' && <MyQuestsList />}
							{activeTab === 'organizations' && <MyOrganizationsList />}
						</div>
					</div>
				</div>
			</div>
		</ProtectedRoute>
	)
}

