import { UserContext } from '@/contexts/UserContext'
import { useAuth } from '@/hooks/useAuth'
import type { User } from '@/types/user'
import { removeToken } from '@/utils/auth'
import { act, renderHook } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Мокируем removeToken
vi.mock('@/utils/auth', () => ({
	removeToken: vi.fn(),
}))

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

describe('useAuth', () => {
	let mockSetUser: (
		user: User | null | ((prev: User | null) => User | null)
	) => void

	beforeEach(() => {
		mockSetUser = vi.fn()
		vi.clearAllMocks()
	})

	const createWrapper = (user: User | null) => {
		return ({ children }: { children: React.ReactNode }) =>
			React.createElement(
				UserContext.Provider,
				{
					value: {
						user,
						setUser: mockSetUser,
					},
				},
				children
			)
	}

	describe('инициализация', () => {
		it('должен возвращать user из контекста', () => {
			const { result } = renderHook(() => useAuth(), {
				wrapper: createWrapper(mockUser),
			})

			expect(result.current.user).toEqual(mockUser)
		})

		it('должен возвращать null, если user отсутствует в контексте', () => {
			const { result } = renderHook(() => useAuth(), {
				wrapper: createWrapper(null),
			})

			expect(result.current.user).toBeNull()
		})

		it('должен возвращать isAuthenticated = true, если user существует', () => {
			const { result } = renderHook(() => useAuth(), {
				wrapper: createWrapper(mockUser),
			})

			expect(result.current.isAuthenticated).toBe(true)
		})

		it('должен возвращать isAuthenticated = false, если user отсутствует', () => {
			const { result } = renderHook(() => useAuth(), {
				wrapper: createWrapper(null),
			})

			expect(result.current.isAuthenticated).toBe(false)
		})
	})

	describe('logout', () => {
		it('должен вызывать removeToken', () => {
			const { result } = renderHook(() => useAuth(), {
				wrapper: createWrapper(mockUser),
			})

			act(() => {
				result.current.logout()
			})

			expect(removeToken).toHaveBeenCalledTimes(1)
		})

		it('должен вызывать setUser(null)', () => {
			const { result } = renderHook(() => useAuth(), {
				wrapper: createWrapper(mockUser),
			})

			act(() => {
				result.current.logout()
			})

			expect(mockSetUser).toHaveBeenCalledWith(null)
		})

		it('должен выполнять logout даже если user = null', () => {
			const { result } = renderHook(() => useAuth(), {
				wrapper: createWrapper(null),
			})

			act(() => {
				result.current.logout()
			})

			expect(removeToken).toHaveBeenCalledTimes(1)
			expect(mockSetUser).toHaveBeenCalledWith(null)
		})
	})

	describe('ошибки', () => {
		it('должен выбрасывать ошибку, если используется вне UserProvider', () => {
			// Рендерим без провайдера
			expect(() => {
				renderHook(() => useAuth())
			}).toThrow('useAuth must be used within a UserProvider')
		})
	})

	describe('реактивность', () => {
		it('должен обновлять isAuthenticated при изменении user', () => {
			const { result, rerender } = renderHook(() => useAuth(), {
				wrapper: createWrapper(null),
			})

			expect(result.current.isAuthenticated).toBe(false)

			// Обновляем провайдер с пользователем
			rerender()
			const WrapperWithUser = createWrapper(mockUser)
			const { result: resultWithUser } = renderHook(() => useAuth(), {
				wrapper: WrapperWithUser,
			})

			expect(resultWithUser.current.isAuthenticated).toBe(true)
		})
	})
})
