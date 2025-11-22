import { Button } from '@/components/ui/button'
import { logger } from '@/utils/logger'
import { Spinner } from '@/components/ui/spinner'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface DangerZoneProps {
	title: string
	description: string
	confirmMessage: string
	onDelete: () => Promise<void> | void
	deleteButtonText: string
}

export function DangerZone({
	title,
	description,
	confirmMessage,
	onDelete,
	deleteButtonText,
}: DangerZoneProps) {
	const [showConfirm, setShowConfirm] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)

	const handleDelete = async () => {
		setIsDeleting(true)
		try {
			await onDelete()
			setShowConfirm(false)
		} catch (error) {
			logger.error('Error deleting:', error)
		} finally {
			setIsDeleting(false)
		}
	}

	return (
		<div className='mt-8 border-t border-red-200 pt-6'>
			<div className='bg-red-50 border border-red-200 rounded-lg p-6'>
				<div className='flex items-start gap-3 mb-4'>
					<AlertTriangle className='h-5 w-5 text-red-600 mt-0.5' />
					<div className='flex-1'>
						<h3 className='text-lg font-semibold text-red-900 mb-1'>{title}</h3>
						<p className='text-sm text-red-700'>{description}</p>
					</div>
				</div>

				{!showConfirm ? (
					<Button
						type='button'
						variant='outline'
						onClick={() => setShowConfirm(true)}
						className='border-red-300 text-red-700 hover:bg-red-100 hover:border-red-400'
					>
						<Trash2 className='h-4 w-4 mr-2' />
						{deleteButtonText}
					</Button>
				) : (
					<div className='space-y-3'>
						<p className='text-sm font-medium text-red-900'>{confirmMessage}</p>
						<div className='flex gap-2'>
							<Button
								type='button'
								variant='outline'
								onClick={() => setShowConfirm(false)}
								disabled={isDeleting}
							>
								Отмена
							</Button>
							<Button
								type='button'
								onClick={handleDelete}
								disabled={isDeleting}
								className='bg-red-600 hover:bg-red-700 text-white'
							>
								{isDeleting ? (
									<div className='flex items-center gap-2'>
										<Spinner />
										<span>Удаление...</span>
									</div>
								) : (
									'Да, удалить'
								)}
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

