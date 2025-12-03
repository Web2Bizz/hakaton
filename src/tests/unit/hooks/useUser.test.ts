import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { useUser } from '@/hooks/useUser'
import { UserContext } from '@/contexts/UserContext'
import type { User } from '@/types/user'
import React from 'react'

// Мокируем все зависимости useUser
const mockUseAuth = vi.hoisted(() => vi.fn<() => { user: User | null; logout: ReturnType<typeof vi.fn>; isAuthenticated: boolean }>(() => ({
	user: null as User | null,
	logout: vi.fn(),
	isAuthenticated: false,
}))) as Mock<() => { user: User | null; logout: ReturnType<typeof vi.fn>; isAuthenticated: boolean }>

const mockUseQuestActions = vi.hoisted(() => vi.fn(() => ({
	participateInQuest: vi.fn(),
	leaveQuest: vi.fn(),
	contributeToQuest: vi.fn(),
	checkAndUnlockAchievements: vi.fn(),
	checkCustomAchievement: vi.fn(),
	checkQuestCompletion: vi.fn(),
})))

const mockUseOrganizationActions = vi.hoisted(() => vi.fn(() => ({
	createQuest: vi.fn(),
	createOrganization: vi.fn(),
	canCreateQuest: vi.fn(() => true),
	canCreateOrganization: vi.fn(() => true),
	deleteQuest: vi.fn(),
	deleteOrganization: vi.fn(),
	getUserQuest: vi.fn(),
	getUserOrganization: vi.fn(),
})))

const mockUseUserStats = vi.hoisted(() => vi.fn(() => ({
	updateUserStats: vi.fn(),
})))

vi.mock('@/hooks/useAuth', () => ({
	useAuth: mockUseAuth,
}))

vi.mock('@/hooks/useQuestActions', () => ({
	useQuestActions: mockUseQuestActions,
}))

vi.mock('@/hooks/useOrganizationActions', () => ({
	useOrganizationActions: mockUseOrganizationActions,
}))

vi.mock('@/hooks/useUserStats', () => ({
	useUserStats: mockUseUserStats,
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

describe('useUser', () => {
	let mockSetUser: Mock<(user: User | null | ((prev: User | null) => User | null)) => void>

	beforeEach(() => {
		mockSetUser = vi.fn()
		vi.clearAllMocks()
		
		// Устанавливаем моки по умолчанию
		mockUseAuth.mockReturnValue({
			user: null,
			logout: vi.fn(),
			isAuthenticated: false,
		})
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
		it('должен возвращать данные из UserContext', () => {
			// useAuth должен возвращать user из контекста, а не null
			mockUseAuth.mockReturnValue({
				user: mockUser,
				logout: vi.fn(),
				isAuthenticated: true,
			})

			const { result } = renderHook(() => useUser(), {
				wrapper: createWrapper(mockUser),
			})

			expect(result.current.user).toEqual(mockUser)
			expect(result.current.setUser).toBe(mockSetUser)
		})

		it('должен возвращать данные из useAuth', () => {
			mockUseAuth.mockReturnValue({
				user: mockUser,
				logout: vi.fn(),
				isAuthenticated: true,
			})

			const { result } = renderHook(() => useUser(), {
				wrapper: createWrapper(mockUser),
			})

			expect(result.current.logout).toBeDefined()
			expect(result.current.isAuthenticated).toBe(true)
			expect(result.current.user).toEqual(mockUser)
		})

		it('должен возвращать данные из useQuestActions', () => {
			const mockParticipateInQuest = vi.fn()
			mockUseQuestActions.mockReturnValue({
				participateInQuest: mockParticipateInQuest,
				leaveQuest: vi.fn(),
				contributeToQuest: vi.fn(),
				checkAndUnlockAchievements: vi.fn(),
				checkCustomAchievement: vi.fn(),
				checkQuestCompletion: vi.fn(),
			})

			const { result } = renderHook(() => useUser(), {
				wrapper: createWrapper(mockUser),
			})

			expect(result.current.participateInQuest).toBe(mockParticipateInQuest)
			expect(result.current.leaveQuest).toBeDefined()
			expect(result.current.contributeToQuest).toBeDefined()
		})

		it('должен возвращать данные из useOrganizationActions', () => {
			const mockCreateQuest = vi.fn()
			mockUseOrganizationActions.mockReturnValue({
				createQuest: mockCreateQuest,
				createOrganization: vi.fn(),
				canCreateQuest: vi.fn(() => true),
				canCreateOrganization: vi.fn(() => true),
				deleteQuest: vi.fn(),
				deleteOrganization: vi.fn(),
				getUserQuest: vi.fn(),
				getUserOrganization: vi.fn(),
			})

			const { result } = renderHook(() => useUser(), {
				wrapper: createWrapper(mockUser),
			})

			expect(result.current.createQuest).toBe(mockCreateQuest)
			expect(result.current.createOrganization).toBeDefined()
			expect(result.current.canCreateQuest).toBeDefined()
		})

		it('должен возвращать данные из useUserStats', () => {
			const mockUpdateUserStats = vi.fn()
			mockUseUserStats.mockReturnValue({
				updateUserStats: mockUpdateUserStats,
			})

			const { result } = renderHook(() => useUser(), {
				wrapper: createWrapper(mockUser),
			})

			expect(result.current.updateUserStats).toBe(mockUpdateUserStats)
		})

		it('должен объединять все данные из разных hooks', () => {
			// useAuth должен возвращать user из контекста
			mockUseAuth.mockReturnValue({
				user: mockUser,
				logout: vi.fn(),
				isAuthenticated: true,
			})

			const { result } = renderHook(() => useUser(), {
				wrapper: createWrapper(mockUser),
			})

			// Проверяем, что все свойства присутствуют
			expect(result.current).toHaveProperty('user')
			expect(result.current).toHaveProperty('setUser')
			expect(result.current).toHaveProperty('logout')
			expect(result.current).toHaveProperty('isAuthenticated')
			expect(result.current).toHaveProperty('participateInQuest')
			expect(result.current).toHaveProperty('leaveQuest')
			expect(result.current).toHaveProperty('contributeToQuest')
			expect(result.current).toHaveProperty('checkAndUnlockAchievements')
			expect(result.current).toHaveProperty('checkCustomAchievement')
			expect(result.current).toHaveProperty('checkQuestCompletion')
			expect(result.current).toHaveProperty('createQuest')
			expect(result.current).toHaveProperty('createOrganization')
			expect(result.current).toHaveProperty('canCreateQuest')
			expect(result.current).toHaveProperty('canCreateOrganization')
			expect(result.current).toHaveProperty('deleteQuest')
			expect(result.current).toHaveProperty('deleteOrganization')
			expect(result.current).toHaveProperty('getUserQuest')
			expect(result.current).toHaveProperty('getUserOrganization')
			expect(result.current).toHaveProperty('updateUserStats')
		})
	})

	describe('реактивность', () => {
		it('должен обновляться при изменении user в контексте', () => {
			// Сбрасываем мок и устанавливаем возвращаемое значение
			mockUseAuth.mockReset()
			mockUseAuth.mockReturnValue({
				user: null,
				logout: vi.fn(),
				isAuthenticated: false,
			})

			const { result } = renderHook(() => useUser(), {
				wrapper: createWrapper(null),
			})

			expect(result.current.user).toBeNull()

			// Когда user установлен, useAuth должен возвращать user
			mockUseAuth.mockReturnValue({
				user: mockUser,
				logout: vi.fn(),
				isAuthenticated: true,
			})

			// Обновляем провайдер с пользователем
			const WrapperWithUser = createWrapper(mockUser)
			const { result: resultWithUser } = renderHook(() => useUser(), {
				wrapper: WrapperWithUser,
			})

			expect(resultWithUser.current.user).toEqual(mockUser)
		})
	})

	describe('ошибки', () => {
		it('должен выбрасывать ошибку, если используется вне UserProvider', () => {
			expect(() => {
				renderHook(() => useUser())
			}).toThrow('useUser must be used within a UserProvider')
		})
	})
})

