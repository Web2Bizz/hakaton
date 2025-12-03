import type { Quest } from '@/store/entities/quest/model/type'
import { QuestRequirementManager } from './QuestRequirementManager'

interface QuestStepsListProps {
	quest: Quest
	questId: number
	isUpdating: boolean
	isGeneratingQR: boolean
	onAddAmount: (
		stepIndex: number,
		amount: number,
		userId?: string,
		isAnonymous?: boolean
	) => void
	onGenerateQRCode: (stepIndex: number) => void
}

export function QuestStepsList({
	quest,
	questId,
	isUpdating,
	isGeneratingQR,
	onAddAmount,
	onGenerateQRCode,
}: QuestStepsListProps) {
	const isArchived = quest.status === 'archived'

	if (quest.steps?.length === 0) {
		return (
			<div
				className={`border rounded-lg p-6 sm:p-8 text-center ${
					isArchived
						? 'bg-slate-100 border-slate-300'
						: 'bg-slate-50 border-slate-200'
				}`}
			>
				<p
					className={`text-sm sm:text-base ${
						isArchived ? 'text-slate-500' : 'text-slate-600'
					}`}
				>
					У этого квеста пока нет этапов с требованиями выполнения
				</p>
			</div>
		)
	}

	return (
		<div className='space-y-4 sm:space-y-6'>
			{quest.steps?.map((step, stepIndex) => {
				if (!step.requirement) {
					// Не показываем сообщение для архивированных квестов
					if (isArchived) {
						return null
					}
					return (
						<div
							key={stepIndex}
							className='border rounded-lg p-3 sm:p-4 border-slate-200 bg-slate-50'
						>
							<h4 className='font-semibold mb-2 text-sm sm:text-base text-slate-900'>
								{step.title}
							</h4>
							<p className='text-xs sm:text-sm text-slate-600'>
								У этого этапа нет требований выполнения
							</p>
						</div>
					)
				}

				return (
					<QuestRequirementManager
						key={stepIndex}
						step={step}
						stepIndex={stepIndex}
						requirement={step.requirement}
						isUpdating={isUpdating}
						questId={questId}
						onAddAmount={onAddAmount}
						onGenerateQRCode={onGenerateQRCode}
						isGeneratingQR={isGeneratingQR}
					/>
				)
			})}
		</div>
	)
}

