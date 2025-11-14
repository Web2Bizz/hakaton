import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { LocationPicker } from './LocationPicker'
import { QuestBasicInfo } from './quest/QuestBasicInfo'
import { QuestStagesSection } from './quest/QuestStagesSection'
import { QuestLocationSection } from './quest/QuestLocationSection'
import { QuestCuratorSection } from './quest/QuestCuratorSection'
import { QuestSocialsSection } from './quest/QuestSocialsSection'
import { DangerZone } from './shared/DangerZone'
import { useQuestForm } from './quest/hooks/useQuestForm'
import { useState } from 'react'
import type { StageFormData } from './quest/QuestStageForm'

interface AddQuestFormProps {
	onSuccess?: (questId: string) => void
}

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

			<QuestStagesSection
				stages={formData.stages}
				onAdd={addStage}
				onRemove={removeStage}
				onUpdate={updateStage}
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

			<Button type='submit' disabled={isSubmitting} className='w-full'>
				{isSubmitting ? (
					<div className='flex items-center gap-2'>
						<Spinner />
						<span>{isEditMode ? 'Сохранение...' : 'Создание...'}</span>
					</div>
				) : (
					<span>{isEditMode ? 'Сохранить изменения' : 'Создать квест'}</span>
				)}
			</Button>

			{isEditMode && (
				<DangerZone
					title='Опасная зона'
					description='Удаление квеста необратимо. Все данные будут потеряны.'
					confirmMessage='Вы уверены, что хотите удалить этот квест?'
					onDelete={handleDelete}
					deleteButtonText='Удалить квест'
				/>
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
