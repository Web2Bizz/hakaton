import { Spinner } from '@/components/ui/spinner'
import {
	useGetQuestQuery,
} from '@/store/entities/quest'
import type { Quest } from '@/store/entities/quest/model/type'
import { QRCodeModal } from './QRCodeModal'
import { QuestArchiveButton } from './QuestArchiveButton'
import { QuestArchiveDialog } from './QuestArchiveDialog'
import { QuestCompleteButton } from './QuestCompleteButton'
import { QuestStepsList } from './QuestStepsList'
import { useQuestManagement } from './hooks/useQuestManagement'

interface QuestManagementProps {
	readonly questId: number
	readonly quest: Quest
}

export function QuestManagement({
	questId,
	quest: initialQuest,
}: QuestManagementProps) {
	const { data: quest, isLoading, refetch } = useGetQuestQuery(questId)

	// Используем актуальные данные квеста или начальные
	const currentQuest = quest || initialQuest
	const questStatus = quest?.status || initialQuest?.status
	const isArchived = currentQuest?.status === 'archived'

	const {
		handleAddAmount,
		handleComplete,
		handleArchive,
		generateQRCode,
		isUpdating,
		isGeneratingQR,
		showQRCode,
		setShowQRCode,
		qrCodeData,
		showArchiveDialog,
		setShowArchiveDialog,
		isArchiving,
		isCompleting,
	} = useQuestManagement({
		questId,
		currentQuest,
		refetch,
	})

	if (isLoading) {
		return (
			<div className='flex items-center justify-center py-12'>
				<Spinner />
			</div>
		)
	}

	if (!currentQuest) {
		return <div>Квест не найден</div>
	}

	return (
		<div className={`space-y-4 sm:space-y-6 ${isArchived ? 'opacity-75' : ''}`}>
			<div className='mb-4 sm:mb-6'>
				<h3
					className={`text-xl sm:text-2xl font-bold mb-2 ${
						isArchived ? 'text-slate-600' : 'text-slate-900'
					}`}
				>
					Управление требованиями выполнения
				</h3>
				<p className='text-slate-600 text-xs sm:text-sm'>
					Отслеживайте прогресс и управляйте вкладами участников в каждый этап
					квеста
				</p>
			</div>

			<QuestStepsList
				quest={currentQuest}
				questId={questId}
				isUpdating={isUpdating}
				isGeneratingQR={isGeneratingQR}
				onAddAmount={handleAddAmount}
				onGenerateQRCode={generateQRCode}
			/>

			{/* Кнопка завершения квеста (только для активных квестов) */}
			{questStatus === 'active' && (
				<QuestCompleteButton
					onComplete={handleComplete}
					isCompleting={isCompleting}
					isUpdating={isUpdating}
				/>
			)}

			{/* Кнопка архивации (только для завершенных квестов) */}
			{currentQuest.status === 'completed' && (
				<QuestArchiveButton onClick={() => setShowArchiveDialog(true)} />
			)}

			{/* Диалог подтверждения архивации */}
			<QuestArchiveDialog
				open={showArchiveDialog}
				onOpenChange={setShowArchiveDialog}
				questTitle={currentQuest.title}
				onArchive={handleArchive}
				isArchiving={isArchiving}
			/>

			{/* Модальное окно с QR кодом */}
			<QRCodeModal
				isOpen={showQRCode}
				onClose={() => setShowQRCode(false)}
				qrCodeData={qrCodeData}
				isLoading={isGeneratingQR}
			/>
		</div>
	)
}
