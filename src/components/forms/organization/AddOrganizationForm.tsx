import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { LocationPicker } from '../shared/LocationPicker'
import { OrganizationBasicInfo } from './OrganizationBasicInfo'
import { OrganizationAssistanceSection } from './OrganizationAssistanceSection'
import { OrganizationGoalsNeedsSection } from './OrganizationGoalsNeedsSection'
import { QuestLocationSection } from '../quest/QuestLocationSection'
import { OrganizationContactsSection } from './OrganizationContactsSection'
import { QuestSocialsSection } from '../quest/QuestSocialsSection'
import { DangerZone } from '../shared/DangerZone'
import { useOrganizationForm } from './hooks/useOrganizationForm'
import { useState } from 'react'
import type { AssistanceTypeId } from '@/types/common'

interface AddOrganizationFormProps {
	onSuccess?: (organizationId: string) => void
}

export function AddOrganizationForm({ onSuccess }: AddOrganizationFormProps) {
	const {
		formData,
		setFormData,
		isSubmitting,
		isEditMode,
		handleSubmit,
		handleCityChange,
		handleDelete,
	} = useOrganizationForm(onSuccess)

	const [showLocationPicker, setShowLocationPicker] = useState(false)

	const handleAssistanceToggle = (id: AssistanceTypeId) => {
		setFormData(prev => ({
			...prev,
			assistance: prev.assistance.includes(id)
				? prev.assistance.filter(a => a !== id)
				: [...prev.assistance, id],
		}))
	}

	const addGoal = () => {
		setFormData(prev => ({ ...prev, goals: [...prev.goals, ''] }))
	}

	const removeGoal = (index: number) => {
		setFormData(prev => ({
			...prev,
			goals: prev.goals.filter((_, i) => i !== index),
		}))
	}

	const updateGoal = (index: number, value: string) => {
		setFormData(prev => ({
			...prev,
			goals: prev.goals.map((g, i) => (i === index ? value : g)),
		}))
	}

	const addNeed = () => {
		setFormData(prev => ({ ...prev, needs: [...prev.needs, ''] }))
	}

	const removeNeed = (index: number) => {
		setFormData(prev => ({
			...prev,
			needs: prev.needs.filter((_, i) => i !== index),
		}))
	}

	const updateNeed = (index: number, value: string) => {
		setFormData(prev => ({
			...prev,
			needs: prev.needs.map((n, i) => (i === index ? value : n)),
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
						<strong>Режим редактирования:</strong> Вы редактируете свою созданную
						организацию. Изменения будут сохранены при нажатии "Сохранить изменения".
					</p>
				</div>
			)}

			<OrganizationBasicInfo
				formData={{
					name: formData.name,
					city: formData.city,
					type: formData.type,
					summary: formData.summary,
					description: formData.description,
					mission: formData.mission,
					gallery: formData.gallery,
				}}
				onChange={(field, value) =>
					setFormData(prev => ({ ...prev, [field]: value }))
				}
				onCityChange={handleCityChange}
				onGalleryChange={gallery =>
					setFormData(prev => ({ ...prev, gallery }))
				}
			/>

			<OrganizationAssistanceSection
				assistance={formData.assistance}
				onToggle={handleAssistanceToggle}
			/>

			<OrganizationGoalsNeedsSection
				goals={formData.goals}
				needs={formData.needs}
				onAddGoal={addGoal}
				onRemoveGoal={removeGoal}
				onUpdateGoal={updateGoal}
				onAddNeed={addNeed}
				onRemoveNeed={removeNeed}
				onUpdateNeed={updateNeed}
			/>

			<QuestLocationSection
				address={formData.address}
				onAddressChange={address =>
					setFormData(prev => ({ ...prev, address }))
				}
				onOpenMap={() => setShowLocationPicker(true)}
				city={formData.city}
			/>

			<OrganizationContactsSection
				phone={formData.phone}
				email={formData.email}
				website={formData.website}
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

