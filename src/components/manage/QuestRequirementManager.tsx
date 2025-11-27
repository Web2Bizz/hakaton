import type {
	QuestStep,
	QuestStepRequirement,
} from '@/store/entities/quest/model/type'
import { getRequirementType } from '@/utils/quest'
import {
	QuestRequirementInput,
	type RequirementType,
} from './QuestRequirementInput'

interface QuestRequirementManagerProps {
	readonly step: QuestStep
	readonly stepIndex: number
	readonly requirement: QuestStepRequirement
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

export function QuestRequirementManager({
	step,
	stepIndex,
	requirement,
	isUpdating,
	questId,
	onAddAmount,
	onGenerateQRCode,
}: QuestRequirementManagerProps) {
	// Используем type из step, если он есть, иначе определяем по значению (для обратной совместимости)
	let requirementType: RequirementType
	if (step.type) {
		// Маппинг новых значений на старые для компонента
		if (step.type === 'finance') {
			requirementType = 'financial'
		} else if (step.type === 'contributers') {
			requirementType = 'volunteers'
		} else {
			requirementType = 'items'
		}
	} else {
		requirementType = getRequirementType(requirement.targetValue)
	}

	return (
		<div className='border-2 border-slate-200 rounded-lg sm:rounded-xl p-4 sm:p-6 bg-gradient-to-br from-white to-slate-50/50 shadow-lg hover:shadow-xl transition-all duration-300'>
			<div className='flex items-start justify-between mb-4 sm:mb-6'>
				<div className='flex-1 min-w-0'>
					<div className='flex items-start gap-2 sm:gap-3 mb-2'>
						<div className='p-1.5 sm:p-2 bg-slate-100 rounded-lg flex-shrink-0'>
							<span className='text-lg sm:text-xl font-bold text-slate-700'>
								{stepIndex + 1}
							</span>
						</div>
						<div className='min-w-0 flex-1'>
							<h4 className='font-bold text-base sm:text-lg text-slate-900 break-words'>
								{step.title}
							</h4>
							{step.description && (
								<p className='text-xs sm:text-sm text-slate-600 mt-1 break-words'>
									{step.description}
								</p>
							)}
						</div>
					</div>
					<div className='flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-xs sm:text-sm mt-3 sm:mt-4'>
						<div className='flex items-center gap-2'>
							<span className='text-slate-600 whitespace-nowrap'>Статус:</span>
							<span
								className={`px-2 sm:px-3 py-1 rounded-full font-medium text-xs whitespace-nowrap ${
									step.status === 'completed'
										? 'bg-green-100 text-green-700'
										: step.status === 'in_progress'
										? 'bg-blue-100 text-blue-700'
										: 'bg-slate-100 text-slate-600'
								}`}
							>
								{step.status === 'completed'
									? '✓ Завершен'
									: step.status === 'in_progress'
									? '⟳ В процессе'
									: '○ Ожидает'}
							</span>
						</div>
						<div className='flex items-center gap-2'>
							<span className='text-slate-600 whitespace-nowrap'>
								Прогресс:
							</span>
							<span className='font-bold text-slate-900'>{step.progress}%</span>
						</div>
					</div>
				</div>
			</div>

			<div className='space-y-3 sm:space-y-4'>
				<QuestRequirementInput
					requirement={requirement}
					stepIndex={stepIndex}
					type={requirementType}
					isUpdating={isUpdating}
					questId={questId}
					onAddAmount={onAddAmount}
					onGenerateQRCode={onGenerateQRCode}
				/>
			</div>
		</div>
	)
}
