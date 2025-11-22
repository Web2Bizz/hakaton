import { MAX_ORGANIZATIONS_PER_USER, MAX_QUESTS_PER_USER } from '@/constants'
import { AddOrganizationForm, AddQuestForm } from '@/components/forms'
import { Spinner } from '@/components/ui/spinner'
import { useUser } from '@/hooks/useUser'
import { ProtectedRoute } from '@/provider/ProtectedRoute'
import { useGetOrganizationQuery, useGetOrganizationsQuery } from '@/store/entities/organization'
import { useGetQuestsQuery } from '@/store/entities/quest'
import { useMemo, useState } from 'react'

type FormType = 'quest' | 'organization'

export default function AddOrganizationPage() {
	const { canCreateQuest, canCreateOrganization, getUserOrganization, user } =
		useUser()
	const [formType, setFormType] = useState<FormType>('organization')
	const [isRedirecting, setIsRedirecting] = useState(false)

	// Загружаем все квесты для подсчета
	const { data: questsResponse } = useGetQuestsQuery()
	
	// Загружаем все организации для подсчета
	const { data: organizations = [] } = useGetOrganizationsQuery()

	// Подсчитываем количество созданных квестов пользователем
	const createdQuestsCount = useMemo(() => {
		if (!user?.id || !questsResponse?.data?.quests) return 0
		const userId = Number.parseInt(user.id, 10)
		return questsResponse.data.quests.filter(quest => quest.ownerId === userId).length
	}, [questsResponse, user?.id])

	// Подсчитываем количество созданных организаций пользователем
	const createdOrganizationsCount = useMemo(() => {
		if (!user?.createdOrganizationId || !organizations.length) return 0
		// Используем createdOrganizationId для определения созданной организации
		// Если MAX_ORGANIZATIONS_PER_USER > 1, потребуется изменить структуру User
		const orgId = typeof user.createdOrganizationId === 'string' 
			? Number.parseInt(user.createdOrganizationId, 10) 
			: Number.parseInt(String(user.createdOrganizationId), 10)
		return organizations.filter(org => {
			const orgIdNum = typeof org.id === 'string' ? Number.parseInt(org.id, 10) : org.id
			return orgIdNum === orgId
		}).length
	}, [organizations, user?.createdOrganizationId])

	// Получаем ID организации пользователя
	const userOrgId = getUserOrganization()

	// Проверяем существование организации через API
	const { data: organizationData } = useGetOrganizationQuery(userOrgId || '', {
		skip: !userOrgId,
	})

	// Определяем, действительно ли организация существует
	const hasOrganization = useMemo(() => {
		if (!userOrgId) return false
		// Если организация не найдена в API, значит она была удалена
		return !!organizationData
	}, [userOrgId, organizationData])

	// Используем проверку через API, если есть ID, иначе через локальное состояние
	const canCreateOrg = useMemo(() => {
		if (!userOrgId) {
			// Если нет ID, используем стандартную проверку
			return canCreateOrganization()
		}
		// Если есть ID, проверяем через API
		return !hasOrganization
	}, [userOrgId, hasOrganization, canCreateOrganization])

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
					<div className='mb-6 flex gap-2 bg-white p-1 rounded-lg border border-slate-200'>
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
									(создано {createdOrganizationsCount}/{MAX_ORGANIZATIONS_PER_USER})
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

					{/* Форма */}
					<div className='bg-white rounded-lg shadow-sm border border-slate-200 p-6 md:p-8'>
						{formType === 'organization' ? (
							<AddOrganizationForm onSuccess={handleSuccess} />
						) : (
							<AddQuestForm onSuccess={handleSuccess} disableEditMode={true} />
						)}
					</div>
				</div>
			</div>
		</ProtectedRoute>
	)
}
