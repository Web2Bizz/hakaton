import { Button } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import {
	useCreateQuestUpdateMutation,
	useGetQuestUpdateQuery,
	useUpdateQuestUpdateMutation,
} from '@/store/entities/quest'
import { getErrorMessage } from '@/utils/error'
import { logger } from '@/utils/logger'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { MediaUpload } from '../shared/MediaUpload'

const questUpdateSchema = z.object({
	title: z.string().min(1, 'Заголовок обязателен').min(3, 'Минимум 3 символа'),
	text: z
		.string()
		.min(1, 'Текст обновления обязателен')
		.min(10, 'Минимум 10 символов'),
	photos: z.array(z.string()).default([]),
})

type QuestUpdateFormData = z.infer<typeof questUpdateSchema>

interface QuestUpdateFormProps {
	questId: number
	updateId?: number
	onSuccess?: () => void
	onCancel?: () => void
}

export function QuestUpdateForm({
	questId,
	updateId,
	onSuccess,
	onCancel,
}: QuestUpdateFormProps) {
	const isEditMode = !!updateId

	const { data: existingUpdate, isLoading: isLoadingUpdate } =
		useGetQuestUpdateQuery(updateId!, {
			skip: !isEditMode,
		})

	const [createUpdate, { isLoading: isCreating }] =
		useCreateQuestUpdateMutation()
	const [updateUpdate, { isLoading: isUpdating }] =
		useUpdateQuestUpdateMutation()

	const form = useForm<QuestUpdateFormData>({
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		resolver: zodResolver(questUpdateSchema) as any,
		defaultValues: {
			title: '',
			text: '',
			photos: [],
		},
	})

	// Загружаем данные существующего обновления для редактирования
	useEffect(() => {
		if (isEditMode && existingUpdate) {
			form.reset({
				title: existingUpdate.title,
				text: existingUpdate.text,
				photos: existingUpdate.photos || [],
			})
		}
	}, [isEditMode, existingUpdate, form])

	const onSubmit = async (data: QuestUpdateFormData) => {
		try {
			if (isEditMode && updateId) {
				await updateUpdate({
					id: updateId,
					data: {
						questId,
						title: data.title,
						text: data.text,
						photos: data.photos,
					},
				}).unwrap()
				toast.success('Обновление успешно изменено')
			} else {
				await createUpdate({
					questId,
					title: data.title,
					text: data.text,
					photos: data.photos,
				}).unwrap()
				toast.success('Обновление успешно создано')
			}
			onSuccess?.()
		} catch (error) {
			logger.error('Error saving update:', error)
			const errorMessage = getErrorMessage(
				error,
				isEditMode
					? 'Ошибка при изменении обновления'
					: 'Ошибка при создании обновления'
			)
			toast.error(errorMessage)
		}
	}

	if (isLoadingUpdate) {
		return (
			<div className='flex items-center justify-center py-12'>
				<div className='flex flex-col items-center gap-4'>
					<Spinner />
					<p className='text-sm text-slate-600'>Загрузка обновления...</p>
				</div>
			</div>
		)
	}

	const isSubmitting = isCreating || isUpdating

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
				<FormField
					control={form.control}
					name='title'
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								Заголовок <span className='text-red-500'>*</span>
							</FormLabel>
							<FormControl>
								<Input
									placeholder='Например: Завершен первый этап!'
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name='text'
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								Текст обновления <span className='text-red-500'>*</span>
							</FormLabel>
							<FormControl>
								<textarea
									{...field}
									placeholder='Расскажите о прогрессе квеста...'
									rows={6}
									className='w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm'
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name='photos'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Фотографии (необязательно)</FormLabel>
							<FormControl>
								<MediaUpload
									images={field.value || []}
									onImagesChange={newImages => {
										field.onChange(newImages)
									}}
									maxImages={5}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className='flex justify-end gap-3 pt-4 border-t border-slate-200'>
					{onCancel && (
						<Button
							type='button'
							variant='outline'
							onClick={onCancel}
							disabled={isSubmitting}
						>
							Отмена
						</Button>
					)}
					<Button
						type='submit'
						disabled={isSubmitting}
						className='min-w-[200px]'
					>
						{isSubmitting ? (
							<div className='flex items-center gap-2'>
								<Spinner />
								<span>{isEditMode ? 'Сохранение...' : 'Создание...'}</span>
							</div>
						) : (
							<span>
								{isEditMode ? 'Сохранить изменения' : 'Создать обновление'}
							</span>
						)}
					</Button>
				</div>
			</form>
		</Form>
	)
}
