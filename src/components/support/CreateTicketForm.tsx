import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Ticket, Send } from 'lucide-react'
import { useState } from 'react'

interface CreateTicketFormProps {
	readonly onCreateTicket: (title: string, description: string) => void
	readonly isCreating?: boolean
}

export function CreateTicketForm({
	onCreateTicket,
	isCreating = false,
}: CreateTicketFormProps) {
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (!title.trim() || !description.trim() || isCreating) return

		onCreateTicket(title.trim(), description.trim())
		setTitle('')
		setDescription('')
	}

	return (
		<div className='flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 bg-gradient-to-br from-slate-50 to-blue-50/30 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
			<div className='flex flex-col items-center justify-center h-full text-center py-8'>
				<div className='w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4'>
					<Ticket className='h-8 w-8 text-blue-600' />
				</div>
				<p className='text-slate-600 font-medium mb-2'>
					Создайте новый тикет
				</p>
				<p className='text-sm text-slate-500 max-w-xs mb-6'>
					Опишите вашу проблему, и мы поможем вам её решить
				</p>

				<form
					onSubmit={handleSubmit}
					className='w-full max-w-sm space-y-4'
				>
					<div>
						<Label htmlFor='ticket-title' className='text-left block mb-2 text-slate-700'>
							Тема обращения
						</Label>
						<Input
							id='ticket-title'
							value={title}
							onChange={e => setTitle(e.target.value)}
							placeholder='Например: Проблема с авторизацией'
							disabled={isCreating}
							className='rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500'
							required
						/>
					</div>

					<div>
						<Label htmlFor='ticket-description' className='text-left block mb-2 text-slate-700'>
							Описание проблемы
						</Label>
						<textarea
							id='ticket-description'
							value={description}
							onChange={e => setDescription(e.target.value)}
							placeholder='Опишите подробно вашу проблему...'
							disabled={isCreating}
							className='flex min-h-[120px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none'
							required
						/>
					</div>

					<Button
						type='submit'
						disabled={!title.trim() || !description.trim() || isCreating}
						className='w-full rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md hover:shadow-lg transition-all'
					>
						{isCreating ? (
							<>
								<span className='w-2 h-2 bg-white rounded-full animate-bounce mr-2' />
								Создание...
							</>
						) : (
							<>
								<Send className='h-4 w-4 mr-2' />
								Создать тикет
							</>
						)}
					</Button>
				</form>
			</div>
		</div>
	)
}
