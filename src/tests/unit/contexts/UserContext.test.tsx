import { UserContext, UserProvider } from '@/contexts/UserContext'
import type { User } from '@/types/user'
import { renderHook, act, waitFor, render } from '@testing-library/react'
import React, { useContext } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { normalizeUserLevel, getLevelTitle } from '@/utils/level'

// Мокируем утилиты для работы с уровнями
vi.mock('@/utils/level', () => ({
	normalizeUserLevel: vi.fn(),
	getLevelTitle: vi.fn(),
}))

const mockNormalizeUserLevel = vi.mocked(normalizeUserLevel)
const mockGetLevelTitle = vi.mocked(getLevelTitle)

describe('UserContext', () => {
	beforeEach(() => {
		localStorage.clear()
		vi.clearAllMocks()
		mockGetLevelTitle.mockImplementation((level: number) => {
			if (level >= 50) return 'Легенда'
			if (level >= 40) return 'Мастер'
			if (level >= 30) return 'Эксперт'
			if (level >= 20) return 'Профессионал'
			if (level >= 15) return 'Опытный'
			if (level >= 10) return 'Продвинутый'
			if (level >= 5) return 'Активный'
			if (level >= 3) return 'Начинающий'
			if (level >= 2) return 'Ученик'
			return 'Новичок'
		})
	})

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

	const useUserContext = () => {
		const context = useContext(UserContext)
		if (context === undefined) {
			throw new Error('useUserContext must be used within a UserProvider')
		}
		return context
	}

	describe('инициализация из localStorage', () => {
		it('должен инициализироваться с null, если в localStorage нет данных', () => {
			const { result } = renderHook(() => useUserContext(), {
				wrapper: ({ children }) => (
					<UserProvider>{children}</UserProvider>
				),
			})

			expect(result.current.user).toBeNull()
		})

		it('должен инициализироваться с пользователем из localStorage', async () => {
			localStorage.setItem('ecoquest_user', JSON.stringify(mockUser))

			// Мокируем normalizeUserLevel, чтобы вернуть те же значения
			mockNormalizeUserLevel.mockReturnValue({
				level: mockUser.level.level,
				experience: mockUser.level.experience,
				experienceToNext: mockUser.level.experienceToNext,
			})

			const { result } = renderHook(() => useUserContext(), {
				wrapper: ({ children }) => (
					<UserProvider>{children}</UserProvider>
				),
			})

			await waitFor(() => {
				expect(result.current.user).toEqual(mockUser)
			})
		})

		it('должен обрабатывать невалидный JSON в localStorage', () => {
			localStorage.setItem('ecoquest_user', 'invalid-json{')

			const { result } = renderHook(() => useUserContext(), {
				wrapper: ({ children }) => (
					<UserProvider>{children}</UserProvider>
				),
			})

			// При ошибке парсинга должен вернуться null
			expect(result.current.user).toBeNull()
		})

		it('должен инициализироваться с пустым объектом, если в localStorage пустая строка', () => {
			localStorage.setItem('ecoquest_user', '')

			const { result } = renderHook(() => useUserContext(), {
				wrapper: ({ children }) => (
					<UserProvider>{children}</UserProvider>
				),
			})

			expect(result.current.user).toBeNull()
		})
	})

	describe('нормализация уровня при загрузке', () => {
		it('должен нормализовать уровень пользователя при монтировании, если уровень изменился', async () => {
			const normalizedLevel = {
				level: 6,
				experience: 120,
				experienceToNext: 200,
			}

			mockNormalizeUserLevel.mockReturnValue(normalizedLevel)
			mockGetLevelTitle.mockReturnValue('Продвинутый')

			localStorage.setItem('ecoquest_user', JSON.stringify(mockUser))

			const { result } = renderHook(() => useUserContext(), {
				wrapper: ({ children }) => (
					<UserProvider>{children}</UserProvider>
				),
			})

			await waitFor(() => {
				expect(mockNormalizeUserLevel).toHaveBeenCalledWith(
					mockUser.level.level,
					mockUser.level.experience,
					mockUser.level.experienceToNext
				)
			})

			await waitFor(() => {
				expect(result.current.user?.level).toEqual({
					...mockUser.level,
					level: normalizedLevel.level,
					experience: normalizedLevel.experience,
					experienceToNext: normalizedLevel.experienceToNext,
					title: 'Продвинутый',
				})
			})
		})

		it('должен нормализовать уровень, если изменился только experience', async () => {
			const normalizedLevel = {
				level: 5,
				experience: 120,
				experienceToNext: 150,
			}

			mockNormalizeUserLevel.mockReturnValue(normalizedLevel)
			mockGetLevelTitle.mockReturnValue('Активный')

			localStorage.setItem('ecoquest_user', JSON.stringify(mockUser))

			const { result } = renderHook(() => useUserContext(), {
				wrapper: ({ children }) => (
					<UserProvider>{children}</UserProvider>
				),
			})

			await waitFor(() => {
				expect(result.current.user?.level.experience).toBe(120)
			})
		})

		it('должен нормализовать уровень, если изменился только experienceToNext', async () => {
			const normalizedLevel = {
				level: 5,
				experience: 100,
				experienceToNext: 200,
			}

			mockNormalizeUserLevel.mockReturnValue(normalizedLevel)
			mockGetLevelTitle.mockReturnValue('Активный')

			localStorage.setItem('ecoquest_user', JSON.stringify(mockUser))

			const { result } = renderHook(() => useUserContext(), {
				wrapper: ({ children }) => (
					<UserProvider>{children}</UserProvider>
				),
			})

			await waitFor(() => {
				expect(result.current.user?.level.experienceToNext).toBe(200)
			})
		})

		it('не должен обновлять пользователя, если уровень не изменился', async () => {
			const normalizedLevel = {
				level: mockUser.level.level,
				experience: mockUser.level.experience,
				experienceToNext: mockUser.level.experienceToNext,
			}

			mockNormalizeUserLevel.mockReturnValue(normalizedLevel)

			localStorage.setItem('ecoquest_user', JSON.stringify(mockUser))

			const { result } = renderHook(() => useUserContext(), {
				wrapper: ({ children }) => (
					<UserProvider>{children}</UserProvider>
				),
			})

			await waitFor(() => {
				expect(mockNormalizeUserLevel).toHaveBeenCalled()
			})

			// Уровень не должен измениться, так как нормализованное значение совпадает
			expect(result.current.user?.level).toEqual(mockUser.level)
		})

		it('не должен вызывать нормализацию, если пользователь отсутствует', async () => {
			const { result } = renderHook(() => useUserContext(), {
				wrapper: ({ children }) => (
					<UserProvider>{children}</UserProvider>
				),
			})

			await waitFor(() => {
				expect(result.current.user).toBeNull()
			})

			expect(mockNormalizeUserLevel).not.toHaveBeenCalled()
		})

		it('не должен вызывать нормализацию, если у пользователя нет уровня', async () => {
			const userWithoutLevel = {
				...mockUser,
				level: undefined as any,
			}

			localStorage.setItem('ecoquest_user', JSON.stringify(userWithoutLevel))

			const { result } = renderHook(() => useUserContext(), {
				wrapper: ({ children }) => (
					<UserProvider>{children}</UserProvider>
				),
			})

			await waitFor(() => {
				expect(result.current.user).toBeTruthy()
			})

			expect(mockNormalizeUserLevel).not.toHaveBeenCalled()
		})

		it('должен нормализовать уровень только при монтировании, а не при каждом изменении user', async () => {
			const normalizedLevel = {
				level: 6,
				experience: 120,
				experienceToNext: 200,
			}

			mockNormalizeUserLevel.mockReturnValue(normalizedLevel)
			mockGetLevelTitle.mockReturnValue('Продвинутый')

			localStorage.setItem('ecoquest_user', JSON.stringify(mockUser))

			const { result } = renderHook(() => useUserContext(), {
				wrapper: ({ children }) => (
					<UserProvider>{children}</UserProvider>
				),
			})

			await waitFor(() => {
				expect(mockNormalizeUserLevel).toHaveBeenCalledTimes(1)
			})

			// Обновляем пользователя
			act(() => {
				result.current.setUser({
					...mockUser,
					name: 'Updated Name',
				})
			})

			// Нормализация не должна вызываться снова
			await waitFor(() => {
				expect(mockNormalizeUserLevel).toHaveBeenCalledTimes(1)
			})
		})

		it('должен корректно обновлять title при нормализации уровня', async () => {
			const normalizedLevel = {
				level: 10,
				experience: 200,
				experienceToNext: 300,
			}

			mockNormalizeUserLevel.mockReturnValue(normalizedLevel)
			mockGetLevelTitle.mockReturnValue('Продвинутый')

			localStorage.setItem('ecoquest_user', JSON.stringify(mockUser))

			const { result } = renderHook(() => useUserContext(), {
				wrapper: ({ children }) => (
					<UserProvider>{children}</UserProvider>
				),
			})

			await waitFor(() => {
				expect(result.current.user?.level.title).toBe('Продвинутый')
				expect(mockGetLevelTitle).toHaveBeenCalledWith(10)
			})
		})

		it('должен сохранять другие свойства пользователя при нормализации уровня', async () => {
			const normalizedLevel = {
				level: 6,
				experience: 120,
				experienceToNext: 200,
			}

			mockNormalizeUserLevel.mockReturnValue(normalizedLevel)
			mockGetLevelTitle.mockReturnValue('Продвинутый')

			localStorage.setItem('ecoquest_user', JSON.stringify(mockUser))

			const { result } = renderHook(() => useUserContext(), {
				wrapper: ({ children }) => (
					<UserProvider>{children}</UserProvider>
				),
			})

			await waitFor(() => {
				expect(result.current.user?.id).toBe(mockUser.id)
				expect(result.current.user?.name).toBe(mockUser.name)
				expect(result.current.user?.email).toBe(mockUser.email)
				expect(result.current.user?.stats).toEqual(mockUser.stats)
				expect(result.current.user?.achievements).toEqual(
					mockUser.achievements
				)
			})
		})
	})

	describe('обновление пользователя', () => {
		it('должен обновлять пользователя через setUser', () => {
			const { result } = renderHook(() => useUserContext(), {
				wrapper: ({ children }) => (
					<UserProvider>{children}</UserProvider>
				),
			})

			act(() => {
				result.current.setUser(mockUser)
			})

			expect(result.current.user).toEqual(mockUser)
			expect(localStorage.getItem('ecoquest_user')).toBe(
				JSON.stringify(mockUser)
			)
		})

		it('должен поддерживать функциональное обновление через setUser', () => {
			const { result } = renderHook(() => useUserContext(), {
				wrapper: ({ children }) => (
					<UserProvider>{children}</UserProvider>
				),
			})

			act(() => {
				result.current.setUser(mockUser)
			})

			act(() => {
				result.current.setUser(prev => ({
					...(prev as User),
					name: 'Updated Name',
				}))
			})

			expect(result.current.user?.name).toBe('Updated Name')
			expect(result.current.user?.id).toBe(mockUser.id)
		})

		it('должен устанавливать пользователя в null', () => {
			localStorage.setItem('ecoquest_user', JSON.stringify(mockUser))

			const { result } = renderHook(() => useUserContext(), {
				wrapper: ({ children }) => (
					<UserProvider>{children}</UserProvider>
				),
			})

			act(() => {
				result.current.setUser(null)
			})

			expect(result.current.user).toBeNull()
			expect(localStorage.getItem('ecoquest_user')).toBe(JSON.stringify(null))
		})

		it('должен обновлять localStorage при изменении пользователя', () => {
			const { result } = renderHook(() => useUserContext(), {
				wrapper: ({ children }) => (
					<UserProvider>{children}</UserProvider>
				),
			})

			act(() => {
				result.current.setUser(mockUser)
			})

			expect(localStorage.getItem('ecoquest_user')).toBe(
				JSON.stringify(mockUser)
			)

			const updatedUser = { ...mockUser, name: 'New Name' }

			act(() => {
				result.current.setUser(updatedUser)
			})

			expect(localStorage.getItem('ecoquest_user')).toBe(
				JSON.stringify(updatedUser)
			)
		})
	})

	describe('предоставление контекста', () => {
		it('должен предоставлять user и setUser в контексте', () => {
			const { result } = renderHook(() => useUserContext(), {
				wrapper: ({ children }) => (
					<UserProvider>{children}</UserProvider>
				),
			})

			expect(result.current).toHaveProperty('user')
			expect(result.current).toHaveProperty('setUser')
			expect(typeof result.current.setUser).toBe('function')
		})

		it('должен обновлять значение контекста при изменении user', () => {
			const { result } = renderHook(() => useUserContext(), {
				wrapper: ({ children }) => (
					<UserProvider>{children}</UserProvider>
				),
			})

			expect(result.current.user).toBeNull()

			act(() => {
				result.current.setUser(mockUser)
			})

			expect(result.current.user).toEqual(mockUser)
		})

		it('должен мемоизировать значение контекста', () => {
			const { result, rerender } = renderHook(() => useUserContext(), {
				wrapper: ({ children }) => (
					<UserProvider>{children}</UserProvider>
				),
			})

			const firstValue = result.current

			rerender()

			// Значение должно быть мемоизировано, если user не изменился
			expect(result.current).toBe(firstValue)
		})

		it('должен обновлять мемоизированное значение при изменении user', () => {
			const { result } = renderHook(() => useUserContext(), {
				wrapper: ({ children }) => (
					<UserProvider>{children}</UserProvider>
				),
			})

			const firstValue = result.current

			act(() => {
				result.current.setUser(mockUser)
			})

			// Значение должно измениться, так как user изменился
			expect(result.current).not.toBe(firstValue)
			expect(result.current.user).toEqual(mockUser)
		})

		it('должен работать с несколькими потребителями контекста', () => {
			const { result: result1 } = renderHook(() => useUserContext(), {
				wrapper: ({ children }) => (
					<UserProvider>{children}</UserProvider>
				),
			})

			const { result: result2 } = renderHook(() => useUserContext(), {
				wrapper: ({ children }) => (
					<UserProvider>{children}</UserProvider>
				),
			})

			// Разные провайдеры - разные состояния
			act(() => {
				result1.current.setUser(mockUser)
			})

			expect(result1.current.user).toEqual(mockUser)
			expect(result2.current.user).toBeNull()
		})

		it('должен синхронизировать состояние между потребителями одного провайдера', () => {
			// Мокируем normalizeUserLevel для начального состояния
			mockNormalizeUserLevel.mockReturnValue({
				level: mockUser.level.level,
				experience: mockUser.level.experience,
				experienceToNext: mockUser.level.experienceToNext,
			})

			// Создаем компонент, который использует два хука
			let context1Value: ReturnType<typeof useUserContext> | null = null
			let context2Value: ReturnType<typeof useUserContext> | null = null

			const TestComponent = () => {
				context1Value = useUserContext()
				context2Value = useUserContext()
				return (
					<div>
						<div data-testid="user1">{context1Value?.user?.name || 'null'}</div>
						<div data-testid="user2">{context2Value?.user?.name || 'null'}</div>
					</div>
				)
			}

			render(
				<UserProvider>
					<TestComponent />
				</UserProvider>
			)

			// Оба должны видеть одно и то же начальное состояние (ссылка на один объект)
			expect(context1Value?.user).toBe(context2Value?.user)
			expect(context1Value?.setUser).toBe(context2Value?.setUser)

			// Обновляем через первый контекст
			act(() => {
				context1Value?.setUser(mockUser)
			})

			// Оба должны видеть одно и то же обновленное состояние
			expect(context1Value?.user).toEqual(mockUser)
			expect(context2Value?.user).toEqual(mockUser)
			// И это должен быть один и тот же объект
			expect(context1Value?.user).toBe(context2Value?.user)
		})
	})

	describe('граничные случаи', () => {
		it('должен обрабатывать пользователя с максимальным уровнем', async () => {
			const maxLevelUser: User = {
				...mockUser,
				level: {
					level: 50,
					experience: 0,
					experienceToNext: 0,
					title: 'Легенда',
				},
			}

			const normalizedLevel = {
				level: 50,
				experience: 0,
				experienceToNext: 0,
			}

			mockNormalizeUserLevel.mockReturnValue(normalizedLevel)
			mockGetLevelTitle.mockReturnValue('Легенда')

			localStorage.setItem('ecoquest_user', JSON.stringify(maxLevelUser))

			const { result } = renderHook(() => useUserContext(), {
				wrapper: ({ children }) => (
					<UserProvider>{children}</UserProvider>
				),
			})

			await waitFor(() => {
				expect(result.current.user?.level.level).toBe(50)
			})
		})

		it('должен обрабатывать пользователя с уровнем 1', async () => {
			const level1User: User = {
				...mockUser,
				level: {
					level: 1,
					experience: 10,
					experienceToNext: 100,
					title: 'Новичок',
				},
			}

			const normalizedLevel = {
				level: 1,
				experience: 10,
				experienceToNext: 100,
			}

			mockNormalizeUserLevel.mockReturnValue(normalizedLevel)
			mockGetLevelTitle.mockReturnValue('Новичок')

			localStorage.setItem('ecoquest_user', JSON.stringify(level1User))

			const { result } = renderHook(() => useUserContext(), {
				wrapper: ({ children }) => (
					<UserProvider>{children}</UserProvider>
				),
			})

			await waitFor(() => {
				expect(result.current.user?.level.level).toBe(1)
			})
		})

		it('должен обрабатывать пользователя с очень большим опытом', async () => {
			const highExpUser: User = {
				...mockUser,
				level: {
					level: 10,
					experience: 2000000,
					experienceToNext: 500,
					title: 'Продвинутый',
				},
			}

			const normalizedLevel = {
				level: 50,
				experience: 0,
				experienceToNext: 0,
			}

			mockNormalizeUserLevel.mockReturnValue(normalizedLevel)
			mockGetLevelTitle.mockReturnValue('Легенда')

			localStorage.setItem('ecoquest_user', JSON.stringify(highExpUser))

			const { result } = renderHook(() => useUserContext(), {
				wrapper: ({ children }) => (
					<UserProvider>{children}</UserProvider>
				),
			})

			await waitFor(() => {
				expect(result.current.user?.level.level).toBe(50)
			})
		})

		it('должен обрабатывать пользователя без email', async () => {
			const userWithoutEmail: User = {
				...mockUser,
				email: undefined,
			}

			localStorage.setItem('ecoquest_user', JSON.stringify(userWithoutEmail))

			const { result } = renderHook(() => useUserContext(), {
				wrapper: ({ children }) => (
					<UserProvider>{children}</UserProvider>
				),
			})

			expect(result.current.user?.email).toBeUndefined()
		})
	})
})

