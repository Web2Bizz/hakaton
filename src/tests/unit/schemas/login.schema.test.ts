import { describe, expect, it } from 'vitest'
import { z } from 'zod'

// Схема из LoginForm.tsx
const loginSchema = z.object({
	email: z.string().email('Введите корректный email адрес'),
	password: z.string().min(1, 'Пароль обязателен для заполнения'),
})

describe('loginSchema', () => {
	const validLogin = {
		email: 'user@example.com',
		password: 'password123',
	}

	it('должен валидировать корректный вход', () => {
		const result = loginSchema.safeParse(validLogin)
		expect(result.success).toBe(true)
	})

	it('должен отклонять вход без email', () => {
		const invalidLogin = {
			...validLogin,
			email: '',
		}
		const result = loginSchema.safeParse(invalidLogin)
		expect(result.success).toBe(false)
	})

	it('должен отклонять некорректный email', () => {
		const invalidLogin = {
			...validLogin,
			email: 'некорректный email',
		}
		const result = loginSchema.safeParse(invalidLogin)
		expect(result.success).toBe(false)
	})

	it('должен отклонять email без @', () => {
		const invalidLogin = {
			...validLogin,
			email: 'email.example.com',
		}
		const result = loginSchema.safeParse(invalidLogin)
		expect(result.success).toBe(false)
	})

	it('должен отклонять email без домена', () => {
		const invalidLogin = {
			...validLogin,
			email: 'email@',
		}
		const result = loginSchema.safeParse(invalidLogin)
		expect(result.success).toBe(false)
	})

	it('должен отклонять email без локальной части', () => {
		const invalidLogin = {
			...validLogin,
			email: '@example.com',
		}
		const result = loginSchema.safeParse(invalidLogin)
		expect(result.success).toBe(false)
	})

	it('должен валидировать корректный email', () => {
		const validEmails = [
			'user@example.com',
			'test.email@example.co.uk',
			'user+tag@example.com',
			'user_name@example-domain.com',
			'u@e.com',
		]

		validEmails.forEach(email => {
			const login = {
				...validLogin,
				email,
			}
			const result = loginSchema.safeParse(login)
			expect(result.success).toBe(true)
		})
	})

	it('должен отклонять вход без пароля', () => {
		const invalidLogin = {
			...validLogin,
			password: '',
		}
		const result = loginSchema.safeParse(invalidLogin)
		expect(result.success).toBe(false)
	})

	it('должен валидировать пароль с одним символом', () => {
		const login = {
			...validLogin,
			password: '1',
		}
		const result = loginSchema.safeParse(login)
		expect(result.success).toBe(true)
	})

	it('должен валидировать длинный пароль', () => {
		const login = {
			...validLogin,
			password: 'a'.repeat(1000),
		}
		const result = loginSchema.safeParse(login)
		expect(result.success).toBe(true)
	})

	it('должен валидировать пароль с пробелами', () => {
		const login = {
			...validLogin,
			password: 'password with spaces',
		}
		const result = loginSchema.safeParse(login)
		expect(result.success).toBe(true)
	})

	it('должен валидировать пароль только из цифр', () => {
		const login = {
			...validLogin,
			password: '123456',
		}
		const result = loginSchema.safeParse(login)
		expect(result.success).toBe(true)
	})

	it('должен валидировать пароль только из букв', () => {
		const login = {
			...validLogin,
			password: 'password',
		}
		const result = loginSchema.safeParse(login)
		expect(result.success).toBe(true)
	})

	it('должен валидировать пароль со специальными символами', () => {
		const login = {
			...validLogin,
			password: 'P@ssw0rd!',
		}
		const result = loginSchema.safeParse(login)
		expect(result.success).toBe(true)
	})

	it('должен валидировать минимальные значения', () => {
		const login = {
			email: 'u@e.com',
			password: '1',
		}
		const result = loginSchema.safeParse(login)
		expect(result.success).toBe(true)
	})

	it('должен валидировать максимальные значения', () => {
		const login = {
			email: 'very.long.email.address@example-domain.com',
			password: 'a'.repeat(1000),
		}
		const result = loginSchema.safeParse(login)
		expect(result.success).toBe(true)
	})
})
