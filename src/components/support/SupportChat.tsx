import { MessageCircle, X } from 'lucide-react'
import { useState } from 'react'
import { ConnectionStatus } from './ConnectionStatus'
import { CreateTicketForm } from './CreateTicketForm'
import { SupportChatContent, type Message } from './SupportChatContent'

interface SupportChatProps {
	readonly onClose: () => void
	readonly isClosing?: boolean
}

interface Ticket {
	id: string
	title: string
	description: string
	createdAt: Date
}

export function SupportChat({ onClose, isClosing = false }: SupportChatProps) {
	const [ticket, setTicket] = useState<Ticket | null>(null)
	const [message, setMessage] = useState('')
	const [messages, setMessages] = useState<Message[]>([])
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isCreatingTicket, setIsCreatingTicket] = useState(false)

	const handleSend = async () => {
		if (!message.trim() || isSubmitting) return

		const userMessage: Message = {
			id: Date.now().toString(),
			text: message.trim(),
			timestamp: new Date(),
			isUser: true,
		}

		setMessages(prev => [...prev, userMessage])
		setMessage('')
		setIsSubmitting(true)

		// Имитация ответа поддержки (в реальном приложении здесь будет API запрос)
		setTimeout(() => {
			const supportMessage: Message = {
				id: (Date.now() + 1).toString(),
				text: 'Спасибо за ваше сообщение! Наша команда поддержки получила ваш запрос и свяжется с вами в ближайшее время.',
				timestamp: new Date(),
				isUser: false,
			}
			setMessages(prev => [...prev, supportMessage])
			setIsSubmitting(false)
		}, 1000)
	}

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			handleSend()
		}
	}

	const formatTime = (date: Date) => {
		return date.toLocaleTimeString('ru-RU', {
			hour: '2-digit',
			minute: '2-digit',
		})
	}

	const handleCreateTicket = async (title: string, description: string) => {
		setIsCreatingTicket(true)

		// Имитация создания тикета (в реальном приложении здесь будет API запрос)
		setTimeout(() => {
			const newTicket: Ticket = {
				id: Date.now().toString(),
				title,
				description,
				createdAt: new Date(),
			}
			setTicket(newTicket)
			setIsCreatingTicket(false)
		}, 1000)
	}

	return (
		<aside
			className={`fixed right-5 top-[88px] bottom-20 w-[400px] max-w-[calc(100vw-40px)] z-[100] bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/80 overflow-hidden flex flex-col ${
				isClosing ? 'animate-slide-out-right' : 'animate-slide-in-right'
			}`}
		>
			{/* Заголовок */}
			<header className='sticky top-0 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 p-6 z-10 flex-shrink-0'>
				<div className='flex items-center justify-between gap-4'>
					<div className='flex items-center gap-3'>
						<div className='relative'>
							<div className='absolute inset-0 bg-white/20 rounded-full blur-xl' />
							<div className='relative flex items-center justify-center w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/30'>
								<MessageCircle className='h-6 w-6 text-white drop-shadow-lg' />
							</div>
						</div>
						<div>
							<h2 className='text-xl font-bold text-white m-0'>
								Чат поддержки
							</h2>
							<div className='flex items-center gap-2 mt-1'>
								<ConnectionStatus variant='light' />
							</div>
						</div>
					</div>
					<button
						type='button'
						onClick={onClose}
						className='shrink-0 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center text-white'
						title='Закрыть'
						aria-label='Закрыть'
					>
						<X className='h-4 w-4' />
					</button>
				</div>
			</header>

			{ticket ? (
				<SupportChatContent
					messages={messages}
					message={message}
					setMessage={setMessage}
					isSubmitting={isSubmitting}
					onSend={handleSend}
					onKeyPress={handleKeyPress}
					formatTime={formatTime}
				/>
			) : (
				<CreateTicketForm
					onCreateTicket={handleCreateTicket}
					isCreating={isCreatingTicket}
				/>
			)}
		</aside>
	)
}

