import { Button } from '@/components/ui/button'
import { type LucideIcon, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface TourModalProps {
	readonly title: string
	readonly description: string
	readonly icon: LucideIcon
	readonly onAccept: () => void
	readonly onDecline: () => void
	readonly onPostpone: () => void
	readonly acceptButtonText?: string
	readonly postponeButtonText?: string
}

export function TourModal({
	title,
	description,
	icon: Icon,
	onAccept,
	onDecline,
	onPostpone,
	acceptButtonText = 'Пройти тур',
	postponeButtonText = 'Позже',
}: TourModalProps) {
	const [isVisible, setIsVisible] = useState(false)

	useEffect(() => {
		// Небольшая задержка для плавного появления
		const timer = setTimeout(() => {
			setIsVisible(true)
		}, 100)
		return () => clearTimeout(timer)
	}, [])

	const handleClose = () => {
		setIsVisible(false)
		setTimeout(() => {
			onDecline()
		}, 300)
	}

	return (
		<div
			className={`fixed bottom-6 left-6 z-50 transition-all duration-300 ease-out ${
				isVisible
					? 'translate-y-0 opacity-100'
					: 'translate-y-4 opacity-0 pointer-events-none'
			}`}
		>
			<div className='relative w-[360px] max-w-[calc(100vw-3rem)] bg-white rounded-xl shadow-2xl border border-slate-200/80 overflow-hidden backdrop-blur-sm'>
				{/* Декоративный акцент */}
				<div className='absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-blue-500 via-cyan-500 to-blue-600' />

				<div className='p-4'>
					{/* Заголовок с иконкой */}
					<div className='flex items-start gap-3 mb-3'>
						<div className='shrink-0 w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-md'>
							<Icon className='h-5 w-5 text-white' />
						</div>
						<div className='flex-1 min-w-0'>
							<h3 className='text-base font-semibold text-slate-900 mb-1 leading-tight'>
								{title}
							</h3>
							<p className='text-sm text-slate-600 leading-relaxed'>
								{description}
							</p>
						</div>
						<button
							onClick={handleClose}
							className='shrink-0 w-6 h-6 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors'
							aria-label='Закрыть'
						>
							<X className='h-4 w-4' />
						</button>
					</div>

					{/* Кнопки действий */}
					<div className='flex gap-2 mt-4'>
						<Button
							onClick={onAccept}
							className='flex-1 bg-linear-to-r from-blue-500 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-700 text-sm font-medium h-9 shadow-sm'
						>
							{acceptButtonText}
						</Button>
						<Button
							onClick={() => {
								setIsVisible(false)
								setTimeout(() => {
									onPostpone()
								}, 300)
							}}
							variant='ghost'
							className='px-3 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 h-9'
						>
							{postponeButtonText}
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}
