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
import { useLazyGetUserQuery, useLoginMutation } from '@/store/entities'
import { saveToken, transformUserFromAPI } from '@/utils/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const loginSchema = z.object({
	email: z.string().email('Введите корректный email адрес'),
	password: z.string().min(1, 'Пароль обязателен для заполнения'),
})

const getErrorMessage = (error: unknown) => {
	if (import.meta.env.DEV) {
		console.error('Login error:', error)
	}

	const errorMessage =
		(error as { data?: { message?: string } })?.data?.message ||
		(error as { message?: string })?.message ||
		'Ошибка входа. Попробуйте еще раз.'

	toast.error(errorMessage)
}

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
	const { user, setUser } = useUser()
	const [loginMutation, { isLoading: isLoggingIn }] = useLoginMutation()
	const [getUser, { isLoading: isFetchingUser }] = useLazyGetUserQuery()
	const [showPassword, setShowPassword] = useState(false)

	const form = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	})

	const isSubmitting = isLoggingIn || isFetchingUser

	// Если пользователь уже авторизован, перенаправляем на главную
	useEffect(() => {
		if (user) {
			globalThis.location.href = '/'
		}
	}, [user])

	if (user) {
		return null
	}

	const onSubmit = async (data: LoginFormData) => {
		try {
			const result = await loginMutation({
				email: data.email,
				password: data.password,
			})

			// Проверяем на ошибки (RTK Query возвращает error для статусов >= 400)
			if (result.error) {
				getErrorMessage(result.error)
				return
			}

			// Проверяем наличие данных
			if (!result.data) {
				toast.error('Ошибка входа. Попробуйте еще раз.')
				return
			}

			// Сохраняем токен
			if (result.data.access_token) {
				saveToken(result.data.access_token)
			}

			// Получаем полные данные пользователя по userId
			const userId = result.data.user?.id
			if (!userId) {
				toast.error('Ошибка получения пользователя')
				return
			}

			const userResult = await getUser(userId)
			if (userResult.error) {
				getErrorMessage(userResult.error)
				return
			}

			if (!userResult.data) {
				toast.error('Ошибка получения пользователя')
				return
			}

			const transformedUser = transformUserFromAPI(userResult.data)
			setUser(transformedUser)

			toast.success('✅ Вход выполнен успешно!', {
				description: `Добро пожаловать, ${transformedUser.name}!`,
				duration: 3000,
			})

			// Перенаправляем на главную
			setTimeout(() => {
				globalThis.location.href = '/'
			}, 1000)
		} catch (error: unknown) {
			getErrorMessage(error)
		}
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center py-12 px-4'>
			<div className='max-w-md w-full'>
				<div className='bg-white rounded-2xl shadow-xl p-8'>
					<div className='text-center mb-8'>
						<h1 className='text-3xl font-bold text-slate-900 mb-2'>Вход</h1>
						<p className='text-slate-600'>Войдите в свой аккаунт</p>
					</div>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
							<FormField
								control={form.control}
								name='email'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
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
										<FormLabel>Пароль</FormLabel>
										<FormControl>
											<div className='relative'>
												<Input
													type={showPassword ? 'text' : 'password'}
													placeholder='••••••••'
													className='pr-10'
													{...field}
												/>
												<button
													type='button'
													onClick={() => setShowPassword(!showPassword)}
													className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900 transition-colors'
													aria-label={
														showPassword ? 'Скрыть пароль' : 'Показать пароль'
													}
												>
													{showPassword ? (
														<EyeOff className='h-4 w-4' />
													) : (
														<Eye className='h-4 w-4' />
													)}
												</button>
											</div>
										</FormControl>
										<div className='flex items-center justify-between'>
											<FormMessage />
											<a
												href='/forgot-password'
												className='text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer ml-auto'
											>
												Забыли пароль?
											</a>
										</div>
									</FormItem>
								)}
							/>

							<Button type='submit' disabled={isSubmitting} className='w-full'>
								{isSubmitting ? (
									<div className='flex items-center gap-2'>
										<Spinner />
										<span>Вход...</span>
									</div>
								) : (
									<span>Войти</span>
								)}
							</Button>
						</form>
					</Form>

					<div className='mt-6 text-center'>
						<a
							href='/registartion'
							className='text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer'
						>
							Нет аккаунта? Зарегистрируйтесь
						</a>
					</div>
				</div>
			</div>
		</div>
	)
}
