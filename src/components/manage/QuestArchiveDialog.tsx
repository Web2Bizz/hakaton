import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Spinner } from '@/components/ui/spinner'
import { Archive } from 'lucide-react'

interface QuestArchiveDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	questTitle: string
	onArchive: () => void
	isArchiving: boolean
}

export function QuestArchiveDialog({
	open,
	onOpenChange,
	questTitle,
	onArchive,
	isArchiving,
}: QuestArchiveDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Подтверждение архивации</AlertDialogTitle>
					<AlertDialogDescription>
						Вы уверены, что хотите архивировать квест "{questTitle}"?
						Архивированный квест будет скрыт из активных квестов, но его можно будет
						найти в архиве.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isArchiving}>Отмена</AlertDialogCancel>
					<AlertDialogAction
						onClick={onArchive}
						disabled={isArchiving}
						className='bg-slate-600 hover:bg-slate-700 focus:ring-slate-600'
					>
						{isArchiving ? (
							<div className='flex items-center gap-2'>
								<Spinner />
								<span>Архивация...</span>
							</div>
						) : (
							<>
								<Archive className='h-4 w-4 mr-2' />
								Архивировать
							</>
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}

