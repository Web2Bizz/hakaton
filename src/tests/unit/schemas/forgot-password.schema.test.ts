import { describe, expect, it } from 'vitest'
import { z } from 'zod'

// Схема из ForgotPasswordForm.tsx
const forgotPasswordSchema = z.object({
	email: z.string().email('Введите корректный email адрес'),
})

describe('forgotPasswordSchema', () => {
	const validForgotPassword = {
		email: 'user@example.com',
	}

	it('должен валидировать корректный email', () => {
		const result = forgotPasswordSchema.safeParse(validForgotPassword)
		expect(result.success).toBe(true)
	})

	it('должен отклонять пустой email', () => {
		const invalidForgotPassword = {
			email: '',
		}
		const result = forgotPasswordSchema.safeParse(invalidForgotPassword)
		expect(result.success).toBe(false)
	})

	it('должен отклонять некорректный email', () => {
		const invalidForgotPassword = {
			email: 'некорректный email',
		}
		const result = forgotPasswordSchema.safeParse(invalidForgotPassword)
		expect(result.success).toBe(false)
	})

	it('должен отклонять email без @', () => {
		const invalidForgotPassword = {
			email: 'email.example.com',
		}
		const result = forgotPasswordSchema.safeParse(invalidForgotPassword)
		expect(result.success).toBe(false)
	})

	it('должен отклонять email без домена', () => {
		const invalidForgotPassword = {
			email: 'email@',
		}
		const result = forgotPasswordSchema.safeParse(invalidForgotPassword)
		expect(result.success).toBe(false)
	})

	it('должен отклонять email без локальной части', () => {
		const invalidForgotPassword = {
			email: '@example.com',
		}
		const result = forgotPasswordSchema.safeParse(invalidForgotPassword)
		expect(result.success).toBe(false)
	})

	it('должен валидировать корректные email адреса', () => {
		const validEmails = [
			'user@example.com',
			'test.email@example.co.uk',
			'user+tag@example.com',
			'user_name@example-domain.com',
			'very.long.email.address@example-domain.com',
			'u@e.com',
		]

		validEmails.forEach(email => {
			const forgotPassword = {
				email,
			}
			const result = forgotPasswordSchema.safeParse(forgotPassword)
			expect(result.success).toBe(true)
		})
	})

	it('должен отклонять email с пробелами', () => {
		const invalidForgotPassword = {
			email: 'user @example.com',
		}
		const result = forgotPasswordSchema.safeParse(invalidForgotPassword)
		expect(result.success).toBe(false)
	})

	it('должен отклонять email только с пробелами', () => {
		const invalidForgotPassword = {
			email: '   ',
		}
		const result = forgotPasswordSchema.safeParse(invalidForgotPassword)
		expect(result.success).toBe(false)
	})

	it('должен валидировать email с подчеркиванием', () => {
		const forgotPassword = {
			email: 'user_name@example.com',
		}
		const result = forgotPasswordSchema.safeParse(forgotPassword)
		expect(result.success).toBe(true)
	})

	it('должен валидировать email с дефисом', () => {
		const forgotPassword = {
			email: 'user-name@example-domain.com',
		}
		const result = forgotPasswordSchema.safeParse(forgotPassword)
		expect(result.success).toBe(true)
	})

	it('должен валидировать email с точкой', () => {
		const forgotPassword = {
			email: 'user.name@example.com',
		}
		const result = forgotPasswordSchema.safeParse(forgotPassword)
		expect(result.success).toBe(true)
	})

	it('должен валидировать email с плюсом', () => {
		const forgotPassword = {
			email: 'user+tag@example.com',
		}
		const result = forgotPasswordSchema.safeParse(forgotPassword)
		expect(result.success).toBe(true)
	})

	it('должен валидировать email с цифрами', () => {
		const forgotPassword = {
			email: 'user123@example.com',
		}
		const result = forgotPasswordSchema.safeParse(forgotPassword)
		expect(result.success).toBe(true)
	})

	it('должен валидировать email с поддоменом', () => {
		const forgotPassword = {
			email: 'user@mail.example.com',
		}
		const result = forgotPasswordSchema.safeParse(forgotPassword)
		expect(result.success).toBe(true)
	})
})
