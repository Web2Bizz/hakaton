import { cities as orgCities } from '@/components/map/data/organizations'
import {
	questCategories,
	questCities,
	questTypes,
} from '@/components/map/data/quests'
import type { Quest } from '@/components/map/types/quest-types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useUser } from '@/contexts/UserContext'
import { getCityCoordinates } from '@/utils/cityCoordinates'
import { calculateQuestProgress, getQuestProgressColor } from '@/utils/quest'
import {
	getUserQuest as getUserQuestById,
	updateUserQuest,
} from '@/utils/userData'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { LocationPicker } from './LocationPicker'

interface AddQuestFormProps {
	onSuccess?: (questId: string) => void
}

export function AddQuestForm({ onSuccess }: AddQuestFormProps) {
	const { user, createQuest, canCreateQuest, deleteQuest, getUserQuest } =
		useUser()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)

	const existingQuestId = getUserQuest()
	const existingQuest = existingQuestId
		? getUserQuestById(existingQuestId)
		: null
	const isEditMode = !!existingQuest
	const [isDataLoaded, setIsDataLoaded] = useState(false)

	// Объединяем города из квестов и организаций
	const allCities = useMemo(
		() =>
			Array.from(new Set([...questCities, ...orgCities])).sort((a, b) =>
				a.localeCompare(b)
			),
		[]
	)

	type StageFormData = {
		title: string
		description: string
		status: 'pending' | 'in_progress' | 'completed'
		progress: number
		hasFinancial?: boolean
		financialNeeded?: number
		hasVolunteers?: boolean
		volunteersNeeded?: number
		hasItems?: boolean
		itemsNeeded?: number
		itemName?: string
		deadline?: string
	}

	const [formData, setFormData] = useState({
		title: '',
		city: '',
		type: '',
		category: 'environment' as Quest['category'],
		story: '',
		address: '',
		curatorName: user?.name || '',
		curatorPhone: '',
		curatorEmail: user?.email || '',
		coordinates: { lat: 0, lng: 0 },
		stages: [
			{
				title: '',
				description: '',
				status: 'pending' as const,
				progress: 0,
			},
		] as StageFormData[],
		socials: [{ name: 'VK' as const, url: '' }],
	})

	// Загружаем данные существующего квеста для редактирования (только один раз)
	useEffect(() => {
		if (existingQuest && existingQuest.curator && !isDataLoaded) {
			setFormData({
				title: existingQuest.title || '',
				city: existingQuest.city || '',
				type: existingQuest.type || '',
				category: existingQuest.category || 'environment',
				story: existingQuest.story || '',
				address: existingQuest.address || '',
				curatorName: existingQuest.curator?.name || user?.name || '',
				curatorPhone: existingQuest.curator?.phone || '',
				curatorEmail: existingQuest.curator?.email || user?.email || '',
				coordinates:
					existingQuest.coordinates && existingQuest.coordinates.length >= 2
						? {
								lat: existingQuest.coordinates[0],
								lng: existingQuest.coordinates[1],
						  }
						: { lat: 0, lng: 0 },
				stages:
					existingQuest.stages && existingQuest.stages.length > 0
						? existingQuest.stages.map(stage => ({
								title: stage.title || '',
								description: stage.description || '',
								status: stage.status || 'pending',
								progress: stage.progress || 0,
								hasFinancial: !!stage.requirements?.financial,
								financialNeeded: stage.requirements?.financial?.needed,
								hasVolunteers: !!stage.requirements?.volunteers,
								volunteersNeeded: stage.requirements?.volunteers?.needed,
								hasItems: !!stage.requirements?.items,
								itemsNeeded: stage.requirements?.items?.needed,
								itemName: stage.requirements?.items?.itemName,
								deadline: stage.deadline,
						  }))
						: [
								{
									title: '',
									description: '',
									status: 'pending' as const,
									progress: 0,
								},
						  ],
				socials:
					existingQuest.socials && existingQuest.socials.length > 0
						? existingQuest.socials.map(s => ({
								name: s.name,
								url: s.url || '',
						  }))
						: [{ name: 'VK' as const, url: '' }],
			})
			setIsDataLoaded(true)
		} else if (!existingQuest) {
			// Если квеста нет, сбрасываем флаг загрузки
			setIsDataLoaded(false)
		}
	}, [existingQuest, user?.email, user?.name, isDataLoaded])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		// Проверяем, что пользователь может создать квест (если не в режиме редактирования)
		if (!isEditMode && !canCreateQuest()) {
			toast.error(
				'Вы уже создали квест. Один пользователь может создать только один квест.'
			)
			return
		}

		if (!formData.coordinates.lat || !formData.coordinates.lng) {
			toast.error('Пожалуйста, выберите местоположение на карте.')
			return
		}

		setIsSubmitting(true)

		try {
			// Используем существующий ID или генерируем новый
			const questId =
				existingQuest?.id || `user-${user?.id}-quest-${Date.now()}`

			// Создаем этапы квеста
			const questStages = formData.stages
				.filter(stage => stage.title.trim() !== '')
				.map((stage, index) => {
					const stageData: Quest['stages'][0] = {
						id: `s${index + 1}`,
						title: stage.title,
						description: stage.description,
						status: stage.status,
						progress: stage.progress,
					}

					// Добавляем требования
					const requirements: Quest['stages'][0]['requirements'] = {}
					if (stage.hasFinancial && stage.financialNeeded) {
						requirements.financial = {
							collected: 0,
							needed: stage.financialNeeded,
							currency: 'RUB',
						}
					}
					if (stage.hasVolunteers && stage.volunteersNeeded) {
						requirements.volunteers = {
							registered: 0,
							needed: stage.volunteersNeeded,
						}
					}
					if (stage.hasItems && stage.itemsNeeded && stage.itemName) {
						requirements.items = {
							collected: 0,
							needed: stage.itemsNeeded,
							itemName: stage.itemName,
						}
					}

					if (Object.keys(requirements).length > 0) {
						stageData.requirements = requirements
					}

					if (stage.deadline) {
						stageData.deadline = stage.deadline
					}

					return stageData
				})

			// Проверяем, что есть хотя бы один этап
			if (questStages.length === 0) {
				toast.error('Добавьте хотя бы один этап квеста.')
				setIsSubmitting(false)
				return
			}

			// Создаем новый квест
			const newQuest: Quest = {
				id: questId,
				title: formData.title,
				city: formData.city,
				type: formData.type,
				category: formData.category,
				story: formData.story,
				stages: questStages,
				overallProgress: 0, // Временно, будет пересчитан ниже
				status: 'active',
				progressColor: 'red', // Временно, будет пересчитан ниже
				updates: [],
				coordinates: [formData.coordinates.lat, formData.coordinates.lng],
				address: formData.address,
				curator: {
					name: formData.curatorName,
					phone: formData.curatorPhone,
					email: formData.curatorEmail,
				},
				socials: formData.socials
					.filter(social => social.url.trim() !== '')
					.map(social => ({
						name: social.name,
						url: social.url,
					})),
				gallery: [],
				createdAt:
					existingQuest?.createdAt || new Date().toISOString().split('T')[0],
				updatedAt: new Date().toISOString().split('T')[0],
			}

			// Рассчитываем общий прогресс и цвет на основе этапов
			newQuest.overallProgress = calculateQuestProgress(newQuest)
			newQuest.progressColor = getQuestProgressColor(newQuest.overallProgress)

			// Сохраняем или обновляем квест
			if (isEditMode) {
				updateUserQuest(newQuest)
			} else {
				// Сохраняем в localStorage (в реальном приложении это будет API вызов)
				const existingQuests = JSON.parse(
					localStorage.getItem('user_created_quests') || '[]'
				)
				existingQuests.push(newQuest)
				localStorage.setItem(
					'user_created_quests',
					JSON.stringify(existingQuests)
				)

				// Обновляем пользователя
				createQuest(questId)
			}

			toast.success(
				isEditMode ? 'Квест успешно обновлен!' : 'Квест успешно создан!'
			)

			if (onSuccess) {
				onSuccess(questId)
			}
		} catch (error) {
			console.error('Error creating quest:', error)
			toast.error('Не удалось создать квест. Попробуйте еще раз.')
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

	const handleDelete = async () => {
		if (!existingQuestId) return

		setIsDeleting(true)
		try {
			deleteQuest(existingQuestId)
			toast.success('Квест успешно удален.')
			setShowDeleteConfirm(false)
			// Сбрасываем форму
			setFormData({
				title: '',
				city: '',
				type: '',
				category: 'environment',
				story: '',
				address: '',
				curatorName: user?.name || '',
				curatorPhone: '',
				curatorEmail: user?.email || '',
				coordinates: { lat: 0, lng: 0 },
				stages: [
					{
						title: '',
						description: '',
						status: 'pending' as const,
						progress: 0,
					},
				],
				socials: [{ name: 'VK' as const, url: '' }],
			})
		} catch (error) {
			console.error('Error deleting quest:', error)
			toast.error('Не удалось удалить квест. Попробуйте еще раз.')
		} finally {
			setIsDeleting(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className='space-y-6'>
			{isEditMode && (
				<div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
					<p className='text-sm text-blue-800'>
						<strong>Режим редактирования:</strong> Вы редактируете свой
						созданный квест. Изменения будут сохранены при нажатии "Сохранить
						изменения".
					</p>
				</div>
			)}
			<div>
				<label
					htmlFor='quest-title'
					className='block text-sm font-medium text-slate-700 mb-2'
				>
					Название квеста *
				</label>
				<Input
					id='quest-title'
					value={formData.title}
					onChange={e =>
						setFormData(prev => ({ ...prev, title: e.target.value }))
					}
					required
					placeholder='Например: Озеленение микрорайона'
				/>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<div>
					<label
						htmlFor='quest-city'
						className='block text-sm font-medium text-slate-700 mb-2'
					>
						Город *
					</label>
					<select
						id='quest-city'
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
					<label
						htmlFor='quest-type'
						className='block text-sm font-medium text-slate-700 mb-2'
					>
						Тип *
					</label>
					<select
						id='quest-type'
						value={formData.type}
						onChange={e =>
							setFormData(prev => ({ ...prev, type: e.target.value }))
						}
						required
						className='w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm'
					>
						<option value=''>Выберите тип</option>
						{questTypes.map(type => (
							<option key={type} value={type}>
								{type}
							</option>
						))}
					</select>
				</div>
			</div>

			<div>
				<label
					htmlFor='quest-category'
					className='block text-sm font-medium text-slate-700 mb-2'
				>
					Категория *
				</label>
				<select
					id='quest-category'
					value={formData.category}
					onChange={e =>
						setFormData(prev => ({
							...prev,
							category: e.target.value as Quest['category'],
						}))
					}
					required
					className='w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm'
				>
					{questCategories.map(cat => (
						<option key={cat.id} value={cat.id}>
							{cat.icon} {cat.label}
						</option>
					))}
				</select>
			</div>

			<div>
				<label
					htmlFor='quest-story'
					className='block text-sm font-medium text-slate-700 mb-2'
				>
					Описание квеста *
				</label>
				<textarea
					id='quest-story'
					value={formData.story}
					onChange={e =>
						setFormData(prev => ({ ...prev, story: e.target.value }))
					}
					required
					rows={4}
					className='w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm'
					placeholder='Расскажите о проблеме, которую решает ваш квест...'
				/>
			</div>

			{/* Этапы квеста */}
			<div>
				<div className='flex items-center justify-between mb-4'>
					<label className='block text-sm font-medium text-slate-700'>
						Этапы квеста *
					</label>
					<Button type='button' variant='outline' onClick={addStage} size='sm'>
						+ Добавить этап
					</Button>
				</div>

				<div className='space-y-4'>
					{formData.stages.map((stage, index) => (
						<div
							key={index}
							className='border border-slate-200 rounded-lg p-4 bg-slate-50'
						>
							<div className='flex items-center justify-between mb-3'>
								<h3 className='text-sm font-semibold text-slate-900'>
									Этап {index + 1}
								</h3>
								{formData.stages.length > 1 && (
									<Button
										type='button'
										variant='outline'
										size='sm'
										onClick={() => removeStage(index)}
									>
										Удалить
									</Button>
								)}
							</div>

							<div className='space-y-3'>
								<div>
									<label className='block text-xs font-medium text-slate-600 mb-1'>
										Название этапа *
									</label>
									<Input
										value={stage.title}
										onChange={e => updateStage(index, 'title', e.target.value)}
										required
										placeholder='Например: Закупка материалов'
									/>
								</div>

								<div>
									<label className='block text-xs font-medium text-slate-600 mb-1'>
										Описание этапа *
									</label>
									<textarea
										value={stage.description}
										onChange={e =>
											updateStage(index, 'description', e.target.value)
										}
										required
										rows={2}
										className='w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm'
										placeholder='Описание этапа...'
									/>
								</div>

								<div className='grid grid-cols-2 gap-3'>
									<div>
										<label className='block text-xs font-medium text-slate-600 mb-1'>
											Статус
										</label>
										<select
											value={stage.status}
											onChange={e =>
												updateStage(
													index,
													'status',
													e.target.value as StageFormData['status']
												)
											}
											className='w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm'
										>
											<option value='pending'>Ожидает</option>
											<option value='in_progress'>В процессе</option>
											<option value='completed'>Завершен</option>
										</select>
									</div>

									<div>
										<label className='block text-xs font-medium text-slate-600 mb-1'>
											Прогресс (%)
										</label>
										<Input
											type='number'
											min={0}
											max={100}
											value={stage.progress}
											onChange={e =>
												updateStage(index, 'progress', Number(e.target.value))
											}
										/>
									</div>
								</div>

								{/* Требования */}
								<div className='space-y-2 pt-2 border-t border-slate-200'>
									<p className='text-xs font-medium text-slate-600 mb-2'>
										Требования этапа (необязательно)
									</p>

									<div className='space-y-2'>
										<label className='flex items-center gap-2'>
											<input
												type='checkbox'
												checked={stage.hasFinancial || false}
												onChange={e =>
													updateStage(index, 'hasFinancial', e.target.checked)
												}
												className='w-4 h-4 rounded border-slate-300'
											/>
											<span className='text-xs text-slate-700'>
												Требуется финансовая поддержка
											</span>
										</label>
										{stage.hasFinancial && (
											<Input
												type='number'
												min={0}
												value={stage.financialNeeded || ''}
												onChange={e =>
													updateStage(
														index,
														'financialNeeded',
														Number(e.target.value)
													)
												}
												placeholder='Сумма (руб.)'
												className='ml-6'
											/>
										)}

										<label className='flex items-center gap-2'>
											<input
												type='checkbox'
												checked={stage.hasVolunteers || false}
												onChange={e =>
													updateStage(index, 'hasVolunteers', e.target.checked)
												}
												className='w-4 h-4 rounded border-slate-300'
											/>
											<span className='text-xs text-slate-700'>
												Требуются волонтеры
											</span>
										</label>
										{stage.hasVolunteers && (
											<Input
												type='number'
												min={0}
												value={stage.volunteersNeeded || ''}
												onChange={e =>
													updateStage(
														index,
														'volunteersNeeded',
														Number(e.target.value)
													)
												}
												placeholder='Количество волонтеров'
												className='ml-6'
											/>
										)}

										<label className='flex items-center gap-2'>
											<input
												type='checkbox'
												checked={stage.hasItems || false}
												onChange={e =>
													updateStage(index, 'hasItems', e.target.checked)
												}
												className='w-4 h-4 rounded border-slate-300'
											/>
											<span className='text-xs text-slate-700'>
												Требуются предметы/материалы
											</span>
										</label>
										{stage.hasItems && (
											<div className='ml-6 space-y-2'>
												<Input
													type='text'
													value={stage.itemName || ''}
													onChange={e =>
														updateStage(index, 'itemName', e.target.value)
													}
													placeholder='Название предмета'
												/>
												<Input
													type='number'
													min={0}
													value={stage.itemsNeeded || ''}
													onChange={e =>
														updateStage(
															index,
															'itemsNeeded',
															Number(e.target.value)
														)
													}
													placeholder='Количество'
												/>
											</div>
										)}
									</div>

									<div>
										<label className='block text-xs font-medium text-slate-600 mb-1'>
											Дедлайн (необязательно)
										</label>
										<Input
											type='date'
											value={stage.deadline || ''}
											onChange={e =>
												updateStage(index, 'deadline', e.target.value)
											}
										/>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			<div>
				<label
					htmlFor='quest-address'
					className='block text-sm font-medium text-slate-700 mb-2'
				>
					Адрес *
				</label>
				<div className='flex gap-2'>
					<Input
						id='quest-address'
						value={formData.address}
						onChange={e =>
							setFormData(prev => ({ ...prev, address: e.target.value }))
						}
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
					<label
						htmlFor='curator-name'
						className='block text-sm font-medium text-slate-700 mb-2'
					>
						Имя куратора *
					</label>
					<Input
						id='curator-name'
						value={formData.curatorName}
						onChange={e =>
							setFormData(prev => ({ ...prev, curatorName: e.target.value }))
						}
						required
					/>
				</div>

				<div>
					<label
						htmlFor='curator-phone'
						className='block text-sm font-medium text-slate-700 mb-2'
					>
						Телефон *
					</label>
					<Input
						id='curator-phone'
						type='tel'
						value={formData.curatorPhone}
						onChange={e =>
							setFormData(prev => ({ ...prev, curatorPhone: e.target.value }))
						}
						required
						placeholder='+7 (XXX) XXX-XX-XX'
					/>
				</div>

				<div>
					<label
						htmlFor='curator-email'
						className='block text-sm font-medium text-slate-700 mb-2'
					>
						Email
					</label>
					<Input
						id='curator-email'
						type='email'
						value={formData.curatorEmail}
						onChange={e =>
							setFormData(prev => ({ ...prev, curatorEmail: e.target.value }))
						}
						placeholder='email@example.com'
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
					<span>{isEditMode ? 'Сохранить изменения' : 'Создать квест'}</span>
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
									Удаление квеста необратимо. Все данные будут потеряны.
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
								Удалить квест
							</Button>
						) : (
							<div className='space-y-3'>
								<p className='text-sm font-medium text-red-900'>
									Вы уверены, что хотите удалить этот квест?
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
