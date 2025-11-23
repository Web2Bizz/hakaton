/**
 * @title Управление квестами и организациями
 * @description Управляйте созданными вами квестами и организациями. Редактируйте информацию, отслеживайте прогресс и управляйте активностью ваших инициатив
 * @keywords управление, мои квесты, мои организации, редактировать квест, редактировать организацию, управление квестами
 * @changefreq daily
 * @priority 0.7
 */

import { MyOrganizationsList } from '@/components/manage/MyOrganizationsList'
import { MyQuestsList } from '@/components/manage/MyQuestsList'
import { Spinner } from '@/components/ui/spinner'
import { useUser } from '@/hooks/useUser'
import { ProtectedRoute } from '@/provider/ProtectedRoute'
import { useGetOrganizationsQuery } from '@/store/entities/organization'
import { useGetUserQuestsQuery } from '@/store/entities/quest'
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

	// Загружаем данные для статистики
	const { data: questsResponse } = useGetUserQuestsQuery(user?.id || '', {
		skip: !user?.id,
	})
	const { data: organizations = [] } = useGetOrganizationsQuery()

	// Статистика квестов
	const questsStats = useMemo(() => {
		if (!questsResponse?.data?.quests)
			return { total: 0, active: 0, completed: 0, archived: 0 }
		const quests = questsResponse.data.quests
		return {
			total: quests.length,
			active: quests.filter(q => q.status === 'active').length,
			completed: quests.filter(q => q.status === 'completed').length,
			archived: quests.filter(q => q.status === 'archived').length,
		}
	}, [questsResponse])

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
			// Используем setTimeout для асинхронного обновления
			const timeoutId = setTimeout(() => {
				setActiveTab(currentTab)
			}, 0)
			return () => clearTimeout(timeoutId)
		}
	}, [currentTab, activeTab])

	// Обновляем URL при изменении вкладки
	const handleTabChange = (tab: 'quests' | 'organizations') => {
		setActiveTab(tab)
		setSearchParams({ tab })
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
			<div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 pt-[72px]'>
				<div className='max-w-7xl mx-auto pt-8'>
					{/* Header с иконкой */}
					<div className='mb-8'>
						<div className='flex items-center gap-4 mb-4'>
							<div className='w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30'>
								<Settings className='h-7 w-7 text-white' />
							</div>
							<div>
								<h1 className='text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2'>
									Панель управления
								</h1>
								<p className='text-slate-600 text-lg'>
									Управляйте своими квестами и организациями
								</p>
							</div>
						</div>

						{/* Статистика (только для квестов) */}
						{activeTab === 'quests' && (
							<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mt-6'>
								<div className='bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 p-4 shadow-sm'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm text-slate-600 mb-1'>
												Всего квестов
											</p>
											<p className='text-2xl font-bold text-slate-900'>
												{questsStats.total}
											</p>
										</div>
										<div className='w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center'>
											<Target className='h-6 w-6 text-orange-600' />
										</div>
									</div>
								</div>
								<div className='bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 p-4 shadow-sm'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm text-slate-600 mb-1'>Активных</p>
											<p className='text-2xl font-bold text-orange-600'>
												{questsStats.active}
											</p>
										</div>
										<div className='w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center'>
											<Target className='h-6 w-6 text-orange-600' />
										</div>
									</div>
								</div>
								<div className='bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 p-4 shadow-sm'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm text-slate-600 mb-1'>Завершено</p>
											<p className='text-2xl font-bold text-green-600'>
												{questsStats.completed}
											</p>
										</div>
										<div className='w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center'>
											<Target className='h-6 w-6 text-green-600' />
										</div>
									</div>
								</div>
								<div className='bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 p-4 shadow-sm'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm text-slate-600 mb-1'>
												Архивировано
											</p>
											<p className='text-2xl font-bold text-slate-600'>
												{questsStats.archived}
											</p>
										</div>
										<div className='w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center'>
											<Target className='h-6 w-6 text-slate-600' />
										</div>
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Вкладки с улучшенным дизайном */}
					<div className='bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden mb-6'>
						{/* Заголовок вкладок */}
						<div className='bg-gradient-to-r from-slate-50 to-blue-50/30 border-b border-slate-200/50 px-6 py-4'>
							<div className='flex items-center justify-between'>
								<div className='flex gap-2'>
									<button
										type='button'
										onClick={() => handleTabChange('quests')}
										className={`flex items-center gap-2.5 px-5 py-2.5 font-semibold text-sm rounded-xl transition-all duration-300 ${
											activeTab === 'quests'
												? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/30'
												: 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
										}`}
									>
										<Target
											className={`h-5 w-5 transition-transform ${
												activeTab === 'quests'
													? 'text-white scale-110'
													: 'text-orange-600'
											}`}
										/>
										<span>Мои квесты</span>
										{activeTab === 'quests' && questsStats.total > 0 && (
											<span className='ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold'>
												{questsStats.total}
											</span>
										)}
									</button>
									<button
										type='button'
										onClick={() => handleTabChange('organizations')}
										className={`flex items-center gap-2.5 px-5 py-2.5 font-semibold text-sm rounded-xl transition-all duration-300 ${
											activeTab === 'organizations'
												? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
												: 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
										}`}
									>
										<Building2
											className={`h-5 w-5 transition-transform ${
												activeTab === 'organizations'
													? 'text-white scale-110'
													: 'text-blue-600'
											}`}
										/>
										<span>Мои организации</span>
										{activeTab === 'organizations' && orgsStats.total > 0 && (
											<span className='ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold'>
												{orgsStats.total}
											</span>
										)}
									</button>
								</div>
								{activeTab === 'quests' && (
									<button
										type='button'
										onClick={() => navigate('/add-organization?type=quest')}
										className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl hover:from-orange-600 hover:to-amber-700 shadow-md shadow-orange-500/30 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/40'
									>
										<Plus className='h-4 w-4' />
										<span className='hidden sm:inline'>Создать квест</span>
										<span className='sm:hidden'>Создать</span>
									</button>
								)}
							</div>
						</div>

						{/* Контент вкладок */}
						<div className='p-6 sm:p-8 bg-gradient-to-br from-white to-slate-50/30'>
							{activeTab === 'quests' && <MyQuestsList />}
							{activeTab === 'organizations' && <MyOrganizationsList />}
						</div>
					</div>
				</div>
			</div>
		</ProtectedRoute>
	)
}
