import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useUser } from '@/hooks/useUser'
import {
	useLazyGetUserQuery,
	useLoginMutation,
} from '@/store/entities/auth/model/auth-service'
import { saveToken, transformUserFromAPI } from '@/utils/auth'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function LoginForm() {
	const { user, setUser } = useUser()
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	})

	const [loginMutation, { isLoading: isLoggingIn }] = useLoginMutation()
	const [getUser, { isLoading: isFetchingUser }] = useLazyGetUserQuery()

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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!formData.email || !formData.password) {
			toast.error('Заполните все поля')
			return
		}

		try {
			const result = await loginMutation({
				email: formData.email,
				password: formData.password,
			})

			// Сохраняем токен
			if (result.data?.access_token) {
				saveToken(result.data.access_token)
			}

			// Получаем полные данные пользователя по userId
			const userId = result.data?.user.id
			if (!userId) {
				toast.error('Ошибка получения пользователя')
				return
			}
			const userResult = await getUser(userId)
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
			}, 500)
		} catch (error: unknown) {
			if (import.meta.env.DEV) {
				console.error('Login error:', error)
			}
			const errorMessage =
				(error as { data?: { message?: string }; message?: string })?.data
					?.message ||
				(error as { message?: string })?.message ||
				'Ошибка входа. Попробуйте еще раз.'
			toast.error(errorMessage)
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

					<form onSubmit={handleSubmit} className='space-y-4'>
						<div>
							<label
								htmlFor='email'
								className='block text-sm font-medium text-slate-700 mb-2'
							>
								Email *
							</label>
							<Input
								id='email'
								type='email'
								value={formData.email}
								onChange={e =>
									setFormData(prev => ({ ...prev, email: e.target.value }))
								}
								required
								placeholder='email@example.com'
							/>
						</div>

						<div>
							<label
								htmlFor='password'
								className='block text-sm font-medium text-slate-700 mb-2'
							>
								Пароль *
							</label>
							<Input
								id='password'
								type='password'
								value={formData.password}
								onChange={e =>
									setFormData(prev => ({ ...prev, password: e.target.value }))
								}
								required
								placeholder='••••••••'
							/>
						</div>

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

