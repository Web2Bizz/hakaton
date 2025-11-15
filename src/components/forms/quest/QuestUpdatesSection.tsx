import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MediaUpload } from '../shared/MediaUpload'
import { X, Plus } from 'lucide-react'
import { useState } from 'react'

export interface UpdateFormData {
	id: string
	title: string
	content: string
	images: string[]
}

interface QuestUpdatesSectionProps {
	updates: UpdateFormData[]
	onAdd: () => void
	onRemove: (id: string) => void
	onUpdate: (id: string, field: keyof UpdateFormData, value: unknown) => void
}

export function QuestUpdatesSection({
	updates,
	onAdd,
	onRemove,
	onUpdate,
}: QuestUpdatesSectionProps) {
	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<h3 className='text-lg font-semibold text-slate-900'>
					Обновления квеста
				</h3>
				<Button type='button' variant='outline' onClick={onAdd} size='sm'>
					<Plus className='h-4 w-4 mr-1' />
					Добавить обновление
				</Button>
			</div>

			{updates.length === 0 ? (
				<div className='bg-slate-50 border border-slate-200 rounded-lg p-8 text-center'>
					<p className='text-slate-600 mb-4'>
						Пока нет обновлений. Добавьте первое обновление, чтобы рассказать о
						прогрессе квеста.
					</p>
					<Button type='button' variant='outline' onClick={onAdd}>
						<Plus className='h-4 w-4 mr-2' />
						Добавить обновление
					</Button>
				</div>
			) : (
				<div className='space-y-4'>
					{updates.map((update, index) => (
						<UpdateForm
							key={update.id}
							update={update}
							index={index}
							onUpdate={onUpdate}
							onRemove={onRemove}
						/>
					))}
				</div>
			)}
		</div>
	)
}

function UpdateForm({
	update,
	index,
	onUpdate,
	onRemove,
}: {
	update: UpdateFormData
	index: number
	onUpdate: (id: string, field: keyof UpdateFormData, value: unknown) => void
	onRemove: (id: string) => void
}) {
	return (
		<div className='border border-slate-200 rounded-lg p-6 bg-white space-y-4'>
			<div className='flex items-center justify-between mb-4'>
				<h4 className='text-base font-semibold text-slate-900'>
					Обновление {index + 1}
				</h4>
				<Button
					type='button'
					variant='outline'
					size='sm'
					onClick={() => onRemove(update.id)}
					className='text-red-600 hover:text-red-700 hover:border-red-300'
				>
					<X className='h-4 w-4 mr-1' />
					Удалить
				</Button>
			</div>

			<div>
				<label className='block text-sm font-medium text-slate-700 mb-2'>
					Заголовок <span className='text-red-500'>*</span>
				</label>
				<Input
					value={update.title}
					onChange={e => onUpdate(update.id, 'title', e.target.value)}
					placeholder='Например: Завершен первый этап!'
					required
				/>
			</div>

			<div>
				<label className='block text-sm font-medium text-slate-700 mb-2'>
					Текст обновления <span className='text-red-500'>*</span>
				</label>
				<textarea
					value={update.content}
					onChange={e => onUpdate(update.id, 'content', e.target.value)}
					placeholder='Расскажите о прогрессе квеста...'
					required
					rows={4}
					className='w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm'
				/>
			</div>

			<div>
				<MediaUpload
					images={update.images}
					onImagesChange={images => onUpdate(update.id, 'images', images)}
					maxImages={5}
					label='Фотографии (необязательно)'
				/>
			</div>
		</div>
	)
}

