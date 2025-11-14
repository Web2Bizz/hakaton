import { useState } from 'react'
import { X, Heart } from 'lucide-react'
import type { QuestStage } from '../../types/quest-types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QUICK_DONATION_AMOUNTS } from '@/constants'
import { formatCurrency } from '@/utils/format'

interface DonationPanelProps {
	readonly stage: QuestStage
	readonly questTitle: string
	readonly onDonate: (amount: number, stageId: string) => void
	readonly onClose: () => void
}

const quickAmounts = [200, 500, 1000, 2000, 5000]

export function DonationPanel({
	stage,
	questTitle,
	onDonate,
	onClose,
}: DonationPanelProps) {
	const [amount, setAmount] = useState('')
	const [customAmount, setCustomAmount] = useState('')

	if (!stage.requirements?.financial) {
		return null
	}

	const { collected, needed, currency } = stage.requirements.financial
	const remaining = needed - collected
	const progress = (collected / needed) * 100

	const handleQuickAmount = (value: number) => {
		setAmount(value.toString())
		setCustomAmount('')
	}

	const handleCustomAmount = (value: string) => {
		setCustomAmount(value)
		setAmount('')
	}

	const handleDonate = () => {
		const donateAmount = customAmount
			? parseFloat(customAmount)
			: parseFloat(amount)
		if (donateAmount > 0 && donateAmount <= remaining) {
			onDonate(donateAmount, stage.id)
			onClose()
		}
	}

	const selectedAmount = customAmount ? parseFloat(customAmount) : parseFloat(amount)

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
						<Heart className='h-5 w-5 text-red-500' />
						<h3 className='text-xl font-bold text-slate-900'>
							Поддержать этап
						</h3>
					</div>
					<p className='text-sm text-slate-600 mb-1'>{questTitle}</p>
					<p className='text-base font-semibold text-slate-900 mb-4'>
						{stage.title}
					</p>

					{/* Прогресс сбора */}
					<div className='mb-4'>
						<div className='flex items-center justify-between mb-2'>
							<span className='text-sm font-medium text-slate-700'>
								Собрано: {formatCurrency(collected, currency)}
							</span>
							<span className='text-sm font-medium text-slate-700'>
								Осталось: {formatCurrency(remaining, currency)}
							</span>
						</div>
						<div className='h-3 bg-slate-200 rounded-full overflow-hidden'>
							<div
								className='h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-300'
								style={{ width: `${Math.min(progress, 100)}%` }}
							/>
						</div>
					</div>
				</div>

				{/* Быстрые суммы */}
				<div className='mb-4'>
					<p className='text-sm font-medium text-slate-700 mb-2'>
						Быстрый выбор:
					</p>
					<div className='grid grid-cols-5 gap-2'>
						{QUICK_DONATION_AMOUNTS.map(quickAmount => (
							<button
								key={quickAmount}
								type='button'
								onClick={() => handleQuickAmount(quickAmount)}
								disabled={quickAmount > remaining}
								className={`px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
									amount === quickAmount.toString()
										? 'border-blue-500 bg-blue-50 text-blue-700'
										: 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed'
								}`}
							>
								{quickAmount}
							</button>
						))}
					</div>
				</div>

				{/* Произвольная сумма */}
				<div className='mb-6'>
					<p className='text-sm font-medium text-slate-700 mb-2'>
						Или введите свою сумму:
					</p>
						<Input
							type='number'
							value={customAmount}
							onChange={e => handleCustomAmount(e.target.value)}
							placeholder={`Макс. ${formatCurrency(remaining, currency)}`}
							min={1}
							max={remaining}
							className='w-full'
						/>
				</div>

				{/* Выбранная сумма */}
				{selectedAmount > 0 && (
					<div className='mb-4 p-4 rounded-xl bg-blue-50 border border-blue-200'>
						<div className='flex items-center justify-between'>
							<span className='text-sm font-medium text-slate-700'>
								Ваш вклад:
							</span>
							<span className='text-lg font-bold text-blue-700'>
								{formatCurrency(selectedAmount, currency)}
							</span>
						</div>
						{selectedAmount <= remaining && (
							<p className='text-xs text-slate-600 mt-1'>
								После вашего взноса будет собрано:{' '}
								{formatCurrency(collected + selectedAmount, currency)} из{' '}
								{formatCurrency(needed, currency)}
							</p>
						)}
					</div>
				)}

				{/* Кнопка доната */}
				<Button
					onClick={handleDonate}
					disabled={selectedAmount <= 0 || selectedAmount > remaining}
					className='w-full bg-gradient-to-br from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
					type='button'
				>
					Внести {selectedAmount > 0 ? formatCurrency(selectedAmount, currency) : 'средства'}
				</Button>

				<p className='text-xs text-slate-500 text-center mt-4'>
					💳 Платежи обрабатываются через безопасный шлюз
				</p>
			</div>
		</div>
	)
}

