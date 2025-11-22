import { Spinner } from '@/components/ui/spinner'
import { useUser } from '@/hooks/useUser'
import { ProtectedRoute } from '@/provider/ProtectedRoute'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetQuestQuery } from '@/store/entities/quest'
import { QuestUpdatesManagement } from '@/components/forms/quest/sections/QuestUpdatesManagement'
import { QuestManagement } from '@/components/manage/QuestManagement'
import { QuestEditForm } from '@/components/manage/QuestEditForm'
import { ArrowLeft, FileText, Bell, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function QuestManagePage() {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const { user } = useUser()
	const questId = id ? Number.parseInt(id, 10) : undefined
	const [activeTab, setActiveTab] = useState<
		'basic' | 'updates' | 'management'
	>('basic')

	const {
		data: quest,
		isLoading,
		error,
	} = useGetQuestQuery(questId!, {
		skip: !questId,
	})

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

	if (isLoading) {
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

	if (error || !quest) {
		return (
			<ProtectedRoute>
				<div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-6 sm:py-12 px-4 mt-16'>
					<div className='max-w-6xl mx-auto'>
						<div className='bg-white rounded-2xl shadow-lg p-6'>
							<p className='text-red-600'>Ошибка загрузки квеста</p>
							<Button
								type='button'
								variant='outline'
								onClick={() => navigate('/manage')}
								className='mt-4'
							>
								<ArrowLeft className='h-4 w-4 mr-2' />
								Вернуться к списку
							</Button>
						</div>
					</div>
				</div>
			</ProtectedRoute>
		)
	}

	// Проверяем, что пользователь является владельцем квеста
	const isOwner = quest.ownerId === Number(user.id) || quest.id === Number(user.createdQuestId)

	if (!isOwner) {
		return (
			<ProtectedRoute>
				<div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-6 sm:py-12 px-4 mt-16'>
					<div className='max-w-6xl mx-auto'>
						<div className='bg-white rounded-2xl shadow-lg p-6'>
							<p className='text-slate-600 mb-4'>
								У вас нет доступа к управлению этим квестом
							</p>
							<Button
								type='button'
								variant='outline'
								onClick={() => navigate('/manage')}
							>
								<ArrowLeft className='h-4 w-4 mr-2' />
								Вернуться к списку
							</Button>
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
					{/* Header с градиентом */}
					<div className='bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 rounded-2xl shadow-2xl p-8 mb-6 text-white relative overflow-hidden'>
						{/* Декоративные элементы */}
						<div className='absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32' />
						<div className='absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-24 -mb-24' />
						
						<div className='relative z-10'>
							<Button
								type='button'
								variant='outline'
								size='sm'
								onClick={() => navigate('/manage')}
								className='mb-6 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm'
							>
								<ArrowLeft className='h-4 w-4 mr-2' />
								Назад к списку
							</Button>
							<h1 className='text-3xl sm:text-4xl font-bold mb-2 drop-shadow-lg'>
								{quest.title}
							</h1>
							<p className='text-blue-100 text-lg'>
								Панель управления квестом
							</p>
						</div>
					</div>

					{/* Вкладки */}
					<div className='bg-white rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden mb-6'>
						<div className='flex gap-1 p-2 bg-slate-50/50 border-b border-slate-200'>
							<button
								type='button'
								onClick={() => setActiveTab('basic')}
								className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 font-semibold text-sm rounded-xl transition-all duration-200 ${
									activeTab === 'basic'
										? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 transform scale-[1.02]'
										: 'text-slate-600 hover:text-slate-900 hover:bg-white'
								}`}
							>
								<FileText className={`h-5 w-5 ${activeTab === 'basic' ? 'text-white' : 'text-blue-600'}`} />
								<span>Основная информация</span>
							</button>
							<button
								type='button'
								onClick={() => setActiveTab('updates')}
								className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 font-semibold text-sm rounded-xl transition-all duration-200 ${
									activeTab === 'updates'
										? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 transform scale-[1.02]'
										: 'text-slate-600 hover:text-slate-900 hover:bg-white'
								}`}
							>
								<Bell className={`h-5 w-5 ${activeTab === 'updates' ? 'text-white' : 'text-blue-600'}`} />
								<span>Обновления</span>
							</button>
							<button
								type='button'
								onClick={() => setActiveTab('management')}
								className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 font-semibold text-sm rounded-xl transition-all duration-200 ${
									activeTab === 'management'
										? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 transform scale-[1.02]'
										: 'text-slate-600 hover:text-slate-900 hover:bg-white'
								}`}
							>
								<Settings className={`h-5 w-5 ${activeTab === 'management' ? 'text-white' : 'text-blue-600'}`} />
								<span>Менеджмент</span>
							</button>
						</div>

						{/* Контент вкладок */}
						<div className='p-6 sm:p-8'>

							{activeTab === 'basic' && questId && (
								<QuestEditForm questId={questId} />
							)}
							{activeTab === 'updates' && questId && (
								<QuestUpdatesManagement questId={questId} />
							)}
							{activeTab === 'management' && questId && (
								<QuestManagement questId={questId} quest={quest} />
							)}
						</div>
					</div>
				</div>
			</div>
		</ProtectedRoute>
	)
}

