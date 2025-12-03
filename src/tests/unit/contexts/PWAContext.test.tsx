import { PWAProvider, usePWA } from '@/pwa/PWAContext'
import type { BeforeInstallPromptEvent } from '@/pwa/types/pwa'
import { renderHook, act, waitFor } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest'
import { toast } from 'sonner'

// Мокируем sonner
vi.mock('sonner', () => ({
	toast: {
		warning: vi.fn(),
		success: vi.fn(),
	},
}))

const mockToast = vi.mocked(toast)

describe('PWAContext', () => {
	let originalMatchMedia: typeof window.matchMedia
	let originalNavigator: typeof navigator
	let originalAddEventListener: typeof window.addEventListener
	let originalRemoveEventListener: typeof window.removeEventListener

	beforeEach(() => {
		vi.clearAllMocks()

		// Сохраняем оригинальные методы
		originalMatchMedia = window.matchMedia
		originalNavigator = navigator
		originalAddEventListener = window.addEventListener
		originalRemoveEventListener = window.removeEventListener

		// Мокируем matchMedia
		Object.defineProperty(window, 'matchMedia', {
			writable: true,
			value: vi.fn().mockImplementation((query: string) => ({
				matches: false,
				media: query,
				onchange: null,
				addListener: vi.fn(),
				removeListener: vi.fn(),
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				dispatchEvent: vi.fn(),
			})),
		})

		// Мокируем navigator.onLine
		Object.defineProperty(navigator, 'onLine', {
			writable: true,
			value: true,
			configurable: true,
		})

		// Мокируем addEventListener и removeEventListener для отслеживания вызовов
		const eventListeners: Map<string, EventListener[]> = new Map()

		window.addEventListener = vi.fn((event: string, handler: EventListener) => {
			if (!eventListeners.has(event)) {
				eventListeners.set(event, [])
			}
			eventListeners.get(event)!.push(handler)
		})

		window.removeEventListener = vi.fn(
			(event: string, handler: EventListener) => {
				const handlers = eventListeners.get(event)
				if (handlers) {
					const index = handlers.indexOf(handler)
					if (index > -1) {
						handlers.splice(index, 1)
					}
				}
			}
		)

		// Добавляем метод для симуляции событий
		;(window as any).__simulateEvent = (eventName: string, event: Event) => {
			const handlers = eventListeners.get(eventName) || []
			handlers.forEach(handler => handler(event))
		}
	})

	afterEach(() => {
		// Восстанавливаем оригинальные методы
		window.matchMedia = originalMatchMedia
		Object.defineProperty(navigator, 'onLine', {
			writable: true,
			value: originalNavigator.onLine,
			configurable: true,
		})
		window.addEventListener = originalAddEventListener
		window.removeEventListener = originalRemoveEventListener
		delete (window as any).__simulateEvent
	})

	describe('определение установленного приложения', () => {
		it('должен определять, что приложение установлено, если display-mode: standalone', () => {
			Object.defineProperty(window, 'matchMedia', {
				writable: true,
				value: vi.fn().mockImplementation((query: string) => ({
					matches: query === '(display-mode: standalone)',
					media: query,
					onchange: null,
					addListener: vi.fn(),
					removeListener: vi.fn(),
					addEventListener: vi.fn(),
					removeEventListener: vi.fn(),
					dispatchEvent: vi.fn(),
				})),
			})

			const { result } = renderHook(() => usePWA(), {
				wrapper: ({ children }) => (
					<PWAProvider>{children}</PWAProvider>
				),
			})

			expect(result.current.isInstalled).toBe(true)
		})

		it('должен определять, что приложение не установлено, если display-mode не standalone', () => {
			Object.defineProperty(window, 'matchMedia', {
				writable: true,
				value: vi.fn().mockImplementation((query: string) => ({
					matches: false,
					media: query,
					onchange: null,
					addListener: vi.fn(),
					removeListener: vi.fn(),
					addEventListener: vi.fn(),
					removeEventListener: vi.fn(),
					dispatchEvent: vi.fn(),
				})),
			})

			const { result } = renderHook(() => usePWA(), {
				wrapper: ({ children }) => (
					<PWAProvider>{children}</PWAProvider>
				),
			})

			expect(result.current.isInstalled).toBe(false)
		})

		it('должен устанавливать isInstalled в true при событии appinstalled', () => {
			const { result } = renderHook(() => usePWA(), {
				wrapper: ({ children }) => (
					<PWAProvider>{children}</PWAProvider>
				),
			})

			expect(result.current.isInstalled).toBe(false)

			act(() => {
				const event = new Event('appinstalled')
				;(window as any).__simulateEvent('appinstalled', event)
			})

			expect(result.current.isInstalled).toBe(true)
		})

		it('должен очищать installPrompt при событии appinstalled', () => {
			const { result } = renderHook(() => usePWA(), {
				wrapper: ({ children }) => (
					<PWAProvider>{children}</PWAProvider>
				),
			})

			// Устанавливаем installPrompt
			const mockPrompt = {
				preventDefault: vi.fn(),
				prompt: vi.fn().mockResolvedValue(undefined),
				userChoice: Promise.resolve({ outcome: 'accepted' as const }),
			} as unknown as BeforeInstallPromptEvent

			act(() => {
				result.current.setInstallPrompt(mockPrompt)
			})

			expect(result.current.installPrompt).toBe(mockPrompt)

			// Симулируем установку
			act(() => {
				const event = new Event('appinstalled')
				;(window as any).__simulateEvent('appinstalled', event)
			})

			expect(result.current.isInstalled).toBe(true)
			expect(result.current.installPrompt).toBeNull()
		})

		it('должен регистрировать обработчик события appinstalled', () => {
			renderHook(() => usePWA(), {
				wrapper: ({ children }) => (
					<PWAProvider>{children}</PWAProvider>
				),
			})

			expect(window.addEventListener).toHaveBeenCalledWith(
				'appinstalled',
				expect.any(Function)
			)
		})

		it('должен удалять обработчик события appinstalled при размонтировании', () => {
			const { unmount } = renderHook(() => usePWA(), {
				wrapper: ({ children }) => (
					<PWAProvider>{children}</PWAProvider>
				),
			})

			unmount()

			expect(window.removeEventListener).toHaveBeenCalledWith(
				'appinstalled',
				expect.any(Function)
			)
		})
	})

	describe('отслеживание онлайн/оффлайн статуса', () => {
		it('должен инициализироваться с isOffline = false, если navigator.onLine = true', () => {
			Object.defineProperty(navigator, 'onLine', {
				writable: true,
				value: true,
				configurable: true,
			})

			const { result } = renderHook(() => usePWA(), {
				wrapper: ({ children }) => (
					<PWAProvider>{children}</PWAProvider>
				),
			})

			expect(result.current.isOffline).toBe(false)
		})

		it('должен инициализироваться с isOffline = true, если navigator.onLine = false', () => {
			Object.defineProperty(navigator, 'onLine', {
				writable: true,
				value: false,
				configurable: true,
			})

			const { result } = renderHook(() => usePWA(), {
				wrapper: ({ children }) => (
					<PWAProvider>{children}</PWAProvider>
				),
			})

			expect(result.current.isOffline).toBe(true)
		})

		it('должен устанавливать isOffline в false при событии online', () => {
			Object.defineProperty(navigator, 'onLine', {
				writable: true,
				value: false,
				configurable: true,
			})

			const { result } = renderHook(() => usePWA(), {
				wrapper: ({ children }) => (
					<PWAProvider>{children}</PWAProvider>
				),
			})

			expect(result.current.isOffline).toBe(true)

			Object.defineProperty(navigator, 'onLine', {
				writable: true,
				value: true,
				configurable: true,
			})

			act(() => {
				const event = new Event('online')
				;(window as any).__simulateEvent('online', event)
			})

			expect(result.current.isOffline).toBe(false)
		})

		it('должен устанавливать isOffline в true при событии offline', () => {
			Object.defineProperty(navigator, 'onLine', {
				writable: true,
				value: true,
				configurable: true,
			})

			const { result } = renderHook(() => usePWA(), {
				wrapper: ({ children }) => (
					<PWAProvider>{children}</PWAProvider>
				),
			})

			expect(result.current.isOffline).toBe(false)

			Object.defineProperty(navigator, 'onLine', {
				writable: true,
				value: false,
				configurable: true,
			})

			act(() => {
				const event = new Event('offline')
				;(window as any).__simulateEvent('offline', event)
			})

			expect(result.current.isOffline).toBe(true)
		})

		it('должен регистрировать обработчики событий online и offline', () => {
			renderHook(() => usePWA(), {
				wrapper: ({ children }) => (
					<PWAProvider>{children}</PWAProvider>
				),
			})

			expect(window.addEventListener).toHaveBeenCalledWith(
				'online',
				expect.any(Function)
			)
			expect(window.addEventListener).toHaveBeenCalledWith(
				'offline',
				expect.any(Function)
			)
		})

		it('должен удалять обработчики событий online и offline при размонтировании', () => {
			const { unmount } = renderHook(() => usePWA(), {
				wrapper: ({ children }) => (
					<PWAProvider>{children}</PWAProvider>
				),
			})

			unmount()

			expect(window.removeEventListener).toHaveBeenCalledWith(
				'online',
				expect.any(Function)
			)
			expect(window.removeEventListener).toHaveBeenCalledWith(
				'offline',
				expect.any(Function)
			)
		})
	})

	describe('уведомления об изменении статуса', () => {
		it('должен показывать предупреждение при переходе в офлайн', async () => {
			Object.defineProperty(navigator, 'onLine', {
				writable: true,
				value: true,
				configurable: true,
			})

			const { result } = renderHook(() => usePWA(), {
				wrapper: ({ children }) => (
					<PWAProvider>{children}</PWAProvider>
				),
			})

			Object.defineProperty(navigator, 'onLine', {
				writable: true,
				value: false,
				configurable: true,
			})

			act(() => {
				const event = new Event('offline')
				;(window as any).__simulateEvent('offline', event)
			})

			await waitFor(() => {
				expect(mockToast.warning).toHaveBeenCalledWith(
					'Вы в офлайн-режиме',
					{
						description: 'Некоторые функции могут быть недоступны',
						duration: 5000,
					}
				)
			})
		})

		it('должен показывать успешное уведомление при восстановлении соединения', async () => {
			Object.defineProperty(navigator, 'onLine', {
				writable: true,
				value: false,
				configurable: true,
			})

			const { result } = renderHook(() => usePWA(), {
				wrapper: ({ children }) => (
					<PWAProvider>{children}</PWAProvider>
				),
			})

			// Сначала переходим в офлайн (чтобы установить prevIsOfflineRef)
			act(() => {
				const offlineEvent = new Event('offline')
				;(window as any).__simulateEvent('offline', offlineEvent)
			})

			await waitFor(() => {
				expect(result.current.isOffline).toBe(true)
			})

			Object.defineProperty(navigator, 'onLine', {
				writable: true,
				value: true,
				configurable: true,
			})

			act(() => {
				const onlineEvent = new Event('online')
				;(window as any).__simulateEvent('online', onlineEvent)
			})

			await waitFor(() => {
				expect(mockToast.success).toHaveBeenCalledWith(
					'Соединение восстановлено',
					{
						description: 'Вы снова в сети',
						duration: 3000,
					}
				)
			})
		})

		it('не должен показывать уведомление, если статус не изменился', async () => {
			Object.defineProperty(navigator, 'onLine', {
				writable: true,
				value: true,
				configurable: true,
			})

			const { result } = renderHook(() => usePWA(), {
				wrapper: ({ children }) => (
					<PWAProvider>{children}</PWAProvider>
				),
			})

			// Симулируем событие online, когда уже онлайн
			act(() => {
				const event = new Event('online')
				;(window as any).__simulateEvent('online', event)
			})

			// Не должно быть уведомлений, так как статус не изменился
			await waitFor(() => {
				expect(mockToast.warning).not.toHaveBeenCalled()
				expect(mockToast.success).not.toHaveBeenCalled()
			})
		})

		it('не должен показывать уведомление при первой инициализации', () => {
			Object.defineProperty(navigator, 'onLine', {
				writable: true,
				value: false,
				configurable: true,
			})

			renderHook(() => usePWA(), {
				wrapper: ({ children }) => (
					<PWAProvider>{children}</PWAProvider>
				),
			})

			// Не должно быть уведомлений при инициализации
			expect(mockToast.warning).not.toHaveBeenCalled()
			expect(mockToast.success).not.toHaveBeenCalled()
		})
	})

	describe('обработка beforeinstallprompt', () => {
		it('должен сохранять событие beforeinstallprompt в installPrompt', () => {
			const { result } = renderHook(() => usePWA(), {
				wrapper: ({ children }) => (
					<PWAProvider>{children}</PWAProvider>
				),
			})

			expect(result.current.installPrompt).toBeNull()

			const mockPrompt = {
				preventDefault: vi.fn(),
				prompt: vi.fn().mockResolvedValue(undefined),
				userChoice: Promise.resolve({ outcome: 'accepted' as const }),
			} as unknown as BeforeInstallPromptEvent

			act(() => {
				;(window as any).__simulateEvent('beforeinstallprompt', mockPrompt)
			})

			expect(result.current.installPrompt).toBe(mockPrompt)
		})

		it('должен вызывать preventDefault на событии beforeinstallprompt', () => {
			const { result } = renderHook(() => usePWA(), {
				wrapper: ({ children }) => (
					<PWAProvider>{children}</PWAProvider>
				),
			})

			const mockPrompt = {
				preventDefault: vi.fn(),
				prompt: vi.fn().mockResolvedValue(undefined),
				userChoice: Promise.resolve({ outcome: 'accepted' as const }),
			} as unknown as BeforeInstallPromptEvent

			act(() => {
				;(window as any).__simulateEvent('beforeinstallprompt', mockPrompt)
			})

			expect(mockPrompt.preventDefault).toHaveBeenCalledTimes(1)
		})

		it('должен регистрировать обработчик события beforeinstallprompt', () => {
			renderHook(() => usePWA(), {
				wrapper: ({ children }) => (
					<PWAProvider>{children}</PWAProvider>
				),
			})

			expect(window.addEventListener).toHaveBeenCalledWith(
				'beforeinstallprompt',
				expect.any(Function)
			)
		})

		it('должен удалять обработчик события beforeinstallprompt при размонтировании', () => {
			const { unmount } = renderHook(() => usePWA(), {
				wrapper: ({ children }) => (
					<PWAProvider>{children}</PWAProvider>
				),
			})

			unmount()

			expect(window.removeEventListener).toHaveBeenCalledWith(
				'beforeinstallprompt',
				expect.any(Function)
			)
		})

		it('должен позволять устанавливать installPrompt вручную через setInstallPrompt', () => {
			const { result } = renderHook(() => usePWA(), {
				wrapper: ({ children }) => (
					<PWAProvider>{children}</PWAProvider>
				),
			})

			const mockPrompt = {
				preventDefault: vi.fn(),
				prompt: vi.fn().mockResolvedValue(undefined),
				userChoice: Promise.resolve({ outcome: 'accepted' as const }),
			} as unknown as BeforeInstallPromptEvent

			act(() => {
				result.current.setInstallPrompt(mockPrompt)
			})

			expect(result.current.installPrompt).toBe(mockPrompt)
		})

		it('должен позволять очищать installPrompt через setInstallPrompt(null)', () => {
			const { result } = renderHook(() => usePWA(), {
				wrapper: ({ children }) => (
					<PWAProvider>{children}</PWAProvider>
				),
			})

			const mockPrompt = {
				preventDefault: vi.fn(),
				prompt: vi.fn().mockResolvedValue(undefined),
				userChoice: Promise.resolve({ outcome: 'accepted' as const }),
			} as unknown as BeforeInstallPromptEvent

			act(() => {
				result.current.setInstallPrompt(mockPrompt)
			})

			expect(result.current.installPrompt).toBe(mockPrompt)

			act(() => {
				result.current.setInstallPrompt(null)
			})

			expect(result.current.installPrompt).toBeNull()
		})
	})

	describe('предоставление контекста', () => {
		it('должен предоставлять все необходимые свойства в контексте', () => {
			const { result } = renderHook(() => usePWA(), {
				wrapper: ({ children }) => (
					<PWAProvider>{children}</PWAProvider>
				),
			})

			expect(result.current).toHaveProperty('isInstalled')
			expect(result.current).toHaveProperty('isOffline')
			expect(result.current).toHaveProperty('registration')
			expect(result.current).toHaveProperty('installPrompt')
			expect(result.current).toHaveProperty('setInstallPrompt')
			expect(typeof result.current.setInstallPrompt).toBe('function')
		})

		it('должен предоставлять registration как null', () => {
			const { result } = renderHook(() => usePWA(), {
				wrapper: ({ children }) => (
					<PWAProvider>{children}</PWAProvider>
				),
			})

			expect(result.current.registration).toBeNull()
		})

		it('должен выбрасывать ошибку, если используется вне PWAProvider', () => {
			expect(() => {
				renderHook(() => usePWA())
			}).toThrow('usePWA must be used within a PWAProvider')
		})

		it('должен работать с несколькими потребителями контекста', () => {
			const wrapper = ({ children }: { children: React.ReactNode }) => (
				<PWAProvider>{children}</PWAProvider>
			)

			const { result: result1 } = renderHook(() => usePWA(), {
				wrapper,
			})

			const { result: result2 } = renderHook(() => usePWA(), {
				wrapper,
			})

			// Оба должны видеть одно и то же состояние
			expect(result1.current.isInstalled).toBe(result2.current.isInstalled)
			expect(result1.current.isOffline).toBe(result2.current.isOffline)
			expect(result1.current.installPrompt).toBe(result2.current.installPrompt)
		})
	})

	describe('граничные случаи', () => {
		it('должен корректно обрабатывать множественные события online/offline', async () => {
			Object.defineProperty(navigator, 'onLine', {
				writable: true,
				value: true,
				configurable: true,
			})

			const { result } = renderHook(() => usePWA(), {
				wrapper: ({ children }) => (
					<PWAProvider>{children}</PWAProvider>
				),
			})

			// Переходим в офлайн
			Object.defineProperty(navigator, 'onLine', {
				writable: true,
				value: false,
				configurable: true,
			})

			act(() => {
				const event = new Event('offline')
				;(window as any).__simulateEvent('offline', event)
			})

			expect(result.current.isOffline).toBe(true)

			// Возвращаемся онлайн
			Object.defineProperty(navigator, 'onLine', {
				writable: true,
				value: true,
				configurable: true,
			})

			act(() => {
				const event = new Event('online')
				;(window as any).__simulateEvent('online', event)
			})

			expect(result.current.isOffline).toBe(false)

			// Снова переходим в офлайн
			Object.defineProperty(navigator, 'onLine', {
				writable: true,
				value: false,
				configurable: true,
			})

			act(() => {
				const event = new Event('offline')
				;(window as any).__simulateEvent('offline', event)
			})

			expect(result.current.isOffline).toBe(true)
		})

		it('должен корректно обрабатывать множественные события beforeinstallprompt', () => {
			const { result } = renderHook(() => usePWA(), {
				wrapper: ({ children }) => (
					<PWAProvider>{children}</PWAProvider>
				),
			})

			const mockPrompt1 = {
				preventDefault: vi.fn(),
				prompt: vi.fn().mockResolvedValue(undefined),
				userChoice: Promise.resolve({ outcome: 'accepted' as const }),
			} as unknown as BeforeInstallPromptEvent

			act(() => {
				;(window as any).__simulateEvent('beforeinstallprompt', mockPrompt1)
			})

			expect(result.current.installPrompt).toBe(mockPrompt1)

			const mockPrompt2 = {
				preventDefault: vi.fn(),
				prompt: vi.fn().mockResolvedValue(undefined),
				userChoice: Promise.resolve({ outcome: 'dismissed' as const }),
			} as unknown as BeforeInstallPromptEvent

			act(() => {
				;(window as any).__simulateEvent('beforeinstallprompt', mockPrompt2)
			})

			expect(result.current.installPrompt).toBe(mockPrompt2)
		})

		it('должен корректно обрабатывать размонтирование и повторное монтирование', () => {
			const { result, unmount, rerender } = renderHook(() => usePWA(), {
				wrapper: ({ children }) => (
					<PWAProvider>{children}</PWAProvider>
				),
			})

			const mockPrompt = {
				preventDefault: vi.fn(),
				prompt: vi.fn().mockResolvedValue(undefined),
				userChoice: Promise.resolve({ outcome: 'accepted' as const }),
			} as unknown as BeforeInstallPromptEvent

			act(() => {
				result.current.setInstallPrompt(mockPrompt)
			})

			expect(result.current.installPrompt).toBe(mockPrompt)

			unmount()

			// Повторное монтирование
			const { result: result2 } = renderHook(() => usePWA(), {
				wrapper: ({ children }) => (
					<PWAProvider>{children}</PWAProvider>
				),
			})

			// Состояние должно быть сброшено
			expect(result2.current.installPrompt).toBeNull()
		})
	})
})

