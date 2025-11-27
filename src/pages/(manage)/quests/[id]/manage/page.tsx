/**
 * @title Управление квестом
 * @description Редактируйте информацию о вашем квесте, управляйте этапами, обновлениями и отслеживайте прогресс участников. Полный контроль над вашей инициативой
 * @keywords управление квестом, редактировать квест, настройки квеста, обновления квеста, этапы квеста
 * @changefreq weekly
 * @priority 0.6
 */

import { QuestUpdatesManagement } from '@/components/forms/quest/sections/QuestUpdatesManagement'
import { QuestEditForm } from '@/components/manage/QuestEditForm'
import { QuestManagement } from '@/components/manage/QuestManagement'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useUser } from '@/hooks/useUser'
import { ProtectedRoute } from '@/provider/ProtectedRoute'
import { useGetQuestQuery } from '@/store/entities/quest'
import { ArrowLeft, Bell, FileText, Settings } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

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
				<div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-4 sm:py-6 lg:py-12 px-4 mt-16'>
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
				<div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-4 sm:py-6 lg:py-12 px-4 mt-16'>
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
				<div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-4 sm:py-6 lg:py-12 px-4 mt-16'>
					<div className='max-w-6xl mx-auto'>
						<div className='bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6'>
							<p className='text-red-600 text-sm sm:text-base'>
								Ошибка загрузки квеста
							</p>
							<Button
								type='button'
								variant='outline'
								onClick={() => navigate('/manage')}
								className='mt-4 text-xs sm:text-sm h-9 sm:h-10'
							>
								<ArrowLeft className='h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2' />
								<span className='hidden sm:inline'>Вернуться к списку</span>
								<span className='sm:hidden'>Назад</span>
							</Button>
						</div>
					</div>
				</div>
			</ProtectedRoute>
		)
	}

	// Проверяем, что пользователь является владельцем квеста
	const isOwner =
		quest.ownerId === Number(user.id) ||
		quest.id === Number(user.createdQuestId)

	if (!isOwner) {
		return (
			<ProtectedRoute>
				<div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-4 sm:py-6 lg:py-12 px-4 mt-16'>
					<div className='max-w-6xl mx-auto'>
						<div className='bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6'>
							<p className='text-slate-600 mb-4 text-sm sm:text-base'>
								У вас нет доступа к управлению этим квестом
							</p>
							<Button
								type='button'
								variant='outline'
								onClick={() => navigate('/manage')}
								className='text-xs sm:text-sm h-9 sm:h-10'
							>
								<ArrowLeft className='h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2' />
								<span className='hidden sm:inline'>Вернуться к списку</span>
								<span className='sm:hidden'>Назад</span>
							</Button>
						</div>
					</div>
				</div>
			</ProtectedRoute>
		)
	}

	const isArchived = quest.status === 'archived'

	return (
		<ProtectedRoute>
			<div
				className={`min-h-screen py-4 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8 mt-16 ${
					isArchived
						? 'bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100'
						: 'bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50'
				}`}
			>
				<div className='max-w-7xl mx-auto'>
					{/* Header с градиентом */}
					<div
						className={`rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 text-white relative overflow-hidden ${
							isArchived
								? 'bg-gradient-to-r from-slate-500 via-slate-600 to-slate-700 opacity-90'
								: 'bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700'
						}`}
					>
						{/* Декоративные элементы */}
						<div className='absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32' />
						<div className='absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-24 -mb-24' />

						<div className='relative z-10'>
							<Button
								type='button'
								variant='outline'
								size='sm'
								onClick={() => navigate('/manage')}
								className='mb-3 sm:mb-4 lg:mb-6 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm text-xs sm:text-sm h-8 sm:h-9'
							>
								<ArrowLeft className='h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2' />
								<span className='hidden sm:inline'>Назад к списку</span>
								<span className='sm:hidden'>Назад</span>
							</Button>
							<h1 className='text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-1 sm:mb-2 drop-shadow-lg break-words'>
								{quest.title}
							</h1>
							<p className='text-blue-100 text-sm sm:text-base lg:text-lg'>
								Панель управления квестом
							</p>
						</div>
					</div>

					{/* Вкладки */}
					<div
						className={`rounded-xl sm:rounded-2xl shadow-xl border overflow-hidden mb-4 sm:mb-6 ${
							isArchived
								? 'bg-slate-50 border-slate-300 opacity-90'
								: 'bg-white border-slate-200/50'
						}`}
					>
						<div
							className={`flex gap-1 sm:gap-2 p-1.5 sm:p-2 border-b ${
								isArchived
									? 'bg-slate-100/80 border-slate-300'
									: 'bg-slate-50/50 border-slate-200'
							}`}
						>
							<button
								type='button'
								onClick={() => setActiveTab('basic')}
								className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 lg:px-6 py-2.5 sm:py-3 lg:py-3.5 font-semibold text-xs sm:text-sm rounded-lg sm:rounded-xl transition-all duration-200 ${
									activeTab === 'basic'
										? isArchived
											? 'bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-lg shadow-slate-500/30 transform scale-[1.02]'
											: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 transform scale-[1.02]'
										: isArchived
										? 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
										: 'text-slate-600 hover:text-slate-900 hover:bg-white'
								}`}
							>
								<FileText
									className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${
										activeTab === 'basic'
											? 'text-white'
											: isArchived
											? 'text-slate-500'
											: 'text-blue-600'
									}`}
								/>
								<span className='truncate hidden sm:inline'>
									Основная информация
								</span>
								<span className='truncate sm:hidden'>Основная</span>
							</button>
							<button
								type='button'
								onClick={() => setActiveTab('updates')}
								className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 lg:px-6 py-2.5 sm:py-3 lg:py-3.5 font-semibold text-xs sm:text-sm rounded-lg sm:rounded-xl transition-all duration-200 ${
									activeTab === 'updates'
										? isArchived
											? 'bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-lg shadow-slate-500/30 transform scale-[1.02]'
											: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 transform scale-[1.02]'
										: isArchived
										? 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
										: 'text-slate-600 hover:text-slate-900 hover:bg-white'
								}`}
							>
								<Bell
									className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${
										activeTab === 'updates'
											? 'text-white'
											: isArchived
											? 'text-slate-500'
											: 'text-blue-600'
									}`}
								/>
								<span className='truncate'>Обновления</span>
							</button>
							<button
								type='button'
								onClick={() => setActiveTab('management')}
								className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 lg:px-6 py-2.5 sm:py-3 lg:py-3.5 font-semibold text-xs sm:text-sm rounded-lg sm:rounded-xl transition-all duration-200 ${
									activeTab === 'management'
										? isArchived
											? 'bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-lg shadow-slate-500/30 transform scale-[1.02]'
											: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 transform scale-[1.02]'
										: isArchived
										? 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
										: 'text-slate-600 hover:text-slate-900 hover:bg-white'
								}`}
							>
								<Settings
									className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${
										activeTab === 'management'
											? 'text-white'
											: isArchived
											? 'text-slate-500'
											: 'text-blue-600'
									}`}
								/>
								<span className='truncate'>Менеджмент</span>
							</button>
						</div>

						{/* Контент вкладок */}
						<div className='p-4 sm:p-6 lg:p-8'>
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
