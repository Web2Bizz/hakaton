import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { LocationPicker } from './LocationPicker'
import { QuestBasicInfo } from './quest/QuestBasicInfo'
import { QuestStagesSection } from './quest/QuestStagesSection'
import { QuestLocationSection } from './quest/QuestLocationSection'
import { QuestCuratorSection } from './quest/QuestCuratorSection'
import { QuestSocialsSection } from './quest/QuestSocialsSection'
import { QuestAchievementSection } from './quest/QuestAchievementSection'
import { DangerZone } from './shared/DangerZone'
import { useQuestForm } from './quest/hooks/useQuestForm'
import { useState } from 'react'
import type { StageFormData } from './quest/QuestStageForm'

interface AddQuestFormProps {
	onSuccess?: (questId: string) => void
}

type FormStep = 'basic' | 'stages' | 'updates'

export function AddQuestForm({ onSuccess }: Readonly<AddQuestFormProps>) {
	const {
		formData,
		setFormData,
		isSubmitting,
		isEditMode,
		handleSubmit,
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


	const addStage = () => {
		setFormData(prev => ({
			...prev,
			stages: [
				...prev.stages,
				{
					title: '',
					description: '',
					status: 'pending' as const,
					progress: 0,
				},
			],
		}))
	}

	const removeStage = (index: number) => {
		setFormData(prev => ({
			...prev,
			stages: prev.stages.filter((_, i) => i !== index),
		}))
	}

	const updateStage = (
		index: number,
		field: keyof StageFormData,
		value: unknown
	) => {
		setFormData(prev => ({
			...prev,
			stages: prev.stages.map((stage, i) =>
				i === index ? { ...stage, [field]: value } : stage
			),
		}))
	}

	const addSocial = () => {
		setFormData(prev => ({
			...prev,
			socials: [...prev.socials, { name: 'VK' as const, url: '' }],
		}))
	}

	const removeSocial = (index: number) => {
		setFormData(prev => ({
			...prev,
			socials: prev.socials.filter((_, i) => i !== index),
		}))
	}

	const updateSocial = (
		index: number,
		field: 'name' | 'url',
		value: string
	) => {
		setFormData(prev => ({
			...prev,
			socials: prev.socials.map((social, i) =>
				i === index
					? {
							...social,
							[field]:
								field === 'name'
									? (value as 'VK' | 'Telegram' | 'Website')
									: value,
					  }
					: social
			),
		}))
	}

	const handleLocationSelect = (coordinates: { lat: number; lng: number }) => {
		setFormData(prev => ({ ...prev, coordinates }))
		setShowLocationPicker(false)
	}

	return (
		<form onSubmit={handleSubmit} className='space-y-6'>
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
					{steps.map((step) => {
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
					<QuestBasicInfo
						formData={{
							title: formData.title,
							city: formData.city,
							type: formData.type,
							category: formData.category,
							story: formData.story,
							storyImage: formData.storyImage,
							gallery: formData.gallery,
						}}
						onChange={(field, value) =>
							setFormData(prev => ({ ...prev, [field]: value }))
						}
						onCityChange={handleCityChange}
						onStoryImageChange={image =>
							setFormData(prev => ({ ...prev, storyImage: image }))
						}
						onGalleryChange={gallery =>
							setFormData(prev => ({ ...prev, gallery }))
						}
					/>

					<QuestLocationSection
						address={formData.address}
						onAddressChange={address =>
							setFormData(prev => ({ ...prev, address }))
						}
						onOpenMap={() => setShowLocationPicker(true)}
						city={formData.city}
					/>

					<QuestCuratorSection
						curatorName={formData.curatorName}
						curatorPhone={formData.curatorPhone}
						curatorEmail={formData.curatorEmail}
						onChange={(field, value) =>
							setFormData(prev => ({ ...prev, [field]: value }))
						}
					/>

					<QuestSocialsSection
						socials={formData.socials}
						onAdd={addSocial}
						onRemove={removeSocial}
						onUpdate={updateSocial}
					/>

					<QuestAchievementSection
						customAchievement={formData.customAchievement}
						onChange={achievement =>
							setFormData(prev => ({ ...prev, customAchievement: achievement }))
						}
					/>
				</div>
			)}

			{/* Вкладка 2: Настройка этапов */}
			{currentStep === 'stages' && (
				<div className='space-y-6'>
					<QuestStagesSection
						stages={formData.stages}
						onAdd={addStage}
						onRemove={removeStage}
						onUpdate={updateStage}
					/>
				</div>
			)}

			{/* Вкладка 3: Обновления */}
			{currentStep === 'updates' && (
				<div className='space-y-6'>
					<div className='bg-slate-50 border border-slate-200 rounded-lg p-6 text-center'>
						<p className='text-slate-600'>
							Раздел обновлений будет доступен в будущих версиях
						</p>
					</div>
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

			{isEditMode && currentStep === 'updates' && (
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
					city={formData.city}
					initialCoordinates={
						formData.coordinates.lat && formData.coordinates.lng
							? formData.coordinates
							: undefined
					}
					onSelect={handleLocationSelect}
					onClose={() => setShowLocationPicker(false)}
				/>
			)}
		</form>
	)
}
