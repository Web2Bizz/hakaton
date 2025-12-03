import { describe, expect, it } from 'vitest'
import { z } from 'zod'

// Схема из RegistrationForm.tsx
const registrationSchema = z
	.object({
		firstName: z.string().min(1, 'Имя обязательно для заполнения'),
		lastName: z.string().min(1, 'Фамилия обязательна для заполнения'),
		middleName: z.string().min(1, 'Отчество обязательно для заполнения'),
		email: z
			.string()
			.min(1, 'Email обязателен для заполнения')
			.email('Введите корректный email адрес'),
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

describe('registrationSchema', () => {
	const validRegistration = {
		firstName: 'Иван',
		lastName: 'Иванов',
		middleName: 'Иванович',
		email: 'ivan@example.com',
		password: 'password123',
		confirmPassword: 'password123',
	}

	it('должен валидировать корректную регистрацию', () => {
		const result = registrationSchema.safeParse(validRegistration)
		expect(result.success).toBe(true)
	})

	it('должен отклонять регистрацию без имени', () => {
		const invalidRegistration = {
			...validRegistration,
			firstName: '',
		}
		const result = registrationSchema.safeParse(invalidRegistration)
		expect(result.success).toBe(false)
	})

	it('должен отклонять регистрацию без фамилии', () => {
		const invalidRegistration = {
			...validRegistration,
			lastName: '',
		}
		const result = registrationSchema.safeParse(invalidRegistration)
		expect(result.success).toBe(false)
	})

	it('должен отклонять регистрацию без отчества', () => {
		const invalidRegistration = {
			...validRegistration,
			middleName: '',
		}
		const result = registrationSchema.safeParse(invalidRegistration)
		expect(result.success).toBe(false)
	})

	it('должен валидировать имя с одним символом', () => {
		const registration = {
			...validRegistration,
			firstName: 'И',
		}
		const result = registrationSchema.safeParse(registration)
		expect(result.success).toBe(true)
	})

	it('должен валидировать длинное имя', () => {
		const registration = {
			...validRegistration,
			firstName: 'Очень длинное имя пользователя',
		}
		const result = registrationSchema.safeParse(registration)
		expect(result.success).toBe(true)
	})

	it('должен отклонять регистрацию без email', () => {
		const invalidRegistration = {
			...validRegistration,
			email: '',
		}
		const result = registrationSchema.safeParse(invalidRegistration)
		expect(result.success).toBe(false)
	})

	it('должен отклонять некорректный email', () => {
		const invalidRegistration = {
			...validRegistration,
			email: 'некорректный email',
		}
		const result = registrationSchema.safeParse(invalidRegistration)
		expect(result.success).toBe(false)
	})

	it('должен отклонять email без @', () => {
		const invalidRegistration = {
			...validRegistration,
			email: 'email.example.com',
		}
		const result = registrationSchema.safeParse(invalidRegistration)
		expect(result.success).toBe(false)
	})

	it('должен отклонять email без домена', () => {
		const invalidRegistration = {
			...validRegistration,
			email: 'email@',
		}
		const result = registrationSchema.safeParse(invalidRegistration)
		expect(result.success).toBe(false)
	})

	it('должен отклонять email без локальной части', () => {
		const invalidRegistration = {
			...validRegistration,
			email: '@example.com',
		}
		const result = registrationSchema.safeParse(invalidRegistration)
		expect(result.success).toBe(false)
	})

	it('должен валидировать корректный email', () => {
		const validEmails = [
			'user@example.com',
			'test.email@example.co.uk',
			'user+tag@example.com',
			'user_name@example-domain.com',
		]

		validEmails.forEach(email => {
			const registration = {
				...validRegistration,
				email,
			}
			const result = registrationSchema.safeParse(registration)
			expect(result.success).toBe(true)
		})
	})

	it('должен отклонять пароль короче 6 символов', () => {
		const invalidRegistration = {
			...validRegistration,
			password: '12345',
			confirmPassword: '12345',
		}
		const result = registrationSchema.safeParse(invalidRegistration)
		expect(result.success).toBe(false)
	})

	it('должен валидировать пароль ровно 6 символов', () => {
		const registration = {
			...validRegistration,
			password: '123456',
			confirmPassword: '123456',
		}
		const result = registrationSchema.safeParse(registration)
		expect(result.success).toBe(true)
	})

	it('должен валидировать пароль 100 символов', () => {
		const longPassword = 'a'.repeat(100)
		const registration = {
			...validRegistration,
			password: longPassword,
			confirmPassword: longPassword,
		}
		const result = registrationSchema.safeParse(registration)
		expect(result.success).toBe(true)
	})

	it('должен отклонять пароль длиннее 100 символов', () => {
		const longPassword = 'a'.repeat(101)
		const invalidRegistration = {
			...validRegistration,
			password: longPassword,
			confirmPassword: longPassword,
		}
		const result = registrationSchema.safeParse(invalidRegistration)
		expect(result.success).toBe(false)
	})

	it('должен отклонять регистрацию без пароля', () => {
		const invalidRegistration = {
			...validRegistration,
			password: '',
			confirmPassword: '',
		}
		const result = registrationSchema.safeParse(invalidRegistration)
		expect(result.success).toBe(false)
	})

	it('должен отклонять регистрацию без подтверждения пароля', () => {
		const invalidRegistration = {
			...validRegistration,
			confirmPassword: '',
		}
		const result = registrationSchema.safeParse(invalidRegistration)
		expect(result.success).toBe(false)
	})

	it('должен отклонять несовпадающие пароли', () => {
		const invalidRegistration = {
			...validRegistration,
			password: 'password123',
			confirmPassword: 'password456',
		}
		const result = registrationSchema.safeParse(invalidRegistration)
		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.issues[0].path).toContain('confirmPassword')
			expect(result.error.issues[0].message).toBe('Пароли не совпадают')
		}
	})

	it('должен валидировать совпадающие пароли', () => {
		const registration = {
			...validRegistration,
			password: 'password123',
			confirmPassword: 'password123',
		}
		const result = registrationSchema.safeParse(registration)
		expect(result.success).toBe(true)
	})

	it('должен валидировать пароль с разными символами', () => {
		const registration = {
			...validRegistration,
			password: 'P@ssw0rd!',
			confirmPassword: 'P@ssw0rd!',
		}
		const result = registrationSchema.safeParse(registration)
		expect(result.success).toBe(true)
	})

	it('должен валидировать пароль только из цифр (6+ символов)', () => {
		const registration = {
			...validRegistration,
			password: '123456',
			confirmPassword: '123456',
		}
		const result = registrationSchema.safeParse(registration)
		expect(result.success).toBe(true)
	})

	it('должен валидировать пароль только из букв (6+ символов)', () => {
		const registration = {
			...validRegistration,
			password: 'abcdef',
			confirmPassword: 'abcdef',
		}
		const result = registrationSchema.safeParse(registration)
		expect(result.success).toBe(true)
	})

	it('должен валидировать пароль с пробелами (6+ символов)', () => {
		const registration = {
			...validRegistration,
			password: 'pass word',
			confirmPassword: 'pass word',
		}
		const result = registrationSchema.safeParse(registration)
		expect(result.success).toBe(true)
	})

	it('должен отклонять несовпадающие пароли с разной длиной', () => {
		const invalidRegistration = {
			...validRegistration,
			password: 'password123',
			confirmPassword: 'password',
		}
		const result = registrationSchema.safeParse(invalidRegistration)
		expect(result.success).toBe(false)
	})

	it('должен отклонять несовпадающие пароли с разным регистром', () => {
		const invalidRegistration = {
			...validRegistration,
			password: 'Password123',
			confirmPassword: 'password123',
		}
		const result = registrationSchema.safeParse(invalidRegistration)
		expect(result.success).toBe(false)
	})

	it('должен валидировать все поля с минимальными значениями', () => {
		const registration = {
			firstName: 'И',
			lastName: 'И',
			middleName: 'И',
			email: 'u@e.com',
			password: '123456',
			confirmPassword: '123456',
		}
		const result = registrationSchema.safeParse(registration)
		expect(result.success).toBe(true)
	})

	it('должен валидировать все поля с максимальными значениями', () => {
		const longPassword = 'a'.repeat(100)
		const registration = {
			firstName: 'Очень длинное имя пользователя',
			lastName: 'Очень длинная фамилия пользователя',
			middleName: 'Очень длинное отчество пользователя',
			email: 'very.long.email.address@example-domain.com',
			password: longPassword,
			confirmPassword: longPassword,
		}
		const result = registrationSchema.safeParse(registration)
		expect(result.success).toBe(true)
	})
})
