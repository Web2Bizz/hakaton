import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/utils/format'
import { Plus, QrCode } from 'lucide-react'
import type { QuestStepRequirement } from '@/store/entities/quest/model/type'

export type RequirementType = 'financial' | 'volunteers' | 'items'

interface QuestRequirementInputProps {
	requirement: QuestStepRequirement
	stepIndex: number
	type: RequirementType
	isUpdating: boolean
	onAddAmount: (stepIndex: number, amount: number) => void
	onGenerateQRCode?: (stepIndex: number) => void
}

export function QuestRequirementInput({
	requirement,
	stepIndex,
	type,
	isUpdating,
	onAddAmount,
	onGenerateQRCode,
}: QuestRequirementInputProps) {
	const handleInputSubmit = (inputId: string) => {
		const input = document.getElementById(inputId) as HTMLInputElement
		const amount = Number.parseFloat(input?.value || '0')
		if (amount > 0) {
			onAddAmount(stepIndex, amount)
			if (input) input.value = ''
		}
	}

	if (type === 'financial') {
		return (
			<div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
				<div className='flex items-center justify-between mb-3'>
					<div>
						<h5 className='font-medium text-slate-900 mb-1'>
							💰 Финансовые средства
						</h5>
						<p className='text-sm text-slate-600'>
							Собрано:{' '}
							<span className='font-semibold text-blue-600'>
								{formatCurrency(requirement.currentValue, 'RUB')}
							</span>{' '}
							из{' '}
							<span className='font-semibold'>
								{formatCurrency(requirement.targetValue, 'RUB')}
							</span>
						</p>
					</div>
				</div>
				<div className='flex gap-2'>
					<Input
						type='number'
						id={`financial-input-${stepIndex}`}
						placeholder='Сумма для добавления'
						min='0'
						step='100'
						className='flex-1'
						onKeyDown={e => {
							if (e.key === 'Enter') {
								handleInputSubmit(`financial-input-${stepIndex}`)
							}
						}}
					/>
					<Button
						type='button'
						onClick={() => handleInputSubmit(`financial-input-${stepIndex}`)}
						disabled={isUpdating}
					>
						<Plus className='h-4 w-4 mr-1' />
						Добавить
					</Button>
				</div>
			</div>
		)
	}

	if (type === 'volunteers') {
		return (
			<div className='bg-green-50 border border-green-200 rounded-lg p-4'>
				<div className='flex items-center justify-between mb-3'>
					<div>
						<h5 className='font-medium text-slate-900 mb-1'>👥 Волонтеры</h5>
						<p className='text-sm text-slate-600'>
							Зарегистрировано:{' '}
							<span className='font-semibold text-green-600'>
								{requirement.currentValue}
							</span>{' '}
							из{' '}
							<span className='font-semibold'>{requirement.targetValue}</span>
						</p>
					</div>
				</div>
				<div className='flex gap-2'>
					{onGenerateQRCode && (
						<Button
							type='button'
							variant='outline'
							onClick={() => onGenerateQRCode(stepIndex)}
							className='flex-1'
						>
							<QrCode className='h-4 w-4 mr-2' />
							Сгенерировать QR код
						</Button>
					)}
					<Button
						type='button'
						onClick={() => onAddAmount(stepIndex, 1)}
						disabled={isUpdating}
					>
						<Plus className='h-4 w-4 mr-1' />
						Добавить вручную
					</Button>
				</div>
			</div>
		)
	}

	if (type === 'items') {
		return (
			<div className='bg-purple-50 border border-purple-200 rounded-lg p-4'>
				<div className='flex items-center justify-between mb-3'>
					<div>
						<h5 className='font-medium text-slate-900 mb-1'>
							📦 Материалы/предметы
						</h5>
						<p className='text-sm text-slate-600'>
							Собрано:{' '}
							<span className='font-semibold text-purple-600'>
								{requirement.currentValue}
							</span>{' '}
							из{' '}
							<span className='font-semibold'>{requirement.targetValue}</span>
						</p>
					</div>
				</div>
				<div className='flex gap-2'>
					<Input
						type='number'
						id={`items-input-${stepIndex}`}
						placeholder='Количество для добавления'
						min='0'
						step='1'
						className='flex-1'
						onKeyDown={e => {
							if (e.key === 'Enter') {
								handleInputSubmit(`items-input-${stepIndex}`)
							}
						}}
					/>
					<Button
						type='button'
						onClick={() => handleInputSubmit(`items-input-${stepIndex}`)}
						disabled={isUpdating}
					>
						<Plus className='h-4 w-4 mr-1' />
						Добавить
					</Button>
				</div>
			</div>
		)
	}

	return null
}

