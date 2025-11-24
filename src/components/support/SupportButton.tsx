import { MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { SupportChat } from './SupportChat'

export function SupportButton() {
	const [isOpen, setIsOpen] = useState(false)
	const [isClosing, setIsClosing] = useState(false)

	const handleOpen = () => {
		setIsClosing(false)
		setIsOpen(true)
	}

	const handleClose = () => {
		setIsClosing(true)
		// Ждем завершения анимации перед скрытием
		setTimeout(() => {
			setIsOpen(false)
			setIsClosing(false)
		}, 300)
	}

	return (
		<>
			<button
				type='button'
				onClick={handleOpen}
				className='fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/60 transition-all duration-300 flex items-center justify-center group hover:scale-110'
				aria-label='Открыть чат поддержки'
			>
				<MessageCircle className='h-6 w-6 group-hover:scale-110 transition-transform' />
				{/* Индикатор пульсации */}
				<span className='absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20' />
			</button>
			{(isOpen || isClosing) && (
				<SupportChat onClose={handleClose} isClosing={isClosing} />
			)}
		</>
	)
}
