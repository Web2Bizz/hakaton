import type { Organization } from '@/components/map/types/types'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useGetMyOrganizationsQuery } from '@/store/entities/organization'
import { getOrganizationCoordinates } from '@/utils/cityCoordinates'
import { logger } from '@/utils/logger'
import { ArrowRight, Building2, Clock, Heart, Map, MapPin } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

export function MyOrganizations() {
	const navigate = useNavigate()
	const { data: myOrganizations = [], isLoading } = useGetMyOrganizationsQuery()

	if (isLoading) {
		return (
			<div className='bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8'>
				<div className='flex items-center justify-center py-8'>
					<Spinner />
				</div>
			</div>
		)
	}

	if (myOrganizations.length === 0) {
		return (
			<div className='bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8'>
				<div className='flex items-center justify-between mb-4 sm:mb-6'>
					<h2 className='text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2'>
						<Building2 className='h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0' />
						Мои организации
					</h2>
				</div>
				<div className='text-center py-8 sm:py-12'>
					<div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4'>
						<Building2 className='h-8 w-8 text-slate-400' />
					</div>
					<p className='text-sm sm:text-base text-slate-500 mb-4'>
						У вас пока нет созданных организаций
					</p>
					<Button
						asChild
						className='bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
					>
						<Link to='/add-organization'>
							Создать организацию
							<ArrowRight className='h-4 w-4 ml-2' />
						</Link>
					</Button>
				</div>
			</div>
		)
	}

	// Показываем только первую организацию (или максимум 1)
	const displayedOrganization = myOrganizations[0]

	return (
		<div className='bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8'>
			<div className='flex items-center justify-between mb-4 sm:mb-6'>
				<h2 className='text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2'>
					<Building2 className='h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0' />
					Мои организации
				</h2>
				<Button
					variant='outline'
					size='sm'
					onClick={() => navigate('/manage?tab=organizations')}
					className='text-blue-600 border-blue-200 hover:bg-blue-50'
				>
					Посмотреть все
					<ArrowRight className='h-4 w-4 ml-2' />
				</Button>
			</div>

			<div className='space-y-4'>
				<OrganizationCard organization={displayedOrganization} />
			</div>
		</div>
	)
}

interface OrganizationCardProps {
	organization: Organization
}

function OrganizationCard({ organization }: OrganizationCardProps) {
	const isPendingModeration = organization.isApproved === false

	return (
		<article
			className={`group relative p-4 sm:p-6 rounded-xl border transition-all bg-gradient-to-br from-white to-blue-50/30 ${
				isPendingModeration
					? 'border-amber-300 hover:border-amber-400 bg-gradient-to-br from-amber-50/30 to-blue-50/30'
					: 'border-slate-200 hover:border-blue-300'
			} hover:shadow-lg`}
		>
			<div className='flex flex-col sm:flex-row items-start gap-4'>
				{/* Иконка */}
				<div
					className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ${
						isPendingModeration
							? 'bg-gradient-to-br from-amber-500 to-amber-600'
							: 'bg-gradient-to-br from-blue-500 to-cyan-600'
					}`}
				>
					<Building2 className='h-8 w-8 text-white' />
				</div>

				<div className='flex-1 min-w-0 w-full'>
					<div className='flex items-center gap-2 mb-2'>
						<MapPin className='h-4 w-4 text-blue-600 flex-shrink-0' />
						<span className='text-xs font-semibold text-blue-600 uppercase tracking-wider'>
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
					<p className='text-sm text-slate-600 mb-4 line-clamp-2'>
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

					<div className='flex flex-col sm:flex-row gap-2'>
						<Button
							variant='outline'
							size='sm'
							onClick={e => {
								e.stopPropagation()
								const orgId =
									typeof organization.id === 'string'
										? organization.id
										: String(organization.id)

								// Сохраняем координаты для зума на карте
								try {
									const coordinates = getOrganizationCoordinates(organization)
									if (coordinates && coordinates.length === 2) {
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

								window.location.href = `/map?organization=${orgId}`
							}}
							className='flex-1 sm:flex-none text-blue-600 border-blue-200 hover:bg-blue-50'
						>
							<Map className='h-4 w-4 mr-2' />
							Показать на карте
						</Button>
						<Button
							variant='outline'
							size='sm'
							className='flex-1 sm:flex-none text-blue-600 border-blue-200 hover:bg-blue-50'
						>
							Подробнее
							<ArrowRight className='h-4 w-4 ml-2' />
						</Button>
					</div>
				</div>
			</div>
		</article>
	)
}
