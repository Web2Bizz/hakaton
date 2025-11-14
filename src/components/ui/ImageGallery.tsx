import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useCallback, useEffect } from 'react'

interface ImageGalleryProps {
	images: string[]
	currentIndex: number
	onClose: () => void
	onChangeIndex: (index: number) => void
}

export function ImageGallery({
	images,
	currentIndex,
	onClose,
	onChangeIndex,
}: ImageGalleryProps) {
	const currentImage = images[currentIndex]

	const handlePrevious = useCallback(() => {
		const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1
		onChangeIndex(newIndex)
	}, [currentIndex, images.length, onChangeIndex])

	const handleNext = useCallback(() => {
		const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0
		onChangeIndex(newIndex)
	}, [currentIndex, images.length, onChangeIndex])

	// Обработка клавиатуры
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose()
			} else if (e.key === 'ArrowLeft') {
				handlePrevious()
			} else if (e.key === 'ArrowRight') {
				handleNext()
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [onClose, handlePrevious, handleNext])

	if (!currentImage) return null

	return (
		<div
			className='fixed mt-5 inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4'
			onClick={onClose}
		>
			{/* Кнопка закрытия (правый верхний угол - с текстом) */}
			<button
				type='button'
				onClick={e => {
					e.stopPropagation()
					onClose()
				}}
				className='absolute top-16 right-4 z-10 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white transition-all shadow-lg hover:scale-105 flex items-center gap-2'
				aria-label='Закрыть галерею'
				title='Закрыть (Esc)'
			>
				<X className='h-5 w-5' />
				<span className='text-sm font-medium'>Закрыть</span>
			</button>

			{/* Кнопка предыдущего изображения */}
			{images.length > 1 && (
				<button
					type='button'
					onClick={e => {
						e.stopPropagation()
						handlePrevious()
					}}
					className='absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors'
					aria-label='Предыдущее изображение'
				>
					<ChevronLeft className='h-6 w-6' />
				</button>
			)}

			{/* Кнопка следующего изображения */}
			{images.length > 1 && (
				<button
					type='button'
					onClick={e => {
						e.stopPropagation()
						handleNext()
					}}
					className='absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors'
					aria-label='Следующее изображение'
				>
					<ChevronRight className='h-6 w-6' />
				</button>
			)}

			{/* Изображение */}
			<div
				className='relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center'
				onClick={e => e.stopPropagation()}
			>
				<img
					src={currentImage}
					alt={`Изображение ${currentIndex + 1} из ${images.length}`}
					className='max-w-full max-h-full object-contain rounded-lg'
				/>
			</div>

			{/* Индикатор текущего изображения */}
			{images.length > 1 && (
				<div className='absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm'>
					{currentIndex + 1} / {images.length}
				</div>
			)}

			{/* Миниатюры внизу (если больше 1 изображения) */}
			{images.length > 1 && (
				<div className='absolute bottom-16 left-1/2 -translate-x-1/2 z-10 flex gap-2 max-w-4xl overflow-x-auto px-4 py-2 bg-white/5 backdrop-blur-sm rounded-lg'>
					{images.map((image, index) => (
						<button
							key={index}
							type='button'
							onClick={e => {
								e.stopPropagation()
								onChangeIndex(index)
							}}
							className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
								index === currentIndex
									? 'border-white scale-110'
									: 'border-transparent opacity-60 hover:opacity-100'
							}`}
						>
							<img
								src={image}
								alt={`Миниатюра ${index + 1}`}
								className='w-full h-full object-cover'
							/>
						</button>
					))}
				</div>
			)}
		</div>
	)
}
