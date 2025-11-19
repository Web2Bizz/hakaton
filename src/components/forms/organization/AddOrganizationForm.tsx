import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Spinner } from '@/components/ui/spinner'
import { useGetCitiesQuery } from '@/store/entities/organization'
import { useState } from 'react'
import { DangerZone } from '../shared/DangerZone'
import { LocationPicker } from '../shared/LocationPicker'
import { useOrganizationForm } from './hooks/useOrganizationForm'
import { OrganizationAssistanceSection } from './sections/OrganizationAssistanceSection'
import { OrganizationBasicInfo } from './sections/OrganizationBasicInfo'
import { OrganizationContactsSection } from './sections/OrganizationContactsSection'
import { OrganizationGoalsNeedsSection } from './sections/OrganizationGoalsNeedsSection'
import { OrganizationLocationSection } from './sections/OrganizationLocationSection'

interface AddOrganizationFormProps {
	onSuccess?: (organizationId: string) => void
}

export function AddOrganizationForm({
	onSuccess,
}: Readonly<AddOrganizationFormProps>) {
	const {
		form,
		isSubmitting,
		isEditMode,
		isLoadingOrganization,
		onSubmit,
		handleCityChange,
		handleDelete,
	} = useOrganizationForm(onSuccess)

	const [showLocationPicker, setShowLocationPicker] = useState(false)

	const handleLocationSelect = (coordinates: [number, number]) => {
		form.setValue('latitude', coordinates[0].toString())
		form.setValue('longitude', coordinates[1].toString())
		setShowLocationPicker(false)
	}

	const { data: cities = [] } = useGetCitiesQuery()
	const cityId = form.watch('cityId')
	const cityName = cityId ? cities.find(c => c.id === cityId)?.name : undefined

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
				{isEditMode && (
					<div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
						<p className='text-sm text-blue-800'>
							<strong>Режим редактирования:</strong> Вы редактируете свою
							созданную организацию. Изменения будут сохранены при нажатии
							"Сохранить изменения".
						</p>
					</div>
				)}

				<OrganizationBasicInfo onCityChange={handleCityChange} />

				<OrganizationAssistanceSection />

				<OrganizationGoalsNeedsSection />

				<OrganizationLocationSection
					onOpenMap={() => setShowLocationPicker(true)}
				/>

				<OrganizationContactsSection />

				<Button type='submit' disabled={isSubmitting} className='w-full'>
					{isSubmitting ? (
						<div className='flex items-center gap-2'>
							<Spinner />
							<span>{isEditMode ? 'Сохранение...' : 'Создание...'}</span>
						</div>
					) : (
						<span>
							{isEditMode ? 'Сохранить изменения' : 'Создать организацию'}
						</span>
					)}
				</Button>

				{isEditMode && (
					<DangerZone
						title='Опасная зона'
						description='Удаление организации необратимо. Все данные будут потеряны.'
						confirmMessage='Вы уверены, что хотите удалить эту организацию?'
						onDelete={handleDelete}
						deleteButtonText='Удалить организацию'
					/>
				)}

				{showLocationPicker && (
					<LocationPicker
						city={cityName || ''}
						initialCoordinates={
							form.watch('latitude') && form.watch('longitude')
								? [
										parseFloat(form.watch('latitude')),
										parseFloat(form.watch('longitude')),
								  ]
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
