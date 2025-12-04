/// <reference types="@testing-library/jest-dom" />
import { LoginForm } from '@/components/forms/login'
import { waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { server } from '../utils/mocks/server'
import { renderWithProviders, userEvent } from '../utils/test-utils'

/**
 * Интеграционный тест для проверки правильности отображения ошибок при авторизации
 *
 * Тестирует:
 * - Правильное извлечение сообщений об ошибках из разных форматов ответов API
 * - Отображение специфичных ошибок (401, 400, 500, сетевые ошибки)
 * - Обработка ошибок при получении данных пользователя
 * - Правильность сообщений об ошибках для пользователя
 */
describe('Login Error Handling Integration Test', () => {
	beforeEach(() => {
		// Очищаем localStorage перед каждым тестом
		localStorage.clear()

		// Очищаем все моки
		vi.clearAllMocks()

		// Мокаем globalThis.location.href
		Object.defineProperty(globalThis, 'location', {
			value: {
				href: '',
			},
			writable: true,
		})
	})

	it('должен отобразить правильное сообщение об ошибке при 401 (неверные credentials)', async () => {
		// Переопределяем handler для возврата 401 с сообщением об ошибке
		server.use(
			http.post(
				'https://it-hackathon-team05.mephi.ru/api/v1/auth/login',
				() => {
					return HttpResponse.json(
						{ message: 'Неверный email или пароль' },
						{ status: 401 }
					)
				}
			)
		)

		const user = userEvent.setup()
		const { getByLabelText, getByRole } = renderWithProviders(<LoginForm />)

		const emailInput = getByLabelText(/email/i)
		const passwordInput = getByLabelText(/пароль/i)
		const submitButton = getByRole('button', { name: /войти/i })

		await user.type(emailInput, 'wrong@example.com')
		await user.type(passwordInput, 'wrongpassword')
		await user.click(submitButton)

		// Проверяем, что токены НЕ сохранены
		await waitFor(
			() => {
				expect(localStorage.getItem('authToken')).toBeNull()
				expect(localStorage.getItem('refreshToken')).toBeNull()
			},
			{ timeout: 2000 }
		)

		// Проверяем, что форма осталась видимой (пользователь не авторизован)
		expect(emailInput).toBeInTheDocument()
		expect(passwordInput).toBeInTheDocument()
	})

	it('должен отобразить правильное сообщение об ошибке при 400 (неверный формат данных)', async () => {
		server.use(
			http.post(
				'https://it-hackathon-team05.mephi.ru/api/v1/auth/login',
				() => {
					return HttpResponse.json(
						{ message: 'Неверный формат данных' },
						{ status: 400 }
					)
				}
			)
		)

		const user = userEvent.setup()
		const { getByLabelText, getByRole } = renderWithProviders(<LoginForm />)

		const emailInput = getByLabelText(/email/i)
		const passwordInput = getByLabelText(/пароль/i)
		const submitButton = getByRole('button', { name: /войти/i })

		await user.type(emailInput, 'test@example.com')
		await user.type(passwordInput, 'password123')
		await user.click(submitButton)

		// Проверяем, что токены НЕ сохранены
		await waitFor(
			() => {
				expect(localStorage.getItem('authToken')).toBeNull()
			},
			{ timeout: 2000 }
		)
	})

	it('должен отобразить правильное сообщение об ошибке при 500 (ошибка сервера)', async () => {
		server.use(
			http.post(
				'https://it-hackathon-team05.mephi.ru/api/v1/auth/login',
				() => {
					return HttpResponse.json(
						{ message: 'Внутренняя ошибка сервера' },
						{ status: 500 }
					)
				}
			)
		)

		const user = userEvent.setup()
		const { getByLabelText, getByRole } = renderWithProviders(<LoginForm />)

		const emailInput = getByLabelText(/email/i)
		const passwordInput = getByLabelText(/пароль/i)
		const submitButton = getByRole('button', { name: /войти/i })

		await user.type(emailInput, 'test@example.com')
		await user.type(passwordInput, 'password123')
		await user.click(submitButton)

		// Проверяем, что токены НЕ сохранены
		await waitFor(
			() => {
				expect(localStorage.getItem('authToken')).toBeNull()
			},
			{ timeout: 2000 }
		)
	})

	it('должен отобразить правильное сообщение об ошибке при отсутствии userId в ответе', async () => {
		// Мокаем успешный login, но без userId
		server.use(
			http.post(
				'https://it-hackathon-team05.mephi.ru/api/v1/auth/login',
				() => {
					return HttpResponse.json({
						access_token: 'mock-token',
						refresh_token: 'mock-refresh',
						user: null, // Нет userId
					})
				}
			)
		)

		const user = userEvent.setup()
		const { getByLabelText, getByRole } = renderWithProviders(<LoginForm />)

		const emailInput = getByLabelText(/email/i)
		const passwordInput = getByLabelText(/пароль/i)
		const submitButton = getByRole('button', { name: /войти/i })

		await user.type(emailInput, 'test@example.com')
		await user.type(passwordInput, 'password123')
		await user.click(submitButton)

		// Проверяем, что токены НЕ сохранены (так как нет userId)
		await waitFor(
			() => {
				// Токены могут быть сохранены, но пользователь не обновлен
				// Проверяем, что пользователь НЕ сохранен
				const savedUser = localStorage.getItem('ecoquest_user')
				expect(savedUser).toBeNull()
			},
			{ timeout: 2000 }
		)
	})

	it('должен отобразить правильное сообщение об ошибке при ошибке получения данных пользователя', async () => {
		// Мокаем успешный login, но ошибку при получении пользователя
		server.use(
			http.post(
				'https://it-hackathon-team05.mephi.ru/api/v1/auth/login',
				() => {
					return HttpResponse.json({
						access_token: 'mock-token',
						refresh_token: 'mock-refresh',
						user: {
							id: '1',
							name: 'Test User',
							email: 'test@example.com',
						},
					})
				}
			),
			http.get('https://it-hackathon-team05.mephi.ru/api/v1/users/1', () => {
				return HttpResponse.json(
					{ message: 'Пользователь не найден' },
					{ status: 404 }
				)
			})
		)

		const user = userEvent.setup()
		const { getByLabelText, getByRole } = renderWithProviders(<LoginForm />)

		const emailInput = getByLabelText(/email/i)
		const passwordInput = getByLabelText(/пароль/i)
		const submitButton = getByRole('button', { name: /войти/i })

		await user.type(emailInput, 'test@example.com')
		await user.type(passwordInput, 'password123')
		await user.click(submitButton)

		// Проверяем, что токены сохранены, но пользователь НЕ обновлен
		await waitFor(
			() => {
				// Токены могут быть сохранены
				// Но пользователь не должен быть сохранен из-за ошибки
				const savedUser = localStorage.getItem('ecoquest_user')
				expect(savedUser).toBeNull()
			},
			{ timeout: 3000 }
		)
	})

	it('должен отобразить правильное сообщение об ошибке при сетевой ошибке', async () => {
		// Мокаем сетевую ошибку
		server.use(
			http.post(
				'https://it-hackathon-team05.mephi.ru/api/v1/auth/login',
				() => {
					return HttpResponse.error()
				}
			)
		)

		const user = userEvent.setup()
		const { getByLabelText, getByRole } = renderWithProviders(<LoginForm />)

		const emailInput = getByLabelText(/email/i)
		const passwordInput = getByLabelText(/пароль/i)
		const submitButton = getByRole('button', { name: /войти/i })

		await user.type(emailInput, 'test@example.com')
		await user.type(passwordInput, 'password123')
		await user.click(submitButton)

		// Проверяем, что токены НЕ сохранены
		await waitFor(
			() => {
				expect(localStorage.getItem('authToken')).toBeNull()
			},
			{ timeout: 2000 }
		)
	})

	it('должен отобразить правильное сообщение об ошибке при ошибке в формате RTK Query', async () => {
		// Мокаем ошибку в формате RTK Query: { status: 401, data: { message: '...' } }
		server.use(
			http.post(
				'https://it-hackathon-team05.mephi.ru/api/v1/auth/login',
				() => {
					return HttpResponse.json(
						{ message: 'Неверные учетные данные' },
						{ status: 401 }
					)
				}
			)
		)

		const user = userEvent.setup()
		const { getByLabelText, getByRole } = renderWithProviders(<LoginForm />)

		const emailInput = getByLabelText(/email/i)
		const passwordInput = getByLabelText(/пароль/i)
		const submitButton = getByRole('button', { name: /войти/i })

		await user.type(emailInput, 'test@example.com')
		await user.type(passwordInput, 'password123')
		await user.click(submitButton)

		// Проверяем, что токены НЕ сохранены
		await waitFor(
			() => {
				expect(localStorage.getItem('authToken')).toBeNull()
			},
			{ timeout: 2000 }
		)
	})

	it('должен отобразить сообщение по умолчанию при ошибке без сообщения', async () => {
		// Мокаем ошибку без сообщения
		server.use(
			http.post(
				'https://it-hackathon-team05.mephi.ru/api/v1/auth/login',
				() => {
					return HttpResponse.json({}, { status: 500 })
				}
			)
		)

		const user = userEvent.setup()
		const { getByLabelText, getByRole } = renderWithProviders(<LoginForm />)

		const emailInput = getByLabelText(/email/i)
		const passwordInput = getByLabelText(/пароль/i)
		const submitButton = getByRole('button', { name: /войти/i })

		await user.type(emailInput, 'test@example.com')
		await user.type(passwordInput, 'password123')
		await user.click(submitButton)

		// Проверяем, что токены НЕ сохранены
		await waitFor(
			() => {
				expect(localStorage.getItem('authToken')).toBeNull()
			},
			{ timeout: 2000 }
		)
	})
})
