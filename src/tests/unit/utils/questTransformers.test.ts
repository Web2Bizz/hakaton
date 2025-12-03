import type { QuestFormData } from '@/components/forms/quest/schemas/quest-form.schema'
import { transformFormDataToCreateRequest } from '@/components/forms/quest/utils/questTransformers'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Мокируем logger
vi.mock('@/utils/logger', () => ({
	logger: {
		debug: vi.fn(),
		error: vi.fn(),
	},
}))

describe('questTransformers', () => {
	describe('transformFormDataToCreateRequest', () => {
		const createBaseFormData = (): QuestFormData => ({
			title: 'Test Quest',
			cityId: 1,
			organizationTypeId: 2,
			category: 'environment',
			story: 'This is a test quest story with enough characters',
			storyImage: undefined,
			gallery: [],
			address: 'Test Address 123',
			contacts: [
				{ name: 'Куратор', value: 'John Doe' },
				{ name: 'Телефон', value: '+1234567890' },
			],
			latitude: '55.751244',
			longitude: '37.618423',
			stages: [
				{
					title: 'Stage 1',
					description: 'Stage description',
					status: 'pending',
					progress: 0,
					requirementType: 'no_required',
					requirementValue: undefined,
					itemName: undefined,
					deadline: undefined,
				},
			],
			customAchievement: undefined,
			achievementId: undefined,
			curatorName: '',
			curatorPhone: '',
			curatorEmail: undefined,
			socials: [],
		})

		beforeEach(() => {
			vi.clearAllMocks()
		})

		describe('базовое преобразование', () => {
			it('должен корректно преобразовывать все обязательные поля', () => {
				const formData = createBaseFormData()
				const result = transformFormDataToCreateRequest(formData)

				expect(result).toMatchObject({
					title: 'Test Quest',
					description: 'This is a test quest story with enough characters',
					status: 'active',
					experienceReward: 100,
					cityId: 1,
					organizationTypeId: 2,
					latitude: 55.751244,
					longitude: 37.618423,
					address: 'Test Address 123',
					categoryIds: [1],
				})
			})

			it('должен устанавливать status в "active"', () => {
				const formData = createBaseFormData()
				const result = transformFormDataToCreateRequest(formData)

				expect(result.status).toBe('active')
			})

			it('должен устанавливать experienceReward в 100', () => {
				const formData = createBaseFormData()
				const result = transformFormDataToCreateRequest(formData)

				expect(result.experienceReward).toBe(100)
			})
		})

		describe('преобразование категорий', () => {
			it('должен преобразовывать category "environment" в categoryId 1', () => {
				const formData = createBaseFormData()
				formData.category = 'environment'
				const result = transformFormDataToCreateRequest(formData)

				expect(result.categoryIds).toEqual([1])
			})

			it('должен преобразовывать category "animals" в categoryId 2', () => {
				const formData = createBaseFormData()
				formData.category = 'animals'
				const result = transformFormDataToCreateRequest(formData)

				expect(result.categoryIds).toEqual([2])
			})

			it('должен преобразовывать category "people" в categoryId 3', () => {
				const formData = createBaseFormData()
				formData.category = 'people'
				const result = transformFormDataToCreateRequest(formData)

				expect(result.categoryIds).toEqual([3])
			})

			it('должен преобразовывать category "education" в categoryId 4', () => {
				const formData = createBaseFormData()
				formData.category = 'education'
				const result = transformFormDataToCreateRequest(formData)

				expect(result.categoryIds).toEqual([4])
			})

			it('должен преобразовывать category "other" в categoryId 5', () => {
				const formData = createBaseFormData()
				formData.category = 'other'
				const result = transformFormDataToCreateRequest(formData)

				expect(result.categoryIds).toEqual([5])
			})

			it('должен использовать categoryId 5 по умолчанию для неизвестной категории', () => {
				const formData = createBaseFormData()
				// @ts-expect-error - тестируем невалидное значение
				formData.category = 'unknown'
				const result = transformFormDataToCreateRequest(formData)

				expect(result.categoryIds).toEqual([5])
			})
		})

		describe('преобразование координат', () => {
			it('должен преобразовывать latitude из строки в число', () => {
				const formData = createBaseFormData()
				formData.latitude = '55.751244'
				const result = transformFormDataToCreateRequest(formData)

				expect(result.latitude).toBe(55.751244)
				expect(typeof result.latitude).toBe('number')
			})

			it('должен преобразовывать longitude из строки в число', () => {
				const formData = createBaseFormData()
				formData.longitude = '37.618423'
				const result = transformFormDataToCreateRequest(formData)

				expect(result.longitude).toBe(37.618423)
				expect(typeof result.longitude).toBe('number')
			})

			it('должен корректно обрабатывать отрицательные координаты', () => {
				const formData = createBaseFormData()
				formData.latitude = '-90.0'
				formData.longitude = '-180.0'
				const result = transformFormDataToCreateRequest(formData)

				expect(result.latitude).toBe(-90.0)
				expect(result.longitude).toBe(-180.0)
			})

			it('должен корректно обрабатывать дробные координаты', () => {
				const formData = createBaseFormData()
				formData.latitude = '55.123456789'
				formData.longitude = '37.987654321'
				const result = transformFormDataToCreateRequest(formData)

				expect(result.latitude).toBeCloseTo(55.123456789)
				expect(result.longitude).toBeCloseTo(37.987654321)
			})
		})

		describe('преобразование cityId и organizationTypeId', () => {
			it('должен корректно обрабатывать cityId как число', () => {
				const formData = createBaseFormData()
				formData.cityId = 42
				const result = transformFormDataToCreateRequest(formData)

				expect(result.cityId).toBe(42)
			})

			it('должен корректно обрабатывать organizationTypeId как число', () => {
				const formData = createBaseFormData()
				formData.organizationTypeId = 99
				const result = transformFormDataToCreateRequest(formData)

				expect(result.organizationTypeId).toBe(99)
			})

			it('должен извлекать id из объекта cityId', () => {
				const formData = createBaseFormData()
				formData.cityId = { id: 100 } as any
				const result = transformFormDataToCreateRequest(formData)

				expect(result.cityId).toBe(100)
			})

			it('должен извлекать id из объекта organizationTypeId', () => {
				const formData = createBaseFormData()
				formData.organizationTypeId = { id: 200 } as any
				const result = transformFormDataToCreateRequest(formData)

				expect(result.organizationTypeId).toBe(200)
			})

			it('должен обрабатывать cityId как число, если объект не имеет id', () => {
				const formData = createBaseFormData()
				formData.cityId = { name: 'Moscow' } as any
				const result = transformFormDataToCreateRequest(formData)

				expect(typeof result.cityId).toBe('number')
				expect(Number.isNaN(result.cityId)).toBe(true)
			})

			it('должен обрабатывать organizationTypeId как число, если объект не имеет id', () => {
				const formData = createBaseFormData()
				formData.organizationTypeId = { name: 'NGO' } as any
				const result = transformFormDataToCreateRequest(formData)

				expect(typeof result.organizationTypeId).toBe('number')
				expect(Number.isNaN(result.organizationTypeId)).toBe(true)
			})

			it('должен обрабатывать null cityId', () => {
				const formData = createBaseFormData()
				formData.cityId = null as any
				const result = transformFormDataToCreateRequest(formData)

				expect(Number.isNaN(result.cityId)).toBe(true)
			})

			it('должен обрабатывать null organizationTypeId', () => {
				const formData = createBaseFormData()
				formData.organizationTypeId = null as any
				const result = transformFormDataToCreateRequest(formData)

				expect(Number.isNaN(result.organizationTypeId)).toBe(true)
			})
		})

		describe('преобразование контактов', () => {
			it('должен корректно преобразовывать контакты', () => {
				const formData = createBaseFormData()
				formData.contacts = [
					{ name: 'Куратор', value: 'John Doe' },
					{ name: 'Телефон', value: '+1234567890' },
					{ name: 'Email', value: 'test@example.com' },
				]
				const result = transformFormDataToCreateRequest(formData)

				expect(result.contacts).toEqual([
					{ name: 'Куратор', value: 'John Doe' },
					{ name: 'Телефон', value: '+1234567890' },
					{ name: 'Email', value: 'test@example.com' },
				])
			})

			it('должен удалять пробелы из значений контактов', () => {
				const formData = createBaseFormData()
				formData.contacts = [
					{ name: 'Телефон', value: '  +1234567890  ' },
					{ name: 'Email', value: '  test@example.com  ' },
				]
				const result = transformFormDataToCreateRequest(formData)

				expect(result.contacts).toEqual([
					{ name: 'Телефон', value: '+1234567890' },
					{ name: 'Email', value: 'test@example.com' },
				])
			})

			it('должен фильтровать контакты с пустыми значениями', () => {
				const formData = createBaseFormData()
				formData.contacts = [
					{ name: 'Куратор', value: 'John Doe' },
					{ name: 'Телефон', value: '' },
					{ name: 'Email', value: '   ' },
					{ name: 'Адрес', value: 'Valid Address' },
				]
				const result = transformFormDataToCreateRequest(formData)

				expect(result.contacts).toEqual([
					{ name: 'Куратор', value: 'John Doe' },
					{ name: 'Адрес', value: 'Valid Address' },
				])
			})

			it('должен обрабатывать пустой массив контактов', () => {
				const formData = createBaseFormData()
				formData.contacts = []
				const result = transformFormDataToCreateRequest(formData)

				expect(result.contacts).toEqual([])
			})
		})

		describe('преобразование этапов (stages)', () => {
			it('должен корректно преобразовывать этапы', () => {
				const formData = createBaseFormData()
				formData.stages = [
					{
						title: 'Stage 1',
						description: 'Description 1',
						status: 'pending',
						progress: 0,
						requirementType: 'no_required',
						requirementValue: undefined,
						itemName: undefined,
						deadline: undefined,
					},
					{
						title: 'Stage 2',
						description: 'Description 2',
						status: 'in_progress',
						progress: 50,
						requirementType: 'no_required',
						requirementValue: undefined,
						itemName: undefined,
						deadline: undefined,
					},
				]
				const result = transformFormDataToCreateRequest(formData)

				expect(result.steps).toHaveLength(2)
				expect(result.steps[0]).toMatchObject({
					title: 'Stage 1',
					description: 'Description 1',
					status: 'pending',
					progress: 0,
				})
				expect(result.steps[1]).toMatchObject({
					title: 'Stage 2',
					description: 'Description 2',
					status: 'in_progress',
					progress: 50,
				})
			})

			it('должен фильтровать этапы с пустым title', () => {
				const formData = createBaseFormData()
				formData.stages = [
					{
						title: 'Valid Stage',
						description: 'Description',
						status: 'pending',
						progress: 0,
						requirementType: 'no_required',
						requirementValue: undefined,
						itemName: undefined,
						deadline: undefined,
					},
					{
						title: '',
						description: 'Description',
						status: 'pending',
						progress: 0,
						requirementType: 'no_required',
						requirementValue: undefined,
						itemName: undefined,
						deadline: undefined,
					},
					{
						title: '   ',
						description: 'Description',
						status: 'pending',
						progress: 0,
						requirementType: 'no_required',
						requirementValue: undefined,
						itemName: undefined,
						deadline: undefined,
					},
				]
				const result = transformFormDataToCreateRequest(formData)

				expect(result.steps).toHaveLength(1)
				expect(result.steps[0].title).toBe('Valid Stage')
			})

			it('должен добавлять type для requirementType "finance"', () => {
				const formData = createBaseFormData()
				formData.stages = [
					{
						title: 'Stage 1',
						description: 'Description',
						status: 'pending',
						progress: 0,
						requirementType: 'finance',
						requirementValue: 1000,
						itemName: undefined,
						deadline: undefined,
					},
				]
				const result = transformFormDataToCreateRequest(formData)

				expect(result.steps[0].type).toBe('finance')
			})

			it('должен добавлять type для requirementType "contributers"', () => {
				const formData = createBaseFormData()
				formData.stages = [
					{
						title: 'Stage 1',
						description: 'Description',
						status: 'pending',
						progress: 0,
						requirementType: 'contributers',
						requirementValue: 10,
						itemName: undefined,
						deadline: undefined,
					},
				]
				const result = transformFormDataToCreateRequest(formData)

				expect(result.steps[0].type).toBe('contributers')
			})

			it('должен добавлять type для requirementType "material"', () => {
				const formData = createBaseFormData()
				formData.stages = [
					{
						title: 'Stage 1',
						description: 'Description',
						status: 'pending',
						progress: 0,
						requirementType: 'material',
						requirementValue: 5,
						itemName: undefined,
						deadline: undefined,
					},
				]
				const result = transformFormDataToCreateRequest(formData)

				expect(result.steps[0].type).toBe('material')
			})

			it('не должен добавлять type для requirementType "no_required"', () => {
				const formData = createBaseFormData()
				formData.stages = [
					{
						title: 'Stage 1',
						description: 'Description',
						status: 'pending',
						progress: 0,
						requirementType: 'no_required',
						requirementValue: undefined,
						itemName: undefined,
						deadline: undefined,
					},
				]
				const result = transformFormDataToCreateRequest(formData)

				expect(result.steps[0].type).toBeUndefined()
			})

			it('должен добавлять requirement с currentValue 0 и targetValue из requirementValue', () => {
				const formData = createBaseFormData()
				formData.stages = [
					{
						title: 'Stage 1',
						description: 'Description',
						status: 'pending',
						progress: 0,
						requirementType: 'finance',
						requirementValue: 5000,
						itemName: undefined,
						deadline: undefined,
					},
				]
				const result = transformFormDataToCreateRequest(formData)

				expect(result.steps[0].requirement).toEqual({
					currentValue: 0,
					targetValue: 5000,
				})
			})

			it('не должен добавлять requirement, если requirementType "no_required"', () => {
				const formData = createBaseFormData()
				formData.stages = [
					{
						title: 'Stage 1',
						description: 'Description',
						status: 'pending',
						progress: 0,
						requirementType: 'no_required',
						requirementValue: 1000,
						itemName: undefined,
						deadline: undefined,
					},
				]
				const result = transformFormDataToCreateRequest(formData)

				expect(result.steps[0].requirement).toBeUndefined()
			})

			it('не должен добавлять requirement, если requirementValue отсутствует', () => {
				const formData = createBaseFormData()
				formData.stages = [
					{
						title: 'Stage 1',
						description: 'Description',
						status: 'pending',
						progress: 0,
						requirementType: 'finance',
						requirementValue: undefined,
						itemName: undefined,
						deadline: undefined,
					},
				]
				const result = transformFormDataToCreateRequest(formData)

				expect(result.steps[0].requirement).toBeUndefined()
			})

			it('должен добавлять deadline, если он указан', () => {
				const deadline = '2024-12-31T23:59:59Z'
				const formData = createBaseFormData()
				formData.stages = [
					{
						title: 'Stage 1',
						description: 'Description',
						status: 'pending',
						progress: 0,
						requirementType: 'no_required',
						requirementValue: undefined,
						itemName: undefined,
						deadline,
					},
				]
				const result = transformFormDataToCreateRequest(formData)

				expect(result.steps[0].deadline).toBe(deadline)
			})

			it('не должен добавлять deadline, если он не указан', () => {
				const formData = createBaseFormData()
				formData.stages = [
					{
						title: 'Stage 1',
						description: 'Description',
						status: 'pending',
						progress: 0,
						requirementType: 'no_required',
						requirementValue: undefined,
						itemName: undefined,
						deadline: undefined,
					},
				]
				const result = transformFormDataToCreateRequest(formData)

				expect(result.steps[0].deadline).toBeUndefined()
			})

			it('должен корректно обрабатывать этап со всеми полями', () => {
				const deadline = '2024-12-31T23:59:59Z'
				const formData = createBaseFormData()
				formData.stages = [
					{
						title: 'Complete Stage',
						description: 'Full description',
						status: 'in_progress',
						progress: 75,
						requirementType: 'contributers',
						requirementValue: 20,
						itemName: undefined,
						deadline,
					},
				]
				const result = transformFormDataToCreateRequest(formData)

				expect(result.steps[0]).toEqual({
					title: 'Complete Stage',
					description: 'Full description',
					status: 'in_progress',
					progress: 75,
					type: 'contributers',
					requirement: {
						currentValue: 0,
						targetValue: 20,
					},
					deadline,
				})
			})
		})

		describe('обработка optional полей', () => {
			it('должен добавлять coverImage, если storyImage указан', () => {
				const formData = createBaseFormData()
				formData.storyImage = 'https://example.com/image.jpg'
				const result = transformFormDataToCreateRequest(formData)

				expect(result.coverImage).toBe('https://example.com/image.jpg')
			})

			it('не должен добавлять coverImage, если storyImage не указан', () => {
				const formData = createBaseFormData()
				formData.storyImage = undefined
				const result = transformFormDataToCreateRequest(formData)

				expect(result.coverImage).toBeUndefined()
			})

			it('должен добавлять gallery, если массив не пустой', () => {
				const formData = createBaseFormData()
				formData.gallery = [
					'https://example.com/image1.jpg',
					'https://example.com/image2.jpg',
				]
				const result = transformFormDataToCreateRequest(formData)

				expect(result.gallery).toEqual([
					'https://example.com/image1.jpg',
					'https://example.com/image2.jpg',
				])
			})

			it('не должен добавлять gallery, если массив пустой', () => {
				const formData = createBaseFormData()
				formData.gallery = []
				const result = transformFormDataToCreateRequest(formData)

				expect(result.gallery).toBeUndefined()
			})

			it('должен добавлять achievement, если customAchievement указан', () => {
				const formData = createBaseFormData()
				formData.customAchievement = {
					icon: '🎯',
					title: 'Test Achievement',
					description: 'Test Description',
				}
				const result = transformFormDataToCreateRequest(formData)

				expect(result.achievement).toEqual({
					icon: '🎯',
					title: 'Test Achievement',
					description: 'Test Description',
				})
			})

			it('не должен добавлять achievement, если customAchievement не указан', () => {
				const formData = createBaseFormData()
				formData.customAchievement = undefined
				const result = transformFormDataToCreateRequest(formData)

				expect(result.achievement).toBeUndefined()
			})

			it('не должен добавлять achievement, если customAchievement null', () => {
				const formData = createBaseFormData()
				formData.customAchievement = null
				const result = transformFormDataToCreateRequest(formData)

				expect(result.achievement).toBeUndefined()
			})
		})

		describe('комплексные сценарии', () => {
			it('должен корректно преобразовывать полную форму со всеми полями', () => {
				const formData: QuestFormData = {
					title: 'Complete Quest',
					cityId: { id: 10 } as any,
					organizationTypeId: { id: 20 } as any,
					category: 'animals',
					story:
						'This is a complete quest story with all the necessary details',
					storyImage: 'https://example.com/cover.jpg',
					gallery: [
						'https://example.com/gallery1.jpg',
						'https://example.com/gallery2.jpg',
					],
					address: '123 Main Street, City',
					contacts: [
						{ name: 'Куратор', value: 'Jane Doe' },
						{ name: 'Телефон', value: '  +9876543210  ' },
						{ name: 'Email', value: 'jane@example.com' },
					],
					latitude: '55.123456',
					longitude: '37.654321',
					stages: [
						{
							title: 'Stage 1',
							description: 'First stage',
							status: 'pending',
							progress: 0,
							requirementType: 'finance',
							requirementValue: 10000,
							itemName: undefined,
							deadline: '2024-12-31T00:00:00Z',
						},
						{
							title: 'Stage 2',
							description: 'Second stage',
							status: 'in_progress',
							progress: 50,
							requirementType: 'contributers',
							requirementValue: 15,
							itemName: undefined,
							deadline: undefined,
						},
						{
							title: '',
							description: 'Empty stage',
							status: 'pending',
							progress: 0,
							requirementType: 'no_required',
							requirementValue: undefined,
							itemName: undefined,
							deadline: undefined,
						},
					],
					customAchievement: {
						icon: '🏆',
						title: 'Complete Quest Achievement',
						description: 'You completed the quest!',
					},
					achievementId: undefined,
					curatorName: 'Jane Doe',
					curatorPhone: '+9876543210',
					curatorEmail: 'jane@example.com',
					socials: [],
				}

				const result = transformFormDataToCreateRequest(formData)

				expect(result).toMatchObject({
					title: 'Complete Quest',
					description:
						'This is a complete quest story with all the necessary details',
					status: 'active',
					experienceReward: 100,
					cityId: 10,
					organizationTypeId: 20,
					latitude: 55.123456,
					longitude: 37.654321,
					address: '123 Main Street, City',
					coverImage: 'https://example.com/cover.jpg',
					categoryIds: [2],
					achievement: {
						icon: '🏆',
						title: 'Complete Quest Achievement',
						description: 'You completed the quest!',
					},
				})

				expect(result.contacts).toEqual([
					{ name: 'Куратор', value: 'Jane Doe' },
					{ name: 'Телефон', value: '+9876543210' },
					{ name: 'Email', value: 'jane@example.com' },
				])

				expect(result.gallery).toEqual([
					'https://example.com/gallery1.jpg',
					'https://example.com/gallery2.jpg',
				])

				expect(result.steps).toHaveLength(2) // Пустой этап отфильтрован
				expect(result.steps[0]).toMatchObject({
					title: 'Stage 1',
					type: 'finance',
					requirement: { currentValue: 0, targetValue: 10000 },
					deadline: '2024-12-31T00:00:00Z',
				})
				expect(result.steps[1]).toMatchObject({
					title: 'Stage 2',
					type: 'contributers',
					requirement: { currentValue: 0, targetValue: 15 },
				})
			})

			it('должен корректно обрабатывать минимальную форму', () => {
				const formData: QuestFormData = {
					title: 'Minimal Quest',
					cityId: 1,
					organizationTypeId: 1,
					category: 'other',
					story: 'This is a minimal quest story with enough characters',
					storyImage: undefined,
					gallery: [],
					address: 'Minimal Address',
					contacts: [{ name: 'Куратор', value: 'Minimal' }],
					latitude: '0',
					longitude: '0',
					stages: [
						{
							title: 'Only Stage',
							description: 'Only description',
							status: 'pending',
							progress: 0,
							requirementType: 'no_required',
							requirementValue: undefined,
							itemName: undefined,
							deadline: undefined,
						},
					],
					customAchievement: undefined,
					achievementId: undefined,
					curatorName: '',
					curatorPhone: '',
					curatorEmail: undefined,
					socials: [],
				}

				const result = transformFormDataToCreateRequest(formData)

				expect(result).toMatchObject({
					title: 'Minimal Quest',
					status: 'active',
					experienceReward: 100,
					cityId: 1,
					organizationTypeId: 1,
					latitude: 0,
					longitude: 0,
					categoryIds: [5],
				})

				expect(result.coverImage).toBeUndefined()
				expect(result.gallery).toBeUndefined()
				expect(result.achievement).toBeUndefined()
				expect(result.steps).toHaveLength(1)
				expect(result.steps[0].type).toBeUndefined()
				expect(result.steps[0].requirement).toBeUndefined()
				expect(result.steps[0].deadline).toBeUndefined()
			})
		})

		describe('граничные случаи', () => {
			it('должен обрабатывать очень длинные строки', () => {
				const formData = createBaseFormData()
				formData.title = 'A'.repeat(1000)
				formData.story = 'B'.repeat(10000)
				formData.address = 'C'.repeat(500)
				const result = transformFormDataToCreateRequest(formData)

				expect(result.title).toBe('A'.repeat(1000))
				expect(result.description).toBe('B'.repeat(10000))
				expect(result.address).toBe('C'.repeat(500))
			})

			it('должен обрабатывать множество этапов', () => {
				const formData = createBaseFormData()
				formData.stages = Array.from({ length: 50 }, (_, i) => ({
					title: `Stage ${i + 1}`,
					description: `Description ${i + 1}`,
					status: 'pending' as const,
					progress: 0,
					requirementType: 'no_required' as const,
					requirementValue: undefined,
					itemName: undefined,
					deadline: undefined,
				}))
				const result = transformFormDataToCreateRequest(formData)

				expect(result.steps).toHaveLength(50)
			})

			it('должен обрабатывать множество контактов', () => {
				const formData = createBaseFormData()
				formData.contacts = Array.from({ length: 20 }, (_, i) => ({
					name: `Contact ${i + 1}`,
					value: `Value ${i + 1}`,
				}))
				const result = transformFormDataToCreateRequest(formData)

				expect(result.contacts).toHaveLength(20)
			})

			it('должен обрабатывать requirementValue равное 0', () => {
				const formData = createBaseFormData()
				formData.stages = [
					{
						title: 'Stage 1',
						description: 'Description',
						status: 'pending',
						progress: 0,
						requirementType: 'finance',
						requirementValue: 0,
						itemName: undefined,
						deadline: undefined,
					},
				]
				const result = transformFormDataToCreateRequest(formData)

				// 0 считается falsy, поэтому requirement не должен быть добавлен
				expect(result.steps[0].requirement).toBeUndefined()
			})
		})
	})
})
