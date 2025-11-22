import type { QuestStep, QuestStepRequirement } from '@/store/entities/quest/model/type'
import { getRequirementType } from '@/utils/quest'
import { QuestRequirementInput, type RequirementType } from './QuestRequirementInput'

interface QuestRequirementManagerProps {
	step: QuestStep
	stepIndex: number
	requirement: QuestStepRequirement
	isUpdating: boolean
	onAddAmount: (stepIndex: number, amount: number) => void
	onGenerateQRCode?: (stepIndex: number) => void
}

export function QuestRequirementManager({
	step,
	stepIndex,
	requirement,
	isUpdating,
	onAddAmount,
	onGenerateQRCode,
}: QuestRequirementManagerProps) {
	const requirementType: RequirementType = getRequirementType(requirement.targetValue)

	return (
		<div className='border border-slate-200 rounded-lg p-6 bg-white'>
			<div className='flex items-start justify-between mb-4'>
				<div className='flex-1'>
					<h4 className='font-semibold text-slate-900 mb-1'>{step.title}</h4>
					<p className='text-sm text-slate-600 mb-3'>{step.description}</p>
					<div className='flex items-center gap-4 text-sm'>
						<span className='text-slate-600'>
							Статус:{' '}
							<span
								className={`font-medium ${
									step.status === 'completed'
										? 'text-green-600'
										: step.status === 'in_progress'
										? 'text-blue-600'
										: 'text-slate-500'
								}`}
							>
								{step.status === 'completed'
									? 'Завершен'
									: step.status === 'in_progress'
									? 'В процессе'
									: 'Ожидает'}
							</span>
						</span>
						<span className='text-slate-600'>Прогресс: {step.progress}%</span>
					</div>
				</div>
			</div>

			<div className='space-y-4'>
				<QuestRequirementInput
					requirement={requirement}
					stepIndex={stepIndex}
					type={requirementType}
					isUpdating={isUpdating}
					onAddAmount={onAddAmount}
					onGenerateQRCode={onGenerateQRCode}
				/>
			</div>
		</div>
	)
}

