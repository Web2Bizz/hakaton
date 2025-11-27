import { Button } from '@/components/ui/button'
import { Archive } from 'lucide-react'

interface QuestArchiveButtonProps {
	onClick: () => void
}

export function QuestArchiveButton({ onClick }: QuestArchiveButtonProps) {
	return (
		<div className='mt-6 sm:mt-8 border-t border-slate-200 pt-4 sm:pt-6'>
			<div className='bg-slate-50 border border-slate-200 rounded-lg p-4 sm:p-6'>
				<div className='flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4'>
					<Archive className='h-4 w-4 sm:h-5 sm:w-5 text-slate-600 mt-0.5 flex-shrink-0' />
					<div className='flex-1 min-w-0'>
						<h3 className='text-base sm:text-lg font-semibold text-slate-900 mb-1'>
							Архивация квеста
						</h3>
						<p className='text-xs sm:text-sm text-slate-600'>
							Квест завершен на 100%. Вы можете архивировать его, чтобы скрыть
							из активных квестов.
						</p>
					</div>
				</div>
				<Button
					type='button'
					variant='outline'
					onClick={onClick}
					className='w-full sm:w-auto text-slate-700 border-slate-300 hover:bg-slate-100 h-10 sm:h-auto text-sm sm:text-base'
				>
					<Archive className='h-4 w-4 mr-2' />
					Архивировать квест
				</Button>
			</div>
		</div>
	)
}
