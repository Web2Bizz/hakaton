import { useGeolocation } from '@/hooks/useGeolocation'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('useGeolocation', () => {
	let mockGetCurrentPosition: ReturnType<typeof vi.fn>
	let mockWatchPosition: ReturnType<typeof vi.fn>
	let mockClearWatch: ReturnType<typeof vi.fn>
	const mockGeolocation = {
		getCurrentPosition: vi.fn(),
		watchPosition: vi.fn(),
		clearWatch: vi.fn(),
	}

	beforeEach(() => {
		mockGetCurrentPosition = vi.fn()
		mockWatchPosition = vi.fn()
		mockClearWatch = vi.fn()

		// Обновляем моки
		// @ts-expect-error - типы моков совместимы в runtime
		mockGeolocation.getCurrentPosition = mockGetCurrentPosition
		// @ts-expect-error - типы моков совместимы в runtime
		mockGeolocation.watchPosition = mockWatchPosition
		// @ts-expect-error - типы моков совместимы в runtime
		mockGeolocation.clearWatch = mockClearWatch

		// Мокируем navigator.geolocation
		Object.defineProperty(globalThis.navigator, 'geolocation', {
			value: mockGeolocation,
			writable: true,
			configurable: true,
		})
	})

	afterEach(() => {
		vi.clearAllMocks()
		vi.restoreAllMocks()
		// Восстанавливаем реальные таймеры, если они были заменены
		if (vi.isFakeTimers()) {
			vi.useRealTimers()
		}
		// Восстанавливаем navigator.geolocation на случай, если он был удален в тесте
		Object.defineProperty(globalThis.navigator, 'geolocation', {
			value: mockGeolocation,
			writable: true,
			configurable: true,
		})
	})

	describe('инициализация', () => {
		it('должен инициализироваться с null position', () => {
			const { result } = renderHook(() => useGeolocation())
			expect(result.current.position).toBeNull()
		})

		it('должен инициализироваться с null error', () => {
			const { result } = renderHook(() => useGeolocation())
			expect(result.current.error).toBeNull()
		})

		it('должен инициализироваться с isLoading = false', () => {
			const { result } = renderHook(() => useGeolocation())
			expect(result.current.isLoading).toBe(false)
		})
	})

	describe('getCurrentPosition - успешное получение позиции', () => {
		it('должен получать текущую позицию', async () => {
			const mockPosition = {
				coords: {
					latitude: 55.751244,
					longitude: 37.618423,
					accuracy: 10,
				},
			}

			mockGetCurrentPosition.mockImplementation(success => {
				success(mockPosition)
			})

			const { result } = renderHook(() => useGeolocation())

			act(() => {
				result.current.getCurrentPosition()
			})

			await waitFor(() => {
				expect(result.current.position).toEqual({
					latitude: 55.751244,
					longitude: 37.618423,
					accuracy: 10,
				})
			})

			expect(result.current.error).toBeNull()
			expect(result.current.isLoading).toBe(false)
		})

		it('должен обрабатывать позицию без accuracy', async () => {
			const mockPosition = {
				coords: {
					latitude: 55.751244,
					longitude: 37.618423,
					// accuracy не указан (undefined)
				},
			}

			mockGetCurrentPosition.mockImplementation(success => {
				success(mockPosition as GeolocationPosition)
			})

			const { result } = renderHook(() => useGeolocation())

			act(() => {
				result.current.getCurrentPosition()
			})

			await waitFor(() => {
				expect(result.current.position).toEqual({
					latitude: 55.751244,
					longitude: 37.618423,
					accuracy: undefined,
				})
			})
		})

		it('должен устанавливать isLoading в true во время запроса', () => {
			mockGetCurrentPosition.mockImplementation(() => {
				// Не вызываем success/error сразу
			})

			const { result } = renderHook(() => useGeolocation())

			act(() => {
				result.current.getCurrentPosition()
			})

			expect(result.current.isLoading).toBe(true)
		})

		it('должен использовать опции по умолчанию', () => {
			const { result } = renderHook(() => useGeolocation())

			act(() => {
				result.current.getCurrentPosition()
			})

			expect(mockGetCurrentPosition).toHaveBeenCalledWith(
				expect.any(Function),
				expect.any(Function),
				{
					enableHighAccuracy: true,
					timeout: 20000,
					maximumAge: 0,
				}
			)
		})

		it('должен использовать переданные опции', () => {
			const { result } = renderHook(() =>
				useGeolocation({
					timeout: 10000,
					enableHighAccuracy: false,
					maximumAge: 60000,
				})
			)

			act(() => {
				result.current.getCurrentPosition()
			})

			// Всегда использует enableHighAccuracy: true и maximumAge: 0 в коде
			expect(mockGetCurrentPosition).toHaveBeenCalledWith(
				expect.any(Function),
				expect.any(Function),
				{
					enableHighAccuracy: true,
					timeout: 10000,
					maximumAge: 0,
				}
			)
		})
	})

	describe('getCurrentPosition - ошибки', () => {
		it('должен обрабатывать ошибку PERMISSION_DENIED', async () => {
			const mockError = {
				code: 1,
				message: 'User denied geolocation',
			}

			mockGetCurrentPosition.mockImplementation((_success, error) => {
				error(mockError)
			})

			const { result } = renderHook(() => useGeolocation())

			act(() => {
				result.current.getCurrentPosition()
			})

			await waitFor(() => {
				expect(result.current.error).toEqual({
					code: 1,
					message:
						'Доступ к геолокации запрещен. Разрешите доступ в настройках браузера.',
				})
			})

			expect(result.current.position).toBeNull()
			expect(result.current.isLoading).toBe(false)
		})

		it('должен обрабатывать ошибку POSITION_UNAVAILABLE', async () => {
			const mockError = {
				code: 2,
				message: 'Position unavailable',
			}

			mockGetCurrentPosition.mockImplementation((_success, error) => {
				error(mockError)
			})

			const { result } = renderHook(() => useGeolocation())

			act(() => {
				result.current.getCurrentPosition()
			})

			await waitFor(() => {
				expect(result.current.error).toEqual({
					code: 2,
					message: 'Информация о местоположении недоступна.',
				})
			})
		})

		it('должен обрабатывать ошибку TIMEOUT', async () => {
			const mockError = {
				code: 3,
				message: 'Timeout',
			}

			mockGetCurrentPosition.mockImplementation((_success, error) => {
				error(mockError)
			})

			const { result } = renderHook(() => useGeolocation())

			act(() => {
				result.current.getCurrentPosition()
			})

			await waitFor(() => {
				expect(result.current.error).toEqual({
					code: 3,
					message: 'Превышено время ожидания получения местоположения.',
				})
			})
		})

		it('должен обрабатывать неизвестную ошибку', async () => {
			const mockError = {
				code: 999,
				message: 'Unknown error',
			}

			mockGetCurrentPosition.mockImplementation((_success, error) => {
				error(mockError)
			})

			const { result } = renderHook(() => useGeolocation())

			act(() => {
				result.current.getCurrentPosition()
			})

			await waitFor(() => {
				expect(result.current.error).toEqual({
					code: 999,
					message: 'Неизвестная ошибка: Unknown error',
				})
			})
		})

		it('должен обрабатывать отсутствие поддержки геолокации', () => {
			// Сохраняем оригинальный geolocation
			const originalGeolocation = globalThis.navigator.geolocation

			// Удаляем geolocation из navigator
			Object.defineProperty(globalThis.navigator, 'geolocation', {
				value: undefined,
				writable: true,
				configurable: true,
			})

			const { result } = renderHook(() => useGeolocation())

			act(() => {
				result.current.getCurrentPosition()
			})

			expect(result.current.error).toEqual({
				code: -1,
				message: 'Геолокация не поддерживается в этом браузере',
			})

			// Восстанавливаем geolocation
			Object.defineProperty(globalThis.navigator, 'geolocation', {
				value: originalGeolocation,
				writable: true,
				configurable: true,
			})
		})
	})

	describe('повторные попытки при низкой точности', () => {
		it('должен повторять запрос при точности выше minAccuracy', async () => {
			vi.useFakeTimers()

			const positions = [
				{
					coords: { latitude: 55.751244, longitude: 37.618423, accuracy: 100 },
				}, // Низкая точность
				{ coords: { latitude: 55.751244, longitude: 37.618423, accuracy: 30 } }, // Хорошая точность
			]

			let callCount = 0
			mockGetCurrentPosition.mockImplementation(success => {
				success(positions[callCount])
				callCount++
			})

			const { result } = renderHook(() =>
				useGeolocation({ minAccuracy: 50, maxRetries: 3 })
			)

			act(() => {
				result.current.getCurrentPosition()
			})

			// Первая попытка с низкой точностью
			expect(mockGetCurrentPosition).toHaveBeenCalledTimes(1)

			// Ждем задержку перед повторной попыткой
			act(() => {
				vi.advanceTimersByTime(1000)
			})

			// Вторая попытка должна быть вызвана
			expect(mockGetCurrentPosition).toHaveBeenCalledTimes(2)

			// Вторая попытка должна вернуть хорошую точность
			expect(result.current.position?.accuracy).toBe(30)

			vi.useRealTimers()
		})

		it('должен прекращать повторные попытки после maxRetries', async () => {
			vi.useFakeTimers()

			mockGetCurrentPosition.mockImplementation(success => {
				success({
					coords: { latitude: 55.751244, longitude: 37.618423, accuracy: 100 },
				})
			})

			const { result } = renderHook(() =>
				useGeolocation({ minAccuracy: 50, maxRetries: 2 })
			)

			act(() => {
				result.current.getCurrentPosition()
			})

			// Первая попытка
			expect(mockGetCurrentPosition).toHaveBeenCalledTimes(1)

			// Вторая попытка
			act(() => {
				vi.advanceTimersByTime(1000)
			})

			expect(mockGetCurrentPosition).toHaveBeenCalledTimes(2)

			// Третья попытка
			act(() => {
				vi.advanceTimersByTime(1000)
			})

			expect(mockGetCurrentPosition).toHaveBeenCalledTimes(3)

			// После maxRetries должна быть принята позиция с низкой точностью
			expect(result.current.position?.accuracy).toBe(100)

			vi.useRealTimers()
		})

		it('должен сбрасывать счетчик попыток при новом запросе', async () => {
			vi.useFakeTimers()

			mockGetCurrentPosition.mockImplementation(success => {
				success({
					coords: { latitude: 55.751244, longitude: 37.618423, accuracy: 100 },
				})
			})

			const { result } = renderHook(() =>
				useGeolocation({ minAccuracy: 50, maxRetries: 2 })
			)

			act(() => {
				result.current.getCurrentPosition()
			})

			expect(mockGetCurrentPosition).toHaveBeenCalledTimes(1)

			// Новый запрос должен сбросить счетчик
			act(() => {
				result.current.getCurrentPosition()
			})

			// Счетчик должен быть сброшен, поэтому снова можно делать попытки
			expect(mockGetCurrentPosition).toHaveBeenCalledTimes(2)

			vi.useRealTimers()
		})
	})

	describe('watch mode', () => {
		it('должен начать отслеживание при watch = true', () => {
			mockWatchPosition.mockReturnValue(123) // watchId

			renderHook(() => useGeolocation({ watch: true }))

			expect(mockWatchPosition).toHaveBeenCalledWith(
				expect.any(Function),
				expect.any(Function),
				{
					enableHighAccuracy: true,
					timeout: 20000,
					maximumAge: 0,
				}
			)
		})

		it('должен обновлять позицию при изменении в watch mode', async () => {
			let watchCallback: (position: GeolocationPosition) => void
			mockWatchPosition.mockImplementation(success => {
				watchCallback = success
				return 123
			})

			const { result } = renderHook(() => useGeolocation({ watch: true }))

			act(() => {
				watchCallback!({
					coords: {
						latitude: 55.751244,
						longitude: 37.618423,
						accuracy: 10,
					},
				} as GeolocationPosition)
			})

			await waitFor(() => {
				expect(result.current.position).toEqual({
					latitude: 55.751244,
					longitude: 37.618423,
					accuracy: 10,
				})
			})
		})

		it('должен очищать watch при размонтировании', () => {
			mockWatchPosition.mockReturnValue(123)

			const { unmount } = renderHook(() => useGeolocation({ watch: true }))

			unmount()

			expect(mockClearWatch).toHaveBeenCalledWith(123)
		})

		it('должен очищать watch при изменении watch на false', () => {
			mockWatchPosition.mockReturnValue(123)

			const { rerender } = renderHook(
				({ watch }) => useGeolocation({ watch }),
				{
					initialProps: { watch: true },
				}
			)

			rerender({ watch: false })

			expect(mockClearWatch).toHaveBeenCalledWith(123)
		})
	})

	describe('clearWatch', () => {
		it('должен очищать активное отслеживание', () => {
			mockWatchPosition.mockReturnValue(456)

			const { result } = renderHook(() => useGeolocation({ watch: true }))

			act(() => {
				result.current.clearWatch()
			})

			expect(mockClearWatch).toHaveBeenCalledWith(456)
			expect(result.current.isLoading).toBe(false)
		})

		it('должен безопасно обрабатывать вызов clearWatch без активного отслеживания', () => {
			const { result } = renderHook(() => useGeolocation())

			act(() => {
				result.current.clearWatch()
			})

			// Не должно выбросить ошибку
			expect(mockClearWatch).not.toHaveBeenCalled()
		})
	})

	describe('граничные случаи', () => {
		it('должен обрабатывать позицию с нулевыми координатами', async () => {
			const mockPosition = {
				coords: {
					latitude: 0,
					longitude: 0,
					accuracy: 10,
				},
			}

			mockGetCurrentPosition.mockImplementation(success => {
				success(mockPosition)
			})

			const { result } = renderHook(() => useGeolocation())

			act(() => {
				result.current.getCurrentPosition()
			})

			await waitFor(() => {
				expect(result.current.position).toEqual({
					latitude: 0,
					longitude: 0,
					accuracy: 10,
				})
			})
		})

		it('должен обрабатывать позицию с отрицательными координатами', async () => {
			const mockPosition = {
				coords: {
					latitude: -90,
					longitude: -180,
					accuracy: 10,
				},
			}

			mockGetCurrentPosition.mockImplementation(success => {
				success(mockPosition)
			})

			const { result } = renderHook(() => useGeolocation())

			act(() => {
				result.current.getCurrentPosition()
			})

			await waitFor(() => {
				expect(result.current.position).toEqual({
					latitude: -90,
					longitude: -180,
					accuracy: 10,
				})
			})
		})

		it('должен обрабатывать очень большую точность', async () => {
			const mockPosition = {
				coords: {
					latitude: 55.751244,
					longitude: 37.618423,
					accuracy: 10000,
				},
			}

			mockGetCurrentPosition.mockImplementation(success => {
				success(mockPosition)
			})

			const { result } = renderHook(() =>
				useGeolocation({ minAccuracy: 50, maxRetries: 0 })
			)

			act(() => {
				result.current.getCurrentPosition()
			})

			await waitFor(() => {
				expect(result.current.position?.accuracy).toBe(10000)
			})
		})

		it('должен обрабатывать точность равную minAccuracy', async () => {
			const mockPosition = {
				coords: {
					latitude: 55.751244,
					longitude: 37.618423,
					accuracy: 50, // Ровно minAccuracy
				},
			}

			mockGetCurrentPosition.mockImplementation(success => {
				success(mockPosition)
			})

			const { result } = renderHook(() =>
				useGeolocation({ minAccuracy: 50, maxRetries: 3 })
			)

			act(() => {
				result.current.getCurrentPosition()
			})

			// Точность 50 не больше 50, поэтому не должно быть повторных попыток
			await waitFor(() => {
				expect(result.current.position?.accuracy).toBe(50)
			})

			// Должна быть только одна попытка
			expect(mockGetCurrentPosition).toHaveBeenCalledTimes(1)
		})
	})
})
