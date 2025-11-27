import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { CheckCircle } from 'lucide-react'

interface QuestCompleteButtonProps {
	onComplete: () => void
	isCompleting: boolean
	isUpdating: boolean
}

export function QuestCompleteButton({
	onComplete,
	isCompleting,
	isUpdating,
}: QuestCompleteButtonProps) {
	return (
		<div className='mt-6 sm:mt-8 border-t border-slate-200 pt-4 sm:pt-6'>
			<div className='bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6'>
				<div className='flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4'>
					<CheckCircle className='h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5 flex-shrink-0' />
					<div className='flex-1 min-w-0'>
						<h3 className='text-base sm:text-lg font-semibold text-slate-900 mb-1'>
							Завершение квеста
						</h3>
						<p className='text-xs sm:text-sm text-slate-600'>
							Завершите квест, когда все этапы выполнены. После завершения квест
							можно будет архивировать.
						</p>
					</div>
				</div>
				<Button
					type='button'
					onClick={onComplete}
					disabled={isCompleting || isUpdating}
					className='w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white h-10 sm:h-auto text-sm sm:text-base'
				>
					{isCompleting ? (
						<div className='flex items-center gap-2'>
							<Spinner />
							<span>Завершение...</span>
						</div>
					) : (
						<>
							<CheckCircle className='h-4 w-4 mr-2' />
							Завершить квест
						</>
					)}
				</Button>
			</div>
		</div>
	)
}
