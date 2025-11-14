import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useUser } from '@/hooks/useUser'
import { useState } from 'react'
import { toast } from 'sonner'

export default function LoginPage() {
	const { login, user } = useUser()
	const [isLogin, setIsLogin] = useState(true)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
	})

	// Если пользователь уже авторизован, перенаправляем на главную
	if (user) {
		window.location.href = '/'
		return null
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (isLogin) {
			// Авторизация
			if (!formData.email || !formData.password) {
				toast.error('Заполните все поля')
				return
			}

			setIsSubmitting(true)
			try {
				// В реальном приложении здесь будет API вызов
				// Пока используем моковую авторизацию
				await new Promise(resolve => setTimeout(resolve, 500))

				// Создаем пользователя на основе email
				const userEmail = formData.email
				const userName = userEmail.split('@')[0] || 'Пользователь'

				login({
					email: userEmail,
					name: userName,
				})

				toast.success('✅ Вход выполнен успешно!', {
					description: `Добро пожаловать, ${userName}!`,
					duration: 3000,
				})

				// Небольшая задержка перед редиректом, чтобы пользователь увидел toast
				setTimeout(() => {
					window.location.href = '/'
				}, 500)
			} catch (error) {
				if (import.meta.env.DEV) {
					console.error('Login error:', error)
				}
				toast.error('Ошибка входа. Попробуйте еще раз.')
			} finally {
				setIsSubmitting(false)
			}
		} else {
			// Регистрация
			if (!formData.name || !formData.email || !formData.password) {
				toast.error('Заполните все обязательные поля')
				return
			}

			if (formData.password !== formData.confirmPassword) {
				toast.error('Пароли не совпадают')
				return
			}

			if (formData.password.length < 6) {
				toast.error('Пароль должен быть не менее 6 символов')
				return
			}

			setIsSubmitting(true)
			try {
				// В реальном приложении здесь будет API вызов
				await new Promise(resolve => setTimeout(resolve, 500))

				login({
					email: formData.email,
					name: formData.name,
				})

				toast.success('🎉 Регистрация успешна!', {
					description: `Добро пожаловать, ${formData.name}! Ваш аккаунт создан.`,
					duration: 4000,
				})

				// Небольшая задержка перед редиректом, чтобы пользователь увидел toast
				setTimeout(() => {
					window.location.href = '/'
				}, 500)
			} catch (error) {
				if (import.meta.env.DEV) {
					console.error('Registration error:', error)
				}
				toast.error('Ошибка регистрации. Попробуйте еще раз.')
			} finally {
				setIsSubmitting(false)
			}
		}
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center py-12 px-4'>
			<div className='max-w-md w-full'>
				<div className='bg-white rounded-2xl shadow-xl p-8'>
					<div className='text-center mb-8'>
						<h1 className='text-3xl font-bold text-slate-900 mb-2'>
							{isLogin ? 'Вход' : 'Регистрация'}
						</h1>
						<p className='text-slate-600'>
							{isLogin ? 'Войдите в свой аккаунт' : 'Создайте новый аккаунт'}
						</p>
					</div>

					<form onSubmit={handleSubmit} className='space-y-4'>
						{!isLogin && (
							<div>
								<label
									htmlFor='name'
									className='block text-sm font-medium text-slate-700 mb-2'
								>
									Имя *
								</label>
								<Input
									id='name'
									type='text'
									value={formData.name}
									onChange={e =>
										setFormData(prev => ({ ...prev, name: e.target.value }))
									}
									required={!isLogin}
									placeholder='Ваше имя'
								/>
							</div>
						)}

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

						{!isLogin && (
							<div>
								<label
									htmlFor='confirmPassword'
									className='block text-sm font-medium text-slate-700 mb-2'
								>
									Подтвердите пароль *
								</label>
								<Input
									id='confirmPassword'
									type='password'
									value={formData.confirmPassword}
									onChange={e =>
										setFormData(prev => ({
											...prev,
											confirmPassword: e.target.value,
										}))
									}
									required={!isLogin}
									placeholder='••••••••'
								/>
							</div>
						)}

						<Button type='submit' disabled={isSubmitting} className='w-full'>
							{isSubmitting ? (
								<div className='flex items-center gap-2'>
									<Spinner />
									<span>{isLogin ? 'Вход...' : 'Регистрация...'}</span>
								</div>
							) : (
								<span>{isLogin ? 'Войти' : 'Зарегистрироваться'}</span>
							)}
						</Button>
					</form>

					<div className='mt-6 text-center'>
						<button
							type='button'
							onClick={() => {
								setIsLogin(!isLogin)
								setFormData({
									name: '',
									email: '',
									password: '',
									confirmPassword: '',
								})
							}}
							className='text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer'
						>
							{isLogin
								? 'Нет аккаунта? Зарегистрируйтесь'
								: 'Уже есть аккаунт? Войдите'}
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
