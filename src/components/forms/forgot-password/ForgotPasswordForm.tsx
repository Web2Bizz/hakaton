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
import { useForgotPasswordMutation } from '@/store/entities'
import { logger } from '@/utils/logger'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const forgotPasswordSchema = z.object({
	email: z.string().email('Введите корректный email адрес'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm() {
	const [forgotPasswordMutation, { isLoading: isSubmitting }] =
		useForgotPasswordMutation()

	const form = useForm<ForgotPasswordFormData>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: {
			email: '',
		},
	})

	const onSubmit = async (data: ForgotPasswordFormData) => {
		try {
			const result = await forgotPasswordMutation({
				email: data.email,
			})

			if (result.error) {
				const errorMessage =
					(result.error as { data?: { message?: string } })?.data?.message ||
					'Ошибка отправки запроса. Попробуйте еще раз.'
				toast.error(errorMessage)
				return
			}

			toast.success('✅ Запрос отправлен!', {
				description:
					'Если указанный email существует, на него будет отправлена инструкция по восстановлению пароля.',
				duration: 5000,
			})

			// Перенаправляем на страницу входа через 2 секунды
			setTimeout(() => {
				globalThis.location.href = '/login'
			}, 2000)
		} catch (error: unknown) {
			logger.error('Forgot password error:', error)
			toast.error('Ошибка отправки запроса. Попробуйте еще раз.')
		}
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
							Восстановление пароля
						</h1>
						<p className='text-slate-600'>
							Введите ваш email, и мы отправим инструкцию по восстановлению
							пароля
						</p>
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

							<Button type='submit' disabled={isSubmitting} className='w-full'>
								{isSubmitting ? (
									<div className='flex items-center gap-2'>
										<Spinner />
										<span>Отправка...</span>
									</div>
								) : (
									<span>Отправить</span>
								)}
							</Button>
						</form>
					</Form>
				</div>
			</div>
		</div>
	)
}
