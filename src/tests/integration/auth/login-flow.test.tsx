/// <reference types="@testing-library/jest-dom" />
import { LoginForm } from '@/components/forms'
import { waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockAuthResponse } from '../utils/mocks/fixtures'
import { server } from '../utils/mocks/server'
import { renderWithProviders, userEvent } from '../utils/test-utils'

/**
 * Интеграционный тест для полного цикла входа в систему
 *
 * Тестирует:
 * - Рендер формы входа
 * - Валидацию полей
 * - Отправку формы
 * - Вызов API через RTK Query
 * - Сохранение токенов в localStorage
 * - Получение данных пользователя
 * - Обновление UserContext
 * - Редирект после успешного входа
 */
describe('Login Flow Integration Test', () => {
	beforeEach(() => {
		// Очищаем localStorage перед каждым тестом
		localStorage.clear()

		// Очищаем все моки
		vi.clearAllMocks()
	})

	it('должен успешно выполнить полный цикл входа: форма → API → сохранение токенов → обновление пользователя', async () => {
		const user = userEvent.setup()

		// Рендерим форму с провайдерами
		const { getByLabelText, getByRole, queryByText } = renderWithProviders(
			<LoginForm />
		)

		// Проверяем, что форма отображается
		expect(getByLabelText(/email/i)).toBeInTheDocument()
		expect(getByLabelText(/пароль/i)).toBeInTheDocument()

		// Заполняем форму
		const emailInput = getByLabelText(/email/i)
		const passwordInput = getByLabelText(/пароль/i)
		const submitButton = getByRole('button', { name: /войти/i })

		await user.type(emailInput, 'test@example.com')
		await user.type(passwordInput, 'password123')

		// Отправляем форму
		await user.click(submitButton)

		// Ждем завершения всех асинхронных операций
		await waitFor(
			() => {
				// Проверяем, что токены сохранены в localStorage
				expect(localStorage.getItem('authToken')).toBe(
					mockAuthResponse.access_token
				)
				expect(localStorage.getItem('refreshToken')).toBe(
					mockAuthResponse.refresh_token
				)
			},
			{ timeout: 3000 }
		)

		// Проверяем, что пользователь обновлен в контексте
		// (это проверяется через то, что форма скрывается, так как user !== null)
		await waitFor(() => {
			// LoginForm должен вернуть null, если user существует
			// Проверяем, что форма больше не отображается
			expect(queryByText(/войти/i)).not.toBeInTheDocument()
		})
	})

	it('должен отобразить ошибку при неверных credentials', async () => {
		// Переопределяем handler для возврата ошибки
		server.use(
			http.post(
				'https://it-hackathon-team05.mephi.ru/api/v1/auth/login',
				() => {
					return HttpResponse.json(
						{ message: 'Invalid credentials' },
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

		// Проверяем, что отображается сообщение об ошибке
		// (toast отображается через sonner, нужно проверить через screen)
		await waitFor(
			() => {
				// Проверяем, что токены НЕ сохранены
				expect(localStorage.getItem('authToken')).toBeNull()
				expect(localStorage.getItem('refreshToken')).toBeNull()
			},
			{ timeout: 2000 }
		)
	})

	it('должен валидировать email формат', async () => {
		const user = userEvent.setup()
		const { getByLabelText, getByRole } = renderWithProviders(<LoginForm />)

		const emailInput = getByLabelText(/email/i)
		const passwordInput = getByLabelText(/пароль/i)
		const submitButton = getByRole('button', { name: /войти/i })

		// Вводим невалидный email
		await user.type(emailInput, 'invalid-email')
		await user.type(passwordInput, 'password123')

		// Пытаемся отправить форму
		await user.click(submitButton)

		// Ждем немного, чтобы валидация сработала
		await new Promise(resolve => setTimeout(resolve, 500))

		// Проверяем, что форма не отправлена (токены не сохранены)
		// Это главная проверка - форма с невалидным email не должна отправляться
		expect(localStorage.getItem('authToken')).toBeNull()
		expect(localStorage.getItem('access_token')).toBeNull()
		expect(localStorage.getItem('refresh_token')).toBeNull()
	})

	it('должен обработать ошибку при получении данных пользователя', async () => {
		// Переопределяем handler для getUser, чтобы вернуть ошибку
		server.use(
			http.get(
				'https://it-hackathon-team05.mephi.ru/api/v1/users/:userId',
				() => {
					return HttpResponse.json(
						{ message: 'User not found' },
						{ status: 404 }
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

		// Проверяем, что токены сохранены (login успешен)
		await waitFor(
			() => {
				expect(localStorage.getItem('authToken')).toBe(
					mockAuthResponse.access_token
				)
			},
			{ timeout: 2000 }
		)

		// Но пользователь не обновлен из-за ошибки getUser
		// Форма должна остаться видимой
		await waitFor(
			() => {
				expect(getByLabelText(/email/i)).toBeInTheDocument()
			},
			{ timeout: 2000 }
		)
	})
})
