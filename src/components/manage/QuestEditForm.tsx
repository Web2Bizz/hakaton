import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Spinner } from '@/components/ui/spinner'
import { useGetCitiesQuery } from '@/store/entities/organization'
import { useState } from 'react'
import { DangerZone } from '@/components/forms/shared/DangerZone'
import { LocationPicker } from '@/components/forms/shared/LocationPicker'
import { QuestAchievementSection } from '@/components/forms/quest/sections/QuestAchievementSection'
import { QuestBasicInfo } from '@/components/forms/quest/sections/QuestBasicInfo'
import { QuestContactsSection } from '@/components/forms/quest/sections/QuestContactsSection'
import { QuestLocationSection } from '@/components/forms/quest/sections/QuestLocationSection'
import { QuestStagesSection } from '@/components/forms/quest/sections/QuestStagesSection'
import { useQuestEditForm } from './hooks/useQuestEditForm'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

interface QuestEditFormProps {
	questId: number
}

type FormSubTab = 'info' | 'achievement' | 'stages'

export function QuestEditForm({ questId }: QuestEditFormProps) {
	const navigate = useNavigate()
	const {
		form,
		isSubmitting,
		isLoadingQuest,
		onSubmit,
		handleCityChange,
		handleDelete,
	} = useQuestEditForm(questId, () => {
		toast.success('Квест успешно обновлен!')
		navigate('/manage')
	})

	const [showLocationPicker, setShowLocationPicker] = useState(false)
	const [activeSubTab, setActiveSubTab] = useState<FormSubTab>('info')

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
		toast.success('Квест успешно удален')
		navigate('/manage')
	}

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
		<>
			<Form {...form}>
				<form onSubmit={onSubmit} className='space-y-6'>
					{/* Подвкладки */}
					<div className='mb-6'>
						<div className='flex items-center gap-2 border-b border-slate-200'>
							<button
								type='button'
								onClick={() => setActiveSubTab('info')}
								className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
									activeSubTab === 'info'
										? 'border-blue-600 text-blue-600'
										: 'border-transparent text-slate-600 hover:text-slate-900'
								}`}
							>
								Редактирование информации
							</button>
							<button
								type='button'
								onClick={() => setActiveSubTab('achievement')}
								className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
									activeSubTab === 'achievement'
										? 'border-blue-600 text-blue-600'
										: 'border-transparent text-slate-600 hover:text-slate-900'
								}`}
							>
								Достижения
							</button>
							<button
								type='button'
								onClick={() => setActiveSubTab('stages')}
								className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
									activeSubTab === 'stages'
										? 'border-blue-600 text-blue-600'
										: 'border-transparent text-slate-600 hover:text-slate-900'
								}`}
							>
								Этапы
							</button>
						</div>
					</div>

					{/* Контент подвкладок */}
					{activeSubTab === 'info' && (
						<div className='space-y-6'>
							<QuestBasicInfo onCityChange={handleCityChange} />

							<QuestLocationSection
								onOpenMap={() => setShowLocationPicker(true)}
							/>

							<QuestContactsSection />
						</div>
					)}

					{activeSubTab === 'achievement' && (
						<div className='space-y-6'>
							<QuestAchievementSection />
						</div>
					)}

					{activeSubTab === 'stages' && (
						<div className='space-y-6'>
							<QuestStagesSection />
						</div>
					)}

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
							description='Удаление квеста необратимо. Все данные будут потеряны.'
							confirmMessage='Вы уверены, что хотите удалить этот квест?'
							onDelete={handleDeleteWithRedirect}
							deleteButtonText='Удалить квест'
						/>
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

