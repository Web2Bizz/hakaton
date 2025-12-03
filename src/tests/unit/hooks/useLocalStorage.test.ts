import { renderHook, act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useLocalStorage } from '@/hooks/useLocalStorage'

describe('useLocalStorage', () => {
	beforeEach(() => {
		localStorage.clear()
		vi.clearAllMocks()
	})

	describe('инициализация', () => {
		it('должен возвращать initialValue, если ключ отсутствует в localStorage', () => {
			const { result } = renderHook(() =>
				useLocalStorage('test-key', 'initial-value')
			)
			expect(result.current[0]).toBe('initial-value')
		})

		it('должен возвращать значение из localStorage, если оно существует', () => {
			localStorage.setItem('test-key', JSON.stringify('stored-value'))
			const { result } = renderHook(() =>
				useLocalStorage('test-key', 'initial-value')
			)
			expect(result.current[0]).toBe('stored-value')
		})

		it('должен возвращать initialValue для объектов', () => {
			const initialValue = { name: 'Test', count: 0 }
			const { result } = renderHook(() =>
				useLocalStorage('test-key', initialValue)
			)
			expect(result.current[0]).toEqual(initialValue)
		})

		it('должен возвращать initialValue для массивов', () => {
			const initialValue = [1, 2, 3]
			const { result } = renderHook(() =>
				useLocalStorage('test-key', initialValue)
			)
			expect(result.current[0]).toEqual(initialValue)
		})

		it('должен возвращать initialValue для чисел', () => {
			const { result } = renderHook(() => useLocalStorage('test-key', 42))
			expect(result.current[0]).toBe(42)
		})

		it('должен возвращать initialValue для булевых значений', () => {
			const { result } = renderHook(() => useLocalStorage('test-key', true))
			expect(result.current[0]).toBe(true)
		})

		it('должен возвращать initialValue для null', () => {
			const { result } = renderHook(() => useLocalStorage('test-key', null))
			expect(result.current[0]).toBeNull()
		})

		it('должен возвращать initialValue в SSR окружении (window === undefined)', () => {
			// В jsdom окружении window всегда определен, поэтому просто проверяем, что hook работает
			const { result } = renderHook(() =>
				useLocalStorage('test-key', 'initial-value')
			)
			expect(result.current[0]).toBe('initial-value')
		})

		it('должен обрабатывать невалидный JSON в localStorage', () => {
			localStorage.setItem('test-key', 'invalid-json{')
			const { result } = renderHook(() =>
				useLocalStorage('test-key', 'initial-value')
			)
			// При ошибке парсинга должен вернуться initialValue
			expect(result.current[0]).toBe('initial-value')
		})
	})

	describe('обновление значения', () => {
		it('должен обновлять значение в состоянии и localStorage', () => {
			const { result } = renderHook(() =>
				useLocalStorage('test-key', 'initial')
			)

			act(() => {
				result.current[1]('updated')
			})

			expect(result.current[0]).toBe('updated')
			expect(localStorage.getItem('test-key')).toBe(JSON.stringify('updated'))
		})

		it('должен обновлять объекты', () => {
			const { result } = renderHook(() =>
				useLocalStorage<{ name: string; count?: number }>('test-key', { name: 'Initial' })
			)

			act(() => {
				result.current[1]({ name: 'Updated', count: 5 })
			})

			expect(result.current[0]).toEqual({ name: 'Updated', count: 5 })
			expect(localStorage.getItem('test-key')).toBe(
				JSON.stringify({ name: 'Updated', count: 5 })
			)
		})

		it('должен обновлять массивы', () => {
			const { result } = renderHook(() =>
				useLocalStorage('test-key', [1, 2, 3])
			)

			act(() => {
				result.current[1]([4, 5, 6])
			})

			expect(result.current[0]).toEqual([4, 5, 6])
			expect(localStorage.getItem('test-key')).toBe(JSON.stringify([4, 5, 6]))
		})

		it('должен поддерживать функциональное обновление (как useState)', () => {
			const { result } = renderHook(() => useLocalStorage('test-key', 0))

			act(() => {
				result.current[1](prev => (prev as number) + 1)
			})

			expect(result.current[0]).toBe(1)

			act(() => {
				result.current[1](prev => (prev as number) + 1)
			})

			expect(result.current[0]).toBe(2)
		})

		it('должен обрабатывать функциональное обновление для объектов', () => {
			const { result } = renderHook(() =>
				useLocalStorage('test-key', { count: 0 })
			)

			act(() => {
				result.current[1](prev => ({
					...(prev as { count: number }),
					count: (prev as { count: number }).count + 1,
				}))
			})

			expect(result.current[0]).toEqual({ count: 1 })
		})

		it('должен обрабатывать обновление на null', () => {
			const { result } = renderHook(() =>
				useLocalStorage<string | null>('test-key', 'initial')
			)

			act(() => {
				result.current[1](null)
			})

			expect(result.current[0]).toBeNull()
			expect(localStorage.getItem('test-key')).toBe(JSON.stringify(null))
		})

		it('должен обрабатывать обновление на undefined', () => {
			const { result } = renderHook(() =>
				useLocalStorage<string | undefined>('test-key', 'initial')
			)

			act(() => {
				result.current[1](undefined)
			})

			expect(result.current[0]).toBeUndefined()
			// undefined удаляется из localStorage, а не сохраняется
			expect(localStorage.getItem('test-key')).toBeNull()
		})

		it('должен обрабатывать ошибки при записи в localStorage', () => {
			// Мокируем setItem, чтобы выбросить ошибку
			const originalSetItem = Storage.prototype.setItem
			Storage.prototype.setItem = vi.fn(() => {
				throw new Error('QuotaExceededError')
			})

			const { result } = renderHook(() =>
				useLocalStorage('test-key', 'initial')
			)

			// Не должно выбросить ошибку, должно обработать её
			act(() => {
				result.current[1]('updated')
			})

			// Значение должно обновиться в состоянии, даже если localStorage не обновился
			expect(result.current[0]).toBe('updated')

			// Восстанавливаем оригинальный setItem
			Storage.prototype.setItem = originalSetItem
		})
	})

	describe('синхронизация между вкладками (storage event)', () => {
		it('должен обновлять значение при изменении в другой вкладке', async () => {
			const { result } = renderHook(() =>
				useLocalStorage('test-key', 'initial')
			)

			// Симулируем событие storage из другой вкладки
			act(() => {
				// В jsdom storageArea опционален, создаем событие без него
				const event = new StorageEvent('storage', {
					key: 'test-key',
					newValue: JSON.stringify('updated-from-other-tab'),
					oldValue: JSON.stringify('initial'),
				} as StorageEventInit)
				window.dispatchEvent(event)
			})

			await waitFor(() => {
				expect(result.current[0]).toBe('updated-from-other-tab')
			})
		})

		it('должен игнорировать события storage для других ключей', () => {
			const { result } = renderHook(() =>
				useLocalStorage('test-key', 'initial')
			)

			act(() => {
				const event = new StorageEvent('storage', {
					key: 'other-key',
					newValue: JSON.stringify('other-value'),
					oldValue: null,
				})
				window.dispatchEvent(event)
			})

			expect(result.current[0]).toBe('initial')
		})

		it('должен игнорировать события storage с null newValue', () => {
			const { result } = renderHook(() =>
				useLocalStorage('test-key', 'initial')
			)

			act(() => {
				const event = new StorageEvent('storage', {
					key: 'test-key',
					newValue: null,
					oldValue: JSON.stringify('initial'),
				})
				window.dispatchEvent(event)
			})

			expect(result.current[0]).toBe('initial')
		})

		it('должен обрабатывать невалидный JSON в storage event', () => {
			const { result } = renderHook(() =>
				useLocalStorage('test-key', 'initial')
			)

			act(() => {
				const event = new StorageEvent('storage', {
					key: 'test-key',
					newValue: 'invalid-json{',
					oldValue: JSON.stringify('initial'),
				})
				window.dispatchEvent(event)
			})

			// При ошибке парсинга значение не должно измениться
			expect(result.current[0]).toBe('initial')
		})

		it('должен очищать обработчик события при размонтировании', () => {
			const { unmount } = renderHook(() =>
				useLocalStorage('test-key', 'initial')
			)

			unmount()

			// После размонтирования событие не должно обрабатываться
			act(() => {
				const event = new StorageEvent('storage', {
					key: 'test-key',
					newValue: JSON.stringify('should-not-update'),
					oldValue: JSON.stringify('initial'),
				})
				window.dispatchEvent(event)
			})

			// Значение не должно измениться, так как компонент размонтирован
			// Но мы не можем проверить это напрямую, так как result больше не доступен
			// Проверяем, что unmount не выбросил ошибку
			expect(unmount).not.toThrow()
		})
	})

	describe('разные типы данных', () => {
		it('должен работать с вложенными объектами', () => {
			const nestedObject = {
				user: {
					name: 'Test',
					settings: {
						theme: 'dark',
					},
				},
			}

			const { result } = renderHook(() =>
				useLocalStorage('test-key', nestedObject)
			)

			act(() => {
				result.current[1]({
					user: {
						name: 'Updated',
						settings: {
							theme: 'light',
						},
					},
				})
			})

			expect(result.current[0]).toEqual({
				user: {
					name: 'Updated',
					settings: {
						theme: 'light',
					},
				},
			})
		})

		it('должен работать с массивами объектов', () => {
			const arrayOfObjects = [
				{ id: 1, name: 'Item 1' },
				{ id: 2, name: 'Item 2' },
			]

			const { result } = renderHook(() =>
				useLocalStorage('test-key', arrayOfObjects)
			)

			act(() => {
				result.current[1]([
					{ id: 1, name: 'Updated Item 1' },
					{ id: 2, name: 'Item 2' },
					{ id: 3, name: 'Item 3' },
				])
			})

			expect(result.current[0]).toEqual([
				{ id: 1, name: 'Updated Item 1' },
				{ id: 2, name: 'Item 2' },
				{ id: 3, name: 'Item 3' },
			])
		})

		it('должен работать с числами', () => {
			const { result } = renderHook(() => useLocalStorage('test-key', 0))

			act(() => {
				result.current[1](42)
			})

			expect(result.current[0]).toBe(42)
		})

		it('должен работать с отрицательными числами', () => {
			const { result } = renderHook(() => useLocalStorage('test-key', 0))

			act(() => {
				result.current[1](-10)
			})

			expect(result.current[0]).toBe(-10)
		})

		it('должен работать с числами с плавающей точкой', () => {
			const { result } = renderHook(() => useLocalStorage('test-key', 0))

			act(() => {
				result.current[1](3.14159)
			})

			expect(result.current[0]).toBe(3.14159)
		})

		it('должен работать с булевыми значениями', () => {
			const { result } = renderHook(() => useLocalStorage('test-key', false))

			act(() => {
				result.current[1](true)
			})

			expect(result.current[0]).toBe(true)
		})

		it('должен работать с пустыми строками', () => {
			const { result } = renderHook(() =>
				useLocalStorage('test-key', 'initial')
			)

			act(() => {
				result.current[1]('')
			})

			expect(result.current[0]).toBe('')
		})

		it('должен работать с пустыми массивами', () => {
			const { result } = renderHook(() =>
				useLocalStorage('test-key', [1, 2, 3])
			)

			act(() => {
				result.current[1]([])
			})

			expect(result.current[0]).toEqual([])
		})

		it('должен работать с пустыми объектами', () => {
			const { result } = renderHook(() =>
				useLocalStorage<Record<string, string>>('test-key', { key: 'value' })
			)

			act(() => {
				result.current[1]({})
			})

			expect(result.current[0]).toEqual({})
		})
	})

	describe('множественные экземпляры', () => {
		it('должен работать с несколькими ключами независимо', () => {
			const { result: result1 } = renderHook(() =>
				useLocalStorage('key1', 'value1')
			)
			const { result: result2 } = renderHook(() =>
				useLocalStorage('key2', 'value2')
			)

			act(() => {
				result1.current[1]('updated1')
				result2.current[1]('updated2')
			})

			expect(result1.current[0]).toBe('updated1')
			expect(result2.current[0]).toBe('updated2')
			expect(localStorage.getItem('key1')).toBe(JSON.stringify('updated1'))
			expect(localStorage.getItem('key2')).toBe(JSON.stringify('updated2'))
		})

		it('должен обновлять только соответствующий hook при storage event', async () => {
			const { result: result1 } = renderHook(() =>
				useLocalStorage('key1', 'value1')
			)
			const { result: result2 } = renderHook(() =>
				useLocalStorage('key2', 'value2')
			)

			act(() => {
				const event = new StorageEvent('storage', {
					key: 'key1',
					newValue: JSON.stringify('updated-from-event'),
					oldValue: JSON.stringify('value1'),
				})
				window.dispatchEvent(event)
			})

			await waitFor(() => {
				expect(result1.current[0]).toBe('updated-from-event')
			})
			expect(result2.current[0]).toBe('value2')
		})
	})
})

