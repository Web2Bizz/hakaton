import { http, HttpResponse } from 'msw'
import {
	mockAuthResponse,
	mockCategory,
	mockCity,
	mockHelpType,
	mockOrganization,
	mockOrganizationType,
	mockQuest,
	mockUser,
} from './fixtures'

/**
 * MSW handlers для мокирования API запросов в интеграционных тестах
 */

const API_BASE_URL = 'https://it-hackathon-team05.mephi.ru/api'

export const handlers = [
	// ==================== AUTH ====================
	// POST /v1/auth/register
	http.post(`${API_BASE_URL}/v1/auth/register`, () => {
		return HttpResponse.json(mockAuthResponse)
	}),

	// POST /v1/auth/login
	http.post(`${API_BASE_URL}/v1/auth/login`, () => {
		return HttpResponse.json(mockAuthResponse)
	}),

	// POST /v1/auth/refresh
	http.post(`${API_BASE_URL}/v1/auth/refresh`, () => {
		return HttpResponse.json({
			access_token: 'new-mock-access-token-789',
			refresh_token: 'new-mock-refresh-token-012',
		})
	}),

	// POST /v1/auth/forgot-password
	http.post(`${API_BASE_URL}/v1/auth/forgot-password`, () => {
		return HttpResponse.json({ message: 'Email sent successfully' })
	}),

	// POST /v1/auth/reset-password
	http.post(`${API_BASE_URL}/v1/auth/reset-password`, () => {
		return HttpResponse.json({ message: 'Password reset successfully' })
	}),

	// GET /v1/users/:userId
	http.get(`${API_BASE_URL}/v1/users/:userId`, () => {
		return HttpResponse.json(mockUser)
	}),

	// PUT /v1/users/:userId
	http.put(`${API_BASE_URL}/v1/users/:userId`, async ({ request }) => {
		const body = (await request.json()) as Record<string, unknown>
		return HttpResponse.json({
			...mockUser,
			...(body as Partial<typeof mockUser>),
		})
	}),

	// ==================== QUESTS ====================
	// GET /v1/quests
	http.get(`${API_BASE_URL}/v1/quests`, () => {
		return HttpResponse.json({
			data: {
				quests: [mockQuest],
				total: 1,
			},
		})
	}),

	// GET /v1/quests/:id
	http.get(`${API_BASE_URL}/v1/quests/:id`, ({ params }) => {
		return HttpResponse.json({
			...mockQuest,
			id: Number(params.id),
		})
	}),

	// GET /v2/quests/:id
	http.get(`${API_BASE_URL}/v2/quests/:id`, ({ request, params }) => {
		// Проверяем наличие токена в заголовках (для защищенных эндпоинтов)
		const authHeader = request.headers.get('authorization')
		if (!authHeader?.startsWith('Bearer ')) {
			return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}
		return HttpResponse.json({
			...mockQuest,
			id: Number(params.id),
		})
	}),

	// POST /v1/quests
	http.post(`${API_BASE_URL}/v1/quests`, async ({ request }) => {
		const body = (await request.json()) as Record<string, unknown>
		return HttpResponse.json({
			...mockQuest,
			...(body as Partial<typeof mockQuest>),
			id: 2, // Новый ID для созданного квеста
		})
	}),

	// PATCH /v1/quests/:id (используется PATCH, а не PUT)
	http.patch(`${API_BASE_URL}/v1/quests/:id`, async ({ request }) => {
		// Проверяем наличие токена в заголовках (для защищенных эндпоинтов)
		const authHeader = request.headers.get('authorization')
		if (!authHeader?.startsWith('Bearer ')) {
			return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}
		const body = (await request.json()) as Record<string, unknown>
		return HttpResponse.json({
			...mockQuest,
			...(body as Partial<typeof mockQuest>),
		})
	}),

	// DELETE /v1/quests/:id
	http.delete(`${API_BASE_URL}/v1/quests/:id`, () => {
		return HttpResponse.json({ message: 'Quest deleted' })
	}),

	// ==================== ORGANIZATIONS ====================
	// GET /v1/organizations
	http.get(`${API_BASE_URL}/v1/organizations`, () => {
		return HttpResponse.json([mockOrganization])
	}),

	// GET /v1/organizations/:id
	http.get(`${API_BASE_URL}/v1/organizations/:id`, ({ params }) => {
		return HttpResponse.json({
			...mockOrganization,
			id: Number(params.id),
		})
	}),

	// POST /v1/organizations
	http.post(`${API_BASE_URL}/v1/organizations`, async ({ request }) => {
		const body = (await request.json()) as Record<string, unknown>
		return HttpResponse.json({
			...mockOrganization,
			...(body as Partial<typeof mockOrganization>),
			id: 2,
		})
	}),

	// PUT /v1/organizations/:id
	http.put(`${API_BASE_URL}/v1/organizations/:id`, async ({ request }) => {
		const body = (await request.json()) as Record<string, unknown>
		return HttpResponse.json({
			...mockOrganization,
			...(body as Partial<typeof mockOrganization>),
		})
	}),

	// ==================== UPLOAD ====================
	// POST /v1/upload/images
	http.post(`${API_BASE_URL}/v1/upload/images`, async ({ request }) => {
		// Проверяем наличие токена в заголовках (для защищенных эндпоинтов)
		const authHeader = request.headers.get('authorization')
		if (!authHeader?.startsWith('Bearer ')) {
			return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}
		// Симулируем загрузку изображений
		const formData = await request.formData()
		const images = formData.getAll('images')

		return HttpResponse.json(
			images.map((_, index) => ({
				url: `https://example.com/uploaded-image-${index + 1}.jpg`,
				id: index + 1,
			}))
		)
	}),

	// ==================== CITIES ====================
	// GET /v1/cities
	http.get(`${API_BASE_URL}/v1/cities`, () => {
		return HttpResponse.json([mockCity])
	}),

	// ==================== ORGANIZATION TYPES ====================
	// GET /v1/organization-types
	http.get(`${API_BASE_URL}/v1/organization-types`, () => {
		return HttpResponse.json([mockOrganizationType])
	}),

	// ==================== HELP TYPES ====================
	// GET /v1/help-types
	http.get(`${API_BASE_URL}/v1/help-types`, () => {
		return HttpResponse.json([mockHelpType])
	}),

	// ==================== CATEGORIES ====================
	// GET /v1/categories
	http.get(`${API_BASE_URL}/v1/categories`, () => {
		return HttpResponse.json([mockCategory])
	}),

	// ==================== ACHIEVEMENTS ====================
	// POST /v1/achievements
	http.post(`${API_BASE_URL}/v1/achievements`, async ({ request }) => {
		// Проверяем наличие токена в заголовках (для защищенных эндпоинтов)
		const authHeader = request.headers.get('authorization')
		if (!authHeader?.startsWith('Bearer ')) {
			return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}
		const body = (await request.json()) as Record<string, unknown>
		return HttpResponse.json({
			id: 1,
			title: (body.title as string) || 'Test Achievement',
			description: (body.description as string) || 'Test Description',
			icon: (body.icon as string) || '🏆',
			rarity: (body.rarity as string) || 'common',
		})
	}),

	// PUT /v1/achievements/:id
	http.put(
		`${API_BASE_URL}/v1/achievements/:id`,
		async ({ request, params }) => {
			// Проверяем наличие токена в заголовках (для защищенных эндпоинтов)
			const authHeader = request.headers.get('authorization')
			if (!authHeader?.startsWith('Bearer ')) {
				return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
			}
			const body = (await request.json()) as Record<string, unknown>
			return HttpResponse.json({
				id: Number(params.id),
				title: (body.title as string) || 'Test Achievement',
				description: (body.description as string) || 'Test Description',
				icon: (body.icon as string) || '🏆',
				rarity: (body.rarity as string) || 'common',
			})
		}
	),

	// DELETE /v1/achievements/:id
	http.delete(`${API_BASE_URL}/v1/achievements/:id`, ({ request }) => {
		// Проверяем наличие токена в заголовках (для защищенных эндпоинтов)
		const authHeader = request.headers.get('authorization')
		if (!authHeader?.startsWith('Bearer ')) {
			return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}
		return HttpResponse.json({ message: 'Achievement deleted' })
	}),
]
