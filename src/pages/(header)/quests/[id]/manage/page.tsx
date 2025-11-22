import { Spinner } from '@/components/ui/spinner'
import { useUser } from '@/hooks/useUser'
import { ProtectedRoute } from '@/provider/ProtectedRoute'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetQuestQuery } from '@/store/entities/quest'
import { QuestUpdatesManagement } from '@/components/forms/quest/sections/QuestUpdatesManagement'
import { QuestManagement } from '@/components/manage/QuestManagement'
import { QuestEditForm } from '@/components/manage/QuestEditForm'
import { ArrowLeft } from 'lucide-react'
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
			<div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-6 sm:py-12 px-4 mt-16'>
				<div className='max-w-6xl mx-auto'>
					<div className='bg-white rounded-2xl shadow-lg p-6 mb-6'>
						<div className='flex items-center gap-4 mb-6'>
							<Button
								type='button'
								variant='outline'
								size='sm'
								onClick={() => navigate('/manage')}
							>
								<ArrowLeft className='h-4 w-4 mr-2' />
								Назад
							</Button>
							<h1 className='text-2xl font-bold text-slate-900'>{quest.title}</h1>
						</div>

						{/* Вкладки */}
						<div className='flex gap-2 border-b border-slate-200 mb-6'>
							<button
								type='button'
								onClick={() => setActiveTab('basic')}
								className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
									activeTab === 'basic'
										? 'border-blue-600 text-blue-600'
										: 'border-transparent text-slate-600 hover:text-slate-900'
								}`}
							>
								Основная информация
							</button>
							<button
								type='button'
								onClick={() => setActiveTab('updates')}
								className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
									activeTab === 'updates'
										? 'border-blue-600 text-blue-600'
										: 'border-transparent text-slate-600 hover:text-slate-900'
								}`}
							>
								Обновления
							</button>
							<button
								type='button'
								onClick={() => setActiveTab('management')}
								className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
									activeTab === 'management'
										? 'border-blue-600 text-blue-600'
										: 'border-transparent text-slate-600 hover:text-slate-900'
								}`}
							>
								Менеджмент
							</button>
						</div>

						{/* Контент вкладок */}
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
		</ProtectedRoute>
	)
}

