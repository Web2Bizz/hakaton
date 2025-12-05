/// <reference types="@testing-library/jest-dom" />
import { useAuth } from '@/hooks/useAuth'
import { waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../utils/test-utils'

// Мокируем useLazyGetUserQuery для UserContext
const mockGetUser = vi.hoisted(() => vi.fn())
vi.mock('@/store/entities', () => ({
	useLazyGetUserQuery: () => [mockGetUser],
}))

// Мокируем getToken и transformUserFromAPI
const mockGetToken = vi.hoisted(() => vi.fn(() => null))
const mockTransformUserFromAPI = vi.hoisted(() => vi.fn((user: any) => user))
vi.mock('@/utils/auth', async () => {
	const actual = await vi.importActual('@/utils/auth')
	return {
		...actual,
		getToken: mockGetToken,
		transformUserFromAPI: mockTransformUserFromAPI,
	}
})

// Мокируем logger
vi.mock('@/utils/logger', () => ({
	logger: {
		debug: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
	},
}))

/**
 * Компонент для тестирования logout
 */
function LogoutTestComponent() {
	const { user, logout, isAuthenticated } = useAuth()

	return (
		<div>
			<div data-testid='user-status'>
				{isAuthenticated ? 'authenticated' : 'not-authenticated'}
			</div>
			<div data-testid='user-id'>{user?.id || 'no-user'}</div>
			<button data-testid='logout-button' onClick={logout}>
				Выйти
			</button>
		</div>
	)
}

/**
 * Интеграционный тест для проверки полного цикла выхода из системы
 *
 * Тестирует:
 * - Очистку токенов из localStorage
 * - Очистку UserContext
 * - Очистку данных пользователя из localStorage
 * - Изменение состояния isAuthenticated
 * - Редирект (если реализован)
 */
describe('Logout Flow Integration Test', () => {
	beforeEach(() => {
		// Очищаем localStorage перед каждым тестом
		localStorage.clear()

		// Очищаем все моки
		vi.clearAllMocks()

		// Мокаем getToken, чтобы он возвращал токен из localStorage
		mockGetToken.mockImplementation(() => {
			return localStorage.getItem('authToken')
		})

		// Мокаем getUser, чтобы он возвращал промис, который никогда не резолвится
		// (чтобы не вызывать обновление данных в тестах, где это не нужно)
		mockGetUser.mockReturnValue(
			Promise.resolve({
				data: undefined,
				error: undefined,
			})
		)

		// Мокаем globalThis.location.href
		Object.defineProperty(globalThis, 'location', {
			value: {
				href: '',
			},
			writable: true,
		})
	})

	it('должен очистить все данные при выходе из системы', async () => {
		// Устанавливаем начальное состояние: авторизованный пользователь
		const mockUser = {
			id: '1',
			name: 'Test User',
			email: 'test@example.com',
			level: {
				level: 1,
				experience: 0,
				experienceToNext: 100,
				title: 'Новичок',
			},
		}

		// Сохраняем токены и пользователя в localStorage
		localStorage.setItem('authToken', 'mock-access-token')
		localStorage.setItem('refreshToken', 'mock-refresh-token')
		localStorage.setItem('ecoquest_user', JSON.stringify(mockUser))

		// Рендерим компонент с авторизованным пользователем
		const { getByTestId } = renderWithProviders(<LogoutTestComponent />)

		// Проверяем, что пользователь авторизован
		expect(getByTestId('user-status')).toHaveTextContent('authenticated')
		expect(getByTestId('user-id')).toHaveTextContent('1')

		// Проверяем, что токены и пользователь сохранены
		expect(localStorage.getItem('authToken')).toBe('mock-access-token')
		expect(localStorage.getItem('refreshToken')).toBe('mock-refresh-token')
		expect(localStorage.getItem('ecoquest_user')).toBe(JSON.stringify(mockUser))

		// Вызываем logout
		const logoutButton = getByTestId('logout-button')
		logoutButton.click()

		// Ждем обновления состояния
		await waitFor(
			() => {
				// Проверяем, что токены удалены
				const authToken = localStorage.getItem('authToken')
				const refreshToken = localStorage.getItem('refreshToken')
				const user = localStorage.getItem('ecoquest_user')
				expect(authToken).toBeNull()
				expect(refreshToken).toBeNull()
				// Проверяем, что пользователь удален (может быть null или 'null' строка)
				expect(user === null || user === 'null').toBe(true)
			},
			{ timeout: 1000 }
		)

		// Проверяем, что состояние изменилось
		await waitFor(
			() => {
				expect(getByTestId('user-status')).toHaveTextContent(
					'not-authenticated'
				)
				expect(getByTestId('user-id')).toHaveTextContent('no-user')
			},
			{ timeout: 1000 }
		)
	})

	it('должен корректно обрабатывать logout когда пользователь уже не авторизован', async () => {
		// Рендерим компонент без авторизованного пользователя
		const { getByTestId } = renderWithProviders(<LogoutTestComponent />)

		// Проверяем, что пользователь не авторизован
		expect(getByTestId('user-status')).toHaveTextContent('not-authenticated')
		expect(getByTestId('user-id')).toHaveTextContent('no-user')

		// Вызываем logout (не должно быть ошибок)
		const logoutButton = getByTestId('logout-button')
		logoutButton.click()

		// Проверяем, что состояние осталось неизменным
		await waitFor(
			() => {
				expect(getByTestId('user-status')).toHaveTextContent(
					'not-authenticated'
				)
				expect(getByTestId('user-id')).toHaveTextContent('no-user')
			},
			{ timeout: 1000 }
		)

		// Проверяем, что localStorage пуст
		const authToken = localStorage.getItem('authToken')
		const refreshToken = localStorage.getItem('refreshToken')
		const user = localStorage.getItem('ecoquest_user')
		expect(authToken).toBeNull()
		expect(refreshToken).toBeNull()
		expect(user === null || user === 'null').toBe(true)
	})

	it('должен очистить только токены, если пользователь не сохранен', async () => {
		// Сохраняем только токены (без пользователя)
		localStorage.setItem('authToken', 'mock-access-token')
		localStorage.setItem('refreshToken', 'mock-refresh-token')

		// Рендерим компонент
		const { getByTestId } = renderWithProviders(<LogoutTestComponent />)

		// Проверяем, что пользователь не авторизован (так как нет пользователя)
		expect(getByTestId('user-status')).toHaveTextContent('not-authenticated')

		// Вызываем logout
		const logoutButton = getByTestId('logout-button')
		logoutButton.click()

		// Проверяем, что токены удалены
		await waitFor(
			() => {
				const authToken = localStorage.getItem('authToken')
				const refreshToken = localStorage.getItem('refreshToken')
				expect(authToken).toBeNull()
				expect(refreshToken).toBeNull()
			},
			{ timeout: 1000 }
		)
	})

	it('должен очистить пользователя, если токены не сохранены', async () => {
		// Сохраняем только пользователя (без токенов)
		const mockUser = {
			id: '1',
			name: 'Test User',
			email: 'test@example.com',
			level: {
				level: 1,
				experience: 0,
				experienceToNext: 100,
				title: 'Новичок',
			},
		}
		localStorage.setItem('ecoquest_user', JSON.stringify(mockUser))

		// Рендерим компонент
		const { getByTestId } = renderWithProviders(<LogoutTestComponent />)

		// Проверяем, что пользователь авторизован (есть пользователь в localStorage)
		expect(getByTestId('user-status')).toHaveTextContent('authenticated')

		// Вызываем logout
		const logoutButton = getByTestId('logout-button')
		logoutButton.click()

		// Проверяем, что пользователь удален
		await waitFor(
			() => {
				const user = localStorage.getItem('ecoquest_user')
				expect(user === null || user === 'null').toBe(true)
				expect(getByTestId('user-status')).toHaveTextContent(
					'not-authenticated'
				)
			},
			{ timeout: 1000 }
		)
	})
})
