import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { compressImage } from '@/utils/storage'
import { Upload, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

interface MediaUploadProps {
	images?: string[]
	onImagesChange?: (images: string[]) => void
	maxImages?: number
	maxImageSizeMB?: number
	label?: string
}

// Константы для ограничений размера
const DEFAULT_MAX_IMAGE_SIZE_MB = 10
const BYTES_PER_MB = 1024 * 1024

// Компонент для предпросмотра изображения со скелетоном
function ImagePreview({
	image,
	index,
	onRemove,
}: {
	image: string
	index: number
	onRemove: () => void
}) {
	const [isLoading, setIsLoading] = useState(true)
	const [hasError, setHasError] = useState(false)

	return (
		<div className='relative group aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100'>
			{isLoading && !hasError && (
				<Skeleton className='absolute inset-0 w-full h-full' />
			)}
			{!hasError && (
				<img
					src={image}
					alt={`Preview ${index + 1}`}
					className={`w-full h-full object-cover transition-opacity ${
						isLoading ? 'opacity-0' : 'opacity-100'
					}`}
					onLoad={() => setIsLoading(false)}
					onError={() => {
						setIsLoading(false)
						setHasError(true)
					}}
				/>
			)}
			{hasError && (
				<div className='w-full h-full flex items-center justify-center bg-slate-200 text-slate-400'>
					<Upload className='h-6 w-6' />
				</div>
			)}
			<button
				type='button'
				onClick={onRemove}
				className='absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10'
			>
				<X className='h-3 w-3' />
			</button>
		</div>
	)
}

export function MediaUpload({
	images = [],
	onImagesChange,
	maxImages = 10,
	maxImageSizeMB = DEFAULT_MAX_IMAGE_SIZE_MB,
	label = '',
}: MediaUploadProps) {
	const [isDragging, setIsDragging] = useState(false)
	const [isUploading, setIsUploading] = useState(false)

	const formatFileSize = useCallback((bytes: number): string => {
		if (bytes < 1024) return `${bytes} Б`
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`
		return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
	}, [])

	const handleFileSelect = useCallback(
		async (files: FileList | null) => {
			if (!files || files.length === 0) return

			setIsUploading(true)

			const imageFiles: File[] = []
			const errors: string[] = []

			Array.from(files).forEach(file => {
				if (file.type.startsWith('image/')) {
					const fileSizeMB = file.size / BYTES_PER_MB
					if (fileSizeMB > maxImageSizeMB) {
						errors.push(
							`${
								file.name
							}: размер превышает ${maxImageSizeMB} МБ (${formatFileSize(
								file.size
							)})`
						)
						return
					}
					if (images.length + imageFiles.length >= maxImages) {
						errors.push(
							`${file.name}: достигнут лимит изображений (${maxImages})`
						)
						return
					}
					imageFiles.push(file)
				} else {
					errors.push(
						`${file.name}: неподдерживаемый тип файла. Поддерживаются только изображения.`
					)
				}
			})

			// Показываем ошибки
			if (errors.length > 0) {
				errors.forEach(error => {
					toast.error(error)
				})
			}

			try {
				if (imageFiles.length > 0 && onImagesChange) {
					try {
						const base64Images = await Promise.all(
							imageFiles.map(async file => {
								try {
									// Сжимаем изображения перед сохранением
									toast.loading(`Сжатие ${file.name}...`, {
										id: `compress-${file.name}`,
									})
									const compressed = await compressImage(file)
									toast.dismiss(`compress-${file.name}`)
									return compressed
								} catch (error) {
									toast.dismiss(`compress-${file.name}`)
									const errorMessage =
										error instanceof Error
											? error.message
											: 'Неизвестная ошибка'
									toast.error(`${file.name}: ${errorMessage}`)
									throw error
								}
							})
						)
						const newImages = [...images, ...base64Images]
						if (import.meta.env.DEV) {
							console.log('MediaUpload: calling onImagesChange with', newImages.length, 'images')
						}
						onImagesChange(newImages)
						if (imageFiles.length > 0) {
							toast.success(`Загружено изображений: ${imageFiles.length}`)
						}
					} catch (error) {
						// Ошибки уже обработаны для каждого файла
						if (import.meta.env.DEV) {
							console.error('Error uploading images:', error)
						}
					}
				}
			} catch (error) {
				toast.error('Неожиданная ошибка при загрузке файлов')
				if (import.meta.env.DEV) {
					console.error('Unexpected error uploading files:', error)
				}
			} finally {
				setIsUploading(false)
			}
		},
		[images, maxImages, maxImageSizeMB, onImagesChange, formatFileSize]
	)

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault()
			setIsDragging(false)
			handleFileSelect(e.dataTransfer.files)
		},
		[handleFileSelect]
	)

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault()
		setIsDragging(true)
	}, [])

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault()
		setIsDragging(false)
	}, [])

	const removeImage = useCallback(
		(index: number) => {
			if (onImagesChange) {
				onImagesChange(images.filter((_, i) => i !== index))
			}
		},
		[images, onImagesChange]
	)

	return (
		<div className='space-y-4'>
			<label className='block text-sm font-medium text-slate-700 mb-2'>
				{label}
			</label>

			{/* Область загрузки */}
			<div
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
					isDragging
						? 'border-blue-500 bg-blue-50'
						: 'border-slate-300 bg-slate-50 hover:border-slate-400'
				}`}
			>
				<Upload className='h-8 w-8 mx-auto mb-2 text-slate-400' />
				<p className='text-sm text-slate-600 mb-2'>
					Перетащите файлы сюда или нажмите для выбора
				</p>
				<p className='text-xs text-slate-500 mb-3'>
					Изображения (до {maxImages}, макс. {maxImageSizeMB} МБ, будут сжаты)
				</p>
				<Button
					type='button'
					variant='outline'
					size='sm'
					disabled={isUploading}
					onClick={() => {
						const input = document.createElement('input')
						input.type = 'file'
						input.accept = 'image/*'
						input.multiple = true
						input.onchange = e => {
							handleFileSelect((e.target as HTMLInputElement).files)
						}
						input.click()
					}}
				>
					{isUploading ? 'Загрузка...' : 'Выбрать файлы'}
				</Button>
			</div>

			{/* Предпросмотр изображений */}
			{images.length > 0 && (
				<div className='space-y-2'>
					<p className='text-sm font-medium text-slate-700'>
						Изображения ({images.length}/{maxImages})
					</p>
					<div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
						{images.map((image, index) => (
							<ImagePreview
								key={index}
								image={image}
								index={index}
								onRemove={() => removeImage(index)}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	)
}
