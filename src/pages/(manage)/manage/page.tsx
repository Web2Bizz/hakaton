/**
 * @title Управление квестами и организациями
 * @description Управляйте созданными вами квестами и организациями. Редактируйте информацию, отслеживайте прогресс и управляйте активностью ваших инициатив
 * @keywords управление, мои квесты, мои организации, редактировать квест, редактировать организацию, управление квестами
 * @changefreq daily
 * @priority 0.7
 */

import { MyOrganizationsList } from '@/components/manage/MyOrganizationsList'
import { MyQuestsList } from '@/components/manage/MyQuestsList'
import { ManageTourProvider } from '@/components/tour'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { useUser } from '@/hooks/useUser'
import { ProtectedRoute } from '@/provider/ProtectedRoute'
import { useGetOrganizationsQuery } from '@/store/entities/organization'
import { useGetQuestsQuery } from '@/store/entities/quest'
import { Building2, Plus, Settings, Target } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function ManagePage() {
	const { user } = useUser()
	const navigate = useNavigate()
	const [searchParams, setSearchParams] = useSearchParams()
	const tabParam = searchParams.get('tab')

	// Определяем текущую вкладку из URL параметра
	const currentTab: 'quests' | 'organizations' =
		tabParam === 'organizations' ? 'organizations' : 'quests'
	const [activeTab, setActiveTab] = useState<'quests' | 'organizations'>(
		currentTab
	)
	const [isTabChanging, setIsTabChanging] = useState(false)

	// Загружаем данные для статистики
	// Используем фильтр ownerId на сервере для получения только созданных квестов
	const userIdNum = user?.id
		? typeof user.id === 'string'
			? Number.parseInt(user.id, 10)
			: Number(user.id)
		: undefined

	const { data: questsResponse } = useGetQuestsQuery(
		userIdNum
			? {
					ownerId: userIdNum,
			  }
			: undefined
	)
	const { data: organizations = [] } = useGetOrganizationsQuery()

	// Статистика квестов (только созданные пользователем)
	// Фильтрация по ownerId уже выполнена на сервере
	const questsStats = useMemo(() => {
		if (!questsResponse?.data?.quests || !user?.id)
			return { total: 0, active: 0, completed: 0, archived: 0 }

		const createdQuests = questsResponse.data.quests

		return {
			total: createdQuests.length,
			active: createdQuests.filter(q => q.status === 'active').length,
			completed: createdQuests.filter(q => q.status === 'completed').length,
			archived: createdQuests.filter(q => q.status === 'archived').length,
		}
	}, [questsResponse, user?.id])

	// Статистика организаций
	const orgsStats = useMemo(() => {
		const createdOrgId = user?.createdOrganizationId
		if (!createdOrgId) return { total: 0 }
		const myOrgs = organizations.filter(org => {
			const orgId = typeof org.id === 'string' ? org.id : String(org.id)
			return orgId === createdOrgId || org.id === createdOrgId
		})
		return { total: myOrgs.length }
	}, [organizations, user])

	// Обновляем вкладку при изменении URL параметра
	useEffect(() => {
		if (currentTab !== activeTab) {
			setIsTabChanging(true)
			// Используем setTimeout для асинхронного обновления
			const timeoutId = setTimeout(() => {
				setActiveTab(currentTab)
				setTimeout(() => {
					setIsTabChanging(false)
				}, 200)
			}, 0)
			return () => clearTimeout(timeoutId)
		}
	}, [currentTab, activeTab])

	// Обновляем URL при изменении вкладки
	const handleTabChange = (tab: 'quests' | 'organizations') => {
		if (tab === activeTab) return

		setIsTabChanging(true)
		setActiveTab(tab)
		setSearchParams({ tab })

		// Скрываем скелетон после небольшой задержки для плавной анимации
		setTimeout(() => {
			setIsTabChanging(false)
		}, 200)
	}

	if (!user) {
		return (
			<ProtectedRoute>
				<div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-6 sm:py-12 px-4 pt-[72px]'>
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
			<div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30 py-4 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8 pt-[72px]'>
				<div className='max-w-7xl mx-auto pt-4 sm:pt-8'>
					{/* Header с иконкой */}
					<div className='manage-header-container mb-4 sm:mb-6 lg:mb-8'>
						<div className='flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4'>
							<div className='w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0'>
								<Settings className='h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white' />
							</div>
							<div className='min-w-0 flex-1'>
								<h1 className='text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent mb-1 sm:mb-2'>
									Панель управления
								</h1>
								<p className='text-sm sm:text-base lg:text-lg text-slate-600'>
									Управляйте своими квестами и организациями
								</p>
							</div>
						</div>
					</div>

					{/* Статистика (только для квестов) */}
					{activeTab === 'quests' && (
						<div className='manage-quests-stats-container grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6 lg:mb-8 transition-opacity duration-300 ease-in-out opacity-100'>
							<div className='bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl border border-slate-200/50 p-3 sm:p-4 shadow-sm'>
								<div className='flex items-center justify-between gap-2'>
									<div className='min-w-0 flex-1'>
										<p className='text-xs sm:text-sm text-slate-600 mb-1 truncate'>
											Всего квестов
										</p>
										<p className='text-xl sm:text-2xl font-bold text-slate-900'>
											{questsStats.total}
										</p>
									</div>
									<div className='w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0'>
										<Target className='h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-orange-600' />
									</div>
								</div>
							</div>
							<div className='bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl border border-slate-200/50 p-3 sm:p-4 shadow-sm'>
								<div className='flex items-center justify-between gap-2'>
									<div className='min-w-0 flex-1'>
										<p className='text-xs sm:text-sm text-slate-600 mb-1 truncate'>
											Активных
										</p>
										<p className='text-xl sm:text-2xl font-bold text-orange-600'>
											{questsStats.active}
										</p>
									</div>
									<div className='w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0'>
										<Target className='h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-orange-600' />
									</div>
								</div>
							</div>
							<div className='bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl border border-slate-200/50 p-3 sm:p-4 shadow-sm'>
								<div className='flex items-center justify-between gap-2'>
									<div className='min-w-0 flex-1'>
										<p className='text-xs sm:text-sm text-slate-600 mb-1 truncate'>
											Завершено
										</p>
										<p className='text-xl sm:text-2xl font-bold text-green-600'>
											{questsStats.completed}
										</p>
									</div>
									<div className='w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0'>
										<Target className='h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600' />
									</div>
								</div>
							</div>
							<div className='bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl border border-slate-200/50 p-3 sm:p-4 shadow-sm'>
								<div className='flex items-center justify-between gap-2'>
									<div className='min-w-0 flex-1'>
										<p className='text-xs sm:text-sm text-slate-600 mb-1 truncate'>
											Архивировано
										</p>
										<p className='text-xl sm:text-2xl font-bold text-slate-600'>
											{questsStats.archived}
										</p>
									</div>
									<div className='w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0'>
										<Target className='h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-slate-600' />
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Вкладки с улучшенным дизайном */}
					<div className='bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden mb-4 sm:mb-6'>
						{/* Заголовок вкладок */}
						<div className='manage-tabs-container bg-gradient-to-r from-slate-50 to-blue-50/30 border-b border-slate-200/50 px-3 sm:px-4 lg:px-6 py-3 sm:py-4'>
							<div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4'>
								<div className='flex gap-2 flex-1 sm:flex-initial'>
									<button
										type='button'
										onClick={() => handleTabChange('quests')}
										className={`flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 font-semibold text-xs sm:text-sm rounded-lg sm:rounded-xl transition-all duration-300 flex-1 sm:flex-initial justify-center ${
											activeTab === 'quests'
												? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/30'
												: 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
										}`}
									>
										<Target
											className={`h-4 w-4 sm:h-5 sm:w-5 transition-transform flex-shrink-0 ${
												activeTab === 'quests'
													? 'text-white scale-110'
													: 'text-orange-600'
											}`}
										/>
										<span className='truncate'>Мои квесты</span>
										{activeTab === 'quests' && questsStats.total > 0 && (
											<span className='ml-1 px-1.5 sm:px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold flex-shrink-0'>
												{questsStats.total}
											</span>
										)}
									</button>
									<button
										type='button'
										onClick={() => handleTabChange('organizations')}
										className={`flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 font-semibold text-xs sm:text-sm rounded-lg sm:rounded-xl transition-all duration-300 flex-1 sm:flex-initial justify-center ${
											activeTab === 'organizations'
												? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
												: 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
										}`}
									>
										<Building2
											className={`h-4 w-4 sm:h-5 sm:w-5 transition-transform flex-shrink-0 ${
												activeTab === 'organizations'
													? 'text-white scale-110'
													: 'text-blue-600'
											}`}
										/>
										<span className='truncate'>Мои организации</span>
										{activeTab === 'organizations' && orgsStats.total > 0 && (
											<span className='ml-1 px-1.5 sm:px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold flex-shrink-0'>
												{orgsStats.total}
											</span>
										)}
									</button>
								</div>
								{activeTab === 'quests' && (
									<div className='manage-create-button-container flex-shrink-0'>
										<button
											type='button'
											onClick={() => navigate('/add-organization')}
											className='w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg sm:rounded-xl hover:from-orange-600 hover:to-amber-700 shadow-md shadow-orange-500/30 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/40'
										>
											<Plus className='h-4 w-4' />
											<span className='hidden sm:inline'>Создать квест</span>
											<span className='sm:hidden'>Создать</span>
										</button>
									</div>
								)}
							</div>
						</div>

						{/* Контент вкладок */}
						<div className='bg-gradient-to-br from-white to-slate-50/30 relative'>
							<div className='p-4 sm:p-6 lg:p-8'>
								{isTabChanging ? (
									<div className='space-y-4'>
										{/* Скелетон для списка */}
										{[...Array(3)].map((_, i) => (
											<div
												key={i}
												className='bg-white rounded-lg border border-slate-200 p-4 sm:p-6'
											>
												<div className='flex items-start gap-4'>
													<Skeleton className='w-20 h-20 sm:w-24 sm:h-24 rounded-lg flex-shrink-0' />
													<div className='flex-1 space-y-3'>
														<Skeleton className='h-6 w-3/4' />
														<Skeleton className='h-4 w-full' />
														<Skeleton className='h-4 w-2/3' />
														<div className='flex gap-2 mt-4'>
															<Skeleton className='h-8 w-24' />
															<Skeleton className='h-8 w-24' />
														</div>
													</div>
												</div>
											</div>
										))}
									</div>
								) : (
									<div
										key={activeTab}
										className='transition-opacity duration-300 ease-in-out opacity-100'
									>
										{activeTab === 'quests' && <MyQuestsList />}
										{activeTab === 'organizations' && <MyOrganizationsList />}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
			<ManageTourProvider />
		</ProtectedRoute>
	)
}
