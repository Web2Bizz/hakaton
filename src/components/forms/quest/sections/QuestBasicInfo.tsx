import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useGetCategoriesQuery } from '@/store/entities/category'
import { useGetCitiesQuery } from '@/store/entities/city'
import { useGetOrganizationTypesQuery } from '@/store/entities/organization-type'
import { compressImage } from '@/utils/image'
import { logger } from '@/utils/logger'
import { X } from 'lucide-react'
import { useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
import { MediaUpload } from '../../shared/MediaUpload'
import type { QuestFormData } from '../schemas/quest-form.schema'

const MAX_IMAGE_SIZE_MB = 10
const BYTES_PER_MB = 1024 * 1024

const formatFileSize = (bytes: number): string => {
	if (bytes < 1024) return `${bytes} Б`
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`
	return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
}

interface QuestBasicInfoProps {
	onCityChange?: (city: string) => void
}

export function QuestBasicInfo({ onCityChange }: QuestBasicInfoProps) {
	const form = useFormContext<QuestFormData>()

	// Загружаем данные из API
	const { data: cities = [], isLoading: isLoadingCities } = useGetCitiesQuery()
	const { data: organizationTypes = [], isLoading: isLoadingTypes } =
		useGetOrganizationTypesQuery()
	const { data: categories = [], isLoading: isLoadingCategories } =
		useGetCategoriesQuery()

	const sortedCities = useMemo(
		() => [...cities].sort((a, b) => a.name.localeCompare(b.name)),
		[cities]
	)

	const sortedOrganizationTypes = useMemo(
		() => [...organizationTypes].sort((a, b) => a.name.localeCompare(b.name)),
		[organizationTypes]
	)

	const sortedCategories = useMemo(
		() => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
		[categories]
	)

	const storyImage = form.watch('storyImage')

	return (
		<div className='space-y-4'>
			<FormField
				control={form.control}
				name='title'
				render={({ field }) => (
					<FormItem>
						<FormLabel>Название квеста *</FormLabel>
						<FormControl>
							<Input
								placeholder='Например: Озеленение микрорайона'
								{...field}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<FormField
					control={form.control}
					name='cityId'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Город *</FormLabel>
							<FormControl>
								{isLoadingCities ? (
									<div className='flex items-center gap-2 h-9'>
										<div className='h-4 w-4'>
											<Spinner />
										</div>
										<span className='text-sm text-slate-500'>Загрузка...</span>
									</div>
								) : (
									<select
										value={field.value || ''}
										onChange={e => {
											const cityId = Number(e.target.value)
											field.onChange(cityId)
											const city = cities.find(c => c.id === cityId)
											if (city && onCityChange) {
												onCityChange(city.name)
											}
										}}
										className='w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm'
									>
										<option value=''>Выберите город</option>
										{sortedCities.map(city => (
											<option key={city.id} value={city.id}>
												{city.name}
											</option>
										))}
									</select>
								)}
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name='organizationTypeId'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Тип квеста *</FormLabel>
							<FormControl>
								{isLoadingTypes ? (
									<div className='flex items-center gap-2 h-9'>
										<div className='h-4 w-4'>
											<Spinner />
										</div>
										<span className='text-sm text-slate-500'>Загрузка...</span>
									</div>
								) : (
									<select
										value={field.value || ''}
										onChange={e => field.onChange(Number(e.target.value))}
										className='w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm'
									>
										<option value=''>Выберите тип</option>
										{sortedOrganizationTypes.map(type => (
											<option key={type.id} value={type.id}>
												{type.name}
											</option>
										))}
									</select>
								)}
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>

			<FormField
				control={form.control}
				name='category'
				render={({ field }) => (
					<FormItem>
						<FormLabel>Категория *</FormLabel>
						<FormControl>
							{isLoadingCategories ? (
								<div className='flex items-center gap-2 h-9'>
									<div className='h-4 w-4'>
										<Spinner />
									</div>
									<span className='text-sm text-slate-500'>Загрузка...</span>
								</div>
							) : (
								<select
									value={field.value || ''}
									onChange={e => {
										const categoryId = Number(e.target.value)
										// Преобразуем ID в строку для схемы
										const categoryName = sortedCategories
											.find(c => c.id === categoryId)
											?.name.toLowerCase()
										// Маппинг имени категории в enum значение
										const categoryMap: Record<
											string,
											QuestFormData['category']
										> = {
											экология: 'environment',
											животные: 'animals',
											люди: 'people',
											образование: 'education',
											другое: 'other',
										}
										const categoryValue =
											categoryMap[categoryName || ''] || 'other'
										field.onChange(categoryValue)
									}}
									className='w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm'
								>
									<option value=''>Выберите категорию</option>
									{sortedCategories.map(cat => {
										// Маппинг имени категории в enum значение для value
										const categoryMap: Record<string, string> = {
											Экология: 'environment',
											Животные: 'animals',
											Люди: 'people',
											Образование: 'education',
											Другое: 'other',
										}
										const categoryValue = categoryMap[cat.name] || 'other'
										return (
											<option key={cat.id} value={categoryValue}>
												{cat.name}
											</option>
										)
									})}
								</select>
							)}
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name='story'
				render={({ field }) => (
					<FormItem>
						<FormLabel>Описание квеста *</FormLabel>
						<FormControl>
							<textarea
								{...field}
								rows={4}
								className='w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm'
								placeholder='Расскажите о проблеме, которую решает ваш квест...'
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			{/* Медиа для истории квеста */}
			<div>
				<FormLabel>Медиа для истории квеста</FormLabel>
				<div className='space-y-3'>
					<div>
						<label className='block text-xs text-slate-600 mb-1'>
							Главное изображение
						</label>
						{storyImage ? (
							<div className='relative group'>
								<img
									src={storyImage}
									alt='Story preview'
									className='w-full h-48 object-cover rounded-lg border border-slate-200'
								/>
								<button
									type='button'
									onClick={() => form.setValue('storyImage', undefined)}
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
													`Размер файла превышает ${MAX_IMAGE_SIZE_MB} МБ (${formatFileSize(
														file.size
													)})`
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
												form.setValue('storyImage', compressed)
												toast.success('Изображение загружено и сжато', {
													id: 'compress-image',
												})
											} catch (error) {
												logger.error('Error compressing image:', error)
												toast.error('Ошибка при загрузке изображения', {
													id: 'compress-image',
												})
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
			<FormField
				control={form.control}
				name='gallery'
				render={({ field }) => (
					<FormItem>
						<FormLabel>Галерея квеста</FormLabel>
						<FormControl>
							<MediaUpload
								images={field.value || []}
								onImagesChange={newImages => {
									field.onChange(newImages)
								}}
								maxImages={10}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</div>
	)
}
