import type { Organization } from '@/components/map/types/types'
import { Spinner } from '@/components/ui/spinner'
import { useGetMyOrganizationsQuery } from '@/store/entities/organization'
import { getOrganizationCoordinates } from '@/utils/cityCoordinates'
import { logger } from '@/utils/logger'
import { ArrowRight, Building2, Clock, Heart, Map, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function MyOrganizationsList() {
	const navigate = useNavigate()
	const { data: myOrganizations = [], isLoading } = useGetMyOrganizationsQuery()

	if (isLoading) {
		return (
			<div className='flex items-center justify-center py-20'>
				<div className='flex flex-col items-center gap-4'>
					<Spinner />
					<p className='text-sm text-slate-500'>Загрузка организаций...</p>
				</div>
			</div>
		)
	}

	if (myOrganizations.length === 0) {
		return (
			<div className='bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center'>
				<div className='max-w-md mx-auto'>
					<div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-200 mb-4'>
						<Building2 className='h-8 w-8 text-slate-400' />
					</div>
					<h3 className='text-xl font-semibold text-slate-700 mb-2'>
						Пока нет организаций
					</h3>
					<p className='text-slate-600 mb-6'>
						Создайте свою организацию, чтобы начать помогать другим и привлекать
						волонтеров
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
			{myOrganizations.map(organization => {
				const orgId =
					typeof organization.id === 'string'
						? organization.id
						: String(organization.id)
				return (
					<OrganizationCard
						key={organization.id}
						organization={organization}
						onClick={() => {
							navigate(`/organizations/${orgId}/manage`)
						}}
					/>
				)
			})}
		</div>
	)
}

interface OrganizationCardProps {
	readonly organization: Organization
	readonly onClick?: () => void
}

function OrganizationCard({ organization, onClick }: OrganizationCardProps) {
	const isPendingModeration = organization.isApproved === false

	const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
		// Игнорируем клик, если кликнули на кнопку внутри
		if (
			(e.target as HTMLElement).closest('button') ||
			(e.target as HTMLElement).tagName === 'BUTTON'
		) {
			return
		}
		onClick?.()
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault()
			onClick?.()
		}
	}

	return (
		<div
			role='button'
			tabIndex={0}
			onClick={handleCardClick}
			onKeyDown={handleKeyDown}
			className={`group relative bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-left w-full flex flex-col h-full cursor-pointer ${
				isPendingModeration
					? 'border-amber-300 hover:border-amber-400'
					: 'border-slate-200'
			}`}
		>
			{/* Градиентная полоса сверху */}
			<div
				className={`h-1.5 ${
					isPendingModeration
						? 'bg-gradient-to-r from-amber-500 to-amber-600'
						: 'bg-gradient-to-r from-blue-500 to-cyan-600'
				}`}
			/>

			<div className='p-6 flex flex-col flex-1'>
				{/* Header */}
				<div className='flex items-start justify-between gap-3 mb-4'>
					<div className='flex-1 min-w-0'>
						<div className='flex items-center gap-2 mb-2 flex-wrap'>
							<MapPin className='h-4 w-4 text-blue-600 flex-shrink-0' />
							<span className='text-xs font-semibold text-blue-600 uppercase tracking-wider truncate'>
								{organization.city?.name || 'Город не указан'}
							</span>
							{organization.isApproved === false && (
								<span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200'>
									<Clock className='h-3 w-3' />
									На модерации
								</span>
							)}
						</div>
						<h3 className='text-lg font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors'>
							{organization.name}
						</h3>
					</div>
					<div className='flex-shrink-0'>
						<div className='w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30'>
							<Building2 className='h-6 w-6 text-white' />
						</div>
					</div>
				</div>

				{/* Контент с растягиванием */}
				<div className='flex flex-col flex-1 justify-between'>
					{/* Описание */}
					<p className='text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed'>
						{organization.summary}
					</p>

					{/* Тип организации */}
					{organization.organizationTypes?.[0] && (
						<div className='mb-4'>
							<span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200'>
								{organization.organizationTypes[0].name}
							</span>
						</div>
					)}

					{/* Виды помощи */}
					{organization.helpTypes && organization.helpTypes.length > 0 && (
						<div className='mb-4'>
							<div className='flex items-center gap-1.5 mb-2'>
								<Heart className='h-3.5 w-3.5 text-blue-500' />
								<span className='text-xs font-medium text-slate-600'>
									Виды помощи
								</span>
							</div>
							<div className='flex flex-wrap gap-1.5'>
								{organization.helpTypes.slice(0, 3).map((helpType, index) => (
									<span
										key={helpType.id || index}
										className='inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200'
									>
										{helpType.name}
									</span>
								))}
								{organization.helpTypes.length > 3 && (
									<span className='inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200'>
										+{organization.helpTypes.length - 3}
									</span>
								)}
							</div>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className='pt-4 border-t border-slate-100'>
					<div className='flex items-center justify-end mb-3'>
						<div className='flex items-center gap-1 text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all'>
							<span>Подробнее</span>
							<ArrowRight className='h-4 w-4' />
						</div>
					</div>
					<button
						type='button'
						onClick={e => {
							e.stopPropagation()
							const orgId =
								typeof organization.id === 'string'
									? organization.id
									: String(organization.id)

							// Сохраняем координаты для зума на карте
							try {
								const coordinates = getOrganizationCoordinates(organization)
								if (coordinates?.length === 2) {
									localStorage.setItem(
										'zoomToCoordinates',
										JSON.stringify({
											lat: coordinates[0],
											lng: coordinates[1],
											zoom: 15,
										})
									)
								}
							} catch (error) {
								logger.error('Error getting organization coordinates:', error)
							}

							globalThis.location.href = `/map?organization=${orgId}`
						}}
						className='w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors'
					>
						<Map className='h-4 w-4' />
						Показать на карте
					</button>
				</div>
			</div>

			{/* Hover эффект */}
			<div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none' />
		</div>
	)
}
