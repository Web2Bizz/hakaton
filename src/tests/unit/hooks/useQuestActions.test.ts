import { renderHook, act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { useQuestActions } from '@/hooks/useQuestActions'
import { UserContext } from '@/contexts/UserContext'
import type { User, QuestContribution } from '@/types/user'
import type { Quest } from '@/components/map/types/quest-types'
import React from 'react'

// Мокируем зависимости
const mockJoinQuest = vi.hoisted(() => vi.fn())
const mockLeaveQuest = vi.hoisted(() => vi.fn())
const mockGetQuest = vi.hoisted(() => vi.fn())
const mockGetUser = vi.hoisted(() => vi.fn())
const mockAddExperience = vi.hoisted(() => vi.fn())
const mockAssignAchievement = vi.hoisted(() => vi.fn())

vi.mock('@/store/entities', () => ({
	useAddExperienceMutation: () => [mockAddExperience],
	useAssignAchievementMutation: () => [mockAssignAchievement],
	useJoinQuestMutation: () => [mockJoinQuest],
	useLazyGetQuestQuery: () => [mockGetQuest],
	useLazyGetUserQuery: () => [mockGetUser],
	useLeaveQuestMutation: () => [mockLeaveQuest],
}))

vi.mock('@/utils/logger', () => ({
	logger: {
		debug: vi.fn(),
		error: vi.fn(),
	},
}))

vi.mock('sonner', () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}))

vi.mock('@/utils/auth', () => ({
	transformUserFromAPI: vi.fn((user) => user),
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

describe('useQuestActions', () => {
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
			const { result } = renderHook(() => useQuestActions(), {
				wrapper: createWrapper(mockUser),
			})

			expect(result.current.participateInQuest).toBeDefined()
			expect(result.current.leaveQuest).toBeDefined()
			expect(result.current.contributeToQuest).toBeDefined()
			expect(result.current.checkAndUnlockAchievements).toBeDefined()
			expect(result.current.checkCustomAchievement).toBeDefined()
			expect(result.current.checkQuestCompletion).toBeDefined()
		})
	})

	describe('participateInQuest', () => {
		it('не должен выполнять действия, если user = null', async () => {
			const { result } = renderHook(() => useQuestActions(), {
				wrapper: createWrapper(null),
			})

			await act(async () => {
				await result.current.participateInQuest('123')
			})

			expect(mockJoinQuest).not.toHaveBeenCalled()
		})

		it('должен вызывать joinQuest с правильными параметрами', async () => {
			mockGetQuest.mockResolvedValue({
				unwrap: () => Promise.resolve({ ownerId: 999 }),
			})
			mockJoinQuest.mockResolvedValue({
				unwrap: () => Promise.resolve({ success: true }),
			})
			mockGetUser.mockResolvedValue({
				unwrap: () => Promise.resolve(mockUser),
			})

			const { result } = renderHook(() => useQuestActions(), {
				wrapper: createWrapper(mockUser),
			})

			await act(async () => {
				await result.current.participateInQuest('123')
			})

			await waitFor(() => {
				expect(mockJoinQuest).toHaveBeenCalledWith({
					id: 123,
					userId: 1,
				})
			})
		})

		it('должен обрабатывать ошибку при неверном формате ID', async () => {
			const { result } = renderHook(() => useQuestActions(), {
				wrapper: createWrapper(mockUser),
			})

			await act(async () => {
				await result.current.participateInQuest('invalid')
			})

			// Должна быть вызвана ошибка
			const { toast } = await import('sonner')
			await waitFor(() => {
				expect(vi.mocked(toast.error)).toHaveBeenCalled()
			})
		})
	})

	describe('leaveQuest', () => {
		it('не должен выполнять действия, если user = null', async () => {
			const { result } = renderHook(() => useQuestActions(), {
				wrapper: createWrapper(null),
			})

			await act(async () => {
				await result.current.leaveQuest('123')
			})

			expect(mockLeaveQuest).not.toHaveBeenCalled()
		})

		it('должен вызывать leaveQuest с правильными параметрами', async () => {
			mockLeaveQuest.mockResolvedValue({
				unwrap: () => Promise.resolve({ success: true }),
			})
			mockGetUser.mockResolvedValue({
				unwrap: () => Promise.resolve(mockUser),
			})

			const { result } = renderHook(() => useQuestActions(), {
				wrapper: createWrapper(mockUser),
			})

			await act(async () => {
				await result.current.leaveQuest('123')
			})

			await waitFor(() => {
				expect(mockLeaveQuest).toHaveBeenCalledWith({
					id: 123,
					userId: 1,
				})
			})
		})
	})

	describe('contributeToQuest', () => {
		it('не должен выполнять действия, если user = null', async () => {
			const { result } = renderHook(() => useQuestActions(), {
				wrapper: createWrapper(null),
			})

			const contribution: QuestContribution = {
				questId: '123',
				stageId: '456',
				amount: 1000,
				contributedAt: new Date().toISOString(),
			}

			await act(async () => {
				await result.current.contributeToQuest(contribution)
			})

			expect(mockAddExperience).not.toHaveBeenCalled()
		})

		it('должен обновлять локальное состояние с новым донатом', async () => {
			mockAddExperience.mockResolvedValue({
				unwrap: () =>
					Promise.resolve({
						level: 5,
						experience: 110,
						levelUp: null,
					}),
			})
			mockGetUser.mockResolvedValue({
				unwrap: () => Promise.resolve(mockUser),
			})

			const { result } = renderHook(() => useQuestActions(), {
				wrapper: createWrapper(mockUser),
			})

			const contribution: QuestContribution = {
				questId: '123',
				stageId: '456',
				amount: 1000,
				contributedAt: new Date().toISOString(),
			}

			await act(async () => {
				await result.current.contributeToQuest(contribution)
			})

			await waitFor(() => {
				expect(mockSetUser).toHaveBeenCalled()
			})

			// Проверяем, что setUser был вызван с функцией обновления
			const updateFn = mockSetUser.mock.calls[0]?.[0]
			if (typeof updateFn !== 'function') {
				throw new Error('updateFn is not a function')
			}
			const updatedUser = updateFn(mockUser)
			expect(updatedUser).not.toBeNull()
			expect(updatedUser?.stats.totalDonations).toBe(1000)
		})

		it('должен рассчитывать опыт на основе суммы (amount / 100)', async () => {
			mockAddExperience.mockResolvedValue({
				unwrap: () =>
					Promise.resolve({
						level: 5,
						experience: 110,
						levelUp: null,
					}),
			})
			mockGetUser.mockResolvedValue({
				unwrap: () => Promise.resolve(mockUser),
			})

			const { result } = renderHook(() => useQuestActions(), {
				wrapper: createWrapper(mockUser),
			})

			const contribution: QuestContribution = {
				questId: '123',
				stageId: '456',
				amount: 500,
				contributedAt: new Date().toISOString(),
			}

			await act(async () => {
				await result.current.contributeToQuest(contribution)
			})

			await waitFor(() => {
				expect(mockAddExperience).toHaveBeenCalledWith({
					userId: '1',
					data: { amount: 5 }, // 500 / 100 = 5
				})
			})
		})

		it('должен использовать значение по умолчанию 10 опыта, если amount отсутствует', async () => {
			mockAddExperience.mockResolvedValue({
				unwrap: () =>
					Promise.resolve({
						level: 5,
						experience: 110,
						levelUp: null,
					}),
			})
			mockGetUser.mockResolvedValue({
				unwrap: () => Promise.resolve(mockUser),
			})

			const { result } = renderHook(() => useQuestActions(), {
				wrapper: createWrapper(mockUser),
			})

			const contribution: QuestContribution = {
				questId: '123',
				stageId: '456',
				contributedAt: new Date().toISOString(),
			}

			await act(async () => {
				await result.current.contributeToQuest(contribution)
			})

			await waitFor(() => {
				expect(mockAddExperience).toHaveBeenCalledWith({
					userId: '1',
					data: { amount: 10 },
				})
			})
		})
	})

	describe('checkCustomAchievement', () => {
		it('не должен выполнять действия, если user = null', () => {
			const { result } = renderHook(() => useQuestActions(), {
				wrapper: createWrapper(null),
			})

			act(() => {
				result.current.checkCustomAchievement('123', 100, {
					icon: '🎯',
					title: 'Test Achievement',
					description: 'Test Description',
				})
			})

			expect(mockSetUser).not.toHaveBeenCalled()
		})

		it('не должен разблокировать достижение, если прогресс < 100', () => {
			const { result } = renderHook(() => useQuestActions(), {
				wrapper: createWrapper(mockUser),
			})

			act(() => {
				result.current.checkCustomAchievement('123', 50, {
					icon: '🎯',
					title: 'Test Achievement',
					description: 'Test Description',
				})
			})

			const updateFn = mockSetUser.mock.calls[0]?.[0]
			if (typeof updateFn === 'function') {
				const updatedUser = updateFn(mockUser)
				expect(updatedUser).toEqual(mockUser)
			}
		})

		it('должен разблокировать достижение, если прогресс = 100', () => {
			const { result } = renderHook(() => useQuestActions(), {
				wrapper: createWrapper(mockUser),
			})

			const onAchievementUnlocked = vi.fn()

			act(() => {
				result.current.checkCustomAchievement(
					'123',
					100,
					{
						icon: '🎯',
						title: 'Test Achievement',
						description: 'Test Description',
					},
					onAchievementUnlocked
				)
			})

			const updateFn = mockSetUser.mock.calls[0]?.[0]
			if (typeof updateFn !== 'function') {
				throw new Error('updateFn is not a function')
			}
			const updatedUser = updateFn(mockUser)
			if (!updatedUser) {
				throw new Error('updatedUser is null')
			}

			expect(updatedUser.achievements).toHaveLength(1)
			expect(updatedUser.achievements[0].id).toBe('custom-123')
			expect(updatedUser.achievements[0].title).toBe('Test Achievement')
			expect(onAchievementUnlocked).toHaveBeenCalledWith({
				id: 'custom-123',
				title: 'Test Achievement',
				icon: '🎯',
			})
		})

		it('не должен разблокировать достижение дважды', () => {
			const userWithAchievement: User = {
				...mockUser,
				achievements: [
					{
						id: 'custom-123',
						title: 'Test Achievement',
						description: 'Test Description',
						icon: '🎯',
						rarity: 'common',
					},
				],
			}

			const { result } = renderHook(() => useQuestActions(), {
				wrapper: createWrapper(userWithAchievement),
			})

			act(() => {
				result.current.checkCustomAchievement('123', 100, {
					icon: '🎯',
					title: 'Test Achievement',
					description: 'Test Description',
				})
			})

			const updateFn = mockSetUser.mock.calls[0]?.[0]
			if (typeof updateFn !== 'function') {
				throw new Error('updateFn is not a function')
			}
			const updatedUser = updateFn(userWithAchievement)
			if (!updatedUser) {
				throw new Error('updatedUser is null')
			}

			expect(updatedUser.achievements).toHaveLength(1)
		})
	})

	describe('checkQuestCompletion', () => {
		it('не должен выполнять действия, если user = null', () => {
			const { result } = renderHook(() => useQuestActions(), {
				wrapper: createWrapper(null),
			})

			const quest: Quest = {
				id: '123',
				title: 'Test Quest',
				city: 'Moscow',
				type: 'environment',
				category: 'environment',
				story: 'Test story',
				stages: [],
				overallProgress: 100,
				status: 'completed',
				progressColor: 'green',
				updates: [],
				coordinates: [55.751244, 37.618423],
				address: 'Test address',
				curator: {
					name: 'Test Curator',
					phone: '+1234567890',
				},
				gallery: [],
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z',
			}

			act(() => {
				result.current.checkQuestCompletion(quest)
			})

			expect(mockSetUser).not.toHaveBeenCalled()
		})

		it('не должен обрабатывать квест, если статус не completed', () => {
			const { result } = renderHook(() => useQuestActions(), {
				wrapper: createWrapper(mockUser),
			})

			const quest: Quest = {
				id: '123',
				title: 'Test Quest',
				city: 'Moscow',
				type: 'environment',
				category: 'environment',
				story: 'Test story',
				stages: [],
				overallProgress: 50,
				status: 'active',
				progressColor: 'yellow',
				updates: [],
				coordinates: [55.751244, 37.618423],
				address: 'Test address',
				curator: {
					name: 'Test Curator',
					phone: '+1234567890',
				},
				gallery: [],
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z',
			}

			act(() => {
				result.current.checkQuestCompletion(quest)
			})

			const updateFn = mockSetUser.mock.calls[0]?.[0]
			if (typeof updateFn === 'function') {
				const updatedUser = updateFn(mockUser)
				expect(updatedUser).toEqual(mockUser)
			}
		})

		it('должен разблокировать customAchievement при завершении квеста', () => {
			const { result } = renderHook(() => useQuestActions(), {
				wrapper: createWrapper(mockUser),
			})

			const onQuestCompleted = vi.fn()
			const onAchievementUnlocked = vi.fn()

			const quest: Quest = {
				id: '123',
				title: 'Test Quest',
				city: 'Moscow',
				type: 'environment',
				category: 'environment',
				story: 'Test story',
				stages: [],
				overallProgress: 100,
				status: 'completed',
				progressColor: 'green',
				updates: [],
				coordinates: [55.751244, 37.618423],
				address: 'Test address',
				curator: {
					name: 'Test Curator',
					phone: '+1234567890',
				},
				gallery: [],
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z',
				customAchievement: {
					icon: '🎯',
					title: 'Quest Completed',
					description: 'You completed the quest',
				},
			}

			act(() => {
				result.current.checkQuestCompletion(
					quest,
					onQuestCompleted,
					onAchievementUnlocked
				)
			})

			const updateFn = mockSetUser.mock.calls[0]?.[0]
			if (typeof updateFn !== 'function') {
				throw new Error('updateFn is not a function')
			}
			const updatedUser = updateFn(mockUser)
			if (!updatedUser) {
				throw new Error('updatedUser is null')
			}

			expect(updatedUser.achievements).toHaveLength(1)
			expect(updatedUser.achievements[0].id).toBe('custom-123')
			expect(onQuestCompleted).toHaveBeenCalledWith(quest)
			expect(onAchievementUnlocked).toHaveBeenCalledWith({
				id: 'custom-123',
				title: 'Quest Completed',
				icon: '🎯',
			})
		})
	})

	describe('checkAndUnlockAchievements', () => {
		it('должен возвращать текущего пользователя без изменений', () => {
			const { result } = renderHook(() => useQuestActions(), {
				wrapper: createWrapper(mockUser),
			})

			act(() => {
				result.current.checkAndUnlockAchievements()
			})

			const updateFn = mockSetUser.mock.calls[0]?.[0]
			if (typeof updateFn !== 'function') {
				throw new Error('updateFn is not a function')
			}
			const updatedUser = updateFn(mockUser)

			expect(updatedUser).toEqual(mockUser)
		})
	})

	describe('ошибки', () => {
		it('должен выбрасывать ошибку, если используется вне UserProvider', () => {
			expect(() => {
				renderHook(() => useQuestActions())
			}).toThrow('useQuestActions must be used within a UserProvider')
		})
	})
})

