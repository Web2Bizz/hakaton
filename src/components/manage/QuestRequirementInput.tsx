import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, type SelectOption } from '@/components/ui/select'
import { useQuestParticipants } from '@/hooks/useQuestParticipants'
import type { QuestStepRequirement } from '@/store/entities/quest/model/type'
import { formatCurrency } from '@/utils/format'
import { Check, Plus, QrCode, Users } from 'lucide-react'
import { useMemo, useState } from 'react'

export type RequirementType = 'financial' | 'volunteers' | 'items'

interface QuestRequirementInputProps {
	readonly requirement: QuestStepRequirement
	readonly stepIndex: number
	readonly type: RequirementType
	readonly isUpdating: boolean
	readonly questId: number
	readonly onAddAmount: (
		stepIndex: number,
		amount: number,
		userId?: string,
		isAnonymous?: boolean
	) => void
	readonly onGenerateQRCode?: (stepIndex: number) => void
}

export function QuestRequirementInput({
	requirement,
	stepIndex,
	type,
	isUpdating,
	questId,
	onAddAmount,
	onGenerateQRCode,
}: QuestRequirementInputProps) {
	const { participants } = useQuestParticipants(questId)
	const [selectedUserId, setSelectedUserId] = useState<string>('')
	const [selectedVolunteers, setSelectedVolunteers] = useState<Set<string>>(
		new Set()
	)
	const [amount, setAmount] = useState<string>('')

	const userOptions: SelectOption[] = useMemo(
		() => [
			{ value: 'anonymous', label: 'Инкогнито' },
			...participants.map(p => ({
				value: p.id,
				label: p.name,
			})),
		],
		[participants]
	)

	const isAnonymous = selectedUserId === 'anonymous'
	const actualUserId = isAnonymous ? undefined : selectedUserId || undefined

	const handleInputSubmit = () => {
		const numAmount = Number.parseFloat(amount || '0')
		if (numAmount > 0) {
			onAddAmount(stepIndex, numAmount, actualUserId, isAnonymous)
			setAmount('')
			setSelectedUserId('')
		}
	}

	const handleVolunteerToggle = (userId: string) => {
		setSelectedVolunteers(prev => {
			const newSet = new Set(prev)
			if (newSet.has(userId)) {
				newSet.delete(userId)
			} else {
				newSet.add(userId)
			}
			return newSet
		})
	}

	const handleMarkVolunteers = () => {
		if (selectedVolunteers.size > 0) {
			for (const userId of selectedVolunteers) {
				onAddAmount(stepIndex, 1, userId, false)
			}
			setSelectedVolunteers(new Set())
		}
	}

	if (type === 'financial') {
		return (
			<div className='bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow'>
				<div className='flex items-start justify-between mb-4'>
					<div className='flex-1'>
						<div className='flex items-center gap-2 mb-2'>
							<div className='p-2 bg-blue-100 rounded-lg'>
								<span className='text-2xl'>💰</span>
							</div>
							<div>
								<h5 className='font-semibold text-slate-900 text-base'>
									Финансовые средства
								</h5>
								<p className='text-xs text-slate-500 mt-0.5'>
									Управление денежными взносами
								</p>
							</div>
						</div>
						<div className='bg-white/60 rounded-lg p-3 mt-3'>
							<p className='text-sm text-slate-700 mb-1'>Прогресс сбора:</p>
							<div className='flex items-baseline gap-2'>
								<span className='text-2xl font-bold text-blue-600'>
									{formatCurrency(requirement.currentValue, 'RUB')}
								</span>
								<span className='text-sm text-slate-500'>из</span>
								<span className='text-lg font-semibold text-slate-700'>
									{formatCurrency(requirement.targetValue, 'RUB')}
								</span>
							</div>
							<div className='mt-2 h-2 bg-blue-100 rounded-full overflow-hidden'>
								<div
									className='h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500'
									style={{
										width: `${Math.min(
											(requirement.currentValue / requirement.targetValue) *
												100,
											100
										)}%`,
									}}
								/>
							</div>
						</div>
					</div>
				</div>

				<div className='space-y-3 mt-4'>
					<div>
						<label
							htmlFor={`participant-select-financial-${stepIndex}`}
							className='block text-sm font-medium text-slate-700 mb-2'
						>
							Участник квеста
						</label>
						<Select
							id={`participant-select-financial-${stepIndex}`}
							options={userOptions}
							value={selectedUserId}
							onChange={e => setSelectedUserId(e.target.value)}
							placeholder='Выберите участника'
							className='w-full'
						/>
					</div>

					<div>
						<label
							htmlFor={`financial-input-${stepIndex}`}
							className='block text-sm font-medium text-slate-700 mb-2'
						>
							Сумма взноса
						</label>
						<Input
							id={`financial-input-${stepIndex}`}
							type='number'
							value={amount}
							onChange={e => setAmount(e.target.value)}
							placeholder='Введите сумму'
							min='0'
							step='100'
							className='w-full'
							onKeyDown={e => {
								if (e.key === 'Enter') {
									handleInputSubmit()
								}
							}}
						/>
					</div>

					<Button
						type='button'
						onClick={handleInputSubmit}
						disabled={isUpdating || !amount || Number.parseFloat(amount) <= 0}
						className='w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md'
					>
						<Plus className='h-4 w-4 mr-2' />
						Добавить взнос
					</Button>
				</div>
			</div>
		)
	}

	if (type === 'volunteers') {
		return (
			<div className='bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow'>
				<div className='flex items-start justify-between mb-4'>
					<div className='flex-1'>
						<div className='flex items-center gap-2 mb-2'>
							<div className='p-2 bg-green-100 rounded-lg'>
								<span className='text-2xl'>👥</span>
							</div>
							<div>
								<h5 className='font-semibold text-slate-900 text-base'>
									Волонтеры
								</h5>
								<p className='text-xs text-slate-500 mt-0.5'>
									Регистрация участников
								</p>
							</div>
						</div>
						<div className='bg-white/60 rounded-lg p-3 mt-3'>
							<p className='text-sm text-slate-700 mb-1'>
								Прогресс регистрации:
							</p>
							<div className='flex items-baseline gap-2'>
								<span className='text-2xl font-bold text-green-600'>
									{requirement.currentValue}
								</span>
								<span className='text-sm text-slate-500'>из</span>
								<span className='text-lg font-semibold text-slate-700'>
									{requirement.targetValue}
								</span>
							</div>
							<div className='mt-2 h-2 bg-green-100 rounded-full overflow-hidden'>
								<div
									className='h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500'
									style={{
										width: `${Math.min(
											(requirement.currentValue / requirement.targetValue) *
												100,
											100
										)}%`,
									}}
								/>
							</div>
						</div>
					</div>
				</div>

				<div className='space-y-4 mt-4'>
					{/* Список участников с чекбоксами */}
					<div>
						<p className='block text-sm font-medium text-slate-700 mb-3'>
							Выберите участников для отметки:
						</p>
						<div className='bg-white/60 rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto'>
							{participants.length > 0 ? (
								participants.map(participant => {
									const isSelected = selectedVolunteers.has(participant.id)
									return (
										<label
											key={participant.id}
											className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
												isSelected
													? 'bg-green-100 border-2 border-green-500'
													: 'bg-white border-2 border-slate-200 hover:border-green-300'
											}`}
										>
											<input
												type='checkbox'
												checked={isSelected}
												onChange={() => handleVolunteerToggle(participant.id)}
												className='h-5 w-5 rounded border-slate-300 text-green-600 focus:ring-green-500'
											/>
											<div className='flex-1'>
												<p className='font-medium text-slate-900'>
													{participant.name}
												</p>
												<p className='text-xs text-slate-500'>
													{participant.email}
												</p>
											</div>
											{isSelected && (
												<Check className='h-5 w-5 text-green-600' />
											)}
										</label>
									)
								})
							) : (
								<p className='text-sm text-slate-500 text-center py-4'>
									Нет участников квеста
								</p>
							)}
						</div>
					</div>

					<div className='flex gap-2'>
						<Button
							type='button'
							onClick={handleMarkVolunteers}
							disabled={isUpdating || selectedVolunteers.size === 0}
							className='flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md'
						>
							<Users className='h-4 w-4 mr-2' />
							Отметить ({selectedVolunteers.size})
						</Button>
						{onGenerateQRCode && (
							<Button
								type='button'
								variant='outline'
								onClick={() => onGenerateQRCode(stepIndex)}
								className='border-green-300 text-green-700 hover:bg-green-50'
							>
								<QrCode className='h-4 w-4 mr-2' />
								QR код
							</Button>
						)}
					</div>
				</div>
			</div>
		)
	}

	if (type === 'items') {
		return (
			<div className='bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow'>
				<div className='flex items-start justify-between mb-4'>
					<div className='flex-1'>
						<div className='flex items-center gap-2 mb-2'>
							<div className='p-2 bg-purple-100 rounded-lg'>
								<span className='text-2xl'>📦</span>
							</div>
							<div>
								<h5 className='font-semibold text-slate-900 text-base'>
									Материалы/предметы
								</h5>
								<p className='text-xs text-slate-500 mt-0.5'>
									Учет материальных взносов
								</p>
							</div>
						</div>
						<div className='bg-white/60 rounded-lg p-3 mt-3'>
							<p className='text-sm text-slate-700 mb-1'>Прогресс сбора:</p>
							<div className='flex items-baseline gap-2'>
								<span className='text-2xl font-bold text-purple-600'>
									{requirement.currentValue}
								</span>
								<span className='text-sm text-slate-500'>из</span>
								<span className='text-lg font-semibold text-slate-700'>
									{requirement.targetValue}
								</span>
							</div>
							<div className='mt-2 h-2 bg-purple-100 rounded-full overflow-hidden'>
								<div
									className='h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500'
									style={{
										width: `${Math.min(
											(requirement.currentValue / requirement.targetValue) *
												100,
											100
										)}%`,
									}}
								/>
							</div>
						</div>
					</div>
				</div>

				<div className='space-y-3 mt-4'>
					<div>
						<label
							htmlFor={`participant-select-items-${stepIndex}`}
							className='block text-sm font-medium text-slate-700 mb-2'
						>
							Участник квеста
						</label>
						<Select
							id={`participant-select-items-${stepIndex}`}
							options={userOptions}
							value={selectedUserId}
							onChange={e => setSelectedUserId(e.target.value)}
							placeholder='Выберите участника'
							className='w-full'
						/>
					</div>

					<div>
						<label
							htmlFor={`items-input-${stepIndex}`}
							className='block text-sm font-medium text-slate-700 mb-2'
						>
							Количество предметов
						</label>
						<Input
							id={`items-amount-input-${stepIndex}`}
							type='number'
							value={amount}
							onChange={e => setAmount(e.target.value)}
							placeholder='Введите количество'
							min='0'
							step='1'
							className='w-full'
							onKeyDown={e => {
								if (e.key === 'Enter') {
									handleInputSubmit()
								}
							}}
						/>
					</div>

					<Button
						type='button'
						onClick={handleInputSubmit}
						disabled={isUpdating || !amount || Number.parseFloat(amount) <= 0}
						className='w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md'
					>
						<Plus className='h-4 w-4 mr-2' />
						Добавить предметы
					</Button>
				</div>
			</div>
		)
	}

	return null
}
