import { useState } from 'react'
import { Calendar, Users, X } from 'lucide-react'
import type { QuestStage } from '../../types/quest-types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUser } from '@/contexts/UserContext'
import { useNotifications } from '@/contexts/NotificationContext'
import { formatDate } from '@/utils/format'

interface VolunteerRegistrationProps {
	readonly stage: QuestStage
	readonly questTitle: string
	readonly onRegister: (stageId: string, data: { name: string; phone: string; email?: string }) => void
	readonly onClose: () => void
}

export function VolunteerRegistration({
	stage,
	questTitle,
	onRegister,
	onClose,
}: VolunteerRegistrationProps) {
	const { user } = useUser()
	const { addNotification } = useNotifications()
	const [formData, setFormData] = useState({
		name: user?.name || '',
		phone: '',
		email: user?.email || '',
	})

	if (!stage.requirements?.volunteers) {
		return null
	}

	const { registered, needed } = stage.requirements.volunteers
	const remaining = needed - registered

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (formData.name && formData.phone) {
			onRegister(stage.id, formData)
			addNotification({
				type: 'volunteer_registered',
				title: 'Вы зарегистрированы!',
				message: `Вы успешно зарегистрировались на событие "${stage.title}" в квесте "${questTitle}"`,
				questId: '',
				icon: '👷',
			})
			onClose()
		}
	}

	return (
		<div className='fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm'>
			<div className='relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl'>
				<button
					type='button'
					onClick={onClose}
					className='absolute right-4 top-4 rounded-full p-2 hover:bg-slate-100 transition-colors'
				>
					<X className='h-4 w-4 text-slate-600' />
				</button>

				<div className='mb-6'>
					<div className='flex items-center gap-2 mb-2'>
						<Users className='h-5 w-5 text-blue-500' />
						<h3 className='text-xl font-bold text-slate-900'>
							Регистрация волонтера
						</h3>
					</div>
					<p className='text-sm text-slate-600 mb-1'>{questTitle}</p>
					<p className='text-base font-semibold text-slate-900 mb-4'>
						{stage.title}
					</p>

					{/* Прогресс регистрации */}
					<div className='mb-4 p-4 rounded-xl bg-blue-50 border border-blue-200'>
						<div className='flex items-center justify-between mb-2'>
							<span className='text-sm font-medium text-slate-700'>
								Зарегистрировано волонтеров:
							</span>
							<span className='text-sm font-bold text-blue-700'>
								{registered} из {needed}
							</span>
						</div>
						<div className='h-2 bg-blue-200 rounded-full overflow-hidden'>
							<div
								className='h-full bg-gradient-to-r from-blue-500 to-cyan-600 transition-all duration-300'
								style={{ width: `${(registered / needed) * 100}%` }}
							/>
						</div>
						{remaining > 0 && (
							<p className='text-xs text-slate-600 mt-2'>
								Осталось мест: <strong>{remaining}</strong>
							</p>
						)}
					</div>
				</div>

				<form onSubmit={handleSubmit} className='space-y-4'>
					<div>
						<label className='block text-sm font-medium text-slate-700 mb-1'>
							Имя и фамилия *
						</label>
						<Input
							type='text'
							value={formData.name}
							onChange={e => setFormData({ ...formData, name: e.target.value })}
							required
							placeholder='Иван Иванов'
						/>
					</div>

					<div>
						<label className='block text-sm font-medium text-slate-700 mb-1'>
							Телефон *
						</label>
						<Input
							type='tel'
							value={formData.phone}
							onChange={e => setFormData({ ...formData, phone: e.target.value })}
							required
							placeholder='+7 (900) 123-45-67'
						/>
					</div>

					<div>
						<label className='block text-sm font-medium text-slate-700 mb-1'>
							Email (необязательно)
						</label>
						<Input
							type='email'
							value={formData.email}
							onChange={e => setFormData({ ...formData, email: e.target.value })}
							placeholder='ivan@example.com'
						/>
					</div>

					{stage.deadline && (
						<div className='p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2'>
							<Calendar className='h-4 w-4 text-slate-500' />
							<span className='text-sm text-slate-600'>
								Срок регистрации: {formatDate(stage.deadline)}
							</span>
						</div>
					)}

					<Button
						type='submit'
						disabled={remaining === 0 || !formData.name || !formData.phone}
						className='w-full bg-gradient-to-br from-blue-500 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-700'
					>
						{remaining === 0 ? 'Места закончились' : 'Зарегистрироваться'}
					</Button>

					<p className='text-xs text-slate-500 text-center'>
						После регистрации с вами свяжется куратор проекта
					</p>
				</form>
			</div>
		</div>
	)
}

