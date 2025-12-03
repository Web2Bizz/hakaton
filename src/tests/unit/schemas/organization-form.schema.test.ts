import {
	contactSchema,
	organizationFormSchema,
} from '@/components/forms/organization/schemas/organization-form.schema'
import { describe, expect, it } from 'vitest'

describe('organization-form schemas', () => {
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

		it('должен валидировать контакт с минимальной длиной', () => {
			const validContact = {
				name: 'A',
				value: '1',
			}
			const result = contactSchema.safeParse(validContact)
			expect(result.success).toBe(true)
		})
	})

	describe('organizationFormSchema', () => {
		const validOrganization = {
			name: 'Название организации',
			cityId: 1,
			organizationTypeId: 1,
			helpTypeIds: [1],
			summary: 'Краткое описание организации, которое содержит минимум 10 символов',
			description: 'Подробное описание организации, которое содержит минимум 20 символов',
			mission: 'Миссия организации, которая содержит минимум 10 символов',
			goals: ['Цель 1'],
			needs: ['Потребность 1'],
			address: 'Москва, ул. Примерная, д. 1',
			contacts: [
				{
					name: 'Телефон',
					value: '+7 999 123 45 67',
				},
			],
			latitude: '55.7558',
			longitude: '37.6173',
		}

		it('должен валидировать корректную форму организации', () => {
			const result = organizationFormSchema.safeParse(validOrganization)
			expect(result.success).toBe(true)
		})

		it('должен отклонять организацию без названия', () => {
			const invalidOrganization = {
				...validOrganization,
				name: '',
			}
			const result = organizationFormSchema.safeParse(invalidOrganization)
			expect(result.success).toBe(false)
		})

		it('должен отклонять название короче 3 символов', () => {
			const invalidOrganization = {
				...validOrganization,
				name: 'AB',
			}
			const result = organizationFormSchema.safeParse(invalidOrganization)
			expect(result.success).toBe(false)
		})

		it('должен валидировать название ровно 3 символа', () => {
			const organization = {
				...validOrganization,
				name: 'ABC',
			}
			const result = organizationFormSchema.safeParse(organization)
			expect(result.success).toBe(true)
		})

		it('должен отклонять cityId меньше 1', () => {
			const invalidOrganization = {
				...validOrganization,
				cityId: 0,
			}
			const result = organizationFormSchema.safeParse(invalidOrganization)
			expect(result.success).toBe(false)
		})

		it('должен валидировать cityId равный 1', () => {
			const organization = {
				...validOrganization,
				cityId: 1,
			}
			const result = organizationFormSchema.safeParse(organization)
			expect(result.success).toBe(true)
		})

		it('должен валидировать cityId больше 1', () => {
			const organization = {
				...validOrganization,
				cityId: 100,
			}
			const result = organizationFormSchema.safeParse(organization)
			expect(result.success).toBe(true)
		})

		it('должен отклонять organizationTypeId меньше 1', () => {
			const invalidOrganization = {
				...validOrganization,
				organizationTypeId: 0,
			}
			const result = organizationFormSchema.safeParse(invalidOrganization)
			expect(result.success).toBe(false)
		})

		it('должен валидировать organizationTypeId равный 1', () => {
			const organization = {
				...validOrganization,
				organizationTypeId: 1,
			}
			const result = organizationFormSchema.safeParse(organization)
			expect(result.success).toBe(true)
		})

		it('должен отклонять пустой массив helpTypeIds', () => {
			const invalidOrganization = {
				...validOrganization,
				helpTypeIds: [],
			}
			const result = organizationFormSchema.safeParse(invalidOrganization)
			expect(result.success).toBe(false)
		})

		it('должен валидировать один helpTypeId', () => {
			const organization = {
				...validOrganization,
				helpTypeIds: [1],
			}
			const result = organizationFormSchema.safeParse(organization)
			expect(result.success).toBe(true)
		})

		it('должен валидировать несколько helpTypeIds', () => {
			const organization = {
				...validOrganization,
				helpTypeIds: [1, 2, 3],
			}
			const result = organizationFormSchema.safeParse(organization)
			expect(result.success).toBe(true)
		})

		it('должен отклонять summary короче 10 символов', () => {
			const invalidOrganization = {
				...validOrganization,
				summary: 'Короткое',
			}
			const result = organizationFormSchema.safeParse(invalidOrganization)
			expect(result.success).toBe(false)
		})

		it('должен валидировать summary ровно 10 символов', () => {
			const organization = {
				...validOrganization,
				summary: '1234567890',
			}
			const result = organizationFormSchema.safeParse(organization)
			expect(result.success).toBe(true)
		})

		it('должен отклонять пустое summary', () => {
			const invalidOrganization = {
				...validOrganization,
				summary: '',
			}
			const result = organizationFormSchema.safeParse(invalidOrganization)
			expect(result.success).toBe(false)
		})

		it('должен отклонять description короче 20 символов', () => {
			const invalidOrganization = {
				...validOrganization,
				description: 'Короткое описание',
			}
			const result = organizationFormSchema.safeParse(invalidOrganization)
			expect(result.success).toBe(false)
		})

		it('должен валидировать description ровно 20 символов', () => {
			const organization = {
				...validOrganization,
				description: '12345678901234567890',
			}
			const result = organizationFormSchema.safeParse(organization)
			expect(result.success).toBe(true)
		})

		it('должен отклонять пустое description', () => {
			const invalidOrganization = {
				...validOrganization,
				description: '',
			}
			const result = organizationFormSchema.safeParse(invalidOrganization)
			expect(result.success).toBe(false)
		})

		it('должен отклонять mission короче 10 символов', () => {
			const invalidOrganization = {
				...validOrganization,
				mission: 'Короткая',
			}
			const result = organizationFormSchema.safeParse(invalidOrganization)
			expect(result.success).toBe(false)
		})

		it('должен валидировать mission ровно 10 символов', () => {
			const organization = {
				...validOrganization,
				mission: '1234567890',
			}
			const result = organizationFormSchema.safeParse(organization)
			expect(result.success).toBe(true)
		})

		it('должен отклонять пустое mission', () => {
			const invalidOrganization = {
				...validOrganization,
				mission: '',
			}
			const result = organizationFormSchema.safeParse(invalidOrganization)
			expect(result.success).toBe(false)
		})

		it('должен валидировать goals как массив строк', () => {
			const organization = {
				...validOrganization,
				goals: ['Цель 1', 'Цель 2', 'Цель 3'],
			}
			const result = organizationFormSchema.safeParse(organization)
			expect(result.success).toBe(true)
		})

		it('должен устанавливать пустой массив по умолчанию для goals', () => {
			const organizationWithoutGoals = {
				...validOrganization,
			}
			delete (organizationWithoutGoals as any).goals
			const result = organizationFormSchema.safeParse(organizationWithoutGoals)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.goals).toEqual([''])
			}
		})

		it('должен валидировать needs как массив строк', () => {
			const organization = {
				...validOrganization,
				needs: ['Потребность 1', 'Потребность 2'],
			}
			const result = organizationFormSchema.safeParse(organization)
			expect(result.success).toBe(true)
		})

		it('должен устанавливать пустой массив по умолчанию для needs', () => {
			const organizationWithoutNeeds = {
				...validOrganization,
			}
			delete (organizationWithoutNeeds as any).needs
			const result = organizationFormSchema.safeParse(organizationWithoutNeeds)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.needs).toEqual([''])
			}
		})

		it('должен отклонять пустой адрес', () => {
			const invalidOrganization = {
				...validOrganization,
				address: '',
			}
			const result = organizationFormSchema.safeParse(invalidOrganization)
			expect(result.success).toBe(false)
		})

		it('должен отклонять пустой массив контактов', () => {
			const invalidOrganization = {
				...validOrganization,
				contacts: [],
			}
			const result = organizationFormSchema.safeParse(invalidOrganization)
			expect(result.success).toBe(false)
		})

		it('должен валидировать несколько контактов', () => {
			const organization = {
				...validOrganization,
				contacts: [
					{ name: 'Телефон', value: '+7 999 123 45 67' },
					{ name: 'Email', value: 'test@example.com' },
					{ name: 'Адрес', value: 'Москва, ул. Примерная, д. 1' },
				],
			}
			const result = organizationFormSchema.safeParse(organization)
			expect(result.success).toBe(true)
		})

		it('должен валидировать широту -90', () => {
			const organization = {
				...validOrganization,
				latitude: '-90',
			}
			const result = organizationFormSchema.safeParse(organization)
			expect(result.success).toBe(true)
		})

		it('должен валидировать широту 90', () => {
			const organization = {
				...validOrganization,
				latitude: '90',
			}
			const result = organizationFormSchema.safeParse(organization)
			expect(result.success).toBe(true)
		})

		it('должен валидировать широту 0', () => {
			const organization = {
				...validOrganization,
				latitude: '0',
			}
			const result = organizationFormSchema.safeParse(organization)
			expect(result.success).toBe(true)
		})

		it('должен отклонять широту меньше -90', () => {
			const invalidOrganization = {
				...validOrganization,
				latitude: '-91',
			}
			const result = organizationFormSchema.safeParse(invalidOrganization)
			expect(result.success).toBe(false)
		})

		it('должен отклонять широту больше 90', () => {
			const invalidOrganization = {
				...validOrganization,
				latitude: '91',
			}
			const result = organizationFormSchema.safeParse(invalidOrganization)
			expect(result.success).toBe(false)
		})

		it('должен отклонять невалидную широту (не число)', () => {
			const invalidOrganization = {
				...validOrganization,
				latitude: 'не число',
			}
			const result = organizationFormSchema.safeParse(invalidOrganization)
			expect(result.success).toBe(false)
		})

		it('должен отклонять пустую широту', () => {
			const invalidOrganization = {
				...validOrganization,
				latitude: '',
			}
			const result = organizationFormSchema.safeParse(invalidOrganization)
			expect(result.success).toBe(false)
		})

		it('должен валидировать долготу -180', () => {
			const organization = {
				...validOrganization,
				longitude: '-180',
			}
			const result = organizationFormSchema.safeParse(organization)
			expect(result.success).toBe(true)
		})

		it('должен валидировать долготу 180', () => {
			const organization = {
				...validOrganization,
				longitude: '180',
			}
			const result = organizationFormSchema.safeParse(organization)
			expect(result.success).toBe(true)
		})

		it('должен валидировать долготу 0', () => {
			const organization = {
				...validOrganization,
				longitude: '0',
			}
			const result = organizationFormSchema.safeParse(organization)
			expect(result.success).toBe(true)
		})

		it('должен отклонять долготу меньше -180', () => {
			const invalidOrganization = {
				...validOrganization,
				longitude: '-181',
			}
			const result = organizationFormSchema.safeParse(invalidOrganization)
			expect(result.success).toBe(false)
		})

		it('должен отклонять долготу больше 180', () => {
			const invalidOrganization = {
				...validOrganization,
				longitude: '181',
			}
			const result = organizationFormSchema.safeParse(invalidOrganization)
			expect(result.success).toBe(false)
		})

		it('должен отклонять невалидную долготу (не число)', () => {
			const invalidOrganization = {
				...validOrganization,
				longitude: 'не число',
			}
			const result = organizationFormSchema.safeParse(invalidOrganization)
			expect(result.success).toBe(false)
		})

		it('должен отклонять пустую долготу', () => {
			const invalidOrganization = {
				...validOrganization,
				longitude: '',
			}
			const result = organizationFormSchema.safeParse(invalidOrganization)
			expect(result.success).toBe(false)
		})

		it('должен валидировать gallery как массив строк', () => {
			const organization = {
				...validOrganization,
				gallery: [
					'https://example.com/image1.jpg',
					'https://example.com/image2.jpg',
				],
			}
			const result = organizationFormSchema.safeParse(organization)
			expect(result.success).toBe(true)
		})

		it('должен устанавливать пустой массив по умолчанию для gallery', () => {
			const organizationWithoutGallery = {
				...validOrganization,
			}
			delete (organizationWithoutGallery as any).gallery
			const result = organizationFormSchema.safeParse(organizationWithoutGallery)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.gallery).toEqual([])
			}
		})

		it('должен валидировать координаты с десятичными знаками', () => {
			const organization = {
				...validOrganization,
				latitude: '55.755826',
				longitude: '37.617299',
			}
			const result = organizationFormSchema.safeParse(organization)
			expect(result.success).toBe(true)
		})

		it('должен валидировать координаты с отрицательными значениями', () => {
			const organization = {
				...validOrganization,
				latitude: '-33.8688',
				longitude: '151.2093',
			}
			const result = organizationFormSchema.safeParse(organization)
			expect(result.success).toBe(true)
		})

		it('должен валидировать длинное название организации', () => {
			const organization = {
				...validOrganization,
				name: 'Очень длинное название организации с множеством символов',
			}
			const result = organizationFormSchema.safeParse(organization)
			expect(result.success).toBe(true)
		})

		it('должен валидировать длинное summary', () => {
			const organization = {
				...validOrganization,
				summary: 'Очень длинное краткое описание организации, которое содержит намного больше 10 символов и описывает основные направления деятельности',
			}
			const result = organizationFormSchema.safeParse(organization)
			expect(result.success).toBe(true)
		})

		it('должен валидировать длинное description', () => {
			const organization = {
				...validOrganization,
				description: 'Очень длинное подробное описание организации, которое содержит намного больше 20 символов и подробно описывает все аспекты деятельности организации, её историю, достижения и планы на будущее',
			}
			const result = organizationFormSchema.safeParse(organization)
			expect(result.success).toBe(true)
		})

		it('должен валидировать длинную mission', () => {
			const organization = {
				...validOrganization,
				mission: 'Очень длинная миссия организации, которая содержит намного больше 10 символов и описывает основные цели и ценности организации',
			}
			const result = organizationFormSchema.safeParse(organization)
			expect(result.success).toBe(true)
		})
	})
})

