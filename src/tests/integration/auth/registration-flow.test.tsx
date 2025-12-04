/// <reference types="@testing-library/jest-dom" />
import { RegistrationForm } from '@/components/forms/registration'
import { waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockAuthResponse } from '../utils/mocks/fixtures'
import { server } from '../utils/mocks/server'
import { renderWithProviders, userEvent } from '../utils/test-utils'

/**
 * Интеграционный тест для полного цикла регистрации
 *
 * Тестирует:
 * - Рендер формы регистрации
 * - Валидацию полей (включая совпадение паролей)
 * - Отправку формы
 * - Вызов API через RTK Query
 * - Редирект на страницу входа
 * - Обработку ошибок
 */
describe('Registration Flow Integration Test', () => {
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

	it('должен успешно выполнить полный цикл регистрации: форма → API → редирект на вход', async () => {
		const user = userEvent.setup()

		// Рендерим форму с провайдерами
		const { getByLabelText, getByRole, getByPlaceholderText } =
			renderWithProviders(<RegistrationForm />)

		// Заполняем форму
		const firstNameInput = getByPlaceholderText('Иван')
		const lastNameInput = getByPlaceholderText('Иванов')
		const middleNameInput = getByPlaceholderText('Иванович')
		const emailInput = getByPlaceholderText('email@example.com')
		const passwordInput = getByLabelText(/^пароль/i)
		const confirmPasswordInput = getByLabelText(/подтвердите пароль/i)
		const submitButton = getByRole('button', { name: /зарегистрироваться/i })

		await user.type(firstNameInput, 'Иван')
		await user.type(lastNameInput, 'Иванов')
		await user.type(middleNameInput, 'Иванович')
		await user.type(emailInput, 'ivan@example.com')
		await user.type(passwordInput, 'password123')
		await user.type(confirmPasswordInput, 'password123')

		// Отправляем форму
		await user.click(submitButton)

		// Ждем завершения всех асинхронных операций
		// Проверяем, что форма была отправлена (редирект происходит через setTimeout в компоненте)
		// Упрощаем проверку - просто ждем, что редирект произошел
		await new Promise(resolve => setTimeout(resolve, 1500))

		// Проверяем, что произошел редирект на /login
		expect(globalThis.location.href).toBe('/login')
	})

	it('должен выполнить полный цикл: регистрация → редирект на вход → вход → сохранение токенов → обновление пользователя → восстановление состояния', async () => {
		const user = userEvent.setup()

		// ШАГ 1: Регистрация
		const { getByLabelText, getByRole, getByPlaceholderText, unmount } =
			renderWithProviders(<RegistrationForm />)

		const firstNameInput = getByPlaceholderText('Иван')
		const lastNameInput = getByPlaceholderText('Иванов')
		const middleNameInput = getByPlaceholderText('Иванович')
		const emailInput = getByPlaceholderText('email@example.com')
		const passwordInput = getByLabelText(/^пароль/i)
		const confirmPasswordInput = getByLabelText(/подтвердите пароль/i)
		const submitButton = getByRole('button', { name: /зарегистрироваться/i })

		await user.type(firstNameInput, 'Иван')
		await user.type(lastNameInput, 'Иванов')
		await user.type(middleNameInput, 'Иванович')
		await user.type(emailInput, 'newuser@example.com')
		await user.type(passwordInput, 'password123')
		await user.type(confirmPasswordInput, 'password123')

		// Отправляем форму регистрации
		await user.click(submitButton)

		// Ждем завершения регистрации и редиректа
		await waitFor(
			() => {
				expect(globalThis.location.href).toBe('/login')
			},
			{ timeout: 2000 }
		)

		// Размонтируем форму регистрации
		unmount()

		// Сбрасываем location.href для следующего теста
		globalThis.location.href = ''

		// ШАГ 2: Вход после регистрации
		const { LoginForm } = await import('@/components/forms/login')
		const { getByLabelText: getLoginLabel, getByRole: getLoginRole } =
			renderWithProviders(<LoginForm />)

		const loginEmailInput = getLoginLabel(/email/i)
		const loginPasswordInput = getLoginLabel(/пароль/i)
		const loginSubmitButton = getLoginRole('button', { name: /войти/i })

		await user.type(loginEmailInput, 'newuser@example.com')
		await user.type(loginPasswordInput, 'password123')

		// Отправляем форму входа
		await user.click(loginSubmitButton)

		// ШАГ 3: Проверяем сохранение токенов
		await waitFor(
			() => {
				expect(localStorage.getItem('authToken')).toBe(
					mockAuthResponse.access_token
				)
				expect(localStorage.getItem('refreshToken')).toBe(
					mockAuthResponse.refresh_token
				)
			},
			{ timeout: 3000 }
		)

		// ШАГ 4: Проверяем обновление пользователя в контексте
		await waitFor(
			() => {
				const savedUser = localStorage.getItem('ecoquest_user')
				expect(savedUser).toBeTruthy()
				if (savedUser) {
					const userData = JSON.parse(savedUser)
					expect(userData.id).toBe(mockAuthResponse.user.id)
					// Проверяем, что пользователь сохранен (имя может отличаться, так как это новый пользователь)
					expect(userData).toHaveProperty('name')
					expect(userData).toHaveProperty('email')
				}
			},
			{ timeout: 2000 }
		)

		// ШАГ 5: Симулируем перезагрузку страницы - проверяем восстановление состояния
		const savedAuthToken = localStorage.getItem('authToken')
		const savedRefreshToken = localStorage.getItem('refreshToken')
		const savedUser = localStorage.getItem('ecoquest_user')

		expect(savedAuthToken).toBe(mockAuthResponse.access_token)
		expect(savedRefreshToken).toBe(mockAuthResponse.refresh_token)
		expect(savedUser).toBeTruthy()

		// Проверяем, что данные пользователя восстановлены корректно
		if (savedUser) {
			const userData = JSON.parse(savedUser)
			expect(userData.id).toBe(mockAuthResponse.user.id)
			// Проверяем, что пользователь восстановлен (имя может отличаться)
			expect(userData).toHaveProperty('name')
			expect(userData).toHaveProperty('email')
			expect(userData.email).toBe(mockAuthResponse.user.email)
		}
	})

	it('должен валидировать совпадение паролей', async () => {
		const user = userEvent.setup()
		const { getByLabelText, getByRole, getByPlaceholderText } =
			renderWithProviders(<RegistrationForm />)

		const firstNameInput = getByPlaceholderText('Иван')
		const lastNameInput = getByPlaceholderText('Иванов')
		const middleNameInput = getByPlaceholderText('Иванович')
		const emailInput = getByPlaceholderText('email@example.com')
		const passwordInput = getByLabelText(/^пароль/i)
		const confirmPasswordInput = getByLabelText(/подтвердите пароль/i)
		const submitButton = getByRole('button', { name: /зарегистрироваться/i })

		// Заполняем форму с несовпадающими паролями
		await user.type(firstNameInput, 'Иван')
		await user.type(lastNameInput, 'Иванов')
		await user.type(middleNameInput, 'Иванович')
		await user.type(emailInput, 'ivan@example.com')
		await user.type(passwordInput, 'password123')
		await user.type(confirmPasswordInput, 'different-password')

		// Пытаемся отправить форму
		await user.click(submitButton)

		// Ждем немного, чтобы валидация сработала
		await new Promise(resolve => setTimeout(resolve, 1000))

		// Проверяем, что форма не отправлена (редирект не произошел)
		// Форма должна остаться видимой
		expect(firstNameInput).toBeInTheDocument()
		expect(globalThis.location.href).toBe('/')
	})

	it('должен отобразить ошибку при неудачной регистрации', async () => {
		// Переопределяем handler для возврата ошибки
		server.use(
			http.post(
				'https://it-hackathon-team05.mephi.ru/api/v1/auth/register',
				() => {
					return HttpResponse.json(
						{ message: 'Email already exists' },
						{ status: 400 }
					)
				}
			)
		)

		const user = userEvent.setup()
		const { getByLabelText, getByRole, getByPlaceholderText } =
			renderWithProviders(<RegistrationForm />)

		const firstNameInput = getByPlaceholderText('Иван')
		const lastNameInput = getByPlaceholderText('Иванов')
		const middleNameInput = getByPlaceholderText('Иванович')
		const emailInput = getByPlaceholderText('email@example.com')
		const passwordInput = getByLabelText(/^пароль/i)
		const confirmPasswordInput = getByLabelText(/подтвердите пароль/i)
		const submitButton = getByRole('button', { name: /зарегистрироваться/i })

		// Заполняем форму
		await user.type(firstNameInput, 'Иван')
		await user.type(lastNameInput, 'Иванов')
		await user.type(middleNameInput, 'Иванович')
		await user.type(emailInput, 'existing@example.com')
		await user.type(passwordInput, 'password123')
		await user.type(confirmPasswordInput, 'password123')

		// Отправляем форму
		await user.click(submitButton)

		// Ждем обработки ошибки
		await waitFor(
			() => {
				// Редирект не должен произойти при ошибке
				// Форма должна остаться видимой
				expect(firstNameInput).toBeInTheDocument()
				expect(globalThis.location.href).toBe('')
			},
			{ timeout: 2000 }
		)
	})

	it('должен валидировать обязательные поля', async () => {
		const user = userEvent.setup()
		const { getByRole } = renderWithProviders(<RegistrationForm />)

		const submitButton = getByRole('button', { name: /зарегистрироваться/i })

		// Пытаемся отправить пустую форму
		await user.click(submitButton)

		// Ждем немного, чтобы валидация сработала
		await new Promise(resolve => setTimeout(resolve, 500))

		// Проверяем, что форма не отправлена
		expect(globalThis.location.href).toBe('')
	})

	it('должен скрыть форму, если пользователь уже авторизован', async () => {
		// Сначала авторизуем пользователя через UserContext
		// UserContext использует ключ 'ecoquest_user' для хранения пользователя
		localStorage.setItem('authToken', mockAuthResponse.access_token)
		localStorage.setItem('refreshToken', mockAuthResponse.refresh_token)
		localStorage.setItem('ecoquest_user', JSON.stringify(mockAuthResponse.user))

		const { queryByPlaceholderText } = renderWithProviders(<RegistrationForm />)

		// Ждем, чтобы useEffect сработал
		await waitFor(
			() => {
				// Форма должна быть скрыта (null) или произошел редирект
				const firstNameInput = queryByPlaceholderText('Иван')
				expect(firstNameInput).toBeNull()
			},
			{ timeout: 2000 }
		)
	})
})
