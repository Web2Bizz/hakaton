import { Input } from '@/components/ui/input'
import { questCategories, questCities, questTypes } from '@/components/map/data/quests'
import type { Quest } from '@/components/map/types/quest-types'
import { cities as orgCities } from '@/components/map/data/organizations'
import { MediaUpload } from '../shared/MediaUpload'
import { compressImage } from '@/utils/storage'
import { X } from 'lucide-react'
import { useMemo } from 'react'
import { toast } from 'sonner'

const MAX_IMAGE_SIZE_MB = 10
const BYTES_PER_MB = 1024 * 1024

const formatFileSize = (bytes: number): string => {
	if (bytes < 1024) return `${bytes} Б`
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`
	return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
}

interface QuestBasicInfoProps {
	formData: {
		title: string
		city: string
		type: string
		category: Quest['category']
		story: string
		storyImage?: string
		gallery: string[]
	}
	onChange: (field: string, value: string | string[] | undefined) => void
	onCityChange: (city: string) => void
	onStoryImageChange?: (image: string | undefined) => void
	onGalleryChange?: (gallery: string[]) => void
}

export function QuestBasicInfo({
	formData,
	onChange,
	onCityChange,
	onStoryImageChange,
	onGalleryChange,
}: QuestBasicInfoProps) {
	const allCities = useMemo(
		() =>
			Array.from(new Set([...questCities, ...orgCities])).sort((a, b) =>
				a.localeCompare(b)
			),
		[]
	)

	return (
		<div className='space-y-4'>
			<div>
				<label
					htmlFor='quest-title'
					className='block text-sm font-medium text-slate-700 mb-2'
				>
					Название квеста *
				</label>
				<Input
					id='quest-title'
					value={formData.title}
					onChange={e => onChange('title', e.target.value)}
					required
					placeholder='Например: Озеленение микрорайона'
				/>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<div>
					<label
						htmlFor='quest-city'
						className='block text-sm font-medium text-slate-700 mb-2'
					>
						Город *
					</label>
					<select
						id='quest-city'
						value={formData.city}
						onChange={e => onCityChange(e.target.value)}
						required
						className='w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm'
					>
						<option value=''>Выберите город</option>
						{allCities.map(city => (
							<option key={city} value={city}>
								{city}
							</option>
						))}
					</select>
				</div>

				<div>
					<label
						htmlFor='quest-type'
						className='block text-sm font-medium text-slate-700 mb-2'
					>
						Тип *
					</label>
					<select
						id='quest-type'
						value={formData.type}
						onChange={e => onChange('type', e.target.value)}
						required
						className='w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm'
					>
						<option value=''>Выберите тип</option>
						{questTypes.map(type => (
							<option key={type} value={type}>
								{type}
							</option>
						))}
					</select>
				</div>
			</div>

			<div>
				<label
					htmlFor='quest-category'
					className='block text-sm font-medium text-slate-700 mb-2'
				>
					Категория *
				</label>
				<select
					id='quest-category'
					value={formData.category}
					onChange={e => onChange('category', e.target.value)}
					required
					className='w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm'
				>
					{questCategories.map(cat => (
						<option key={cat.id} value={cat.id}>
							{cat.icon} {cat.label}
						</option>
					))}
				</select>
			</div>

			<div>
				<label
					htmlFor='quest-story'
					className='block text-sm font-medium text-slate-700 mb-2'
				>
					Описание квеста *
				</label>
				<textarea
					id='quest-story'
					value={formData.story}
					onChange={e => onChange('story', e.target.value)}
					required
					rows={4}
					className='w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm'
					placeholder='Расскажите о проблеме, которую решает ваш квест...'
				/>
			</div>

			{/* Медиа для истории квеста */}
			<div>
				<label className='block text-sm font-medium text-slate-700 mb-2'>
					Медиа для истории квеста
				</label>
				<div className='space-y-3'>
					<div>
						<label className='block text-xs text-slate-600 mb-1'>
							Главное изображение
						</label>
						{formData.storyImage ? (
							<div className='relative group'>
								<img
									src={formData.storyImage}
									alt='Story preview'
									className='w-full h-48 object-cover rounded-lg border border-slate-200'
								/>
								<button
									type='button'
									onClick={() => onStoryImageChange?.(undefined)}
									className='absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
								>
									<X className='h-4 w-4' />
								</button>
							</div>
						) : (
							<div>
								<input
									type='file'
									accept='image/*'
									onChange={async e => {
										const file = e.target.files?.[0]
										if (file) {
											const fileSizeMB = file.size / BYTES_PER_MB
											if (fileSizeMB > MAX_IMAGE_SIZE_MB) {
												toast.error(
													`Размер файла превышает ${MAX_IMAGE_SIZE_MB} МБ (${formatFileSize(file.size)})`
												)
												e.target.value = ''
												return
											}

											// Сжимаем изображение перед сохранением
											toast.loading('Сжатие изображения...', {
												id: 'compress-image',
											})
											try {
												const compressed = await compressImage(file)
												onStoryImageChange?.(compressed)
												toast.success('Изображение загружено и сжато', {
													id: 'compress-image',
												})
											} catch (error) {
												toast.error('Ошибка при загрузке изображения', {
													id: 'compress-image',
												})
												if (import.meta.env.DEV) {
													console.error('Error compressing image:', error)
												}
											}
										}
									}}
									className='w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
								/>
								<p className='text-xs text-slate-500 mt-1'>
									Максимальный размер: {MAX_IMAGE_SIZE_MB} МБ
								</p>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Галерея */}
			{onGalleryChange && (
				<MediaUpload
					images={formData.gallery}
					onImagesChange={onGalleryChange}
					maxImages={10}
					label='Галерея квеста'
				/>
			)}
		</div>
	)
}

