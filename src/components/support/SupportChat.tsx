import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MessageCircle, Send, X } from 'lucide-react'
import { useState } from 'react'

interface SupportChatProps {
	readonly onClose: () => void
	readonly isClosing?: boolean
}

interface Message {
	id: string
	text: string
	timestamp: Date
	isUser: boolean
}

export function SupportChat({ onClose, isClosing = false }: SupportChatProps) {
	const [message, setMessage] = useState('')
	const [messages, setMessages] = useState<Message[]>([])
	const [isSubmitting, setIsSubmitting] = useState(false)

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
							<p className='text-sm text-white/90 mt-0.5'>
								Мы всегда готовы помочь
							</p>
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

			{/* Область сообщений */}
			<div className='flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 bg-gradient-to-br from-slate-50 to-blue-50/30 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
				{messages.length === 0 ? (
					<div className='flex flex-col items-center justify-center h-full text-center py-8'>
						<div className='w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4'>
							<MessageCircle className='h-8 w-8 text-blue-600' />
						</div>
						<p className='text-slate-600 font-medium mb-2'>
							Добро пожаловать в чат поддержки!
						</p>
						<p className='text-sm text-slate-500 max-w-xs'>
							Задайте свой вопрос, и наша команда поддержки поможет вам
						</p>
					</div>
				) : (
					<div className='space-y-4'>
						{messages.map(msg => (
							<div
								key={msg.id}
								className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
							>
								<div
									className={`max-w-[80%] rounded-2xl px-4 py-3 ${
										msg.isUser
											? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white'
											: 'bg-white text-slate-900 border border-slate-200'
									}`}
								>
									<p className='text-sm leading-relaxed'>{msg.text}</p>
									<p
										className={`text-xs mt-1.5 ${
											msg.isUser ? 'text-white/70' : 'text-slate-500'
										}`}
									>
										{formatTime(msg.timestamp)}
									</p>
								</div>
							</div>
						))}
						{isSubmitting && (
							<div className='flex justify-start'>
								<div className='bg-white text-slate-900 border border-slate-200 rounded-2xl px-4 py-3'>
									<div className='flex gap-1'>
										<span className='w-2 h-2 bg-slate-400 rounded-full animate-bounce' />
										<span
											className='w-2 h-2 bg-slate-400 rounded-full animate-bounce'
											style={{ animationDelay: '0.2s' }}
										/>
										<span
											className='w-2 h-2 bg-slate-400 rounded-full animate-bounce'
											style={{ animationDelay: '0.4s' }}
										/>
									</div>
								</div>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Форма ввода */}
			<div className='px-4 py-4 bg-white border-t border-slate-200 flex-shrink-0'>
				<div className='flex gap-2'>
					<div className='flex-1'>
						<Label htmlFor='support-message' className='sr-only'>
							Ваше сообщение
						</Label>
						<Input
							id='support-message'
							value={message}
							onChange={e => setMessage(e.target.value)}
							onKeyPress={handleKeyPress}
							placeholder='Введите ваше сообщение...'
							disabled={isSubmitting}
							className='rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500'
						/>
					</div>
					<Button
						type='button'
						onClick={handleSend}
						disabled={!message.trim() || isSubmitting}
						className='rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 shadow-md hover:shadow-lg transition-all'
					>
						<Send className='h-4 w-4' />
					</Button>
				</div>
				<p className='text-xs text-slate-500 mt-2 text-center'>
					Обычно мы отвечаем в течение нескольких минут
				</p>
			</div>
		</aside>
	)
}

