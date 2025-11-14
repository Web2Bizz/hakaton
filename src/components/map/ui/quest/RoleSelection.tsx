import { useState } from 'react'
import type { UserRole } from '@/types/user'
import { Button } from '@/components/ui/button'

interface RoleSelectionProps {
	readonly onSelect: (role: UserRole) => void
	readonly onCancel: () => void
}

const roles: {
	id: UserRole
	title: string
	description: string
	icon: string
	color: string
}[] = [
	{
		id: 'financial',
		title: 'Финансовый воин',
		description: 'Вносите деньги на конкретные этапы квеста',
		icon: '💰',
		color: 'from-green-500 to-emerald-600',
	},
	{
		id: 'volunteer',
		title: 'Волонтер-герой',
		description: 'Регистрируйтесь на события и помогайте физически',
		icon: '👷',
		color: 'from-blue-500 to-cyan-600',
	},
	{
		id: 'ambassador',
		title: 'Амбассадор',
		description: 'Делитесь квестом в соцсетях и привлекайте людей',
		icon: '📢',
		color: 'from-purple-500 to-pink-600',
	},
]

export function RoleSelection({ onSelect, onCancel }: RoleSelectionProps) {
	const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)

	return (
		<div className='fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm'>
			<div className='relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl'>
				<h3 className='mb-4 text-xl font-bold text-slate-900'>
					Выберите свою роль в квесте
				</h3>
				<p className='mb-6 text-sm text-slate-600'>
					Вы можете выбрать одну или несколько ролей. Начните с одной!
				</p>

				<div className='space-y-3 mb-6'>
					{roles.map(role => (
						<button
							key={role.id}
							type='button'
							onClick={() => setSelectedRole(role.id)}
							className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
								selectedRole === role.id
									? 'border-blue-500 bg-blue-50 shadow-md'
									: 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
							}`}
						>
							<div className='flex items-start gap-3'>
								<div
									className={`text-3xl p-2 rounded-lg bg-gradient-to-br ${role.color} text-white`}
								>
									{role.icon}
								</div>
								<div className='flex-1'>
									<h4 className='font-semibold text-slate-900 mb-1'>
										{role.title}
									</h4>
									<p className='text-sm text-slate-600'>{role.description}</p>
								</div>
								{selectedRole === role.id && (
									<div className='text-blue-600 text-xl'>✓</div>
								)}
							</div>
						</button>
					))}
				</div>

				<div className='flex gap-3'>
					<Button
						variant='outline'
						onClick={onCancel}
						className='flex-1'
						type='button'
					>
						Отмена
					</Button>
					<Button
						onClick={() => selectedRole && onSelect(selectedRole)}
						disabled={!selectedRole}
						className='flex-1 bg-gradient-to-br from-blue-500 to-cyan-600 text-white'
						type='button'
					>
						Продолжить
					</Button>
				</div>
			</div>
		</div>
	)
}

