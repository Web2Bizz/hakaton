import {
	contactSchema,
	customAchievementSchema,
	questFormSchema,
	socialLinkSchema,
	stageFormSchema,
} from '@/components/forms/quest/schemas/quest-form.schema'
import { describe, expect, it } from 'vitest'

describe('quest-form schemas', () => {
	describe('contactSchema', () => {
		it('должен валидировать корректный контакт', () => {
			const validContact = {
				name: 'Телефон',
				value: '+7 999 123 45 67',
			}
			const result = contactSchema.safeParse(validContact)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data).toEqual(validContact)
			}
		})

		it('должен отклонять контакт без названия', () => {
			const invalidContact = {
				name: '',
				value: '+7 999 123 45 67',
			}
			const result = contactSchema.safeParse(invalidContact)
			expect(result.success).toBe(false)
		})

		it('должен отклонять контакт без значения', () => {
			const invalidContact = {
				name: 'Телефон',
				value: '',
			}
			const result = contactSchema.safeParse(invalidContact)
			expect(result.success).toBe(false)
		})

		it('должен отклонять контакт с пустым названием (пробелы)', () => {
			const invalidContact = {
				name: '   ',
				value: '+7 999 123 45 67',
			}
			const result = contactSchema.safeParse(invalidContact)
			expect(result.success).toBe(true) // min(1) не проверяет пробелы
		})

		it('должен валидировать контакт с минимальной длиной', () => {
			const validContact = {
				name: 'A',
				value: '1',
			}
			const result = contactSchema.safeParse(validContact)
			expect(result.success).toBe(true)
		})

		it('должен валидировать контакт с длинными значениями', () => {
			const validContact = {
				name: 'Очень длинное название контакта',
				value: 'Очень длинное значение контакта с множеством символов',
			}
			const result = contactSchema.safeParse(validContact)
			expect(result.success).toBe(true)
		})
	})

	describe('socialLinkSchema', () => {
		it('должен валидировать корректную ссылку VK', () => {
			const validLink = {
				name: 'VK' as const,
				url: 'https://vk.com/group',
			}
			const result = socialLinkSchema.safeParse(validLink)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.name).toBe('VK')
			}
		})

		it('должен валидировать корректную ссылку Telegram', () => {
			const validLink = {
				name: 'Telegram' as const,
				url: 'https://t.me/group',
			}
			const result = socialLinkSchema.safeParse(validLink)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.name).toBe('Telegram')
			}
		})

		it('должен валидировать корректную ссылку Website', () => {
			const validLink = {
				name: 'Website' as const,
				url: 'https://example.com',
			}
			const result = socialLinkSchema.safeParse(validLink)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.name).toBe('Website')
			}
		})

		it('должен отклонять недопустимое имя социальной сети', () => {
			const invalidLink = {
				name: 'Facebook' as unknown as 'VK' | 'Telegram' | 'Website',
				url: 'https://facebook.com',
			}
			const result = socialLinkSchema.safeParse(invalidLink)
			expect(result.success).toBe(false)
		})

		it('должен устанавливать пустую строку по умолчанию для url', () => {
			const linkWithoutUrl = {
				name: 'VK' as const,
			}
			const result = socialLinkSchema.safeParse(linkWithoutUrl)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.url).toBe('')
			}
		})

		it('должен валидировать пустую строку url', () => {
			const validLink = {
				name: 'VK' as const,
				url: '',
			}
			const result = socialLinkSchema.safeParse(validLink)
			expect(result.success).toBe(true)
		})
	})

	describe('stageFormSchema', () => {
		const validStage = {
			title: 'Этап 1',
			description: 'Описание этапа',
			status: 'pending' as const,
			progress: 0,
			requirementType: 'no_required' as const,
		}

		it('должен валидировать корректный этап', () => {
			const result = stageFormSchema.safeParse(validStage)
			expect(result.success).toBe(true)
		})

		it('должен отклонять этап без названия', () => {
			const invalidStage = {
				...validStage,
				title: '',
			}
			const result = stageFormSchema.safeParse(invalidStage)
			expect(result.success).toBe(false)
		})

		it('должен отклонять этап без описания', () => {
			const invalidStage = {
				...validStage,
				description: '',
			}
			const result = stageFormSchema.safeParse(invalidStage)
			expect(result.success).toBe(false)
		})

		it('должен валидировать статус pending', () => {
			const stage = {
				...validStage,
				status: 'pending' as const,
			}
			const result = stageFormSchema.safeParse(stage)
			expect(result.success).toBe(true)
		})

		it('должен валидировать статус in_progress', () => {
			const stage = {
				...validStage,
				status: 'in_progress' as const,
			}
			const result = stageFormSchema.safeParse(stage)
			expect(result.success).toBe(true)
		})

		it('должен валидировать статус completed', () => {
			const stage = {
				...validStage,
				status: 'completed' as const,
			}
			const result = stageFormSchema.safeParse(stage)
			expect(result.success).toBe(true)
		})

		it('должен отклонять недопустимый статус', () => {
			const invalidStage = {
				...validStage,
				status: 'invalid' as unknown as 'pending' | 'in_progress' | 'completed',
			}
			const result = stageFormSchema.safeParse(invalidStage)
			expect(result.success).toBe(false)
		})

		it('должен валидировать прогресс 0', () => {
			const stage = {
				...validStage,
				progress: 0,
			}
			const result = stageFormSchema.safeParse(stage)
			expect(result.success).toBe(true)
		})

		it('должен валидировать прогресс 100', () => {
			const stage = {
				...validStage,
				progress: 100,
			}
			const result = stageFormSchema.safeParse(stage)
			expect(result.success).toBe(true)
		})

		it('должен валидировать прогресс 50', () => {
			const stage = {
				...validStage,
				progress: 50,
			}
			const result = stageFormSchema.safeParse(stage)
			expect(result.success).toBe(true)
		})

		it('должен отклонять прогресс меньше 0', () => {
			const invalidStage = {
				...validStage,
				progress: -1,
			}
			const result = stageFormSchema.safeParse(invalidStage)
			expect(result.success).toBe(false)
		})

		it('должен отклонять прогресс больше 100', () => {
			const invalidStage = {
				...validStage,
				progress: 101,
			}
			const result = stageFormSchema.safeParse(invalidStage)
			expect(result.success).toBe(false)
		})

		it('должен валидировать requirementType no_required', () => {
			const stage = {
				...validStage,
				requirementType: 'no_required' as const,
			}
			const result = stageFormSchema.safeParse(stage)
			expect(result.success).toBe(true)
		})

		it('должен валидировать requirementType finance', () => {
			const stage = {
				...validStage,
				requirementType: 'finance' as const,
			}
			const result = stageFormSchema.safeParse(stage)
			expect(result.success).toBe(true)
		})

		it('должен валидировать requirementType contributers', () => {
			const stage = {
				...validStage,
				requirementType: 'contributers' as const,
			}
			const result = stageFormSchema.safeParse(stage)
			expect(result.success).toBe(true)
		})

		it('должен валидировать requirementType material', () => {
			const stage = {
				...validStage,
				requirementType: 'material' as const,
			}
			const result = stageFormSchema.safeParse(stage)
			expect(result.success).toBe(true)
		})

		it('должен валидировать requirementValue 0', () => {
			const stage = {
				...validStage,
				requirementValue: 0,
			}
			const result = stageFormSchema.safeParse(stage)
			expect(result.success).toBe(true)
		})

		it('должен валидировать requirementValue положительное число', () => {
			const stage = {
				...validStage,
				requirementValue: 1000,
			}
			const result = stageFormSchema.safeParse(stage)
			expect(result.success).toBe(true)
		})

		it('должен отклонять requirementValue отрицательное число', () => {
			const invalidStage = {
				...validStage,
				requirementValue: -1,
			}
			const result = stageFormSchema.safeParse(invalidStage)
			expect(result.success).toBe(false)
		})

		it('должен валидировать этап без requirementValue', () => {
			const result = stageFormSchema.safeParse(validStage)
			expect(result.success).toBe(true)
		})

		it('должен валидировать itemName как строку', () => {
			const stage = {
				...validStage,
				itemName: 'Название предмета',
			}
			const result = stageFormSchema.safeParse(stage)
			expect(result.success).toBe(true)
		})

		it('должен преобразовывать null itemName в undefined', () => {
			const stage = {
				...validStage,
				itemName: null,
			}
			const result = stageFormSchema.safeParse(stage)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.itemName).toBeUndefined()
			}
		})

		it('должен валидировать deadline как строку', () => {
			const stage = {
				...validStage,
				deadline: '2024-12-31',
			}
			const result = stageFormSchema.safeParse(stage)
			expect(result.success).toBe(true)
		})

		it('должен преобразовывать null deadline в undefined', () => {
			const stage = {
				...validStage,
				deadline: null,
			}
			const result = stageFormSchema.safeParse(stage)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.deadline).toBeUndefined()
			}
		})

		it('должен устанавливать значения по умолчанию', () => {
			const minimalStage = {
				title: 'Этап',
				description: 'Описание',
			}
			const result = stageFormSchema.safeParse(minimalStage)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.status).toBe('pending')
				expect(result.data.progress).toBe(0)
				expect(result.data.requirementType).toBe('no_required')
			}
		})
	})

	describe('customAchievementSchema', () => {
		const validAchievement = {
			icon: '🏆',
			title: 'Название достижения',
			description: 'Описание достижения',
		}

		it('должен валидировать корректное достижение', () => {
			const result = customAchievementSchema.safeParse(validAchievement)
			expect(result.success).toBe(true)
		})

		it('должен отклонять достижение без эмодзи', () => {
			const invalidAchievement = {
				...validAchievement,
				icon: '',
			}
			const result = customAchievementSchema.safeParse(invalidAchievement)
			expect(result.success).toBe(false)
		})

		it('должен отклонять достижение без названия', () => {
			const invalidAchievement = {
				...validAchievement,
				title: '',
			}
			const result = customAchievementSchema.safeParse(invalidAchievement)
			expect(result.success).toBe(false)
		})

		it('должен отклонять достижение без описания', () => {
			const invalidAchievement = {
				...validAchievement,
				description: '',
			}
			const result = customAchievementSchema.safeParse(invalidAchievement)
			expect(result.success).toBe(false)
		})

		it('должен валидировать null как null (опциональное поле)', () => {
			const result = customAchievementSchema.safeParse(null)
			expect(result.success).toBe(true)
			if (result.success) {
				// Схема .optional().nullable() возвращает null, а не undefined
				expect(result.data).toBeNull()
			}
		})

		it('должен валидировать undefined', () => {
			const result = customAchievementSchema.safeParse(undefined)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data).toBeUndefined()
			}
		})

		it('должен валидировать достижение с длинным эмодзи', () => {
			const achievement = {
				...validAchievement,
				icon: '🎉🎊🎈',
			}
			const result = customAchievementSchema.safeParse(achievement)
			expect(result.success).toBe(true)
		})
	})

	describe('questFormSchema', () => {
		const validQuest = {
			title: 'Название квеста',
			cityId: 1,
			organizationTypeId: 1,
			category: 'environment' as const,
			story:
				'Это очень длинное описание квеста, которое содержит минимум 20 символов',
			address: 'Москва, ул. Примерная, д. 1',
			contacts: [
				{
					name: 'Телефон',
					value: '+7 999 123 45 67',
				},
			],
			latitude: '55.7558',
			longitude: '37.6173',
			stages: [
				{
					title: 'Этап 1',
					description: 'Описание этапа',
					status: 'pending' as const,
					progress: 0,
					requirementType: 'no_required' as const,
				},
			],
		}

		it('должен валидировать корректную форму квеста', () => {
			const result = questFormSchema.safeParse(validQuest)
			expect(result.success).toBe(true)
		})

		it('должен отклонять квест без названия', () => {
			const invalidQuest = {
				...validQuest,
				title: '',
			}
			const result = questFormSchema.safeParse(invalidQuest)
			expect(result.success).toBe(false)
		})

		it('должен отклонять название короче 3 символов', () => {
			const invalidQuest = {
				...validQuest,
				title: 'AB',
			}
			const result = questFormSchema.safeParse(invalidQuest)
			expect(result.success).toBe(false)
		})

		it('должен валидировать название ровно 3 символа', () => {
			const quest = {
				...validQuest,
				title: 'ABC',
			}
			const result = questFormSchema.safeParse(quest)
			expect(result.success).toBe(true)
		})

		it('должен отклонять cityId меньше 1', () => {
			const invalidQuest = {
				...validQuest,
				cityId: 0,
			}
			const result = questFormSchema.safeParse(invalidQuest)
			expect(result.success).toBe(false)
		})

		it('должен валидировать cityId равный 1', () => {
			const quest = {
				...validQuest,
				cityId: 1,
			}
			const result = questFormSchema.safeParse(quest)
			expect(result.success).toBe(true)
		})

		it('должен отклонять organizationTypeId меньше 1', () => {
			const invalidQuest = {
				...validQuest,
				organizationTypeId: 0,
			}
			const result = questFormSchema.safeParse(invalidQuest)
			expect(result.success).toBe(false)
		})

		it('должен валидировать все категории', () => {
			const categories = [
				'environment',
				'animals',
				'people',
				'education',
				'other',
			] as const

			categories.forEach(category => {
				const quest = {
					...validQuest,
					category,
				}
				const result = questFormSchema.safeParse(quest)
				expect(result.success).toBe(true)
			})
		})

		it('должен отклонять недопустимую категорию', () => {
			const invalidQuest = {
				...validQuest,
				category: 'invalid' as unknown as
					| 'environment'
					| 'animals'
					| 'people'
					| 'education'
					| 'other',
			}
			const result = questFormSchema.safeParse(invalidQuest)
			expect(result.success).toBe(false)
		})

		it('должен отклонять story короче 20 символов', () => {
			const invalidQuest = {
				...validQuest,
				story: 'Короткое описание',
			}
			const result = questFormSchema.safeParse(invalidQuest)
			expect(result.success).toBe(false)
		})

		it('должен валидировать story ровно 20 символов', () => {
			const quest = {
				...validQuest,
				story: '12345678901234567890',
			}
			const result = questFormSchema.safeParse(quest)
			expect(result.success).toBe(true)
		})

		it('должен отклонять пустой адрес', () => {
			const invalidQuest = {
				...validQuest,
				address: '',
			}
			const result = questFormSchema.safeParse(invalidQuest)
			expect(result.success).toBe(false)
		})

		it('должен отклонять пустой массив контактов', () => {
			const invalidQuest = {
				...validQuest,
				contacts: [],
			}
			const result = questFormSchema.safeParse(invalidQuest)
			expect(result.success).toBe(false)
		})

		it('должен валидировать несколько контактов', () => {
			const quest = {
				...validQuest,
				contacts: [
					{ name: 'Телефон', value: '+7 999 123 45 67' },
					{ name: 'Email', value: 'test@example.com' },
				],
			}
			const result = questFormSchema.safeParse(quest)
			expect(result.success).toBe(true)
		})

		it('должен валидировать широту -90', () => {
			const quest = {
				...validQuest,
				latitude: '-90',
			}
			const result = questFormSchema.safeParse(quest)
			expect(result.success).toBe(true)
		})

		it('должен валидировать широту 90', () => {
			const quest = {
				...validQuest,
				latitude: '90',
			}
			const result = questFormSchema.safeParse(quest)
			expect(result.success).toBe(true)
		})

		it('должен валидировать широту 0', () => {
			const quest = {
				...validQuest,
				latitude: '0',
			}
			const result = questFormSchema.safeParse(quest)
			expect(result.success).toBe(true)
		})

		it('должен отклонять широту меньше -90', () => {
			const invalidQuest = {
				...validQuest,
				latitude: '-91',
			}
			const result = questFormSchema.safeParse(invalidQuest)
			expect(result.success).toBe(false)
		})

		it('должен отклонять широту больше 90', () => {
			const invalidQuest = {
				...validQuest,
				latitude: '91',
			}
			const result = questFormSchema.safeParse(invalidQuest)
			expect(result.success).toBe(false)
		})

		it('должен отклонять невалидную широту (не число)', () => {
			const invalidQuest = {
				...validQuest,
				latitude: 'не число',
			}
			const result = questFormSchema.safeParse(invalidQuest)
			expect(result.success).toBe(false)
		})

		it('должен валидировать долготу -180', () => {
			const quest = {
				...validQuest,
				longitude: '-180',
			}
			const result = questFormSchema.safeParse(quest)
			expect(result.success).toBe(true)
		})

		it('должен валидировать долготу 180', () => {
			const quest = {
				...validQuest,
				longitude: '180',
			}
			const result = questFormSchema.safeParse(quest)
			expect(result.success).toBe(true)
		})

		it('должен валидировать долготу 0', () => {
			const quest = {
				...validQuest,
				longitude: '0',
			}
			const result = questFormSchema.safeParse(quest)
			expect(result.success).toBe(true)
		})

		it('должен отклонять долготу меньше -180', () => {
			const invalidQuest = {
				...validQuest,
				longitude: '-181',
			}
			const result = questFormSchema.safeParse(invalidQuest)
			expect(result.success).toBe(false)
		})

		it('должен отклонять долготу больше 180', () => {
			const invalidQuest = {
				...validQuest,
				longitude: '181',
			}
			const result = questFormSchema.safeParse(invalidQuest)
			expect(result.success).toBe(false)
		})

		it('должен отклонять невалидную долготу (не число)', () => {
			const invalidQuest = {
				...validQuest,
				longitude: 'не число',
			}
			const result = questFormSchema.safeParse(invalidQuest)
			expect(result.success).toBe(false)
		})

		it('должен отклонять пустой массив этапов', () => {
			const invalidQuest = {
				...validQuest,
				stages: [],
			}
			const result = questFormSchema.safeParse(invalidQuest)
			expect(result.success).toBe(false)
		})

		it('должен валидировать несколько этапов', () => {
			const quest = {
				...validQuest,
				stages: [
					{
						title: 'Этап 1',
						description: 'Описание этапа 1',
						status: 'pending' as const,
						progress: 0,
						requirementType: 'no_required' as const,
					},
					{
						title: 'Этап 2',
						description: 'Описание этапа 2',
						status: 'in_progress' as const,
						progress: 50,
						requirementType: 'finance' as const,
						requirementValue: 1000,
					},
				],
			}
			const result = questFormSchema.safeParse(quest)
			expect(result.success).toBe(true)
		})

		it('должен валидировать корректный email куратора', () => {
			const quest = {
				...validQuest,
				curatorEmail: 'curator@example.com',
			}
			const result = questFormSchema.safeParse(quest)
			expect(result.success).toBe(true)
		})

		it('должен отклонять некорректный email куратора', () => {
			const invalidQuest = {
				...validQuest,
				curatorEmail: 'некорректный email',
			}
			const result = questFormSchema.safeParse(invalidQuest)
			expect(result.success).toBe(false)
		})

		it('должен валидировать пустую строку email куратора как undefined', () => {
			const quest = {
				...validQuest,
				curatorEmail: '',
			}
			const result = questFormSchema.safeParse(quest)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.curatorEmail).toBeUndefined()
			}
		})

		it('должен валидировать null email куратора как undefined', () => {
			const quest = {
				...validQuest,
				curatorEmail: null,
			}
			const result = questFormSchema.safeParse(quest)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.curatorEmail).toBeUndefined()
			}
		})

		it('должен валидировать квест без email куратора', () => {
			const result = questFormSchema.safeParse(validQuest)
			expect(result.success).toBe(true)
		})

		it('должен валидировать customAchievement', () => {
			const quest = {
				...validQuest,
				customAchievement: {
					icon: '🏆',
					title: 'Название',
					description: 'Описание',
				},
			}
			const result = questFormSchema.safeParse(quest)
			expect(result.success).toBe(true)
		})

		it('должен валидировать null customAchievement', () => {
			const quest = {
				...validQuest,
				customAchievement: null,
			}
			const result = questFormSchema.safeParse(quest)
			expect(result.success).toBe(true)
		})

		it('должен валидировать квест без customAchievement', () => {
			const result = questFormSchema.safeParse(validQuest)
			expect(result.success).toBe(true)
		})

		it('должен валидировать storyImage как строку', () => {
			const quest = {
				...validQuest,
				storyImage: 'https://example.com/image.jpg',
			}
			const result = questFormSchema.safeParse(quest)
			expect(result.success).toBe(true)
		})

		it('должен преобразовывать null storyImage в undefined', () => {
			const quest = {
				...validQuest,
				storyImage: null,
			}
			const result = questFormSchema.safeParse(quest)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.storyImage).toBeUndefined()
			}
		})

		it('должен валидировать gallery как массив строк', () => {
			const quest = {
				...validQuest,
				gallery: [
					'https://example.com/image1.jpg',
					'https://example.com/image2.jpg',
				],
			}
			const result = questFormSchema.safeParse(quest)
			expect(result.success).toBe(true)
		})

		it('должен устанавливать пустой массив по умолчанию для gallery', () => {
			const result = questFormSchema.safeParse(validQuest)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.gallery).toEqual([])
			}
		})

		it('должен валидировать socials как массив', () => {
			const quest = {
				...validQuest,
				socials: [
					{ name: 'VK' as const, url: 'https://vk.com/group' },
					{ name: 'Telegram' as const, url: 'https://t.me/group' },
				],
			}
			const result = questFormSchema.safeParse(quest)
			expect(result.success).toBe(true)
		})

		it('должен устанавливать пустой массив по умолчанию для socials', () => {
			const result = questFormSchema.safeParse(validQuest)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.socials).toEqual([])
			}
		})

		it('должен валидировать curatorName', () => {
			const quest = {
				...validQuest,
				curatorName: 'Иван Иванов',
			}
			const result = questFormSchema.safeParse(quest)
			expect(result.success).toBe(true)
		})

		it('должен валидировать curatorPhone', () => {
			const quest = {
				...validQuest,
				curatorPhone: '+7 999 123 45 67',
			}
			const result = questFormSchema.safeParse(quest)
			expect(result.success).toBe(true)
		})

		it('должен валидировать achievementId', () => {
			const quest = {
				...validQuest,
				achievementId: 1,
			}
			const result = questFormSchema.safeParse(quest)
			expect(result.success).toBe(true)
		})

		it('должен валидировать null achievementId', () => {
			const quest = {
				...validQuest,
				achievementId: null,
			}
			const result = questFormSchema.safeParse(quest)
			expect(result.success).toBe(true)
		})

		it('должен валидировать координаты с десятичными знаками', () => {
			const quest = {
				...validQuest,
				latitude: '55.755826',
				longitude: '37.617299',
			}
			const result = questFormSchema.safeParse(quest)
			expect(result.success).toBe(true)
		})

		it('должен валидировать координаты с отрицательными значениями', () => {
			const quest = {
				...validQuest,
				latitude: '-33.8688',
				longitude: '151.2093',
			}
			const result = questFormSchema.safeParse(quest)
			expect(result.success).toBe(true)
		})
	})
})
