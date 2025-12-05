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
import EmojiPicker, {
	type EmojiClickData,
	Categories,
} from 'emoji-picker-react'
import { Trophy, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
import type { QuestFormData } from '../schemas/quest-form.schema'

export function QuestAchievementSection() {
	const form = useFormContext<QuestFormData>()
	const [deleteAchievementMutation] = useDeleteAchievementMutation()
	const [showEmojiPicker, setShowEmojiPicker] = useState(false)
	const [isMobile, setIsMobile] = useState(false)
	const [pickerWidth, setPickerWidth] = useState(350)

	const customAchievement = form.watch('customAchievement')
	const achievementId = form.watch('achievementId')
	const hasAchievement = !!customAchievement

	// Определяем, является ли устройство мобильным и вычисляем размеры picker
	useEffect(() => {
		const checkMobile = () => {
			const mobile = window.innerWidth < 640 // sm breakpoint в Tailwind
			setIsMobile(mobile)
			setPickerWidth(mobile ? Math.min(window.innerWidth - 32, 350) : 350)
		}

		checkMobile()
		window.addEventListener('resize', checkMobile)

		return () => {
			window.removeEventListener('resize', checkMobile)
		}
	}, [])

	// Вычисляем высоту picker
	const pickerHeight = isMobile ? 350 : 400

	// Закрытие emoji picker по Escape и клику вне области
	useEffect(() => {
		if (!showEmojiPicker) return

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				setShowEmojiPicker(false)
			}
		}

		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as HTMLElement
			if (!target.closest('[data-emoji-picker-container]')) {
				setShowEmojiPicker(false)
			}
		}

		document.addEventListener('keydown', handleEscape)
		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('keydown', handleEscape)
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [showEmojiPicker])

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
										<div className='relative' data-emoji-picker-container>
											<div className='flex items-center gap-3'>
												<button
													type='button'
													onClick={() => setShowEmojiPicker(!showEmojiPicker)}
													className='flex items-center justify-center w-16 h-16 rounded-lg border-2 border-slate-300 bg-white hover:border-blue-500 hover:bg-blue-50 transition-colors text-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
												>
													{field.value || '🏆'}
												</button>
												<div className='flex-1'>
													<p className='text-sm text-slate-600'>
														Нажмите на кнопку, чтобы выбрать эмодзи
													</p>
													{field.value && (
														<p className='text-xs text-slate-500 mt-1'>
															Выбрано: {field.value}
														</p>
													)}
												</div>
											</div>
											{showEmojiPicker && (
												<>
													{/* Overlay для мобильных устройств */}
													{isMobile && (
														<button
															type='button'
															className='fixed inset-0 bg-black/20 z-40'
															onClick={() => setShowEmojiPicker(false)}
															aria-label='Закрыть выбор эмодзи'
														/>
													)}
													<div
														className={`z-50 mt-2 shadow-2xl rounded-lg overflow-hidden border border-slate-200 bg-white ${
															isMobile
																? 'fixed left-4 right-4 top-1/2 -translate-y-1/2 max-h-[80vh] overflow-y-auto'
																: 'absolute left-0 top-full'
														}`}
													>
														<EmojiPicker
															onEmojiClick={(emojiData: EmojiClickData) => {
																field.onChange(emojiData.emoji)
																setShowEmojiPicker(false)
															}}
															searchPlaceHolder='Поиск эмодзи...'
															previewConfig={{
																showPreview: false,
															}}
															categories={[
																{
																	category: Categories.SUGGESTED,
																	name: 'Недавние',
																},
																{
																	category: Categories.SMILEYS_PEOPLE,
																	name: 'Смайлы и люди',
																},
																{
																	category: Categories.ANIMALS_NATURE,
																	name: 'Животные и природа',
																},
																{
																	category: Categories.FOOD_DRINK,
																	name: 'Еда и напитки',
																},
																{
																	category: Categories.TRAVEL_PLACES,
																	name: 'Путешествия и места',
																},
																{
																	category: Categories.ACTIVITIES,
																	name: 'Активности',
																},
																{
																	category: Categories.OBJECTS,
																	name: 'Объекты',
																},
																{
																	category: Categories.SYMBOLS,
																	name: 'Символы',
																},
																{
																	category: Categories.FLAGS,
																	name: 'Флаги',
																},
															]}
															width={pickerWidth}
															height={pickerHeight}
														/>
													</div>
												</>
											)}
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
