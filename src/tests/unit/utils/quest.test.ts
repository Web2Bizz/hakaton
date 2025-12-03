import type { Quest } from '@/components/map/types/quest-types'
import type { Quest as ApiQuest } from '@/store/entities/quest/model/type'
import {
	calculateQuestProgress,
	findStageById,
	getActiveStages,
	getCompletedStages,
	getQuestProgressColor,
	getRequirementType,
	transformApiQuestToComponentQuest,
	transformApiQuestsToComponentQuests,
} from '@/utils/quest'
import { describe, expect, it } from 'vitest'

describe('quest utils', () => {
	describe('calculateQuestProgress', () => {
		it('должен возвращать 0 для пустого массива этапов', () => {
			const quest: Quest = {
				id: '1',
				title: 'Тест',
				city: 'Москва',
				type: 'environment',
				category: 'environment',
				story: 'История',
				stages: [],
				overallProgress: 0,
				status: 'active',
				progressColor: 'red',
				updates: [],
				coordinates: [55.751244, 37.618423],
				address: 'Адрес',
				curator: {
					name: 'Иван',
					phone: '+79991234567',
				},
				gallery: [],
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z',
			}
			expect(calculateQuestProgress(quest)).toBe(0)
		})

		it('должен рассчитывать прогресс для одного этапа', () => {
			const quest: Quest = {
				id: '1',
				title: 'Тест',
				city: 'Москва',
				type: 'environment',
				category: 'environment',
				story: 'История',
				stages: [
					{
						id: '1',
						title: 'Этап 1',
						description: 'Описание',
						status: 'in_progress',
						progress: 50,
					},
				],
				overallProgress: 0,
				status: 'active',
				progressColor: 'red',
				updates: [],
				coordinates: [55.751244, 37.618423],
				address: 'Адрес',
				curator: {
					name: 'Иван',
					phone: '+79991234567',
				},
				gallery: [],
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z',
			}
			expect(calculateQuestProgress(quest)).toBe(50)
		})

		it('должен рассчитывать средний прогресс для нескольких этапов', () => {
			const quest: Quest = {
				id: '1',
				title: 'Тест',
				city: 'Москва',
				type: 'environment',
				category: 'environment',
				story: 'История',
				stages: [
					{ id: '1', title: 'Этап 1', description: '', status: 'in_progress', progress: 50 },
					{ id: '2', title: 'Этап 2', description: '', status: 'in_progress', progress: 75 },
					{ id: '3', title: 'Этап 3', description: '', status: 'in_progress', progress: 25 },
				],
				overallProgress: 0,
				status: 'active',
				progressColor: 'red',
				updates: [],
				coordinates: [55.751244, 37.618423],
				address: 'Адрес',
				curator: {
					name: 'Иван',
					phone: '+79991234567',
				},
				gallery: [],
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z',
			}
			// (50 + 75 + 25) / 3 = 50
			expect(calculateQuestProgress(quest)).toBe(50)
		})

		it('должен округлять результат', () => {
			const quest: Quest = {
				id: '1',
				title: 'Тест',
				city: 'Москва',
				type: 'environment',
				category: 'environment',
				story: 'История',
				stages: [
					{ id: '1', title: 'Этап 1', description: '', status: 'in_progress', progress: 33 },
					{ id: '2', title: 'Этап 2', description: '', status: 'in_progress', progress: 34 },
					{ id: '3', title: 'Этап 3', description: '', status: 'in_progress', progress: 33 },
				],
				overallProgress: 0,
				status: 'active',
				progressColor: 'red',
				updates: [],
				coordinates: [55.751244, 37.618423],
				address: 'Адрес',
				curator: {
					name: 'Иван',
					phone: '+79991234567',
				},
				gallery: [],
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z',
			}
			// (33 + 34 + 33) / 3 = 33.33... -> 33
			expect(calculateQuestProgress(quest)).toBe(33)
		})

		it('должен обрабатывать этапы с прогрессом 100%', () => {
			const quest: Quest = {
				id: '1',
				title: 'Тест',
				city: 'Москва',
				type: 'environment',
				category: 'environment',
				story: 'История',
				stages: [
					{ id: '1', title: 'Этап 1', description: '', status: 'completed', progress: 100 },
					{ id: '2', title: 'Этап 2', description: '', status: 'completed', progress: 100 },
				],
				overallProgress: 0,
				status: 'active',
				progressColor: 'red',
				updates: [],
				coordinates: [55.751244, 37.618423],
				address: 'Адрес',
				curator: {
					name: 'Иван',
					phone: '+79991234567',
				},
				gallery: [],
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z',
			}
			expect(calculateQuestProgress(quest)).toBe(100)
		})

		it('должен обрабатывать этапы с прогрессом 0%', () => {
			const quest: Quest = {
				id: '1',
				title: 'Тест',
				city: 'Москва',
				type: 'environment',
				category: 'environment',
				story: 'История',
				stages: [
					{ id: '1', title: 'Этап 1', description: '', status: 'pending', progress: 0 },
					{ id: '2', title: 'Этап 2', description: '', status: 'pending', progress: 0 },
				],
				overallProgress: 0,
				status: 'active',
				progressColor: 'red',
				updates: [],
				coordinates: [55.751244, 37.618423],
				address: 'Адрес',
				curator: {
					name: 'Иван',
					phone: '+79991234567',
				},
				gallery: [],
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z',
			}
			expect(calculateQuestProgress(quest)).toBe(0)
		})
	})

	describe('getQuestProgressColor', () => {
		it('должен возвращать "victory" для прогресса 100', () => {
			expect(getQuestProgressColor(100)).toBe('victory')
		})

		it('должен возвращать "green" для прогресса 76', () => {
			expect(getQuestProgressColor(76)).toBe('green')
		})

		it('должен возвращать "green" для прогресса 99', () => {
			expect(getQuestProgressColor(99)).toBe('green')
		})

		it('должен возвращать "yellow" для прогресса 51', () => {
			expect(getQuestProgressColor(51)).toBe('yellow')
		})

		it('должен возвращать "yellow" для прогресса 75', () => {
			expect(getQuestProgressColor(75)).toBe('yellow')
		})

		it('должен возвращать "orange" для прогресса 26', () => {
			expect(getQuestProgressColor(26)).toBe('orange')
		})

		it('должен возвращать "orange" для прогресса 50', () => {
			expect(getQuestProgressColor(50)).toBe('orange')
		})

		it('должен возвращать "red" для прогресса 0', () => {
			expect(getQuestProgressColor(0)).toBe('red')
		})

		it('должен возвращать "red" для прогресса 25', () => {
			expect(getQuestProgressColor(25)).toBe('red')
		})

		it('должен обрабатывать отрицательный прогресс как "red"', () => {
			expect(getQuestProgressColor(-10)).toBe('red')
		})

		it('должен обрабатывать прогресс больше 100 как "victory"', () => {
			expect(getQuestProgressColor(150)).toBe('victory')
		})
	})

	describe('findStageById', () => {
		const quest: Quest = {
			id: '1',
			title: 'Тест',
			city: 'Москва',
			type: 'environment',
			category: 'environment',
			story: 'История',
			stages: [
				{ id: 'stage-1', title: 'Этап 1', description: '', status: 'pending', progress: 0 },
				{ id: 'stage-2', title: 'Этап 2', description: '', status: 'in_progress', progress: 50 },
				{ id: 'stage-3', title: 'Этап 3', description: '', status: 'completed', progress: 100 },
			],
			overallProgress: 0,
			status: 'active',
			progressColor: 'red',
			updates: [],
			coordinates: [55.751244, 37.618423],
			address: 'Адрес',
			curator: {
				name: 'Иван',
				phone: '+79991234567',
			},
			gallery: [],
			createdAt: '2024-01-01T00:00:00Z',
			updatedAt: '2024-01-01T00:00:00Z',
		}

		it('должен находить существующий этап', () => {
			const stage = findStageById(quest, 'stage-2')
			expect(stage).toBeDefined()
			expect(stage?.id).toBe('stage-2')
			expect(stage?.title).toBe('Этап 2')
		})

		it('должен возвращать undefined для несуществующего этапа', () => {
			const stage = findStageById(quest, 'stage-999')
			expect(stage).toBeUndefined()
		})

		it('должен возвращать undefined для пустой строки', () => {
			const stage = findStageById(quest, '')
			expect(stage).toBeUndefined()
		})
	})

	describe('getActiveStages', () => {
		it('должен возвращать только активные этапы', () => {
			const quest: Quest = {
				id: '1',
				title: 'Тест',
				city: 'Москва',
				type: 'environment',
				category: 'environment',
				story: 'История',
				stages: [
					{ id: '1', title: 'Этап 1', description: '', status: 'pending', progress: 0 },
					{ id: '2', title: 'Этап 2', description: '', status: 'in_progress', progress: 50 },
					{ id: '3', title: 'Этап 3', description: '', status: 'completed', progress: 100 },
					{ id: '4', title: 'Этап 4', description: '', status: 'in_progress', progress: 75 },
				],
				overallProgress: 0,
				status: 'active',
				progressColor: 'red',
				updates: [],
				coordinates: [55.751244, 37.618423],
				address: 'Адрес',
				curator: {
					name: 'Иван',
					phone: '+79991234567',
				},
				gallery: [],
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z',
			}

			const activeStages = getActiveStages(quest)
			expect(activeStages).toHaveLength(2)
			expect(activeStages[0].id).toBe('2')
			expect(activeStages[1].id).toBe('4')
		})

		it('должен возвращать пустой массив, если нет активных этапов', () => {
			const quest: Quest = {
				id: '1',
				title: 'Тест',
				city: 'Москва',
				type: 'environment',
				category: 'environment',
				story: 'История',
				stages: [
					{ id: '1', title: 'Этап 1', description: '', status: 'pending', progress: 0 },
					{ id: '2', title: 'Этап 2', description: '', status: 'completed', progress: 100 },
				],
				overallProgress: 0,
				status: 'active',
				progressColor: 'red',
				updates: [],
				coordinates: [55.751244, 37.618423],
				address: 'Адрес',
				curator: {
					name: 'Иван',
					phone: '+79991234567',
				},
				gallery: [],
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z',
			}

			const activeStages = getActiveStages(quest)
			expect(activeStages).toHaveLength(0)
		})
	})

	describe('getCompletedStages', () => {
		it('должен возвращать только завершенные этапы', () => {
			const quest: Quest = {
				id: '1',
				title: 'Тест',
				city: 'Москва',
				type: 'environment',
				category: 'environment',
				story: 'История',
				stages: [
					{ id: '1', title: 'Этап 1', description: '', status: 'pending', progress: 0 },
					{ id: '2', title: 'Этап 2', description: '', status: 'in_progress', progress: 50 },
					{ id: '3', title: 'Этап 3', description: '', status: 'completed', progress: 100 },
					{ id: '4', title: 'Этап 4', description: '', status: 'completed', progress: 100 },
				],
				overallProgress: 0,
				status: 'active',
				progressColor: 'red',
				updates: [],
				coordinates: [55.751244, 37.618423],
				address: 'Адрес',
				curator: {
					name: 'Иван',
					phone: '+79991234567',
				},
				gallery: [],
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z',
			}

			const completedStages = getCompletedStages(quest)
			expect(completedStages).toHaveLength(2)
			expect(completedStages[0].id).toBe('3')
			expect(completedStages[1].id).toBe('4')
		})

		it('должен возвращать пустой массив, если нет завершенных этапов', () => {
			const quest: Quest = {
				id: '1',
				title: 'Тест',
				city: 'Москва',
				type: 'environment',
				category: 'environment',
				story: 'История',
				stages: [
					{ id: '1', title: 'Этап 1', description: '', status: 'pending', progress: 0 },
					{ id: '2', title: 'Этап 2', description: '', status: 'in_progress', progress: 50 },
				],
				overallProgress: 0,
				status: 'active',
				progressColor: 'red',
				updates: [],
				coordinates: [55.751244, 37.618423],
				address: 'Адрес',
				curator: {
					name: 'Иван',
					phone: '+79991234567',
				},
				gallery: [],
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z',
			}

			const completedStages = getCompletedStages(quest)
			expect(completedStages).toHaveLength(0)
		})
	})

	describe('getRequirementType', () => {
		it('должен возвращать "financial" для значения >= 1000', () => {
			expect(getRequirementType(1000)).toBe('financial')
			expect(getRequirementType(1001)).toBe('financial')
			expect(getRequirementType(10000)).toBe('financial')
		})

		it('должен возвращать "volunteers" для значения < 1000', () => {
			expect(getRequirementType(999)).toBe('volunteers')
			expect(getRequirementType(500)).toBe('volunteers')
			expect(getRequirementType(0)).toBe('volunteers')
		})

		it('должен обрабатывать граничное значение 1000', () => {
			expect(getRequirementType(1000)).toBe('financial')
		})

		it('должен обрабатывать граничное значение 999', () => {
			expect(getRequirementType(999)).toBe('volunteers')
		})
	})

	describe('transformApiQuestToComponentQuest', () => {
		const baseApiQuest: ApiQuest = {
			id: 1,
			title: 'Тестовый квест',
			description: 'Описание квеста',
			status: 'active',
			experienceReward: 100,
			achievementId: null,
			ownerId: 1,
			cityId: 1,
			organizationTypeId: 1,
			latitude: '55.751244',
			longitude: '37.618423',
			address: 'Москва, Красная площадь',
			contacts: [],
			steps: [],
			categories: [{ id: 1, name: 'Экология' }],
		}

		it('должен преобразовывать базовый квест', () => {
			const result = transformApiQuestToComponentQuest(baseApiQuest)
			expect(result.id).toBe('1')
			expect(result.title).toBe('Тестовый квест')
			expect(result.story).toBe('Описание квеста')
			expect(result.status).toBe('active')
			expect(result.coordinates).toEqual([55.751244, 37.618423])
			expect(result.address).toBe('Москва, Красная площадь')
		})

		it('должен преобразовывать steps в stages', () => {
			const apiQuest: ApiQuest = {
				...baseApiQuest,
				steps: [
					{
						title: 'Этап 1',
						description: 'Описание этапа',
						status: 'in_progress',
						progress: 50,
					},
				],
			}
			const result = transformApiQuestToComponentQuest(apiQuest)
			expect(result.stages).toHaveLength(1)
			expect(result.stages[0].title).toBe('Этап 1')
			expect(result.stages[0].status).toBe('in_progress')
			expect(result.stages[0].progress).toBe(50)
		})

		it('должен генерировать ID для stages', () => {
			const apiQuest: ApiQuest = {
				...baseApiQuest,
				steps: [
					{
						title: 'Этап 1',
						description: '',
						status: 'pending',
						progress: 0,
					},
				],
			}
			const result = transformApiQuestToComponentQuest(apiQuest)
			expect(result.stages[0].id).toBe('step-1-0')
		})

		it('должен обрабатывать пустой массив steps', () => {
			const result = transformApiQuestToComponentQuest(baseApiQuest)
			expect(result.stages).toHaveLength(0)
			expect(result.overallProgress).toBe(0)
		})

		it('должен обрабатывать undefined steps', () => {
			const apiQuest: ApiQuest = {
				...baseApiQuest,
				// @ts-expect-error - тестируем обработку undefined
				steps: undefined,
			}
			const result = transformApiQuestToComponentQuest(apiQuest)
			expect(result.stages).toHaveLength(0)
		})

		it('должен преобразовывать финансовое требование (>= 1000)', () => {
			const apiQuest: ApiQuest = {
				...baseApiQuest,
				steps: [
					{
						title: 'Этап 1',
						description: '',
						status: 'in_progress',
						progress: 50,
						requirement: {
							currentValue: 500,
							targetValue: 1000,
						},
					},
				],
			}
			const result = transformApiQuestToComponentQuest(apiQuest)
			expect(result.stages[0].requirements?.financial).toBeDefined()
			expect(result.stages[0].requirements?.financial?.collected).toBe(500)
			expect(result.stages[0].requirements?.financial?.needed).toBe(1000)
			expect(result.stages[0].requirements?.financial?.currency).toBe('RUB')
		})

		it('должен преобразовывать требование волонтеров (< 1000)', () => {
			const apiQuest: ApiQuest = {
				...baseApiQuest,
				steps: [
					{
						title: 'Этап 1',
						description: '',
						status: 'in_progress',
						progress: 50,
						requirement: {
							currentValue: 5,
							targetValue: 10,
						},
					},
				],
			}
			const result = transformApiQuestToComponentQuest(apiQuest)
			expect(result.stages[0].requirements?.volunteers).toBeDefined()
			expect(result.stages[0].requirements?.volunteers?.registered).toBe(5)
			expect(result.stages[0].requirements?.volunteers?.needed).toBe(10)
		})

		it('должен обрабатывать deadline', () => {
			const apiQuest: ApiQuest = {
				...baseApiQuest,
				steps: [
					{
						title: 'Этап 1',
						description: '',
						status: 'pending',
						progress: 0,
						deadline: '2024-12-31T23:59:59Z',
					},
				],
			}
			const result = transformApiQuestToComponentQuest(apiQuest)
			expect(result.stages[0].deadline).toBe('2024-12-31T23:59:59Z')
		})

		it('должен преобразовывать категорию из ID', () => {
			const apiQuest: ApiQuest = {
				...baseApiQuest,
				categories: [{ id: 1, name: 'Экология' }],
			}
			const result = transformApiQuestToComponentQuest(apiQuest)
			expect(result.category).toBe('environment')
		})

		it('должен использовать "other" для неизвестной категории', () => {
			const apiQuest: ApiQuest = {
				...baseApiQuest,
				categories: [{ id: 999, name: 'Неизвестная' }],
			}
			const result = transformApiQuestToComponentQuest(apiQuest)
			expect(result.category).toBe('other')
		})

		it('должен использовать "other" при отсутствии категорий', () => {
			const apiQuest: ApiQuest = {
				...baseApiQuest,
				categories: [],
			}
			const result = transformApiQuestToComponentQuest(apiQuest)
			expect(result.category).toBe('other')
		})

		it('должен извлекать контакты куратора', () => {
			const apiQuest: ApiQuest = {
				...baseApiQuest,
				contacts: [
					{ name: 'Телефон', value: '+79991234567' },
					{ name: 'Email', value: 'curator@example.com' },
					{ name: 'Куратор', value: 'Иван Иванов' },
				],
			}
			const result = transformApiQuestToComponentQuest(apiQuest)
			expect(result.curator.phone).toBe('+79991234567')
			expect(result.curator.email).toBe('curator@example.com')
			expect(result.curator.name).toBe('Иван Иванов')
		})

		it('должен использовать имя владельца, если куратор не указан', () => {
			const apiQuest: ApiQuest = {
				...baseApiQuest,
				owner: {
					id: 1,
					firstName: 'Петр',
					lastName: 'Петров',
					email: 'petr@example.com',
				},
			}
			const result = transformApiQuestToComponentQuest(apiQuest)
			expect(result.curator.name).toBe('Петр Петров')
		})

		it('должен использовать "Не указан" для отсутствующих данных', () => {
			const result = transformApiQuestToComponentQuest(baseApiQuest)
			expect(result.curator.name).toBe('Не указан')
			expect(result.curator.phone).toBe('Не указан')
		})

		it('должен преобразовывать achievement в customAchievement', () => {
			const apiQuest: ApiQuest = {
				...baseApiQuest,
				achievement: {
					title: 'Достижение',
					description: 'Описание достижения',
					icon: '🏆',
				},
			}
			const result = transformApiQuestToComponentQuest(apiQuest)
			expect(result.customAchievement).toBeDefined()
			expect(result.customAchievement?.title).toBe('Достижение')
			expect(result.customAchievement?.icon).toBe('🏆')
		})

		it('должен использовать дефолтную иконку для achievement без icon', () => {
			const apiQuest: ApiQuest = {
				...baseApiQuest,
				achievement: {
					title: 'Достижение',
					description: 'Описание',
				},
			}
			const result = transformApiQuestToComponentQuest(apiQuest)
			expect(result.customAchievement?.icon).toBe('🏆')
		})

		it('должен преобразовывать координаты из строк в числа', () => {
			const apiQuest: ApiQuest = {
				...baseApiQuest,
				latitude: '55.751244',
				longitude: '37.618423',
			}
			const result = transformApiQuestToComponentQuest(apiQuest)
			expect(result.coordinates).toEqual([55.751244, 37.618423])
		})

		it('должен обрабатывать невалидные координаты как 0', () => {
			const apiQuest: ApiQuest = {
				...baseApiQuest,
				latitude: 'invalid',
				longitude: 'invalid',
			}
			const result = transformApiQuestToComponentQuest(apiQuest)
			expect(result.coordinates).toEqual([0, 0])
		})

		it('должен извлекать название города', () => {
			const apiQuest: ApiQuest = {
				...baseApiQuest,
				city: {
					id: 1,
					name: 'Москва',
				},
			}
			const result = transformApiQuestToComponentQuest(apiQuest)
			expect(result.city).toBe('Москва')
		})

		it('должен использовать "Не указан" для отсутствующего города', () => {
			const result = transformApiQuestToComponentQuest(baseApiQuest)
			expect(result.city).toBe('Не указан')
		})

		it('должен извлекать тип организации', () => {
			const apiQuest: ApiQuest = {
				...baseApiQuest,
				organizationType: {
					id: 1,
					name: 'НКО',
				},
			}
			const result = transformApiQuestToComponentQuest(apiQuest)
			expect(result.type).toBe('НКО')
		})

		it('должен использовать "Не указан" для отсутствующего типа организации', () => {
			const result = transformApiQuestToComponentQuest(baseApiQuest)
			expect(result.type).toBe('Не указан')
		})

		it('должен преобразовывать coverImage в storyMedia', () => {
			const apiQuest: ApiQuest = {
				...baseApiQuest,
				coverImage: 'https://example.com/image.jpg',
			}
			const result = transformApiQuestToComponentQuest(apiQuest)
			expect(result.storyMedia?.image).toBe('https://example.com/image.jpg')
		})

		it('должен обрабатывать отсутствующий coverImage', () => {
			const result = transformApiQuestToComponentQuest(baseApiQuest)
			expect(result.storyMedia).toBeUndefined()
		})

		it('должен преобразовывать gallery', () => {
			const apiQuest: ApiQuest = {
				...baseApiQuest,
				gallery: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
			}
			const result = transformApiQuestToComponentQuest(apiQuest)
			expect(result.gallery).toEqual([
				'https://example.com/img1.jpg',
				'https://example.com/img2.jpg',
			])
		})

		it('должен обрабатывать отсутствующий gallery', () => {
			const result = transformApiQuestToComponentQuest(baseApiQuest)
			expect(result.gallery).toEqual([])
		})

		it('должен рассчитывать overallProgress из steps', () => {
			const apiQuest: ApiQuest = {
				...baseApiQuest,
				steps: [
					{ title: 'Этап 1', description: '', status: 'in_progress', progress: 50 },
					{ title: 'Этап 2', description: '', status: 'in_progress', progress: 75 },
				],
			}
			const result = transformApiQuestToComponentQuest(apiQuest)
			expect(result.overallProgress).toBe(63) // (50 + 75) / 2 = 62.5 -> 63
		})

		it('должен устанавливать progressColor на основе overallProgress', () => {
			const apiQuest: ApiQuest = {
				...baseApiQuest,
				steps: [
					{ title: 'Этап 1', description: '', status: 'completed', progress: 100 },
				],
			}
			const result = transformApiQuestToComponentQuest(apiQuest)
			expect(result.progressColor).toBe('victory')
		})

		it('должен обрабатывать isParticipating', () => {
			const apiQuest: ApiQuest = {
				...baseApiQuest,
				isParticipating: true,
			}
			const result = transformApiQuestToComponentQuest(apiQuest)
			expect(result.isParticipating).toBe(true)
		})

		it('должен использовать текущую дату для отсутствующих createdAt/updatedAt', () => {
			const result = transformApiQuestToComponentQuest(baseApiQuest)
			expect(result.createdAt).toBeDefined()
			expect(result.updatedAt).toBeDefined()
		})
	})

	describe('transformApiQuestsToComponentQuests', () => {
		it('должен преобразовывать массив квестов', () => {
			const apiQuests: ApiQuest[] = [
				{
					id: 1,
					title: 'Квест 1',
					description: 'Описание 1',
					status: 'active',
					experienceReward: 100,
					achievementId: null,
					ownerId: 1,
					cityId: 1,
					organizationTypeId: 1,
					latitude: '55.751244',
					longitude: '37.618423',
					address: 'Адрес 1',
					contacts: [],
					steps: [],
					categories: [],
				},
				{
					id: 2,
					title: 'Квест 2',
					description: 'Описание 2',
					status: 'active',
					experienceReward: 200,
					achievementId: null,
					ownerId: 1,
					cityId: 1,
					organizationTypeId: 1,
					latitude: '59.93428',
					longitude: '30.3351',
					address: 'Адрес 2',
					contacts: [],
					steps: [],
					categories: [],
				},
			]

			const result = transformApiQuestsToComponentQuests(apiQuests)
			expect(result).toHaveLength(2)
			expect(result[0].id).toBe('1')
			expect(result[1].id).toBe('2')
		})

		it('должен обрабатывать пустой массив', () => {
			const result = transformApiQuestsToComponentQuests([])
			expect(result).toHaveLength(0)
		})
	})
})

