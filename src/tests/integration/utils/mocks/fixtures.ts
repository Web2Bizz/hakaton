import type { User } from '@/types/user'

/**
 * Тестовые данные (fixtures) для интеграционных тестов
 */

export const mockUser: User = {
	id: '1',
	name: 'Test User',
	email: 'test@example.com',
	level: {
		level: 5,
		experience: 100,
		experienceToNext: 150,
		title: 'Активный',
	},
	stats: {
		totalQuests: 2,
		completedQuests: 1,
		totalDonations: 5000,
		totalVolunteerHours: 20,
		totalImpact: {
			treesPlanted: 0,
			animalsHelped: 0,
			areasCleaned: 0,
			livesChanged: 0,
		},
	},
	achievements: [],
	participatingQuests: [],
	createdAt: '2024-01-01T00:00:00Z',
}

export const mockAuthResponse = {
	access_token: 'mock-access-token-123',
	refresh_token: 'mock-refresh-token-456',
	user: mockUser,
}

export const mockCategory = {
	id: 1,
	name: 'environment',
	displayName: 'Экология',
}

export const mockQuest = {
	id: 1,
	title: 'Test Quest',
	description:
		'Test Description with more than 20 characters to pass validation',
	cityId: 1,
	organizationTypeId: 1,
	categoryIds: [1],
	address: 'Test Address',
	latitude: '55.7558', // Строка, как приходит с сервера
	longitude: '37.6173', // Строка, как приходит с сервера
	coverImage: 'https://example.com/image.jpg',
	gallery: [],
	contacts: [
		{ name: 'Куратор', value: 'Test User' },
		{ name: 'Телефон', value: '+79991234567' },
	],
	steps: [],
	categories: [mockCategory], // Массив категорий
	status: 'active',
	experienceReward: 100,
	achievementId: null,
	ownerId: 1,
	createdAt: '2024-01-01T00:00:00Z',
	updatedAt: '2024-01-01T00:00:00Z',
}

export const mockOrganization = {
	id: 1,
	name: 'Test Organization',
	summary: 'Test Summary',
	description: 'Test Description',
	cityId: 1,
	organizationTypeId: 1,
	address: 'Test Address',
	latitude: 55.7558,
	longitude: 37.6173,
	coverImage: 'https://example.com/image.jpg',
	gallery: [],
	contacts: [],
	helpTypes: [],
	status: 'active',
	createdAt: '2024-01-01T00:00:00Z',
	updatedAt: '2024-01-01T00:00:00Z',
}

export const mockCity = {
	id: 1,
	name: 'Москва',
	latitude: 55.7558,
	longitude: 37.6173,
}

export const mockOrganizationType = {
	id: 1,
	name: 'Благотворительный фонд',
}

export const mockHelpType = {
	id: 1,
	name: 'Экология',
}

export const mockBase64Image =
	'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
