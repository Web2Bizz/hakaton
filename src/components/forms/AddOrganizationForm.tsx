import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { ASSISTANCE_OPTIONS } from '@/constants'
import { useUser } from '@/hooks/useUser'
import {
	cities as orgCities,
	organizationTypes,
} from '@/components/map/data/organizations'
import { questCities } from '@/components/map/data/quests'
import { getUserOrganization as getUserOrganizationById, updateUserOrganization } from '@/utils/userData'
import { getCityCoordinates } from '@/utils/cityCoordinates'
import { useMemo, useState, useEffect } from 'react'
import type { Organization } from '@/components/map/types/types'
import type { AssistanceTypeId } from '@/types/common'
import { LocationPicker } from './LocationPicker'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface AddOrganizationFormProps {
	onSuccess?: (organizationId: string) => void
}

export function AddOrganizationForm({ onSuccess }: AddOrganizationFormProps) {
	const { user, createOrganization, canCreateOrganization, deleteOrganization, getUserOrganization: getUserOrgId } = useUser()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)

	const existingOrgId = getUserOrgId()
	const existingOrg = existingOrgId ? getUserOrganizationById(existingOrgId) : null
	const isEditMode = !!existingOrg
	const [isDataLoaded, setIsDataLoaded] = useState(false)

	// Объединяем города из квестов и организаций
	const allCities = useMemo(
		() =>
			Array.from(new Set([...questCities, ...orgCities])).sort((a, b) =>
				a.localeCompare(b)
			),
		[]
	)

	const [formData, setFormData] = useState({
		name: '',
		city: '',
		type: '',
		assistance: [] as AssistanceTypeId[],
		summary: '',
		description: '',
		mission: '',
		goals: [''],
		needs: [''],
		address: '',
		phone: '',
		email: user?.email || '',
		website: '',
		coordinates: { lat: 0, lng: 0 },
		socials: [{ name: 'VK' as const, url: '' }],
	})

	// Загружаем данные существующей организации для редактирования (только один раз)
	useEffect(() => {
		if (existingOrg && existingOrg.contacts && !isDataLoaded) {
			setFormData({
				name: existingOrg.name || '',
				city: existingOrg.city || '',
				type: existingOrg.type || '',
				assistance: existingOrg.assistance || [],
				summary: existingOrg.summary || '',
				description: existingOrg.description || '',
				mission: existingOrg.mission || '',
				goals: existingOrg.goals && existingOrg.goals.length > 0 ? existingOrg.goals : [''],
				needs: existingOrg.needs && existingOrg.needs.length > 0 ? existingOrg.needs : [''],
				address: existingOrg.address || '',
				phone: existingOrg.contacts?.phone || '',
				email: existingOrg.contacts?.email || user?.email || '',
				website: existingOrg.website || '',
				coordinates: existingOrg.coordinates && existingOrg.coordinates.length >= 2
					? { lat: existingOrg.coordinates[0], lng: existingOrg.coordinates[1] }
					: { lat: 0, lng: 0 },
				socials:
					existingOrg.socials && existingOrg.socials.length > 0
						? existingOrg.socials.map(s => ({ name: s.name, url: s.url || '' }))
						: [{ name: 'VK' as const, url: '' }],
			})
			setIsDataLoaded(true)
		} else if (!existingOrg) {
			// Если организации нет, сбрасываем флаг загрузки
			setIsDataLoaded(false)
		}
	}, [existingOrg, user?.email, isDataLoaded])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		// Проверяем, что пользователь может создать организацию (если не в режиме редактирования)
		if (!isEditMode && !canCreateOrganization()) {
			toast.error('Вы уже создали организацию. Один пользователь может создать только одну организацию.')
			return
		}

		if (!formData.coordinates.lat || !formData.coordinates.lng) {
			toast.error('Пожалуйста, выберите местоположение на карте.')
			return
		}

		setIsSubmitting(true)

		try {
			// Используем существующий ID или генерируем новый
			const organizationId = existingOrg?.id || `user-${user?.id}-org-${Date.now()}`

			// Создаем новую организацию
			const newOrganization: Organization = {
				id: organizationId,
				name: formData.name,
				city: formData.city,
				type: formData.type,
				assistance: formData.assistance,
				summary: formData.summary,
				description: formData.description,
				mission: formData.mission,
				goals: formData.goals.filter(g => g.trim() !== ''),
				needs: formData.needs.filter(n => n.trim() !== ''),
				coordinates: [formData.coordinates.lat, formData.coordinates.lng],
				address: formData.address,
				contacts: {
					phone: formData.phone,
					email: formData.email || undefined,
				},
				website: formData.website || undefined,
				socials: formData.socials
					.filter(social => social.url.trim() !== '')
					.map(social => ({
						name: social.name,
						url: social.url,
					})),
				gallery: [],
			}

			// Сохраняем или обновляем организацию
			if (isEditMode) {
				updateUserOrganization(newOrganization)
			} else {
				// Сохраняем в localStorage (в реальном приложении это будет API вызов)
				const existingOrganizations = JSON.parse(
					localStorage.getItem('user_created_organizations') || '[]'
				)
				existingOrganizations.push(newOrganization)
				localStorage.setItem(
					'user_created_organizations',
					JSON.stringify(existingOrganizations)
				)

				// Обновляем пользователя
				createOrganization(organizationId)
			}

			toast.success(
				isEditMode ? 'Организация успешно обновлена!' : 'Организация успешно создана!'
			)

			if (onSuccess) {
				onSuccess(organizationId)
			}
		} catch (error) {
			console.error('Error creating organization:', error)
			toast.error('Не удалось создать организацию. Попробуйте еще раз.')
		} finally {
			setIsSubmitting(false)
		}
	}

	const [showLocationPicker, setShowLocationPicker] = useState(false)

	const handleAddressSearch = () => {
		setShowLocationPicker(true)
	}

	const handleLocationSelect = (coordinates: { lat: number; lng: number }) => {
		setFormData(prev => ({ ...prev, coordinates }))
		setShowLocationPicker(false)
	}

	// Автоматически устанавливаем координаты города при выборе города
	const handleCityChange = (city: string) => {
		setFormData(prev => {
			const cityCoords = getCityCoordinates(city)
			return {
				...prev,
				city,
				coordinates: cityCoords || prev.coordinates,
			}
		})
	}

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
							[field]: field === 'name' ? (value as 'VK' | 'Telegram' | 'Website') : value,
						}
					: social
			),
		}))
	}

	const handleDelete = async () => {
		if (!existingOrgId) return

		setIsDeleting(true)
		try {
			deleteOrganization(existingOrgId)
			toast.success('Организация успешно удалена.')
			setShowDeleteConfirm(false)
			// Сбрасываем форму
			setFormData({
				name: '',
				city: '',
				type: '',
				assistance: [],
				summary: '',
				description: '',
				mission: '',
				goals: [''],
				needs: [''],
				address: '',
				phone: '',
				email: user?.email || '',
				website: '',
				coordinates: { lat: 0, lng: 0 },
				socials: [{ name: 'VK' as const, url: '' }],
			})
		} catch (error) {
			console.error('Error deleting organization:', error)
			toast.error('Не удалось удалить организацию. Попробуйте еще раз.')
		} finally {
			setIsDeleting(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className='space-y-6'>
			{isEditMode && (
				<div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
					<p className='text-sm text-blue-800'>
						<strong>Режим редактирования:</strong> Вы редактируете свою созданную организацию.
						Изменения будут сохранены при нажатии "Сохранить изменения".
					</p>
				</div>
			)}
			<div>
				<label htmlFor='org-name' className='block text-sm font-medium text-slate-700 mb-2'>
					Название организации *
				</label>
				<Input
					id='org-name'
					value={formData.name}
					onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
					required
					placeholder='Например: Приют «Лапки добра»'
				/>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<div>
					<label htmlFor='org-city' className='block text-sm font-medium text-slate-700 mb-2'>
						Город *
					</label>
					<select
						id='org-city'
						value={formData.city}
						onChange={e => handleCityChange(e.target.value)}
						required
						className='w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm'
					>
						<option value=''>Выберите город</option>
						{allCities.map(city => (
							<option key={city} value={city}>
								{city}
							</option>
						))}
					</select>
				</div>

				<div>
					<label htmlFor='org-type' className='block text-sm font-medium text-slate-700 mb-2'>
						Тип организации *
					</label>
					<select
						id='org-type'
						value={formData.type}
						onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
						required
						className='w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm'
					>
						<option value=''>Выберите тип</option>
						{organizationTypes.map(type => (
							<option key={type} value={type}>
								{type}
							</option>
						))}
					</select>
				</div>
			</div>

			<div>
				<label className='block text-sm font-medium text-slate-700 mb-2'>
					Вид помощи *
				</label>
				<div className='grid grid-cols-2 gap-2'>
					{ASSISTANCE_OPTIONS.map(option => (
						<label
							key={option.id}
							className='flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-slate-50'
						>
							<input
								type='checkbox'
								checked={formData.assistance.includes(option.id)}
								onChange={() => handleAssistanceToggle(option.id)}
								className='w-4 h-4 rounded border-slate-300 text-blue-600'
							/>
							<span className='text-sm text-slate-700'>{option.label}</span>
						</label>
					))}
				</div>
			</div>

			<div>
				<label htmlFor='org-summary' className='block text-sm font-medium text-slate-700 mb-2'>
					Краткое описание *
				</label>
				<Input
					id='org-summary'
					value={formData.summary}
					onChange={e => setFormData(prev => ({ ...prev, summary: e.target.value }))}
					required
					placeholder='Краткое описание организации'
				/>
			</div>

			<div>
				<label htmlFor='org-description' className='block text-sm font-medium text-slate-700 mb-2'>
					Подробное описание *
				</label>
				<textarea
					id='org-description'
					value={formData.description}
					onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
					required
					rows={4}
					className='w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm'
					placeholder='Подробное описание деятельности организации...'
				/>
			</div>

			<div>
				<label htmlFor='org-mission' className='block text-sm font-medium text-slate-700 mb-2'>
					Миссия *
				</label>
				<textarea
					id='org-mission'
					value={formData.mission}
					onChange={e => setFormData(prev => ({ ...prev, mission: e.target.value }))}
					required
					rows={3}
					className='w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm'
					placeholder='Миссия организации...'
				/>
			</div>

			<div>
				<label className='block text-sm font-medium text-slate-700 mb-2'>Цели</label>
				{formData.goals.map((goal, index) => (
					<div key={index} className='flex gap-2 mb-2'>
						<Input
							value={goal}
							onChange={e => updateGoal(index, e.target.value)}
							placeholder={`Цель ${index + 1}`}
							className='flex-1'
						/>
						{formData.goals.length > 1 && (
							<Button
								type='button'
								variant='outline'
								onClick={() => removeGoal(index)}
							>
								Удалить
							</Button>
						)}
					</div>
				))}
				<Button type='button' variant='outline' onClick={addGoal} className='mt-2'>
					+ Добавить цель
				</Button>
			</div>

			<div>
				<label className='block text-sm font-medium text-slate-700 mb-2'>Актуальные нужды</label>
				{formData.needs.map((need, index) => (
					<div key={index} className='flex gap-2 mb-2'>
						<Input
							value={need}
							onChange={e => updateNeed(index, e.target.value)}
							placeholder={`Нужда ${index + 1}`}
							className='flex-1'
						/>
						{formData.needs.length > 1 && (
							<Button
								type='button'
								variant='outline'
								onClick={() => removeNeed(index)}
							>
								Удалить
							</Button>
						)}
					</div>
				))}
				<Button type='button' variant='outline' onClick={addNeed} className='mt-2'>
					+ Добавить нужду
				</Button>
			</div>

			<div>
				<label htmlFor='org-address' className='block text-sm font-medium text-slate-700 mb-2'>
					Адрес *
				</label>
				<div className='flex gap-2'>
					<Input
						id='org-address'
						value={formData.address}
						onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
						required
						placeholder='Например: ул. Ленина, 10'
						className='flex-1'
					/>
					<Button
						type='button'
						variant='outline'
						onClick={handleAddressSearch}
						disabled={!formData.city}
					>
						Найти на карте
					</Button>
				</div>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
				<div>
					<label htmlFor='org-phone' className='block text-sm font-medium text-slate-700 mb-2'>
						Телефон *
					</label>
					<Input
						id='org-phone'
						type='tel'
						value={formData.phone}
						onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
						required
						placeholder='+7 (XXX) XXX-XX-XX'
					/>
				</div>

				<div>
					<label htmlFor='org-email' className='block text-sm font-medium text-slate-700 mb-2'>
						Email
					</label>
					<Input
						id='org-email'
						type='email'
						value={formData.email}
						onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
						placeholder='email@example.com'
					/>
				</div>

				<div>
					<label htmlFor='org-website' className='block text-sm font-medium text-slate-700 mb-2'>
						Сайт
					</label>
					<Input
						id='org-website'
						type='url'
						value={formData.website}
						onChange={e => setFormData(prev => ({ ...prev, website: e.target.value }))}
						placeholder='https://example.com'
					/>
				</div>
			</div>

			{/* Социальные сети */}
			<div>
				<div className='flex items-center justify-between mb-2'>
					<label className='block text-sm font-medium text-slate-700'>
						Социальные сети (необязательно)
					</label>
					<Button type='button' variant='outline' onClick={addSocial} size='sm'>
						+ Добавить
					</Button>
				</div>

				<div className='space-y-2'>
					{formData.socials.map((social, index) => (
						<div key={index} className='flex gap-2 items-start'>
							<select
								value={social.name}
								onChange={e => updateSocial(index, 'name', e.target.value)}
								className='w-32 h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm'
							>
								<option value='VK'>VK</option>
								<option value='Telegram'>Telegram</option>
								<option value='Website'>Website</option>
							</select>
							<Input
								type='url'
								value={social.url}
								onChange={e => updateSocial(index, 'url', e.target.value)}
								placeholder='https://...'
								className='flex-1'
							/>
							<Button
								type='button'
								variant='outline'
								size='sm'
								onClick={() => removeSocial(index)}
							>
								Удалить
							</Button>
						</div>
					))}
				</div>
			</div>

			<Button type='submit' disabled={isSubmitting} className='w-full'>
				{isSubmitting ? (
					<div className='flex items-center gap-2'>
						<Spinner />
						<span>{isEditMode ? 'Сохранение...' : 'Создание...'}</span>
					</div>
				) : (
					<span>{isEditMode ? 'Сохранить изменения' : 'Создать организацию'}</span>
				)}
			</Button>

			{/* Danger Zone */}
			{isEditMode && (
				<div className='mt-8 border-t border-red-200 pt-6'>
					<div className='bg-red-50 border border-red-200 rounded-lg p-6'>
						<div className='flex items-start gap-3 mb-4'>
							<AlertTriangle className='h-5 w-5 text-red-600 mt-0.5' />
							<div className='flex-1'>
								<h3 className='text-lg font-semibold text-red-900 mb-1'>
									Опасная зона
								</h3>
								<p className='text-sm text-red-700'>
									Удаление организации необратимо. Все данные будут потеряны.
								</p>
							</div>
						</div>

						{!showDeleteConfirm ? (
							<Button
								type='button'
								variant='outline'
								onClick={() => setShowDeleteConfirm(true)}
								className='border-red-300 text-red-700 hover:bg-red-100 hover:border-red-400'
							>
								<Trash2 className='h-4 w-4 mr-2' />
								Удалить организацию
							</Button>
						) : (
							<div className='space-y-3'>
								<p className='text-sm font-medium text-red-900'>
									Вы уверены, что хотите удалить эту организацию?
								</p>
								<div className='flex gap-2'>
									<Button
										type='button'
										variant='outline'
										onClick={() => setShowDeleteConfirm(false)}
										disabled={isDeleting}
									>
										Отмена
									</Button>
									<Button
										type='button'
										onClick={handleDelete}
										disabled={isDeleting}
										className='bg-red-600 hover:bg-red-700 text-white'
									>
										{isDeleting ? (
											<div className='flex items-center gap-2'>
												<Spinner />
												<span>Удаление...</span>
											</div>
										) : (
											'Да, удалить'
										)}
									</Button>
								</div>
							</div>
						)}
					</div>
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

