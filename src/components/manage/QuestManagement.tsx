import { useGetQuestQuery, useUpdateQuestMutation } from '@/store/entities/quest'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useState } from 'react'
import { toast } from 'sonner'
import { QrCode, Plus } from 'lucide-react'
import type { Quest } from '@/store/entities/quest/model/type'
import { formatCurrency } from '@/utils/format'

interface QuestManagementProps {
	questId: number
	quest: Quest
}

export function QuestManagement({ questId, quest: initialQuest }: QuestManagementProps) {
	const { data: quest, isLoading, refetch } = useGetQuestQuery(questId)
	const [updateQuest, { isLoading: isUpdating }] = useUpdateQuestMutation()
	const [showQRCode, setShowQRCode] = useState(false)
	const [qrCodeData, setQrCodeData] = useState<string>('')

	// Используем актуальные данные квеста или начальные
	const currentQuest = quest || initialQuest

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

	const handleUpdateRequirement = async (
		stepIndex: number,
		newCurrentValue: number
	) => {
		if (!currentQuest.steps || !currentQuest.steps[stepIndex]) return

		const updatedSteps = [...currentQuest.steps]
		const step = updatedSteps[stepIndex]

		if (step.requirement) {
			step.requirement.currentValue = Math.max(
				0,
				Math.min(newCurrentValue, step.requirement.targetValue)
			)

			// Пересчитываем прогресс этапа
			const progress = Math.round(
				(step.requirement.currentValue / step.requirement.targetValue) * 100
			)
			step.progress = Math.min(100, Math.max(0, progress))

			// Если собрано достаточно, помечаем как завершенный
			if (step.requirement.currentValue >= step.requirement.targetValue) {
				step.status = 'completed'
			} else if (step.requirement.currentValue > 0) {
				step.status = 'in_progress'
			}
		}

		try {
			await updateQuest({
				id: questId,
				data: {
					steps: updatedSteps,
				},
			}).unwrap()
			toast.success('Требования успешно обновлены')
			refetch()
		} catch (error) {
			if (import.meta.env.DEV) {
				console.error('Error updating quest:', error)
			}
			const errorMessage =
				error && typeof error === 'object' && 'data' in error
					? (error.data as { message?: string })?.message ||
					  'Не удалось обновить требования'
					: 'Не удалось обновить требования. Попробуйте еще раз.'
			toast.error(errorMessage)
		}
	}

	const handleAddAmount = (stepIndex: number, amount: number) => {
		const step = currentQuest.steps?.[stepIndex]
		if (!step?.requirement) return

		const newValue = step.requirement.currentValue + amount
		handleUpdateRequirement(stepIndex, newValue)
	}

	const generateQRCode = (stepIndex: number) => {
		const step = currentQuest.steps?.[stepIndex]
		if (!step) return

		// Генерируем уникальный токен для QR кода
		const token = `${questId}-${stepIndex}-${Date.now()}`
		const qrData = JSON.stringify({
			questId,
			stepIndex,
			token,
			type: 'volunteer_checkin',
		})

		setQrCodeData(qrData)
		setShowQRCode(true)
	}

	const handleVolunteerCheckin = async (stepIndex: number) => {
		// Увеличиваем количество зарегистрированных волонтеров на 1
		handleAddAmount(stepIndex, 1)
	}

	return (
		<div className='space-y-6'>
			<h3 className='text-lg font-semibold text-slate-900 mb-4'>
				Управление требованиями выполнения
			</h3>

			{currentQuest.steps && currentQuest.steps.length > 0 ? (
				<div className='space-y-6'>
					{currentQuest.steps.map((step, stepIndex) => {
						if (!step.requirement) {
							return (
								<div
									key={stepIndex}
									className='border border-slate-200 rounded-lg p-4 bg-slate-50'
								>
									<h4 className='font-semibold text-slate-900 mb-2'>
										{step.title}
									</h4>
									<p className='text-sm text-slate-600'>
										У этого этапа нет требований выполнения
									</p>
								</div>
							)
						}

						// Определяем тип требования на основе targetValue
						// >= 1000 = финансовые средства, < 1000 = волонтеры или материалы
						const isFinancial = step.requirement.targetValue >= 1000
						const isVolunteers = !isFinancial && step.requirement.targetValue < 1000
						// Для материалов можно использовать описание этапа или отдельное поле
						// Пока используем ту же логику, что и для волонтеров
						const isItems = false // Можно добавить логику определения материалов

						return (
							<div
								key={stepIndex}
								className='border border-slate-200 rounded-lg p-6 bg-white'
							>
								<div className='flex items-start justify-between mb-4'>
									<div className='flex-1'>
										<h4 className='font-semibold text-slate-900 mb-1'>
											{step.title}
										</h4>
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
											<span className='text-slate-600'>
												Прогресс: {step.progress}%
											</span>
										</div>
									</div>
								</div>

								{/* Требования */}
								<div className='space-y-4'>
									{isFinancial && (
										<div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
											<div className='flex items-center justify-between mb-3'>
												<div>
													<h5 className='font-medium text-slate-900 mb-1'>
														💰 Финансовые средства
													</h5>
													<p className='text-sm text-slate-600'>
														Собрано:{' '}
														<span className='font-semibold text-blue-600'>
															{formatCurrency(
																step.requirement.currentValue,
																'RUB'
															)}
														</span>{' '}
														из{' '}
														<span className='font-semibold'>
															{formatCurrency(
																step.requirement.targetValue,
																'RUB'
															)}
														</span>
													</p>
												</div>
											</div>
											<div className='flex gap-2'>
												<Input
													type='number'
													id={`financial-input-${stepIndex}`}
													placeholder='Сумма для добавления'
													min='0'
													step='100'
													className='flex-1'
													onKeyDown={e => {
														if (e.key === 'Enter') {
															const input = e.target as HTMLInputElement
															const amount = Number.parseFloat(input.value) || 0
															if (amount > 0) {
																handleAddAmount(stepIndex, amount)
																input.value = ''
															}
														}
													}}
												/>
												<Button
													type='button'
													onClick={() => {
														const input = document.getElementById(
															`financial-input-${stepIndex}`
														) as HTMLInputElement
														const amount = Number.parseFloat(input?.value || '0')
														if (amount > 0) {
															handleAddAmount(stepIndex, amount)
															if (input) input.value = ''
														}
													}}
													disabled={isUpdating}
												>
													<Plus className='h-4 w-4 mr-1' />
													Добавить
												</Button>
											</div>
										</div>
									)}

									{isVolunteers && (
										<div className='bg-green-50 border border-green-200 rounded-lg p-4'>
											<div className='flex items-center justify-between mb-3'>
												<div>
													<h5 className='font-medium text-slate-900 mb-1'>
														👥 Волонтеры
													</h5>
													<p className='text-sm text-slate-600'>
														Зарегистрировано:{' '}
														<span className='font-semibold text-green-600'>
															{step.requirement.currentValue}
														</span>{' '}
														из{' '}
														<span className='font-semibold'>
															{step.requirement.targetValue}
														</span>
													</p>
												</div>
											</div>
											<div className='flex gap-2'>
												<Button
													type='button'
													variant='outline'
													onClick={() => generateQRCode(stepIndex)}
													className='flex-1'
												>
													<QrCode className='h-4 w-4 mr-2' />
													Сгенерировать QR код
												</Button>
												<Button
													type='button'
													onClick={() => handleVolunteerCheckin(stepIndex)}
													disabled={isUpdating}
												>
													<Plus className='h-4 w-4 mr-1' />
													Добавить вручную
												</Button>
											</div>
										</div>
									)}

									{/* Материалы/предметы - пока используем ту же логику, что и для волонтеров */}
									{isItems && (
										<div className='bg-purple-50 border border-purple-200 rounded-lg p-4'>
											<div className='flex items-center justify-between mb-3'>
												<div>
													<h5 className='font-medium text-slate-900 mb-1'>
														📦 Материалы/предметы
													</h5>
													<p className='text-sm text-slate-600'>
														Собрано:{' '}
														<span className='font-semibold text-purple-600'>
															{step.requirement.currentValue}
														</span>{' '}
														из{' '}
														<span className='font-semibold'>
															{step.requirement.targetValue}
														</span>
													</p>
												</div>
											</div>
											<div className='flex gap-2'>
												<Input
													type='number'
													id={`items-input-${stepIndex}`}
													placeholder='Количество для добавления'
													min='0'
													step='1'
													className='flex-1'
													onKeyDown={e => {
														if (e.key === 'Enter') {
															const input = e.target as HTMLInputElement
															const amount = Number.parseFloat(input.value) || 0
															if (amount > 0) {
																handleAddAmount(stepIndex, amount)
																input.value = ''
															}
														}
													}}
												/>
												<Button
													type='button'
													onClick={() => {
														const input = document.getElementById(
															`items-input-${stepIndex}`
														) as HTMLInputElement
														const amount = Number.parseFloat(input?.value || '0')
														if (amount > 0) {
															handleAddAmount(stepIndex, amount)
															if (input) input.value = ''
														}
													}}
													disabled={isUpdating}
												>
													<Plus className='h-4 w-4 mr-1' />
													Добавить
												</Button>
											</div>
										</div>
									)}
								</div>
							</div>
						)
					})}
				</div>
			) : (
				<div className='bg-slate-50 border border-slate-200 rounded-lg p-8 text-center'>
					<p className='text-slate-600'>
						У этого квеста пока нет этапов с требованиями выполнения
					</p>
				</div>
			)}

			{/* Модальное окно с QR кодом */}
			{showQRCode && (
				<div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
					<div className='bg-white rounded-2xl p-6 max-w-md w-full mx-4'>
						<div className='flex items-center justify-between mb-4'>
							<h3 className='text-lg font-semibold text-slate-900'>
								QR код для отметки присутствия
							</h3>
							<button
								type='button'
								onClick={() => setShowQRCode(false)}
								className='text-slate-500 hover:text-slate-900'
							>
								✕
							</button>
						</div>
						<div className='flex flex-col items-center space-y-4'>
							<div className='bg-white p-4 rounded-lg border-2 border-slate-200'>
								<QRCodeDisplay data={qrCodeData} />
							</div>
							<p className='text-sm text-slate-600 text-center'>
								Отсканируйте этот QR код, чтобы отметить присутствие волонтера
							</p>
							<Button
								type='button'
								variant='outline'
								onClick={() => setShowQRCode(false)}
							>
								Закрыть
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

// Простой компонент для отображения QR кода
// В реальном приложении можно использовать библиотеку qrcode.react
function QRCodeDisplay({ data }: { data: string }) {
	// Используем внешний сервис для генерации QR кода
	const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`

	return (
		<div className='flex items-center justify-center'>
			<img src={qrUrl} alt='QR Code' className='w-48 h-48' />
		</div>
	)
}

