import { useUser } from '@/hooks/useUser'
import { useGetOrganizationsQuery } from '@/store/entities/organization'
import { useMemo } from 'react'
import { Spinner } from '@/components/ui/spinner'
import type { Organization } from '@/components/map/types/types'

export function MyOrganizationsList() {
	const { user } = useUser()
	const { data: organizations = [], isLoading } = useGetOrganizationsQuery()

	// Фильтруем только мои организации (созданные пользователем)
	const myOrganizations = useMemo(() => {
		if (!user?.createdOrganizationId) return []
		return organizations.filter(org => {
			const orgId = typeof org.id === 'string' ? org.id : String(org.id)
			return orgId === user.createdOrganizationId || org.id === user.createdOrganizationId
		})
	}, [organizations, user?.createdOrganizationId])

	if (isLoading) {
		return (
			<div className='flex items-center justify-center py-12'>
				<Spinner />
			</div>
		)
	}

	if (myOrganizations.length === 0) {
		return (
			<div className='bg-slate-50 border border-slate-200 rounded-lg p-8 text-center'>
				<p className='text-slate-600 mb-4'>
					У вас пока нет созданных организаций. Создайте организацию, чтобы начать
					управлять ею.
				</p>
			</div>
		)
	}

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
			{myOrganizations.map(organization => (
				<OrganizationCard key={organization.id} organization={organization} />
			))}
		</div>
	)
}

interface OrganizationCardProps {
	organization: Organization
}

function OrganizationCard({ organization }: OrganizationCardProps) {
	return (
		<article className='p-4 rounded-xl border-2 border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all'>
			<div className='flex items-center justify-between gap-2 mb-2'>
				<span className='text-xs font-medium text-blue-600 uppercase tracking-wider'>
					{organization.city?.name || 'Город не указан'}
				</span>
				<span className='text-xs font-medium text-slate-500'>
					{organization.organizationTypes?.[0]?.name || ''}
				</span>
			</div>
			<h3 className='text-base font-semibold text-slate-900 m-0 mb-2 line-clamp-1'>
				{organization.name}
			</h3>
			<p className='text-sm text-slate-600 m-0 mb-3 line-clamp-2'>
				{organization.summary}
			</p>
			{organization.helpTypes && organization.helpTypes.length > 0 && (
				<div className='flex flex-wrap gap-1.5'>
					{organization.helpTypes.slice(0, 3).map((helpType, index) => (
						<span
							key={helpType.id || index}
							className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200'
						>
							{helpType.name}
						</span>
					))}
					{organization.helpTypes.length > 3 && (
						<span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600'>
							+{organization.helpTypes.length - 3}
						</span>
					)}
				</div>
			)}
		</article>
	)
}

