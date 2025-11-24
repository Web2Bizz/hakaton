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
import { useResetPasswordMutation } from '@/store/entities'
import { logger } from '@/utils/logger'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

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

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export function ResetPasswordForm() {
	const [resetPasswordMutation, { isLoading: isSubmitting }] =
		useResetPasswordMutation()

	// Получаем токен из URL параметров
	const urlParams = new URLSearchParams(globalThis.location.search)
	const token = urlParams.get('token')

	const form = useForm<ResetPasswordFormData>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: {
			password: '',
			confirmPassword: '',
		},
	})

	const onSubmit = async (data: ResetPasswordFormData) => {
		if (!token) {
			toast.error(
				'Отсутствует токен восстановления. Проверьте ссылку из письма.'
			)
			return
		}

		try {
			const result = await resetPasswordMutation({
				token,
				password: data.password,
				confirmPassword: data.confirmPassword,
			})

			if (result.error) {
				const errorMessage =
					(result.error as { data?: { message?: string } })?.data?.message ||
					'Ошибка сброса пароля. Попробуйте еще раз.'
				toast.error(errorMessage)
				return
			}

			toast.success('✅ Пароль успешно изменен!', {
				description: 'Теперь вы можете войти с новым паролем.',
				duration: 3000,
			})

			// Перенаправляем на страницу входа
			setTimeout(() => {
				globalThis.location.href = '/login'
			}, 1500)
		} catch (error: unknown) {
			logger.error('Reset password error:', error)
			toast.error('Ошибка сброса пароля. Попробуйте еще раз.')
		}
	}

	if (!token) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center py-12 px-4'>
				<div className='max-w-md w-full'>
					<div className='bg-white rounded-2xl shadow-xl p-8'>
						<div className='text-center'>
							<h1 className='text-3xl font-bold text-slate-900 mb-2'>
								Неверная ссылка
							</h1>
							<p className='text-slate-600 mb-6'>
								Отсутствует токен восстановления. Проверьте ссылку из письма.
							</p>
							<a
								href='/forgot-password'
								className='text-blue-600 hover:text-blue-700 font-medium'
							>
								Запросить новую ссылку
							</a>
						</div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center py-12 px-4'>
			<div className='max-w-md w-full'>
				<div className='bg-white rounded-2xl shadow-xl p-8'>
					<div className='mb-6'>
						<a
							href='/login'
							className='inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium mb-4'
						>
							<ArrowLeft className='h-4 w-4 mr-2' />
							Вернуться к входу
						</a>
					</div>

					<div className='text-center mb-8'>
						<h1 className='text-3xl font-bold text-slate-900 mb-2'>
							Новый пароль
						</h1>
						<p className='text-slate-600'>
							Введите новый пароль для вашего аккаунта
						</p>
					</div>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
							<FormField
								control={form.control}
								name='password'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Новый пароль *</FormLabel>
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
										<span>Сохранение...</span>
									</div>
								) : (
									<span>Сохранить пароль</span>
								)}
							</Button>
						</form>
					</Form>
				</div>
			</div>
		</div>
	)
}
