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
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
	useDeleteQuestUpdateMutation,
	useGetQuestUpdatesQuery,
} from '@/store/entities/quest'
import type { QuestUpdate } from '@/store/entities/quest/model/type'
import { getErrorMessage } from '@/utils/error'
import { formatDate } from '@/utils/format'
import { logger } from '@/utils/logger'
import { Edit2, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { QuestUpdateForm } from '../QuestUpdateForm'

interface QuestUpdatesManagementProps {
	questId: number
}

export function QuestUpdatesManagement({
	questId,
}: QuestUpdatesManagementProps) {
	const [showCreateForm, setShowCreateForm] = useState(false)
	const [editingUpdateId, setEditingUpdateId] = useState<number | null>(null)

	const {
		data: updates = [],
		isLoading,
		refetch,
	} = useGetQuestUpdatesQuery(questId)

	const handleSuccess = () => {
		setShowCreateForm(false)
		setEditingUpdateId(null)
		refetch()
	}

	const handleCancel = () => {
		setShowCreateForm(false)
		setEditingUpdateId(null)
	}

	if (isLoading) {
		return (
			<div className='flex items-center justify-center py-12'>
				<Spinner />
			</div>
		)
	}

	if (showCreateForm) {
		return (
			<div className='space-y-4'>
				<div className='flex items-center justify-between'>
					<h3 className='text-lg font-semibold text-slate-900'>
						Создать обновление
					</h3>
					<Button
						type='button'
						variant='outline'
						size='sm'
						onClick={handleCancel}
					>
						<X className='h-4 w-4 mr-1' />
						Отмена
					</Button>
				</div>
				<QuestUpdateForm
					questId={questId}
					onSuccess={handleSuccess}
					onCancel={handleCancel}
				/>
			</div>
		)
	}

	if (editingUpdateId) {
		const update = updates.find(u => u.id === editingUpdateId)
		if (!update) {
			setEditingUpdateId(null)
			return null
		}

		return (
			<div className='space-y-4'>
				<div className='flex items-center justify-between'>
					<h3 className='text-lg font-semibold text-slate-900'>
						Редактировать обновление
					</h3>
					<Button
						type='button'
						variant='outline'
						size='sm'
						onClick={handleCancel}
					>
						<X className='h-4 w-4 mr-1' />
						Отмена
					</Button>
				</div>
				<QuestUpdateForm
					questId={questId}
					updateId={editingUpdateId}
					onSuccess={handleSuccess}
					onCancel={handleCancel}
				/>
			</div>
		)
	}

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<h3 className='text-lg font-semibold text-slate-900'>
					Обновления квеста
				</h3>
				<Button
					type='button'
					variant='outline'
					size='sm'
					onClick={() => setShowCreateForm(true)}
				>
					<Plus className='h-4 w-4 mr-1' />
					Добавить обновление
				</Button>
			</div>

			{updates.length === 0 ? (
				<div className='bg-slate-50 border border-slate-200 rounded-lg p-8 text-center'>
					<p className='text-slate-600 mb-4'>
						Пока нет обновлений. Добавьте первое обновление, чтобы рассказать о
						прогрессе квеста.
					</p>
					<Button
						type='button'
						variant='outline'
						onClick={() => setShowCreateForm(true)}
					>
						<Plus className='h-4 w-4 mr-2' />
						Добавить обновление
					</Button>
				</div>
			) : (
				<div className='space-y-4'>
					{updates.map(update => (
						<UpdateCard
							key={update.id}
							update={update}
							onEdit={() => setEditingUpdateId(update.id)}
							onDelete={refetch}
						/>
					))}
				</div>
			)}
		</div>
	)
}

function UpdateCard({
	update,
	onEdit,
	onDelete,
}: {
	update: QuestUpdate
	onEdit: () => void
	onDelete: () => void
}) {
	const [deleteQuestUpdate, { isLoading: isDeleting }] =
		useDeleteQuestUpdateMutation()
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)

	const handleDelete = async () => {
		try {
			await deleteQuestUpdate(update.id).unwrap()
			toast.success('Обновление успешно удалено')
			setShowDeleteDialog(false)
			onDelete()
		} catch (error) {
			logger.error('Error deleting quest update:', error)
			const errorMessage = getErrorMessage(
				error,
				'Не удалось удалить обновление. Попробуйте еще раз.'
			)
			toast.error(errorMessage)
		}
	}

	return (
		<div className='border border-slate-200 rounded-lg p-6 bg-white'>
			<div className='flex items-start justify-between mb-3'>
				<div className='flex-1'>
					<h4 className='text-base font-semibold text-slate-900 m-0 mb-1'>
						{update.title}
					</h4>
					{update.createdAt && (
						<p className='text-xs text-slate-500 m-0'>
							{formatDate(update.createdAt)}
						</p>
					)}
				</div>
				<div className='flex items-center gap-2'>
					<Button type='button' variant='outline' size='sm' onClick={onEdit}>
						<Edit2 className='h-4 w-4 mr-1' />
						Редактировать
					</Button>
					<Button
						type='button'
						variant='outline'
						size='sm'
						onClick={() => setShowDeleteDialog(true)}
						disabled={isDeleting}
						className='text-red-600 hover:text-red-700 hover:border-red-300'
					>
						<Trash2 className='h-4 w-4 mr-1' />
						Удалить
					</Button>
				</div>
			</div>

			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
						<AlertDialogDescription>
							Вы уверены, что хотите удалить обновление "{update.title}"? Это
							действие нельзя отменить.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={isDeleting}
							className='bg-red-600 hover:bg-red-700 focus:ring-red-600'
						>
							{isDeleting ? (
								<div className='flex items-center gap-2'>
									<Spinner />
									<span>Удаление...</span>
								</div>
							) : (
								'Удалить'
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
			<p className='text-sm text-slate-700 leading-relaxed m-0 mb-3'>
				{update.text}
			</p>
			{update.photos && update.photos.length > 0 && (
				<div className='grid grid-cols-2 gap-2 mt-3'>
					{update.photos.map((img, idx) => (
						<img
							key={idx}
							src={img}
							alt={update.title}
							className='w-full h-32 object-cover rounded-lg'
						/>
					))}
				</div>
			)}
		</div>
	)
}
