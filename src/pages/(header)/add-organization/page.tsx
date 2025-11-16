import { AddOrganizationForm, AddQuestForm } from '@/components/forms'
import { useUser } from '@/hooks/useUser'
import { ProtectedRoute } from '@/provider/ProtectedRoute'
import { useGetOrganizationQuery } from '@/store/entities/organization'
import { useState, useMemo } from 'react'

type FormType = 'quest' | 'organization'

export default function AddOrganizationPage() {
	const { canCreateQuest, canCreateOrganization, getUserOrganization } = useUser()
	const [formType, setFormType] = useState<FormType>('organization')
	
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
		// Перенаправляем на карту после успешного создания
		setTimeout(() => {
			window.location.href = '/map'
		}, 2000)
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
							{!canCreateOrg && (
								<span className='ml-2 text-xs opacity-75'>(создана)</span>
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
							{!canCreateQuest() && (
								<span className='ml-2 text-xs opacity-75'>(создан)</span>
							)}
						</button>
					</div>

					{/* Форма */}
					<div className='bg-white rounded-lg shadow-sm border border-slate-200 p-6 md:p-8'>
						{formType === 'organization' ? (
							<AddOrganizationForm onSuccess={handleSuccess} />
						) : (
							<AddQuestForm onSuccess={handleSuccess} />
						)}
					</div>

					{/* Информация об ограничениях */}
					<div className='mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4'>
						<p className='text-sm text-blue-800'>
							<strong>Важно:</strong> Один пользователь может создать только
							одну организацию и один квест. Это помогает поддерживать качество
							контента на платформе.
						</p>
					</div>
				</div>
			</div>
		</ProtectedRoute>
	)
}
