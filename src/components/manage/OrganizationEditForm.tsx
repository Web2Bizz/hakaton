import { OrganizationAssistanceSection } from '@/components/forms/organization/sections/OrganizationAssistanceSection'
import { OrganizationBasicInfo } from '@/components/forms/organization/sections/OrganizationBasicInfo'
import { OrganizationContactsSection } from '@/components/forms/organization/sections/OrganizationContactsSection'
import { OrganizationGoalsNeedsSection } from '@/components/forms/organization/sections/OrganizationGoalsNeedsSection'
import { OrganizationLocationSection } from '@/components/forms/organization/sections/OrganizationLocationSection'
import { DangerZone } from '@/components/forms/shared/DangerZone'
import { LocationPicker } from '@/components/forms/shared/LocationPicker'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Spinner } from '@/components/ui/spinner'
import { useGetCitiesQuery } from '@/store/entities/city'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useOrganizationEditForm } from './hooks/useOrganizationEditForm'

interface OrganizationEditFormProps {
	readonly organizationId: string
}

export function OrganizationEditForm({
	organizationId,
}: OrganizationEditFormProps) {
	const navigate = useNavigate()
	const {
		form,
		isSubmitting,
		isLoadingOrganization,
		onSubmit,
		handleCityChange,
		handleDelete,
	} = useOrganizationEditForm(organizationId, () => {
		navigate('/manage?tab=organizations')
	})

	const [showLocationPicker, setShowLocationPicker] = useState(false)

	const handleLocationSelect = (coordinates: [number, number]) => {
		form.setValue('latitude', coordinates[0].toString())
		form.setValue('longitude', coordinates[1].toString())
		setShowLocationPicker(false)
	}

	const { data: cities = [] } = useGetCitiesQuery()
	const cityId = form.watch('cityId')
	const latitude = form.watch('latitude')
	const longitude = form.watch('longitude')
	const city = cities.find(c => c.id === cityId)

	const handleDeleteWithRedirect = async () => {
		await handleDelete()
		toast.success('Организация успешно удалена')
		navigate('/manage?tab=organizations')
	}

	if (isLoadingOrganization) {
		return (
			<div className='flex items-center justify-center py-12'>
				<div className='flex flex-col items-center gap-4'>
					<Spinner />
					<p className='text-sm text-slate-600'>
						Загрузка данных организации...
					</p>
				</div>
			</div>
		)
	}

	return (
		<Form {...form}>
			<form onSubmit={onSubmit} className='space-y-6'>
				<OrganizationBasicInfo onCityChange={handleCityChange} />

				<OrganizationAssistanceSection />

				<OrganizationGoalsNeedsSection />

				<OrganizationLocationSection
					onOpenMap={() => setShowLocationPicker(true)}
				/>

				<OrganizationContactsSection />

				{/* Кнопка сохранения */}
				<div className='flex justify-end pt-6 border-t border-slate-200 mt-6'>
					<Button
						type='submit'
						disabled={isSubmitting}
						className='min-w-[200px]'
					>
						{isSubmitting ? (
							<div className='flex items-center gap-2'>
								<Spinner />
								<span>Сохранение...</span>
							</div>
						) : (
							<span>Сохранить изменения</span>
						)}
					</Button>
				</div>

				{/* Danger Zone */}
				<div className='mt-6'>
					<DangerZone
						title='Опасная зона'
						description='Удаление организации необратимо. Все данные будут потеряны.'
						confirmMessage='Вы уверены, что хотите удалить эту организацию?'
						onDelete={handleDeleteWithRedirect}
						deleteButtonText='Удалить организацию'
					/>
				</div>

				{showLocationPicker && (
					<LocationPicker
						city={city?.name || ''}
						initialCoordinates={
							latitude && longitude
								? [Number.parseFloat(latitude), Number.parseFloat(longitude)]
								: undefined
						}
						onSelect={handleLocationSelect}
						onClose={() => setShowLocationPicker(false)}
					/>
				)}
			</form>
		</Form>
	)
}
