import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Spinner } from '@/components/ui/spinner'
import { LocationPicker } from '../shared/LocationPicker'
import { DangerZone } from '../shared/DangerZone'
import { useQuestForm } from './hooks/useQuestForm'
import { useState } from 'react'
import { useGetCitiesQuery } from '@/store/entities/organization'
import { QuestBasicInfo } from './sections/QuestBasicInfo'
import { QuestStagesSection } from './sections/QuestStagesSection'
import { QuestLocationSection } from './sections/QuestLocationSection'
import { QuestCuratorSection } from './sections/QuestCuratorSection'
import { QuestSocialsSection } from './sections/QuestSocialsSection'
import { QuestAchievementSection } from './sections/QuestAchievementSection'
import { QuestUpdatesSection } from './sections/QuestUpdatesSection'

interface AddQuestFormProps {
	onSuccess?: (questId: string) => void
}

type FormStep = 'basic' | 'stages' | 'updates'

export function AddQuestForm({ onSuccess }: Readonly<AddQuestFormProps>) {
	const {
		form,
		isSubmitting,
		isEditMode,
		isLoadingQuest,
		onSubmit,
		handleCityChange,
		handleDelete,
	} = useQuestForm(onSuccess)

	const [showLocationPicker, setShowLocationPicker] = useState(false)
	const [currentStep, setCurrentStep] = useState<FormStep>('basic')

	const steps: Array<{ id: FormStep; label: string }> = [
		{ id: 'basic', label: 'Основная информация' },
		{ id: 'stages', label: 'Настройка этапов' },
		{ id: 'updates', label: 'Обновления' },
	]

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

	if (isLoadingQuest) {
		return (
			<div className='flex items-center justify-center py-12'>
				<div className='flex flex-col items-center gap-4'>
					<Spinner />
					<p className='text-sm text-slate-600'>Загрузка данных квеста...</p>
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
							<strong>Режим редактирования:</strong> Вы редактируете свой созданный
							квест. Изменения будут сохранены при нажатии "Сохранить изменения".
						</p>
					</div>
				)}

				{/* Навигация по вкладкам */}
				<div className='mb-6'>
					<div className='flex items-center justify-between border-b border-slate-200'>
						{steps.map(step => {
							const isActive = step.id === currentStep

							return (
								<button
									key={step.id}
									type='button'
									onClick={() => setCurrentStep(step.id)}
									className={`flex-1 py-4 px-4 text-sm font-medium transition-all relative ${
										isActive
											? 'text-blue-600 border-b-2 border-blue-600'
											: 'text-slate-500 hover:text-slate-700'
									}`}
								>
									{step.label}
								</button>
							)
						})}
					</div>
				</div>

				{/* Вкладка 1: Основная информация */}
				{currentStep === 'basic' && (
					<div className='space-y-6'>
						<QuestBasicInfo onCityChange={handleCityChange} />

						<QuestLocationSection
							onOpenMap={() => setShowLocationPicker(true)}
						/>

						<QuestCuratorSection />

						<QuestSocialsSection />

						<QuestAchievementSection />
					</div>
				)}

				{/* Вкладка 2: Настройка этапов */}
				{currentStep === 'stages' && (
					<div className='space-y-6'>
						<QuestStagesSection />
					</div>
				)}

				{/* Вкладка 3: Обновления */}
				{currentStep === 'updates' && (
					<div className='space-y-6'>
						<QuestUpdatesSection />
					</div>
				)}

				{/* Общая кнопка сохранения */}
				<div className='flex justify-end pt-6 border-t border-slate-200 mt-6'>
					<Button type='submit' disabled={isSubmitting} className='min-w-[200px]'>
						{isSubmitting ? (
							<div className='flex items-center gap-2'>
								<Spinner />
								<span>{isEditMode ? 'Сохранение...' : 'Создание...'}</span>
							</div>
						) : (
							<span>{isEditMode ? 'Сохранить изменения' : 'Создать квест'}</span>
						)}
					</Button>
				</div>

				{isEditMode && (
					<div className='mt-6'>
						<DangerZone
							title='Опасная зона'
							description='Удаление квеста необратимо. Все данные будут потеряны.'
							confirmMessage='Вы уверены, что хотите удалить этот квест?'
							onDelete={handleDelete}
							deleteButtonText='Удалить квест'
						/>
					</div>
				)}

				{showLocationPicker && (
					<LocationPicker
						city={city?.name || ''}
						initialCoordinates={
							latitude && longitude
								? [parseFloat(latitude), parseFloat(longitude)]
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
