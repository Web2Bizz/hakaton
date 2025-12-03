import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { useOrganizationActions } from '@/hooks/useOrganizationActions'
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

describe('useOrganizationActions', () => {
	let mockSetUser: Mock<(user: User | null | ((prev: User | null) => User | null)) => void>

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
		it('должен возвращать все необходимые функции', () => {
			const { result } = renderHook(() => useOrganizationActions(), {
				wrapper: createWrapper(mockUser),
			})

			expect(result.current.createQuest).toBeDefined()
			expect(result.current.createOrganization).toBeDefined()
			expect(result.current.canCreateQuest).toBeDefined()
			expect(result.current.canCreateOrganization).toBeDefined()
			expect(result.current.deleteQuest).toBeDefined()
			expect(result.current.deleteOrganization).toBeDefined()
			expect(result.current.getUserQuest).toBeDefined()
			expect(result.current.getUserOrganization).toBeDefined()
		})
	})

	describe('createQuest', () => {
		it('должен создавать квест, если user существует и не имеет createdQuestId', () => {
			const { result } = renderHook(() => useOrganizationActions(), {
				wrapper: createWrapper(mockUser),
			})

			act(() => {
				result.current.createQuest('quest-123')
			})

			expect(mockSetUser).toHaveBeenCalledWith(
				expect.any(Function)
			)

			// Проверяем, что функция обновления корректна
			const updateFn = mockSetUser.mock.calls[0]?.[0]
			if (typeof updateFn !== 'function') {
				throw new Error('updateFn is not a function')
			}
			const updatedUser = updateFn(mockUser)
			expect(updatedUser).not.toBeNull()
			expect(updatedUser?.createdQuestId).toBe('quest-123')
		})

		it('не должен создавать квест, если user = null', () => {
			const { result } = renderHook(() => useOrganizationActions(), {
				wrapper: createWrapper(null),
			})

			act(() => {
				result.current.createQuest('quest-123')
			})

			const updateFn = mockSetUser.mock.calls[0]?.[0]
			if (typeof updateFn !== 'function') {
				throw new Error('updateFn is not a function')
			}
			const updatedUser = updateFn(null)
			expect(updatedUser).toBeNull()
		})

		it('не должен перезаписывать существующий createdQuestId', () => {
			const userWithQuest: User = {
				...mockUser,
				createdQuestId: 'existing-quest',
			}

			const { result } = renderHook(() => useOrganizationActions(), {
				wrapper: createWrapper(userWithQuest),
			})

			act(() => {
				result.current.createQuest('new-quest-123')
			})

			const updateFn = mockSetUser.mock.calls[0]?.[0]
			if (typeof updateFn !== 'function') {
				throw new Error('updateFn is not a function')
			}
			const updatedUser = updateFn(userWithQuest)
			expect(updatedUser).not.toBeNull()
			expect(updatedUser?.createdQuestId).toBe('existing-quest')
		})
	})

	describe('createOrganization', () => {
		it('должен создавать организацию, если user существует и не имеет createdOrganizationId', () => {
			const { result } = renderHook(() => useOrganizationActions(), {
				wrapper: createWrapper(mockUser),
			})

			act(() => {
				result.current.createOrganization('org-123')
			})

			expect(mockSetUser).toHaveBeenCalledWith(expect.any(Function))

			const updateFn = mockSetUser.mock.calls[0]?.[0]
			if (typeof updateFn !== 'function') {
				throw new Error('updateFn is not a function')
			}
			const updatedUser = updateFn(mockUser)
			expect(updatedUser).not.toBeNull()
			expect(updatedUser?.createdOrganizationId).toBe('org-123')
		})

		it('не должен создавать организацию, если user = null', () => {
			const { result } = renderHook(() => useOrganizationActions(), {
				wrapper: createWrapper(null),
			})

			act(() => {
				result.current.createOrganization('org-123')
			})

			const updateFn = mockSetUser.mock.calls[0]?.[0]
			if (typeof updateFn !== 'function') {
				throw new Error('updateFn is not a function')
			}
			const updatedUser = updateFn(null)
			expect(updatedUser).toBeNull()
		})

		it('не должен перезаписывать существующий createdOrganizationId', () => {
			const userWithOrg: User = {
				...mockUser,
				createdOrganizationId: 'existing-org',
			}

			const { result } = renderHook(() => useOrganizationActions(), {
				wrapper: createWrapper(userWithOrg),
			})

			act(() => {
				result.current.createOrganization('new-org-123')
			})

			const updateFn = mockSetUser.mock.calls[0]?.[0]
			if (typeof updateFn !== 'function') {
				throw new Error('updateFn is not a function')
			}
			const updatedUser = updateFn(userWithOrg)
			expect(updatedUser).not.toBeNull()
			expect(updatedUser?.createdOrganizationId).toBe('existing-org')
		})
	})

	describe('canCreateQuest', () => {
		it('должен возвращать true, если user не имеет createdQuestId', () => {
			const { result } = renderHook(() => useOrganizationActions(), {
				wrapper: createWrapper(mockUser),
			})

			expect(result.current.canCreateQuest()).toBe(true)
		})

		it('должен возвращать false, если user имеет createdQuestId', () => {
			const userWithQuest: User = {
				...mockUser,
				createdQuestId: 'quest-123',
			}

			const { result } = renderHook(() => useOrganizationActions(), {
				wrapper: createWrapper(userWithQuest),
			})

			expect(result.current.canCreateQuest()).toBe(false)
		})

		it('должен возвращать false, если user = null', () => {
			const { result } = renderHook(() => useOrganizationActions(), {
				wrapper: createWrapper(null),
			})

			expect(result.current.canCreateQuest()).toBe(false)
		})
	})

	describe('canCreateOrganization', () => {
		it('должен возвращать true, если user не имеет createdOrganizationId', () => {
			const { result } = renderHook(() => useOrganizationActions(), {
				wrapper: createWrapper(mockUser),
			})

			expect(result.current.canCreateOrganization()).toBe(true)
		})

		it('должен возвращать false, если user имеет createdOrganizationId', () => {
			const userWithOrg: User = {
				...mockUser,
				createdOrganizationId: 'org-123',
			}

			const { result } = renderHook(() => useOrganizationActions(), {
				wrapper: createWrapper(userWithOrg),
			})

			expect(result.current.canCreateOrganization()).toBe(false)
		})

		it('должен возвращать false, если user = null', () => {
			const { result } = renderHook(() => useOrganizationActions(), {
				wrapper: createWrapper(null),
			})

			expect(result.current.canCreateOrganization()).toBe(false)
		})
	})

	describe('deleteQuest', () => {
		it('должен удалять квест, если questId совпадает', () => {
			const userWithQuest: User = {
				...mockUser,
				createdQuestId: 'quest-123',
			}

			const { result } = renderHook(() => useOrganizationActions(), {
				wrapper: createWrapper(userWithQuest),
			})

			act(() => {
				result.current.deleteQuest('quest-123')
			})

			const updateFn = mockSetUser.mock.calls[0]?.[0]
			if (typeof updateFn !== 'function') {
				throw new Error('updateFn is not a function')
			}
			const updatedUser = updateFn(userWithQuest)
			expect(updatedUser).not.toBeNull()
			expect(updatedUser?.createdQuestId).toBeUndefined()
		})

		it('не должен удалять квест, если questId не совпадает', () => {
			const userWithQuest: User = {
				...mockUser,
				createdQuestId: 'quest-123',
			}

			const { result } = renderHook(() => useOrganizationActions(), {
				wrapper: createWrapper(userWithQuest),
			})

			act(() => {
				result.current.deleteQuest('other-quest-456')
			})

			const updateFn = mockSetUser.mock.calls[0]?.[0]
			if (typeof updateFn !== 'function') {
				throw new Error('updateFn is not a function')
			}
			const updatedUser = updateFn(userWithQuest)
			expect(updatedUser).not.toBeNull()
			expect(updatedUser?.createdQuestId).toBe('quest-123')
		})

		it('не должен удалять квест, если user = null', () => {
			const { result } = renderHook(() => useOrganizationActions(), {
				wrapper: createWrapper(null),
			})

			act(() => {
				result.current.deleteQuest('quest-123')
			})

			const updateFn = mockSetUser.mock.calls[0]?.[0]
			if (typeof updateFn !== 'function') {
				throw new Error('updateFn is not a function')
			}
			const updatedUser = updateFn(null)
			expect(updatedUser).toBeNull()
		})

		it('не должен удалять квест, если createdQuestId отсутствует', () => {
			const { result } = renderHook(() => useOrganizationActions(), {
				wrapper: createWrapper(mockUser),
			})

			act(() => {
				result.current.deleteQuest('quest-123')
			})

			const updateFn = mockSetUser.mock.calls[0]?.[0]
			if (typeof updateFn !== 'function') {
				throw new Error('updateFn is not a function')
			}
			const updatedUser = updateFn(mockUser)
			expect(updatedUser).not.toBeNull()
			expect(updatedUser?.createdQuestId).toBeUndefined()
		})
	})

	describe('deleteOrganization', () => {
		it('должен удалять организацию, если organizationId совпадает', () => {
			const userWithOrg: User = {
				...mockUser,
				createdOrganizationId: 'org-123',
			}

			const { result } = renderHook(() => useOrganizationActions(), {
				wrapper: createWrapper(userWithOrg),
			})

			act(() => {
				result.current.deleteOrganization('org-123')
			})

			const updateFn = mockSetUser.mock.calls[0]?.[0]
			if (typeof updateFn !== 'function') {
				throw new Error('updateFn is not a function')
			}
			const updatedUser = updateFn(userWithOrg)
			expect(updatedUser).not.toBeNull()
			expect(updatedUser?.createdOrganizationId).toBeUndefined()
		})

		it('не должен удалять организацию, если organizationId не совпадает', () => {
			const userWithOrg: User = {
				...mockUser,
				createdOrganizationId: 'org-123',
			}

			const { result } = renderHook(() => useOrganizationActions(), {
				wrapper: createWrapper(userWithOrg),
			})

			act(() => {
				result.current.deleteOrganization('other-org-456')
			})

			const updateFn = mockSetUser.mock.calls[0]?.[0]
			if (typeof updateFn !== 'function') {
				throw new Error('updateFn is not a function')
			}
			const updatedUser = updateFn(userWithOrg)
			expect(updatedUser).not.toBeNull()
			expect(updatedUser?.createdOrganizationId).toBe('org-123')
		})

		it('не должен удалять организацию, если user = null', () => {
			const { result } = renderHook(() => useOrganizationActions(), {
				wrapper: createWrapper(null),
			})

			act(() => {
				result.current.deleteOrganization('org-123')
			})

			const updateFn = mockSetUser.mock.calls[0]?.[0]
			if (typeof updateFn !== 'function') {
				throw new Error('updateFn is not a function')
			}
			const updatedUser = updateFn(null)
			expect(updatedUser).toBeNull()
		})

		it('не должен удалять организацию, если createdOrganizationId отсутствует', () => {
			const { result } = renderHook(() => useOrganizationActions(), {
				wrapper: createWrapper(mockUser),
			})

			act(() => {
				result.current.deleteOrganization('org-123')
			})

			const updateFn = mockSetUser.mock.calls[0]?.[0]
			if (typeof updateFn !== 'function') {
				throw new Error('updateFn is not a function')
			}
			const updatedUser = updateFn(mockUser)
			expect(updatedUser).not.toBeNull()
			expect(updatedUser?.createdOrganizationId).toBeUndefined()
		})
	})

	describe('getUserQuest', () => {
		it('должен возвращать createdQuestId, если он существует', () => {
			const userWithQuest: User = {
				...mockUser,
				createdQuestId: 'quest-123',
			}

			const { result } = renderHook(() => useOrganizationActions(), {
				wrapper: createWrapper(userWithQuest),
			})

			expect(result.current.getUserQuest()).toBe('quest-123')
		})

		it('должен возвращать undefined, если createdQuestId отсутствует', () => {
			const { result } = renderHook(() => useOrganizationActions(), {
				wrapper: createWrapper(mockUser),
			})

			expect(result.current.getUserQuest()).toBeUndefined()
		})

		it('должен возвращать undefined, если user = null', () => {
			const { result } = renderHook(() => useOrganizationActions(), {
				wrapper: createWrapper(null),
			})

			expect(result.current.getUserQuest()).toBeUndefined()
		})
	})

	describe('getUserOrganization', () => {
		it('должен возвращать createdOrganizationId, если он существует', () => {
			const userWithOrg: User = {
				...mockUser,
				createdOrganizationId: 'org-123',
			}

			const { result } = renderHook(() => useOrganizationActions(), {
				wrapper: createWrapper(userWithOrg),
			})

			expect(result.current.getUserOrganization()).toBe('org-123')
		})

		it('должен возвращать undefined, если createdOrganizationId отсутствует', () => {
			const { result } = renderHook(() => useOrganizationActions(), {
				wrapper: createWrapper(mockUser),
			})

			expect(result.current.getUserOrganization()).toBeUndefined()
		})

		it('должен возвращать undefined, если user = null', () => {
			const { result } = renderHook(() => useOrganizationActions(), {
				wrapper: createWrapper(null),
			})

			expect(result.current.getUserOrganization()).toBeUndefined()
		})
	})

	describe('ошибки', () => {
		it('должен выбрасывать ошибку, если используется вне UserProvider', () => {
			expect(() => {
				renderHook(() => useOrganizationActions())
			}).toThrow('useOrganizationActions must be used within a UserProvider')
		})
	})
})

