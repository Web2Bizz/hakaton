/**
 * @title Добавить организацию или квест
 * @description Создайте новую волонтерскую организацию или квест на карте. Добавьте информацию о вашей инициативе, чтобы другие могли найти и присоединиться к вам
 * @keywords добавить организацию, создать квест, добавить точку на карте, новая организация, новый квест, создать организацию
 * @changefreq weekly
 * @priority 0.8
 */

import { AddOrganizationForm, AddQuestForm } from '@/components/forms'
import { AddOrganizationTourProvider } from '@/components/tour'
import { Spinner } from '@/components/ui/spinner'
import { MAX_ORGANIZATIONS_PER_USER, MAX_QUESTS_PER_USER } from '@/constants'
import { useUser } from '@/hooks/useUser'
import { ProtectedRoute } from '@/provider/ProtectedRoute'
import { useGetOrganizationsQuery } from '@/store/entities/organization'
import { useGetQuestsQuery } from '@/store/entities/quest'
import { useMemo, useState } from 'react'

type FormType = 'quest' | 'organization'

export default function AddOrganizationPage() {
	const { user } = useUser()
	const [formType, setFormType] = useState<FormType>('organization')
	const [isRedirecting, setIsRedirecting] = useState(false)

	// Загружаем все квесты для подсчета
	const { data: questsResponse } = useGetQuestsQuery()

	// Загружаем все организации для подсчета
	const { data: organizations = [] } = useGetOrganizationsQuery()

	// Подсчитываем количество созданных квестов пользователем (исключая архивированные)
	const createdQuestsCount = useMemo(() => {
		const userId = user?.id
		if (!userId || !questsResponse?.data?.quests) return 0
		const userIdNum = Number.parseInt(userId, 10)
		return questsResponse.data.quests.filter(
			quest => quest.ownerId === userIdNum && quest.status !== 'archived'
		).length
	}, [questsResponse, user])

	// Подсчитываем количество созданных организаций пользователем
	const createdOrganizationsCount = useMemo(() => {
		const createdOrgId = user?.createdOrganizationId
		if (!createdOrgId || !organizations.length) return 0
		// Используем createdOrganizationId для определения созданной организации
		// Если MAX_ORGANIZATIONS_PER_USER > 1, потребуется изменить структуру User
		const orgId =
			typeof createdOrgId === 'string'
				? Number.parseInt(createdOrgId, 10)
				: Number.parseInt(String(createdOrgId), 10)
		return organizations.filter(org => {
			const orgIdNum =
				typeof org.id === 'string' ? Number.parseInt(org.id, 10) : org.id
			return orgIdNum === orgId
		}).length
	}, [organizations, user])

	const handleSuccess = () => {
		// Показываем loader и перенаправляем на карту после успешного создания
		setIsRedirecting(true)
		setTimeout(() => {
			globalThis.location.href = '/map'
		}, 2000)
	}

	// Показываем loader при перенаправлении
	if (isRedirecting) {
		return (
			<div
				className='fixed inset-0 z-50 bg-slate-50'
				style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
			>
				<div className='w-full h-full flex items-center justify-center'>
					<div className='flex flex-col items-center gap-4'>
						<Spinner />
					</div>
				</div>
			</div>
		)
	}

	return (
		<ProtectedRoute>
			<div className='min-h-screen bg-slate-50 pt-24 pb-12'>
				<div className='max-w-4xl mx-auto px-6'>
					<div className='mb-8'>
						<h1 className='text-3xl font-bold text-slate-900 mb-2'>
							Добавить точку на карте
						</h1>
						<p className='text-slate-600'>
							Создайте квест или организацию, чтобы помочь другим людям найти
							вас
						</p>
					</div>

					{/* Переключатель типа формы */}
					<div className='add-organization-tabs-container mb-6 flex gap-2 bg-white p-1 rounded-lg border border-slate-200'>
						<button
							type='button'
							onClick={() => setFormType('organization')}
							className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
								formType === 'organization'
									? 'bg-blue-600 text-white shadow-sm'
									: 'text-slate-600 hover:text-slate-900'
							}`}
						>
							Организация
							{createdOrganizationsCount > 0 && (
								<span className='ml-2 text-xs opacity-75'>
									(создано {createdOrganizationsCount}/
									{MAX_ORGANIZATIONS_PER_USER})
								</span>
							)}
						</button>
						<button
							type='button'
							onClick={() => setFormType('quest')}
							className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
								formType === 'quest'
									? 'bg-blue-600 text-white shadow-sm'
									: 'text-slate-600 hover:text-slate-900'
							}`}
						>
							Квест
							{createdQuestsCount > 0 && (
								<span className='ml-2 text-xs opacity-75'>
									(создано {createdQuestsCount}/{MAX_QUESTS_PER_USER})
								</span>
							)}
						</button>
					</div>

					{/* Контейнер для информации об ограничениях */}
					<div className='add-organization-limits-container mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4'>
						<div className='flex items-start gap-3'>
							<div className='text-blue-600 text-xl'>ℹ️</div>
							<div className='flex-1'>
								<h3 className='text-sm font-semibold text-blue-900 mb-1'>
									Ограничения на создание
								</h3>
								<p className='text-xs text-blue-700'>
									Максимум {MAX_ORGANIZATIONS_PER_USER} организация и{' '}
									{MAX_QUESTS_PER_USER} квестов на пользователя
								</p>
							</div>
						</div>
					</div>

					{/* Форма */}
					<div className='bg-white rounded-lg shadow-sm border border-slate-200 p-6 md:p-8'>
						{formType === 'organization' ? (
							<AddOrganizationForm
								onSuccess={handleSuccess}
								disableEditMode={true}
							/>
						) : (
							<AddQuestForm onSuccess={handleSuccess} />
						)}
					</div>
				</div>
			</div>
			<AddOrganizationTourProvider />
		</ProtectedRoute>
	)
}
