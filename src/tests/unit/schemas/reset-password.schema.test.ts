import { describe, expect, it } from 'vitest'
import { z } from 'zod'

// Схема из ResetPasswordForm.tsx
const resetPasswordSchema = z
	.object({
		password: z
			.string()
			.min(6, 'Пароль должен быть не менее 6 символов')
			.max(100, 'Пароль слишком длинный'),
		confirmPassword: z.string().min(1, 'Подтвердите пароль'),
	})
	.refine(data => data.password === data.confirmPassword, {
		message: 'Пароли не совпадают',
		path: ['confirmPassword'],
	})

describe('resetPasswordSchema', () => {
	const validResetPassword = {
		password: 'password123',
		confirmPassword: 'password123',
	}

	it('должен валидировать корректный сброс пароля', () => {
		const result = resetPasswordSchema.safeParse(validResetPassword)
		expect(result.success).toBe(true)
	})

	it('должен отклонять пароль короче 6 символов', () => {
		const invalidResetPassword = {
			password: '12345',
			confirmPassword: '12345',
		}
		const result = resetPasswordSchema.safeParse(invalidResetPassword)
		expect(result.success).toBe(false)
	})

	it('должен валидировать пароль ровно 6 символов', () => {
		const resetPassword = {
			password: '123456',
			confirmPassword: '123456',
		}
		const result = resetPasswordSchema.safeParse(resetPassword)
		expect(result.success).toBe(true)
	})

	it('должен валидировать пароль 100 символов', () => {
		const longPassword = 'a'.repeat(100)
		const resetPassword = {
			password: longPassword,
			confirmPassword: longPassword,
		}
		const result = resetPasswordSchema.safeParse(resetPassword)
		expect(result.success).toBe(true)
	})

	it('должен отклонять пароль длиннее 100 символов', () => {
		const longPassword = 'a'.repeat(101)
		const invalidResetPassword = {
			password: longPassword,
			confirmPassword: longPassword,
		}
		const result = resetPasswordSchema.safeParse(invalidResetPassword)
		expect(result.success).toBe(false)
	})

	it('должен отклонять сброс пароля без пароля', () => {
		const invalidResetPassword = {
			password: '',
			confirmPassword: '',
		}
		const result = resetPasswordSchema.safeParse(invalidResetPassword)
		expect(result.success).toBe(false)
	})

	it('должен отклонять сброс пароля без подтверждения пароля', () => {
		const invalidResetPassword = {
			password: 'password123',
			confirmPassword: '',
		}
		const result = resetPasswordSchema.safeParse(invalidResetPassword)
		expect(result.success).toBe(false)
	})

	it('должен отклонять несовпадающие пароли', () => {
		const invalidResetPassword = {
			password: 'password123',
			confirmPassword: 'password456',
		}
		const result = resetPasswordSchema.safeParse(invalidResetPassword)
		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.issues[0].path).toContain('confirmPassword')
			expect(result.error.issues[0].message).toBe('Пароли не совпадают')
		}
	})

	it('должен валидировать совпадающие пароли', () => {
		const resetPassword = {
			password: 'password123',
			confirmPassword: 'password123',
		}
		const result = resetPasswordSchema.safeParse(resetPassword)
		expect(result.success).toBe(true)
	})

	it('должен валидировать пароль с разными символами', () => {
		const resetPassword = {
			password: 'P@ssw0rd!',
			confirmPassword: 'P@ssw0rd!',
		}
		const result = resetPasswordSchema.safeParse(resetPassword)
		expect(result.success).toBe(true)
	})

	it('должен валидировать пароль только из цифр (6+ символов)', () => {
		const resetPassword = {
			password: '123456',
			confirmPassword: '123456',
		}
		const result = resetPasswordSchema.safeParse(resetPassword)
		expect(result.success).toBe(true)
	})

	it('должен валидировать пароль только из букв (6+ символов)', () => {
		const resetPassword = {
			password: 'abcdef',
			confirmPassword: 'abcdef',
		}
		const result = resetPasswordSchema.safeParse(resetPassword)
		expect(result.success).toBe(true)
	})

	it('должен валидировать пароль с пробелами (6+ символов)', () => {
		const resetPassword = {
			password: 'pass word',
			confirmPassword: 'pass word',
		}
		const result = resetPasswordSchema.safeParse(resetPassword)
		expect(result.success).toBe(true)
	})

	it('должен отклонять несовпадающие пароли с разной длиной', () => {
		const invalidResetPassword = {
			password: 'password123',
			confirmPassword: 'password',
		}
		const result = resetPasswordSchema.safeParse(invalidResetPassword)
		expect(result.success).toBe(false)
	})

	it('должен отклонять несовпадающие пароли с разным регистром', () => {
		const invalidResetPassword = {
			password: 'Password123',
			confirmPassword: 'password123',
		}
		const result = resetPasswordSchema.safeParse(invalidResetPassword)
		expect(result.success).toBe(false)
	})

	it('должен валидировать минимальный пароль (6 символов)', () => {
		const resetPassword = {
			password: '123456',
			confirmPassword: '123456',
		}
		const result = resetPasswordSchema.safeParse(resetPassword)
		expect(result.success).toBe(true)
	})

	it('должен валидировать максимальный пароль (100 символов)', () => {
		const longPassword = 'a'.repeat(100)
		const resetPassword = {
			password: longPassword,
			confirmPassword: longPassword,
		}
		const result = resetPasswordSchema.safeParse(resetPassword)
		expect(result.success).toBe(true)
	})

	it('должен отклонять пароль 5 символов', () => {
		const invalidResetPassword = {
			password: '12345',
			confirmPassword: '12345',
		}
		const result = resetPasswordSchema.safeParse(invalidResetPassword)
		expect(result.success).toBe(false)
	})

	it('должен отклонять пароль 101 символ', () => {
		const longPassword = 'a'.repeat(101)
		const invalidResetPassword = {
			password: longPassword,
			confirmPassword: longPassword,
		}
		const result = resetPasswordSchema.safeParse(invalidResetPassword)
		expect(result.success).toBe(false)
	})

	it('должен валидировать пароль с кириллицей (6+ символов)', () => {
		const resetPassword = {
			password: 'пароль123',
			confirmPassword: 'пароль123',
		}
		const result = resetPasswordSchema.safeParse(resetPassword)
		expect(result.success).toBe(true)
	})

	it('должен валидировать пароль со специальными символами', () => {
		const resetPassword = {
			password: '!@#$%^&*()',
			confirmPassword: '!@#$%^&*()',
		}
		const result = resetPasswordSchema.safeParse(resetPassword)
		expect(result.success).toBe(true)
	})
})

