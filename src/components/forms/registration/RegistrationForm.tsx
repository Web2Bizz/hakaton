import {
	Button,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
	Spinner,
} from '@/components/ui'
import { useUser } from '@/hooks/useUser'
import { useRegisterMutation } from '@/store/entities'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

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

import { getErrorMessage } from '@/utils'
import { logger } from '@/utils/logger'

const getRegistrationErrorMessage = (error: unknown) => {
	logger.error('Registration error:', error)
	const errorMessage = getErrorMessage(
		error,
		'Ошибка регистрации. Попробуйте еще раз.'
	)
	return toast.error(errorMessage)
}

type RegistrationFormData = z.infer<typeof registrationSchema>

export function RegistrationForm() {
	const { user } = useUser()
	const [registerMutation, { isLoading: isRegistering }] = useRegisterMutation()

	const form = useForm<RegistrationFormData>({
		resolver: zodResolver(registrationSchema),
		defaultValues: {
			firstName: '',
			lastName: '',
			middleName: '',
			email: '',
			password: '',
			confirmPassword: '',
		},
	})

	const isSubmitting = isRegistering

	// Если пользователь уже авторизован, перенаправляем на главную
	useEffect(() => {
		if (user) {
			globalThis.location.href = '/'
		}
	}, [user])

	if (user) {
		return null
	}

	const onSubmit = async (data: RegistrationFormData) => {
		try {
			const result = await registerMutation({
				firstName: data.firstName,
				lastName: data.lastName,
				middleName: data.middleName,
				email: data.email,
				password: data.password,
				confirmPassword: data.confirmPassword,
			})

			if (result.error) {
				getRegistrationErrorMessage(result.error)
				return
			}

			// Показываем сообщение об успехе
			toast.success('🎉 Регистрация успешна!', {
				description: `Аккаунт создан. Теперь войдите в систему.`,
				duration: 4000,
			})

			// Перенаправляем на страницу входа
			setTimeout(() => {
				globalThis.location.href = '/login'
			}, 1000)
		} catch (error: unknown) {
			const errorMessage = getErrorMessage(
				error,
				'Не удалось зарегистрироваться. Попробуйте еще раз.'
			)
			toast.error(errorMessage)
		}
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center py-12 px-4'>
			<div className='max-w-md w-full'>
				<div className='bg-white rounded-2xl shadow-xl p-8'>
					<div className='text-center mb-8'>
						<h1 className='text-3xl font-bold text-slate-900 mb-2'>
							Регистрация
						</h1>
						<p className='text-slate-600'>Создайте новый аккаунт</p>
					</div>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
							<FormField
								control={form.control}
								name='firstName'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Имя *</FormLabel>
										<FormControl>
											<Input type='text' placeholder='Иван' {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='lastName'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Фамилия *</FormLabel>
										<FormControl>
											<Input type='text' placeholder='Иванов' {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='middleName'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Отчество *</FormLabel>
										<FormControl>
											<Input type='text' placeholder='Иванович' {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='email'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email *</FormLabel>
										<FormControl>
											<Input
												type='email'
												placeholder='email@example.com'
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='password'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Пароль *</FormLabel>
										<FormControl>
											<Input
												type='password'
												placeholder='••••••••'
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='confirmPassword'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Подтвердите пароль *</FormLabel>
										<FormControl>
											<Input
												type='password'
												placeholder='••••••••'
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button type='submit' disabled={isSubmitting} className='w-full'>
								{isSubmitting ? (
									<div className='flex items-center gap-2'>
										<Spinner />
										<span>Регистрация...</span>
									</div>
								) : (
									<span>Зарегистрироваться</span>
								)}
							</Button>
						</form>
					</Form>

					<div className='mt-6 text-center'>
						<Link
							to='/login'
							className='text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer'
						>
							Уже есть аккаунт? Войдите
						</Link>
					</div>
				</div>
			</div>
		</div>
	)
}
