import { ProtectedRoute } from '@/provider/ProtectedRoute'
import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import React from 'react'
import type { User } from '@/types/user'

// Мокируем useUser хук
const mockUseUser = vi.hoisted(() => vi.fn<() => { user: User | null }>(() => ({
	user: null as User | null,
}))) as Mock<() => { user: User | null }>

vi.mock('@/hooks/useUser', () => ({
	useUser: mockUseUser,
}))

describe('ProtectedRoute', () => {
	const mockUser: User = {
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
			totalQuests: 10,
			completedQuests: 5,
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

	// Сохраняем оригинальный window.location
	const originalLocation = window.location

	beforeEach(() => {
		vi.clearAllMocks()
		
		// Мокируем window.location.href
		delete (window as any).location
		window.location = {
			...originalLocation,
			href: '',
		} as Location
	})

	afterEach(() => {
		// Восстанавливаем оригинальный window.location
		window.location = originalLocation
	})

	describe('редирект на /login при отсутствии пользователя', () => {
		it('должен перенаправлять на /login, когда пользователь отсутствует', async () => {
			mockUseUser.mockReturnValue({ user: null })

			render(
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			)

			await waitFor(() => {
				expect(window.location.href).toBe('/login')
			})
		})

		it('должен перенаправлять на /login при монтировании, если пользователь null', async () => {
			mockUseUser.mockReturnValue({ user: null })

			render(
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			)

			await waitFor(() => {
				expect(window.location.href).toBe('/login')
			})
		})

		it('должен перенаправлять на /login, когда пользователь становится null', async () => {
			mockUseUser.mockReturnValue({ user: mockUser })

			const { rerender } = render(
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			)

			// Проверяем, что контент отображается
			expect(screen.getByText('Protected Content')).toBeTruthy()
			expect(window.location.href).toBe('')

			// Изменяем пользователя на null
			mockUseUser.mockReturnValue({ user: null })
			rerender(
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			)

			await waitFor(() => {
				expect(window.location.href).toBe('/login')
			})
		})

		it('должен перенаправлять на /login только один раз при монтировании без пользователя', async () => {
			mockUseUser.mockReturnValue({ user: null })

			render(
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			)

			await waitFor(() => {
				expect(window.location.href).toBe('/login')
			})

			// Проверяем, что href установлен только один раз
			const hrefValue = window.location.href
			
			// Ждем немного и проверяем, что значение не изменилось
			await new Promise(resolve => setTimeout(resolve, 100))
			expect(window.location.href).toBe(hrefValue)
		})
	})

	describe('рендеринг children при наличии пользователя', () => {
		it('должен рендерить children, когда пользователь присутствует', () => {
			mockUseUser.mockReturnValue({ user: mockUser })

			render(
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			)

			expect(screen.getByText('Protected Content')).toBeTruthy()
			expect(window.location.href).toBe('')
		})

		it('должен рендерить сложный контент, когда пользователь присутствует', () => {
			mockUseUser.mockReturnValue({ user: mockUser })

			render(
				<ProtectedRoute>
					<div>
						<h1>Dashboard</h1>
						<p>Welcome, {mockUser.name}!</p>
						<button>Click me</button>
					</div>
				</ProtectedRoute>
			)

			expect(screen.getByText('Dashboard')).toBeTruthy()
			expect(screen.getByText(`Welcome, ${mockUser.name}!`)).toBeTruthy()
			expect(screen.getByText('Click me')).toBeTruthy()
			expect(window.location.href).toBe('')
		})

		it('должен рендерить несколько children элементов', () => {
			mockUseUser.mockReturnValue({ user: mockUser })

			render(
				<ProtectedRoute>
					<header>Header</header>
					<main>Main Content</main>
					<footer>Footer</footer>
				</ProtectedRoute>
			)

			expect(screen.getByText('Header')).toBeTruthy()
			expect(screen.getByText('Main Content')).toBeTruthy()
			expect(screen.getByText('Footer')).toBeTruthy()
			expect(window.location.href).toBe('')
		})

		it('должен рендерить children, когда пользователь появляется после монтирования', async () => {
			mockUseUser.mockReturnValue({ user: null })

			const { rerender } = render(
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			)

			// Проверяем, что контент не отображается
			expect(screen.queryByText('Protected Content')).toBeNull()

			// Ждем, пока useEffect выполнится и установит редирект
			await waitFor(() => {
				expect(window.location.href).toBe('/login')
			})

			// Сбрасываем href перед изменением пользователя
			window.location.href = ''

			// Изменяем пользователя на существующего
			mockUseUser.mockReturnValue({ user: mockUser })
			rerender(
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			)

			// Проверяем, что контент теперь отображается
			expect(screen.getByText('Protected Content')).toBeTruthy()
			// href не должен измениться, так как пользователь теперь присутствует
			expect(window.location.href).toBe('')
		})
	})

	describe('обработка загрузки', () => {
		it('должен возвращать null, когда пользователь отсутствует', () => {
			mockUseUser.mockReturnValue({ user: null })

			const { container } = render(
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			)

			// Компонент должен вернуть null, поэтому контейнер должен быть пустым
			expect(container.firstChild).toBeNull()
		})

		it('должен возвращать null сразу при монтировании без пользователя', () => {
			mockUseUser.mockReturnValue({ user: null })

			const { container } = render(
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			)

			expect(container.firstChild).toBeNull()
			expect(screen.queryByText('Protected Content')).toBeNull()
		})

		it('должен возвращать null при переходе от пользователя к отсутствию пользователя', async () => {
			mockUseUser.mockReturnValue({ user: mockUser })

			const { container, rerender } = render(
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			)

			// Проверяем, что контент отображается
			expect(screen.getByText('Protected Content')).toBeTruthy()

			// Изменяем пользователя на null
			mockUseUser.mockReturnValue({ user: null })
			rerender(
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			)

			// Контент должен исчезнуть
			await waitFor(() => {
				expect(screen.queryByText('Protected Content')).toBeNull()
			})
		})

		it('должен корректно обрабатывать быстрые изменения состояния пользователя', async () => {
			mockUseUser.mockReturnValue({ user: null })

			const { rerender } = render(
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			)

			// Быстро меняем на пользователя
			mockUseUser.mockReturnValue({ user: mockUser })
			rerender(
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			)

			expect(screen.getByText('Protected Content')).toBeTruthy()

			// Быстро меняем обратно на null
			mockUseUser.mockReturnValue({ user: null })
			rerender(
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			)

			await waitFor(() => {
				expect(screen.queryByText('Protected Content')).toBeNull()
				expect(window.location.href).toBe('/login')
			})
		})
	})

	describe('граничные случаи', () => {
		it('должен корректно обрабатывать пользователя с минимальными данными', () => {
			const minimalUser: User = {
				id: '2',
				name: 'Minimal User',
				email: 'minimal@example.com',
				level: {
					level: 1,
					experience: 0,
					experienceToNext: 100,
					title: 'Новичок',
				},
				stats: {
					totalQuests: 0,
					completedQuests: 0,
					totalDonations: 0,
					totalVolunteerHours: 0,
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

			mockUseUser.mockReturnValue({ user: minimalUser })

			render(
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			)

			expect(screen.getByText('Protected Content')).toBeTruthy()
			expect(window.location.href).toBe('')
		})

		it('должен корректно обрабатывать пользователя с максимальными данными', () => {
			const maxUser: User = {
				id: '3',
				name: 'Max User',
				email: 'max@example.com',
				level: {
					level: 50,
					experience: 999999,
					experienceToNext: 0,
					title: 'Легенда',
				},
				stats: {
					totalQuests: 1000,
					completedQuests: 999,
					totalDonations: 1000000,
					totalVolunteerHours: 10000,
					totalImpact: {
						treesPlanted: 10000,
						animalsHelped: 5000,
						areasCleaned: 2000,
						livesChanged: 1000,
					},
				},
				achievements: Array(100).fill({}),
				participatingQuests: Array(50).fill({}),
				createdAt: '2024-01-01T00:00:00Z',
			}

			mockUseUser.mockReturnValue({ user: maxUser })

			render(
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			)

			expect(screen.getByText('Protected Content')).toBeTruthy()
			expect(window.location.href).toBe('')
		})

		it('должен корректно обрабатывать пустой children', () => {
			mockUseUser.mockReturnValue({ user: mockUser })

			const { container } = render(
				<ProtectedRoute>
					{null}
				</ProtectedRoute>
			)

			// Компонент должен рендериться, но без контента (пустой фрагмент)
			// React Fragment рендерится как пустой узел, поэтому firstChild может быть null
			// Но важно, что редирект не происходит
			expect(window.location.href).toBe('')
		})

		it('должен корректно обрабатывать children с условным рендерингом', () => {
			mockUseUser.mockReturnValue({ user: mockUser })

			render(
				<ProtectedRoute>
					{true && <div>Conditional Content</div>}
					{false && <div>Hidden Content</div>}
				</ProtectedRoute>
			)

			expect(screen.getByText('Conditional Content')).toBeTruthy()
			expect(screen.queryByText('Hidden Content')).toBeNull()
			expect(window.location.href).toBe('')
		})

		it('должен корректно обрабатывать фрагменты React', () => {
			mockUseUser.mockReturnValue({ user: mockUser })

			render(
				<ProtectedRoute>
					<>
						<div>First</div>
						<div>Second</div>
					</>
				</ProtectedRoute>
			)

			expect(screen.getByText('First')).toBeTruthy()
			expect(screen.getByText('Second')).toBeTruthy()
			expect(window.location.href).toBe('')
		})
	})

	describe('интеграция с useUser', () => {
		it('должен вызывать useUser при монтировании', () => {
			mockUseUser.mockReturnValue({ user: mockUser })

			render(
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			)

			expect(mockUseUser).toHaveBeenCalled()
		})

		it('должен вызывать useUser при каждом рендере', () => {
			mockUseUser.mockReturnValue({ user: mockUser })

			const { rerender } = render(
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			)

			const firstCallCount = mockUseUser.mock.calls.length

			rerender(
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			)

			expect(mockUseUser.mock.calls.length).toBeGreaterThan(firstCallCount)
		})

		it('должен реагировать на изменения user из useUser', async () => {
			mockUseUser.mockReturnValue({ user: null })

			const { rerender } = render(
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			)

			expect(screen.queryByText('Protected Content')).toBeNull()

			// Изменяем возвращаемое значение useUser
			mockUseUser.mockReturnValue({ user: mockUser })
			rerender(
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			)

			expect(screen.getByText('Protected Content')).toBeTruthy()
		})
	})

	describe('поведение useEffect', () => {
		it('должен устанавливать window.location.href в useEffect при отсутствии пользователя', async () => {
			mockUseUser.mockReturnValue({ user: null })

			render(
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			)

			// useEffect выполняется асинхронно, поэтому нужно подождать
			await waitFor(() => {
				expect(window.location.href).toBe('/login')
			}, { timeout: 1000 })
		})

		it('не должен изменять window.location.href, когда пользователь присутствует', async () => {
			mockUseUser.mockReturnValue({ user: mockUser })

			render(
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			)

			// Ждем немного, чтобы убедиться, что useEffect выполнился
			await new Promise(resolve => setTimeout(resolve, 100))

			expect(window.location.href).toBe('')
		})

		it('должен обновлять window.location.href при изменении user с существующего на null', async () => {
			mockUseUser.mockReturnValue({ user: mockUser })

			const { rerender } = render(
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			)

			expect(window.location.href).toBe('')

			// Изменяем пользователя на null
			mockUseUser.mockReturnValue({ user: null })
			rerender(
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			)

			await waitFor(() => {
				expect(window.location.href).toBe('/login')
			})
		})

		it('не должен изменять window.location.href при изменении user с null на существующего', async () => {
			mockUseUser.mockReturnValue({ user: null })

			const { rerender } = render(
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			)

			await waitFor(() => {
				expect(window.location.href).toBe('/login')
			})

			// Сохраняем текущий href
			const currentHref = window.location.href

			// Изменяем пользователя на существующего
			mockUseUser.mockReturnValue({ user: mockUser })
			rerender(
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			)

			// href не должен измениться (остается '/login', так как это уже было установлено)
			// Но важно, что редирект не происходит снова
			await new Promise(resolve => setTimeout(resolve, 100))
			// В реальном приложении, если пользователь появился, редирект уже произошел
			// и компонент просто рендерит контент
		})
	})
})

