import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useUserStats } from '@/hooks/useUserStats'
import { UserContext } from '@/contexts/UserContext'
import type { User } from '@/types/user'
import React from 'react'

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

describe('useUserStats', () => {
	let mockSetUser: (user: User | null | ((prev: User | null) => User | null)) => void

	beforeEach(() => {
		mockSetUser = vi.fn() as typeof mockSetUser
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
		it('должен возвращать updateUserStats функцию', () => {
			const { result } = renderHook(() => useUserStats(), {
				wrapper: createWrapper(mockUser),
			})

			expect(result.current.updateUserStats).toBeDefined()
			expect(typeof result.current.updateUserStats).toBe('function')
		})
	})

	describe('updateUserStats', () => {
		it('должен вызывать setUser с текущим user, если user существует', () => {
			const { result } = renderHook(() => useUserStats(), {
				wrapper: createWrapper(mockUser),
			})

			act(() => {
				result.current.updateUserStats()
			})

			expect(mockSetUser).toHaveBeenCalledWith(mockUser)
		})

		it('не должен вызывать setUser, если user = null', () => {
			const { result } = renderHook(() => useUserStats(), {
				wrapper: createWrapper(null),
			})

			act(() => {
				result.current.updateUserStats()
			})

			expect(mockSetUser).not.toHaveBeenCalled()
		})

		it('должен работать с обновленным user', () => {
			const updatedUser: User = {
				...mockUser,
				stats: {
					...mockUser.stats,
					totalQuests: 15,
				},
			}

			const { rerender } = renderHook(() => useUserStats(), {
				wrapper: createWrapper(mockUser),
			})

			// Обновляем user в контексте
			const WrapperWithUpdatedUser = createWrapper(updatedUser)
			rerender()
			const { result: resultWithUpdated } = renderHook(() => useUserStats(), {
				wrapper: WrapperWithUpdatedUser,
			})

			act(() => {
				resultWithUpdated.current.updateUserStats()
			})

			expect(mockSetUser).toHaveBeenCalledWith(updatedUser)
		})
	})

	describe('ошибки', () => {
		it('должен выбрасывать ошибку, если используется вне UserProvider', () => {
			expect(() => {
				renderHook(() => useUserStats())
			}).toThrow('useUserStats must be used within a UserProvider')
		})
	})
})

