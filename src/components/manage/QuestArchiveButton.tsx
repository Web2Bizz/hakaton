import { Button } from '@/components/ui/button'
import { Archive } from 'lucide-react'

interface QuestArchiveButtonProps {
	onClick: () => void
}

export function QuestArchiveButton({ onClick }: QuestArchiveButtonProps) {
	return (
		<div className='mt-8 border-t border-slate-200 pt-6'>
			<div className='bg-slate-50 border border-slate-200 rounded-lg p-6'>
				<div className='flex items-start gap-3 mb-4'>
					<Archive className='h-5 w-5 text-slate-600 mt-0.5' />
					<div className='flex-1'>
						<h3 className='text-lg font-semibold text-slate-900 mb-1'>
							Архивация квеста
						</h3>
						<p className='text-sm text-slate-600'>
							Квест завершен на 100%. Вы можете архивировать его, чтобы скрыть из
							активных квестов.
						</p>
					</div>
				</div>
				<Button
					type='button'
					variant='outline'
					onClick={onClick}
					className='text-slate-700 border-slate-300 hover:bg-slate-100'
				>
					<Archive className='h-4 w-4 mr-2' />
					Архивировать квест
				</Button>
			</div>
		</div>
	)
}

