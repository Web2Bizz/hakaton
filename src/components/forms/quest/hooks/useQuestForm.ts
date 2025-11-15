import { useUser } from '@/hooks/useUser'
import { getCityCoordinates } from '@/utils/cityCoordinates'
import { calculateQuestProgress, getQuestProgressColor } from '@/utils/quest'
import { getUserQuest as getUserQuestById, updateUserQuest } from '@/utils/userData'
import { checkLocalStorageSize } from '@/utils/storage'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { Quest } from '@/components/map/types/quest-types'
import type { StageFormData } from '../QuestStageForm'
import type { SocialFormData } from '../QuestSocialsSection'

import type { UpdateFormData } from '../QuestUpdatesSection'

export interface QuestFormData {
	title: string
	city: string
	type: string
	category: Quest['category']
	story: string
	storyImage?: string
	gallery: string[]
	address: string
	curatorName: string
	curatorPhone: string
	curatorEmail: string
	coordinates: { lat: number; lng: number }
	stages: StageFormData[]
	socials: SocialFormData[]
	updates: UpdateFormData[]
	// Пользовательское достижение (опционально)
	customAchievement?: {
		icon: string
		title: string
		description: string
	}
}

export function useQuestForm(onSuccess?: (questId: string) => void) {
	const { user, createQuest, canCreateQuest, deleteQuest, getUserQuest } = useUser()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isDataLoaded, setIsDataLoaded] = useState(false)

	const existingQuestId = getUserQuest()
	const existingQuest = existingQuestId
		? getUserQuestById(existingQuestId)
		: null
	const isEditMode = !!existingQuest

	const [formData, setFormData] = useState<QuestFormData>({
		title: '',
		city: '',
		type: '',
		category: 'environment',
		story: '',
		storyImage: undefined,
		gallery: [],
		address: '',
		curatorName: user?.name || '',
		curatorPhone: '',
		curatorEmail: user?.email || '',
		coordinates: { lat: 0, lng: 0 },
		stages: [
			{
				title: '',
				description: '',
				status: 'pending',
				progress: 0,
			},
		],
		socials: [{ name: 'VK', url: '' }],
		updates: [],
		customAchievement: undefined,
	})

	// Загружаем данные существующего квеста для редактирования
	useEffect(() => {
		if (existingQuest?.curator && !isDataLoaded) {
			setFormData({
				title: existingQuest.title || '',
				city: existingQuest.city || '',
				type: existingQuest.type || '',
				category: existingQuest.category || 'environment',
				story: existingQuest.story || '',
				storyImage: existingQuest.storyMedia?.image,
				gallery: existingQuest.gallery || [],
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
				updates:
					existingQuest.updates && existingQuest.updates.length > 0
						? existingQuest.updates.map(update => ({
								id: update.id || `update-${Date.now()}-${Math.random()}`,
								title: update.title || '',
								content: update.content || '',
								images: update.images || [],
						  }))
						: [],
				socials:
					existingQuest.socials && existingQuest.socials.length > 0
						? (existingQuest.socials.map(s => ({
								name: s.name,
								url: s.url || '',
						  })) as SocialFormData[])
						: [{ name: 'VK' as const, url: '' }],
				customAchievement: existingQuest.customAchievement
					? {
							icon: existingQuest.customAchievement.icon || '',
							title: existingQuest.customAchievement.title || '',
							description: existingQuest.customAchievement.description || '',
					  }
					: undefined,
			})
			setIsDataLoaded(true)
		} else if (!existingQuest) {
			setIsDataLoaded(false)
		}
	}, [existingQuest, user?.email, user?.name, isDataLoaded])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

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

		// Валидация пользовательского достижения
		if (formData.customAchievement) {
			if (!formData.customAchievement.icon?.trim()) {
				toast.error('Укажите эмодзи для достижения.')
				return
			}
			if (!formData.customAchievement.title?.trim()) {
				toast.error('Укажите название достижения.')
				return
			}
			if (!formData.customAchievement.description?.trim()) {
				toast.error('Укажите описание достижения.')
				return
			}
		}

		setIsSubmitting(true)

		try {
			const questId =
				existingQuest?.id || `user-${user?.id}-quest-${Date.now()}`

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

			if (questStages.length === 0) {
				toast.error('Добавьте хотя бы один этап квеста.')
				setIsSubmitting(false)
				return
			}

			// Удаляем видео из данных, так как они слишком большие для localStorage
			// Видео будут храниться только в памяти во время редактирования
			const questDataWithoutVideo: Omit<Quest, 'storyMedia'> & {
				storyMedia?: { image?: string }
			} = {
				id: questId,
				title: formData.title,
				city: formData.city,
				type: formData.type,
				category: formData.category,
				story: formData.story,
				storyMedia: formData.storyImage
					? {
							image: formData.storyImage,
					  }
					: undefined,
				stages: questStages,
				overallProgress: 0,
				status: 'active',
				progressColor: 'red',
				updates:
					formData.updates && formData.updates.length > 0
						? formData.updates.map(update => {
								// При редактировании сохраняем оригинальную дату, если она есть
								const existingUpdate = existingQuest?.updates?.find(
									u => u.id === update.id
								)
								return {
									id: update.id,
									date:
										existingUpdate?.date || new Date().toISOString(),
									title: update.title,
									content: update.content,
									images: update.images || [],
									author: formData.curatorName,
								}
						  })
						: [],
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
				// Ограничиваем галерею - оставляем только первые 5 изображений для экономии места
				gallery: formData.gallery.slice(0, 5),
				// Пользовательское достижение
				customAchievement: formData.customAchievement
					? {
							icon: formData.customAchievement.icon,
							title: formData.customAchievement.title,
							description: formData.customAchievement.description,
					  }
					: undefined,
				createdAt:
					existingQuest?.createdAt || new Date().toISOString().split('T')[0],
				updatedAt: new Date().toISOString().split('T')[0],
			}

			const newQuest = questDataWithoutVideo as Quest

			// Проверяем размер данных перед сохранением
			const questJson = JSON.stringify(newQuest)
			if (!checkLocalStorageSize(questJson)) {
				toast.error(
					'Квест слишком большой для сохранения. Пожалуйста, уменьшите количество или размер медиафайлов.'
				)
				setIsSubmitting(false)
				return
			}

			newQuest.overallProgress = calculateQuestProgress(newQuest)
			newQuest.progressColor = getQuestProgressColor(newQuest.overallProgress)

			try {
				if (isEditMode) {
					updateUserQuest(newQuest)
				} else {
					const existingQuests = JSON.parse(
						localStorage.getItem('user_created_quests') || '[]'
					)
					existingQuests.push(newQuest)
					const allQuestsJson = JSON.stringify(existingQuests)
					
					// Проверяем общий размер всех квестов
					if (!checkLocalStorageSize(allQuestsJson)) {
						toast.error(
							'Недостаточно места в хранилище. Пожалуйста, удалите старые квесты или уменьшите размер медиафайлов.'
						)
						setIsSubmitting(false)
						return
					}
					
					localStorage.setItem('user_created_quests', allQuestsJson)
					createQuest(questId)
				}
			} catch (error) {
				if (error instanceof DOMException && error.name === 'QuotaExceededError') {
					toast.error(
						'Недостаточно места в хранилище браузера. Пожалуйста, удалите старые квесты или уменьшите размер медиафайлов.',
						{
							duration: 5000,
						}
					)
					setIsSubmitting(false)
					return
				}
				throw error
			}

			toast.success(
				isEditMode ? 'Квест успешно обновлен!' : 'Квест успешно создан!'
			)

			// Сохраняем координаты для зума на карте при сохранении
			if (formData.coordinates.lat && formData.coordinates.lng) {
				localStorage.setItem(
					'zoomToCoordinates',
					JSON.stringify({
						lat: formData.coordinates.lat,
						lng: formData.coordinates.lng,
						zoom: 15,
					})
				)
			}

			if (onSuccess) {
				onSuccess(questId)
			}
		} catch (error) {
			if (error instanceof DOMException && error.name === 'QuotaExceededError') {
				toast.error(
					'Недостаточно места в хранилище браузера. Пожалуйста, удалите старые квесты или уменьшите размер медиафайлов.',
					{
						duration: 5000,
					}
				)
			} else {
				if (import.meta.env.DEV) {
					console.error('Error creating quest:', error)
				}
				toast.error('Не удалось создать квест. Попробуйте еще раз.')
			}
		} finally {
			setIsSubmitting(false)
		}
	}

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

	const handleDelete = async () => {
		if (!existingQuestId) return
		deleteQuest(existingQuestId)
		toast.success('Квест успешно удален.')
		setFormData({
			title: '',
			city: '',
			type: '',
			category: 'environment',
			story: '',
			storyImage: undefined,
			gallery: [],
			address: '',
			curatorName: user?.name || '',
			curatorPhone: '',
			curatorEmail: user?.email || '',
			coordinates: { lat: 0, lng: 0 },
			stages: [
				{
					title: '',
					description: '',
					status: 'pending',
					progress: 0,
				},
			],
			socials: [{ name: 'VK', url: '' }],
			customAchievement: undefined,
			updates: [],
		})
	}

	return {
		formData,
		setFormData,
		isSubmitting,
		isEditMode,
		handleSubmit,
		handleCityChange,
		handleDelete,
	}
}

