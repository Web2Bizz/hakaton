import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Spinner } from '@/components/ui/spinner'
import { useGetCitiesQuery } from '@/store/entities/organization'
import { useState } from 'react'
import { LocationPicker } from '../shared/LocationPicker'
import { useQuestForm } from './hooks/useQuestForm'
import { QuestAchievementSection } from './sections/QuestAchievementSection'
import { QuestBasicInfo } from './sections/QuestBasicInfo'
import { QuestContactsSection } from './sections/QuestContactsSection'
import { QuestLocationSection } from './sections/QuestLocationSection'
import { QuestStagesSection } from './sections/QuestStagesSection'

interface AddQuestFormProps {
	onSuccess?: (questId: string) => void
	disableEditMode?: boolean // Отключает режим редактирования
}

type FormStep = 'basic' | 'stages' | 'updates'

export function AddQuestForm({
	onSuccess,
	disableEditMode = false,
}: Readonly<AddQuestFormProps>) {
	const { form, isSubmitting, isLoadingQuest, onSubmit, handleCityChange } =
		useQuestForm(onSuccess, disableEditMode)

	const [showLocationPicker, setShowLocationPicker] = useState(false)
	const [currentStep, setCurrentStep] = useState<FormStep>('basic')

	const steps: Array<{ id: FormStep; label: string }> = [
		{ id: 'basic', label: 'Основная информация' },
		{ id: 'stages', label: 'Настройка этапов' },
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

	// Не показываем загрузку, если режим редактирования отключен
	if (isLoadingQuest && !disableEditMode) {
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
		<>
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

			<Form {...form}>
				<form onSubmit={onSubmit} className='space-y-6'>
					{/* Вкладка 1: Основная информация */}
					{currentStep === 'basic' && (
						<div className='space-y-6'>
							<QuestBasicInfo onCityChange={handleCityChange} />

							<QuestLocationSection
								onOpenMap={() => setShowLocationPicker(true)}
							/>

							<QuestContactsSection />

							<QuestAchievementSection />
						</div>
					)}

					{/* Вкладка 2: Настройка этапов */}
					{currentStep === 'stages' && (
						<div className='space-y-6'>
							<QuestStagesSection />
						</div>
					)}

					{/* Общая кнопка сохранения */}
					<div className='flex justify-end pt-6 border-t border-slate-200 mt-6'>
						<Button
							type='submit'
							disabled={isSubmitting}
							className='min-w-[200px]'
						>
							{isSubmitting ? (
								<div className='flex items-center gap-2'>
									<Spinner />
									<span>Создание...</span>
								</div>
							) : (
								<span>Создать квест</span>
							)}
						</Button>
					</div>

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
		</>
	)
}
