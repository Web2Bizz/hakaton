import { Button } from '@/components/ui/button'
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useDeleteAchievementMutation } from '@/store/entities/achievement'
import { logger } from '@/utils/logger'
import { Trophy, X } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
import type { QuestFormData } from '../schemas/quest-form.schema'

export function QuestAchievementSection() {
	const form = useFormContext<QuestFormData>()
	const [deleteAchievementMutation] = useDeleteAchievementMutation()

	const customAchievement = form.watch('customAchievement')
	const achievementId = form.watch('achievementId')
	const hasAchievement = !!customAchievement

	const handleToggle = async () => {
		if (hasAchievement) {
			// Если есть achievementId, удаляем achievement через API
			if (achievementId) {
				try {
					await deleteAchievementMutation(achievementId).unwrap()
					toast.success('Достижение удалено')
				} catch (error) {
					logger.error('Error deleting achievement:', error)
					toast.error('Не удалось удалить достижение')
				}
			}
			// Удаляем из формы
			form.setValue('customAchievement', undefined)
			form.setValue('achievementId', undefined)
		} else {
			form.setValue('customAchievement', {
				icon: '🏆',
				title: '',
				description: '',
			})
		}
	}

	return (
		<div className='space-y-4 rounded-lg border border-slate-200 bg-white p-6'>
			<div className='items-center justify-center sm:justify-between grid grid-rows-2 sm:flex'>
				<div className='items-center gap-2 flex'>
					<Trophy className='h-5 w-5 text-amber-500' />
					<h3 className='text-lg font-semibold text-slate-900'>
						Пользовательское достижение
					</h3>
				</div>
				<Button
					type='button'
					variant={hasAchievement ? 'destructive' : 'outline'}
					size='sm'
					onClick={handleToggle}
				>
					{hasAchievement ? (
						<>
							<X className='h-4 w-4 mr-1' />
							Удалить
						</>
					) : (
						<>Добавить достижение</>
					)}
				</Button>
			</div>

			{hasAchievement && (
				<div className='space-y-4 rounded-lg border border-amber-200 bg-amber-50/50 p-4'>
					<p className='text-sm text-slate-600'>
						Это достижение будет выдано участникам квеста при его завершении на
						100%. Вы можете указать эмодзи, название и описание.
					</p>

					<div className='space-y-4'>
						<FormField
							control={form.control}
							name='customAchievement.icon'
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Эмодзи <span className='text-red-500'>*</span>
									</FormLabel>
									<FormControl>
										<div className='flex items-center gap-2'>
											<Input
												type='text'
												{...field}
												placeholder='🏆'
												maxLength={2}
												className='w-20 text-2xl text-center'
											/>
											<div className='text-sm text-slate-500'>
												Введите эмодзи (1-2 символа)
											</div>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='customAchievement.title'
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Название достижения <span className='text-red-500'>*</span>
									</FormLabel>
									<FormControl>
										<Input
											type='text'
											{...field}
											placeholder='Герой экологии'
											maxLength={50}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='customAchievement.description'
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Описание достижения <span className='text-red-500'>*</span>
									</FormLabel>
									<FormControl>
										<div>
											<textarea
												{...field}
												placeholder='Завершил квест по очистке парка от мусора'
												maxLength={200}
												rows={3}
												className='w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											/>
											<div className='text-xs text-slate-500 mt-1'>
												{field.value?.length || 0}/200 символов
											</div>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Предпросмотр */}
						{customAchievement?.icon &&
							customAchievement?.title &&
							customAchievement?.description && (
								<div className='rounded-lg border border-slate-200 bg-white p-4'>
									<p className='text-xs font-medium text-slate-500 mb-2'>
										Предпросмотр:
									</p>
									<div className='flex items-start gap-3'>
										<div className='text-3xl'>{customAchievement.icon}</div>
										<div className='flex-1'>
											<h4 className='font-semibold text-slate-900'>
												{customAchievement.title}
											</h4>
											<p className='text-sm text-slate-600 mt-1'>
												{customAchievement.description}
											</p>
										</div>
									</div>
								</div>
							)}
					</div>
				</div>
			)}

			{!hasAchievement && (
				<p className='text-sm text-slate-500'>
					Вы можете добавить пользовательское достижение, которое будет выдано
					участникам квеста при его завершении на 100%.
				</p>
			)}
		</div>
	)
}
