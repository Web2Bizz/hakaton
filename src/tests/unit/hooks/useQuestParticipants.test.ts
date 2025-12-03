import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useQuestParticipants } from '@/hooks/useQuestParticipants'

// Мокируем RTK Query hook
const mockUseGetQuestUsersQuery = vi.hoisted(() => vi.fn())

vi.mock('@/store/entities/quest', () => ({
	useGetQuestUsersQuery: (questId: number | string, options?: { skip?: boolean }) =>
		mockUseGetQuestUsersQuery(questId, options),
}))

describe('useQuestParticipants', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})


	describe('инициализация', () => {
		it('должен вызывать useGetQuestUsersQuery с questId', () => {
			mockUseGetQuestUsersQuery.mockReturnValue({
				data: null,
				isLoading: false,
			})

			renderHook(() => useQuestParticipants(123))

			expect(mockUseGetQuestUsersQuery).toHaveBeenCalledWith(123, {
				skip: false,
			})
		})

		it('должен пропускать запрос, если questId отсутствует', () => {
			mockUseGetQuestUsersQuery.mockReturnValue({
				data: null,
				isLoading: false,
			})

			renderHook(() => useQuestParticipants(''))

			expect(mockUseGetQuestUsersQuery).toHaveBeenCalledWith('', {
				skip: true,
			})
		})

		it('должен работать со строковым questId', () => {
			mockUseGetQuestUsersQuery.mockReturnValue({
				data: null,
				isLoading: false,
			})

			renderHook(() => useQuestParticipants('quest-123'))

			expect(mockUseGetQuestUsersQuery).toHaveBeenCalledWith('quest-123', {
				skip: false,
			})
		})
	})

	describe('возвращаемые данные', () => {
		it('должен возвращать isLoading из query', () => {
			mockUseGetQuestUsersQuery.mockReturnValue({
				data: null,
				isLoading: true,
			})

			const { result } = renderHook(() => useQuestParticipants(123))

			expect(result.current.isLoading).toBe(true)
		})

		it('должен возвращать пустой массив participants, если data отсутствует', () => {
			mockUseGetQuestUsersQuery.mockReturnValue({
				data: null,
				isLoading: false,
			})

			const { result } = renderHook(() => useQuestParticipants(123))

			expect(result.current.participants).toEqual([])
		})

		it('должен возвращать пустой массив participants, если data.data отсутствует', () => {
			mockUseGetQuestUsersQuery.mockReturnValue({
				data: {},
				isLoading: false,
			})

			const { result } = renderHook(() => useQuestParticipants(123))

			expect(result.current.participants).toEqual([])
		})

		it('должен преобразовывать участников из API в нужный формат', () => {
			mockUseGetQuestUsersQuery.mockReturnValue({
				data: {
					data: [
						{
							id: 1,
							firstName: 'Иван',
							lastName: 'Иванов',
							middleName: 'Иванович',
						},
						{
							id: 2,
							firstName: 'Петр',
							lastName: 'Петров',
							middleName: undefined,
						},
					],
				},
				isLoading: false,
			})

			const { result } = renderHook(() => useQuestParticipants(123))

			expect(result.current.participants).toEqual([
				{
					id: '1',
					name: 'Иван Иванов Иванович',
					email: '',
					firstName: 'Иван',
					lastName: 'Иванов',
					middleName: 'Иванович',
				},
				{
					id: '2',
					name: 'Петр Петров',
					email: '',
					firstName: 'Петр',
					lastName: 'Петров',
					middleName: undefined,
				},
			])
		})

		it('должен обрабатывать участников без middleName', () => {
			mockUseGetQuestUsersQuery.mockReturnValue({
				data: {
					data: [
						{
							id: 3,
							firstName: 'Мария',
							lastName: 'Сидорова',
							middleName: null,
						},
					],
				},
				isLoading: false,
			})

			const { result } = renderHook(() => useQuestParticipants(123))

			expect(result.current.participants[0].name).toBe('Мария Сидорова')
			expect(result.current.participants[0].middleName).toBeNull()
		})

		it('должен преобразовывать id в строку', () => {
			mockUseGetQuestUsersQuery.mockReturnValue({
				data: {
					data: [
						{
							id: 999,
							firstName: 'Test',
							lastName: 'User',
						},
					],
				},
				isLoading: false,
			})

			const { result } = renderHook(() => useQuestParticipants(123))

			expect(result.current.participants[0].id).toBe('999')
			expect(typeof result.current.participants[0].id).toBe('string')
		})

		it('должен устанавливать email как пустую строку', () => {
			mockUseGetQuestUsersQuery.mockReturnValue({
				data: {
					data: [
						{
							id: 1,
							firstName: 'Test',
							lastName: 'User',
						},
					],
				},
				isLoading: false,
			})

			const { result } = renderHook(() => useQuestParticipants(123))

			expect(result.current.participants[0].email).toBe('')
		})
	})

	describe('граничные случаи', () => {
		it('должен обрабатывать пустой массив участников', () => {
			mockUseGetQuestUsersQuery.mockReturnValue({
				data: {
					data: [],
				},
				isLoading: false,
			})

			const { result } = renderHook(() => useQuestParticipants(123))

			expect(result.current.participants).toEqual([])
		})

		it('должен обрабатывать участников с пустыми именами', () => {
			mockUseGetQuestUsersQuery.mockReturnValue({
				data: {
					data: [
						{
							id: 1,
							firstName: '',
							lastName: '',
							middleName: '',
						},
					],
				},
				isLoading: false,
			})

			const { result } = renderHook(() => useQuestParticipants(123))

			expect(result.current.participants[0].name).toBe('')
		})

		it('должен обрабатывать участников только с firstName', () => {
			mockUseGetQuestUsersQuery.mockReturnValue({
				data: {
					data: [
						{
							id: 1,
							firstName: 'Имя',
							lastName: '',
							middleName: '',
						},
					],
				},
				isLoading: false,
			})

			const { result } = renderHook(() => useQuestParticipants(123))

			expect(result.current.participants[0].name).toBe('Имя')
		})

		it('должен обрабатывать участников только с lastName', () => {
			mockUseGetQuestUsersQuery.mockReturnValue({
				data: {
					data: [
						{
							id: 1,
							firstName: '',
							lastName: 'Фамилия',
							middleName: '',
						},
					],
				},
				isLoading: false,
			})

			const { result } = renderHook(() => useQuestParticipants(123))

			expect(result.current.participants[0].name).toBe('Фамилия')
		})
	})
})

