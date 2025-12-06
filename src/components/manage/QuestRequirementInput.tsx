import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, type SelectOption } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { useQuestParticipants } from '@/hooks/useQuestParticipants'
import {
	useAddQuestContributerMutation,
	useAddQuestStepContributionMutation,
	useGetQuestContributersQuery,
	useGetQuestQuery,
} from '@/store/entities/quest'
import type { QuestStepRequirement } from '@/store/entities/quest/model/type'
import { getErrorMessage } from '@/utils/error'
import { formatCurrency } from '@/utils/format'
import { logger } from '@/utils/logger'
import { Check, Plus, QrCode, Search, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

export type RequirementType = 'financial' | 'volunteers' | 'items'

interface QuestRequirementInputProps {
	readonly requirement: QuestStepRequirement
	readonly stepIndex: number
	readonly type: RequirementType
	readonly stepType?: 'finance' | 'contributers' | 'material'
	readonly isUpdating: boolean
	readonly questId: number
	readonly onAddAmount: (
		stepIndex: number,
		amount: number,
		userId?: string,
		isAnonymous?: boolean
	) => void
	readonly onGenerateQRCode?: (stepIndex: number) => void
	readonly isGeneratingQR?: boolean
}

export function QuestRequirementInput({
	requirement,
	stepIndex,
	type,
	stepType,
	isUpdating,
	questId,
	onAddAmount,
	onGenerateQRCode,
	isGeneratingQR,
}: QuestRequirementInputProps) {
	const { participants, isLoading: isLoadingParticipants } =
		useQuestParticipants(questId)
	const [addContribution, { isLoading: isAddingContribution }] =
		useAddQuestStepContributionMutation()
	const [addQuestContributer, { isLoading: isMarkingVolunteers }] =
		useAddQuestContributerMutation()
	const { refetch: refetchQuest } = useGetQuestQuery(questId)

	// Загружаем уже отмеченных волонтеров только для этапа с типом "contributers"
	const {
		data: markedVolunteersData,
		isLoading: isLoadingMarkedVolunteers,
		refetch: refetchMarkedVolunteers,
	} = useGetQuestContributersQuery(questId, {
		skip: type !== 'volunteers' || stepType !== 'contributers',
	})

	const [selectedUserId, setSelectedUserId] = useState<string>('')
	const [selectedVolunteers, setSelectedVolunteers] = useState<Set<string>>(
		new Set()
	)
	const [markedVolunteerIds, setMarkedVolunteerIds] = useState<Set<string>>(
		new Set()
	)
	const [amount, setAmount] = useState<string>('')
	const [searchQuery, setSearchQuery] = useState<string>('')

	// Инициализируем markedVolunteerIds с уже отмеченными пользователями (заблокированные)
	useEffect(() => {
		if (
			type === 'volunteers' &&
			stepType === 'contributers' &&
			!isLoadingMarkedVolunteers
		) {
			if (
				markedVolunteersData?.data &&
				Array.isArray(markedVolunteersData.data)
			) {
				const markedIds = new Set(
					markedVolunteersData.data.map(volunteer => String(volunteer.id))
				)
				setMarkedVolunteerIds(markedIds)
			} else {
				// Если данных нет, очищаем отмеченных волонтеров
				setMarkedVolunteerIds(new Set())
			}
		}
	}, [type, stepType, markedVolunteersData, isLoadingMarkedVolunteers])

	const userOptions: SelectOption[] = useMemo(
		() => [
			{ value: 'anonymous', label: 'Инкогнито' },
			...participants.map(p => ({
				value: p.id,
				label: p.name,
			})),
		],
		[participants]
	)

	// Фильтруем участников по поисковому запросу
	const filteredParticipants = useMemo(() => {
		if (!searchQuery.trim()) {
			return participants
		}

		const query = searchQuery.toLowerCase().trim()
		return participants.filter(participant => {
			const name = participant.name.toLowerCase()
			const email = participant.email?.toLowerCase() || ''
			return name.includes(query) || email.includes(query)
		})
	}, [participants, searchQuery])

	const isAnonymous = selectedUserId === 'anonymous'
	const actualUserId = isAnonymous ? undefined : selectedUserId || undefined

	const handleInputSubmit = async () => {
		const numAmount = Number.parseFloat(amount || '0')
		if (numAmount <= 0) return

		// Если это финансовый или материальный этап, и выбран пользователь, используем API
		if (
			(stepType === 'finance' || stepType === 'material') &&
			actualUserId &&
			!isAnonymous
		) {
			try {
				const userIdNum = Number.parseInt(actualUserId, 10)
				if (Number.isNaN(userIdNum)) {
					toast.error('Неверный ID пользователя')
					return
				}

				// Маппинг типа этапа для API
				const apiStepType =
					stepType === 'finance'
						? 'finance'
						: stepType === 'material'
						? 'material'
						: 'no_required'

				await addContribution({
					questId,
					stepType: apiStepType,
					userId: userIdNum,
					contributeValue: numAmount,
				}).unwrap()

				toast.success('Вклад успешно добавлен')
				setAmount('')
				setSelectedUserId('')
				// Обновляем данные квеста
				await refetchQuest()
			} catch (error) {
				logger.error('Error adding contribution:', error)
				const errorMessage = getErrorMessage(
					error,
					'Не удалось добавить вклад. Попробуйте еще раз.'
				)
				toast.error(errorMessage)
			}
		} else {
			// Для волонтеров или анонимных вкладов используем старый метод
			onAddAmount(stepIndex, numAmount, actualUserId, isAnonymous)
			setAmount('')
			setSelectedUserId('')
		}
	}

	const handleVolunteerToggle = (userId: string) => {
		// Не позволяем изменять уже отмеченных волонтеров
		if (markedVolunteerIds.has(userId)) {
			return
		}

		setSelectedVolunteers(prev => {
			const newSet = new Set(prev)
			if (newSet.has(userId)) {
				newSet.delete(userId)
			} else {
				newSet.add(userId)
			}
			return newSet
		})
	}

	const handleMarkVolunteers = async () => {
		// Отправляем только новых выбранных волонтеров (исключая уже отмеченных)
		const newVolunteers = Array.from(selectedVolunteers).filter(
			id => !markedVolunteerIds.has(id)
		)

		if (newVolunteers.length === 0) {
			toast.info('Нет новых волонтеров для отметки')
			return
		}

		try {
			// Преобразуем выбранные ID из строк в числа
			const userIds = newVolunteers.map(id => Number.parseInt(id, 10))

			// Проверяем, что все ID валидны
			if (userIds.some(id => Number.isNaN(id))) {
				toast.error('Неверный ID пользователя')
				return
			}

			// Отправляем массив userIds одним запросом
			await addQuestContributer({
				questId,
				userIds,
			}).unwrap()

			toast.success('Волонтеры успешно отмечены')
			// Обновляем данные квеста и отмеченных волонтеров
			await Promise.all([refetchQuest(), refetchMarkedVolunteers()])
			// Очищаем выбранных волонтеров, так как они теперь отмечены на сервере
			setSelectedVolunteers(new Set())
		} catch (error) {
			logger.error('Error marking volunteers:', error)
			const errorMessage = getErrorMessage(
				error,
				'Не удалось отметить волонтеров. Попробуйте еще раз.'
			)
			toast.error(errorMessage)
		}
	}

	if (type === 'financial') {
		return (
			<div className='bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow'>
				<div className='flex items-start justify-between mb-3 sm:mb-4'>
					<div className='flex-1 min-w-0'>
						<div className='flex items-center gap-2 mb-2'>
							<div className='p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0'>
								<span className='text-xl sm:text-2xl'>💰</span>
							</div>
							<div className='min-w-0 flex-1'>
								<h5 className='font-semibold text-slate-900 text-sm sm:text-base'>
									Финансовые средства
								</h5>
								<p className='text-xs text-slate-500 mt-0.5'>
									Управление денежными взносами
								</p>
							</div>
						</div>
						<div className='bg-white/60 rounded-lg p-2.5 sm:p-3 mt-2 sm:mt-3'>
							<p className='text-xs sm:text-sm text-slate-700 mb-1'>
								Прогресс сбора:
							</p>
							<div className='flex items-baseline gap-1.5 sm:gap-2 flex-wrap'>
								<span className='text-xl sm:text-2xl font-bold text-blue-600'>
									{formatCurrency(requirement.currentValue, 'RUB')}
								</span>
								<span className='text-xs sm:text-sm text-slate-500'>из</span>
								<span className='text-base sm:text-lg font-semibold text-slate-700'>
									{formatCurrency(requirement.targetValue, 'RUB')}
								</span>
							</div>
							<div className='mt-2 h-2 bg-blue-100 rounded-full overflow-hidden'>
								<div
									className='h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500'
									style={{
										width: `${Math.min(
											(requirement.currentValue / requirement.targetValue) *
												100,
											100
										)}%`,
									}}
								/>
							</div>
						</div>
					</div>
				</div>

				<div className='space-y-3 mt-3 sm:mt-4'>
					<div>
						<label
							htmlFor={`participant-select-financial-${stepIndex}`}
							className='block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2'
						>
							Участник квеста
						</label>
						{isLoadingParticipants ? (
							<div className='relative h-10 w-full flex items-center justify-center border border-slate-300 rounded-md bg-white'>
								<Spinner />
							</div>
						) : (
							<Select
								id={`participant-select-financial-${stepIndex}`}
								options={userOptions}
								value={selectedUserId}
								onChange={e => setSelectedUserId(e.target.value)}
								placeholder='Выберите участника'
								className='w-full text-sm'
							/>
						)}
					</div>

					<div>
						<label
							htmlFor={`financial-input-${stepIndex}`}
							className='block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2'
						>
							Сумма взноса
						</label>
						<Input
							id={`financial-input-${stepIndex}`}
							type='number'
							value={amount}
							onChange={e => setAmount(e.target.value)}
							placeholder='Введите сумму'
							min='0'
							step='100'
							className='w-full text-sm'
							onKeyDown={e => {
								if (e.key === 'Enter') {
									handleInputSubmit()
								}
							}}
						/>
					</div>

					<Button
						type='button'
						onClick={handleInputSubmit}
						disabled={
							isUpdating ||
							isAddingContribution ||
							!amount ||
							Number.parseFloat(amount) <= 0
						}
						className='w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md h-10 sm:h-auto text-sm sm:text-base'
					>
						<Plus className='h-4 w-4 mr-2' />
						{isAddingContribution ? 'Добавление...' : 'Добавить взнос'}
					</Button>
				</div>
			</div>
		)
	}

	if (type === 'volunteers') {
		return (
			<div className='bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow'>
				<div className='flex items-start justify-between mb-3 sm:mb-4'>
					<div className='flex-1 min-w-0'>
						<div className='flex items-center gap-2 mb-2'>
							<div className='p-1.5 sm:p-2 bg-green-100 rounded-lg flex-shrink-0'>
								<span className='text-xl sm:text-2xl'>👥</span>
							</div>
							<div className='min-w-0 flex-1'>
								<h5 className='font-semibold text-slate-900 text-sm sm:text-base'>
									Волонтеры
								</h5>
								<p className='text-xs text-slate-500 mt-0.5'>
									Регистрация участников
								</p>
							</div>
						</div>
						<div className='bg-white/60 rounded-lg p-2.5 sm:p-3 mt-2 sm:mt-3'>
							<p className='text-xs sm:text-sm text-slate-700 mb-1'>
								Прогресс регистрации:
							</p>
							<div className='flex items-baseline gap-1.5 sm:gap-2 flex-wrap'>
								<span className='text-xl sm:text-2xl font-bold text-green-600'>
									{requirement.currentValue}
								</span>
								<span className='text-xs sm:text-sm text-slate-500'>из</span>
								<span className='text-base sm:text-lg font-semibold text-slate-700'>
									{requirement.targetValue}
								</span>
							</div>
							<div className='mt-2 h-2 bg-green-100 rounded-full overflow-hidden'>
								<div
									className='h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500'
									style={{
										width: `${Math.min(
											(requirement.currentValue / requirement.targetValue) *
												100,
											100
										)}%`,
									}}
								/>
							</div>
						</div>
					</div>
				</div>

				<div className='space-y-3 sm:space-y-4 mt-3 sm:mt-4'>
					{/* Список участников с чекбоксами */}
					<div>
						<p className='block text-xs sm:text-sm font-medium text-slate-700 mb-2 sm:mb-3'>
							Выберите участников для отметки:
						</p>
						{/* Поле поиска */}
						<div className='mb-3'>
							<div className='relative'>
								<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400' />
								<Input
									type='text'
									placeholder='Поиск по имени или email...'
									value={searchQuery}
									onChange={e => setSearchQuery(e.target.value)}
									className='pl-10 w-full text-sm'
								/>
							</div>
						</div>
						<div className='bg-white/60 rounded-lg p-3 sm:p-4 space-y-2 max-h-48 overflow-y-auto relative min-h-[100px]'>
							{isLoadingParticipants || isLoadingMarkedVolunteers ? (
								<div className='absolute inset-0 flex items-center justify-center'>
									<Spinner />
								</div>
							) : filteredParticipants.length > 0 ? (
								filteredParticipants.map(participant => {
									const isMarked = markedVolunteerIds.has(participant.id)
									const isSelected =
										isMarked || selectedVolunteers.has(participant.id)
									const isDisabled = isMarked

									return (
										<label
											key={participant.id}
											className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg transition-all ${
												isDisabled
													? 'bg-slate-100 border-2 border-slate-300 cursor-not-allowed opacity-75'
													: isSelected
													? 'bg-green-100 border-2 border-green-500 cursor-pointer'
													: 'bg-white border-2 border-slate-200 hover:border-green-300 cursor-pointer'
											}`}
										>
											<input
												type='checkbox'
												checked={isSelected}
												disabled={isDisabled}
												onChange={() => handleVolunteerToggle(participant.id)}
												className='h-4 w-4 sm:h-5 sm:w-5 rounded border-slate-300 text-green-600 focus:ring-green-500 flex-shrink-0 disabled:cursor-not-allowed'
											/>
											<div className='flex-1 min-w-0'>
												<p className='font-medium text-sm sm:text-base text-slate-900 truncate'>
													{participant.name}
													{isMarked && (
														<span className='ml-2 text-xs text-slate-500 font-normal'>
															(уже отмечен)
														</span>
													)}
												</p>
												{participant.email && (
													<p className='text-xs text-slate-500 truncate'>
														{participant.email}
													</p>
												)}
											</div>
											{isSelected && (
												<Check className='h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0' />
											)}
										</label>
									)
								})
							) : searchQuery.trim() ? (
								<p className='text-xs sm:text-sm text-slate-500 text-center py-3 sm:py-4'>
									Участники не найдены по запросу "{searchQuery}"
								</p>
							) : (
								<p className='text-xs sm:text-sm text-slate-500 text-center py-3 sm:py-4'>
									Нет участников квеста
								</p>
							)}
						</div>
					</div>

					<div className='flex flex-col sm:flex-row gap-2'>
						<Button
							type='button'
							onClick={handleMarkVolunteers}
							disabled={
								isUpdating ||
								isMarkingVolunteers ||
								selectedVolunteers.size === 0 ||
								Array.from(selectedVolunteers).every(id =>
									markedVolunteerIds.has(id)
								)
							}
							className='flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md h-10 sm:h-auto text-sm sm:text-base'
						>
							<Users className='h-4 w-4 mr-2' />
							{isMarkingVolunteers
								? 'Отмечаем...'
								: `Отметить (${
										Array.from(selectedVolunteers).filter(
											id => !markedVolunteerIds.has(id)
										).length
								  })`}
						</Button>
						{onGenerateQRCode && (
							<Button
								type='button'
								variant='outline'
								onClick={() => onGenerateQRCode(stepIndex)}
								disabled={isGeneratingQR}
								className='border-green-300 text-green-700 hover:bg-green-50 h-10 sm:h-auto text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed'
							>
								{isGeneratingQR ? (
									<>
										<div className='mr-2 flex items-center justify-center'>
											<Spinner />
										</div>
										<span className='hidden sm:inline'>Генерация...</span>
										<span className='sm:hidden'>...</span>
									</>
								) : (
									<>
										<QrCode className='h-4 w-4 mr-2' />
										<span className='hidden sm:inline'>QR код</span>
										<span className='sm:hidden'>QR</span>
									</>
								)}
							</Button>
						)}
					</div>
				</div>
			</div>
		)
	}

	if (type === 'items') {
		return (
			<div className='bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow'>
				<div className='flex items-start justify-between mb-3 sm:mb-4'>
					<div className='flex-1 min-w-0'>
						<div className='flex items-center gap-2 mb-2'>
							<div className='p-1.5 sm:p-2 bg-purple-100 rounded-lg flex-shrink-0'>
								<span className='text-xl sm:text-2xl'>📦</span>
							</div>
							<div className='min-w-0 flex-1'>
								<h5 className='font-semibold text-slate-900 text-sm sm:text-base'>
									Материалы/предметы
								</h5>
								<p className='text-xs text-slate-500 mt-0.5'>
									Учет материальных взносов
								</p>
							</div>
						</div>
						<div className='bg-white/60 rounded-lg p-2.5 sm:p-3 mt-2 sm:mt-3'>
							<p className='text-xs sm:text-sm text-slate-700 mb-1'>
								Прогресс сбора:
							</p>
							<div className='flex items-baseline gap-1.5 sm:gap-2 flex-wrap'>
								<span className='text-xl sm:text-2xl font-bold text-purple-600'>
									{requirement.currentValue}
								</span>
								<span className='text-xs sm:text-sm text-slate-500'>из</span>
								<span className='text-base sm:text-lg font-semibold text-slate-700'>
									{requirement.targetValue}
								</span>
							</div>
							<div className='mt-2 h-2 bg-purple-100 rounded-full overflow-hidden'>
								<div
									className='h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500'
									style={{
										width: `${Math.min(
											(requirement.currentValue / requirement.targetValue) *
												100,
											100
										)}%`,
									}}
								/>
							</div>
						</div>
					</div>
				</div>

				<div className='space-y-3 mt-3 sm:mt-4'>
					<div>
						<label
							htmlFor={`participant-select-items-${stepIndex}`}
							className='block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2'
						>
							Участник квеста
						</label>
						{isLoadingParticipants ? (
							<div className='relative h-10 w-full flex items-center justify-center border border-slate-300 rounded-md bg-white'>
								<Spinner />
							</div>
						) : (
							<Select
								id={`participant-select-items-${stepIndex}`}
								options={userOptions}
								value={selectedUserId}
								onChange={e => setSelectedUserId(e.target.value)}
								placeholder='Выберите участника'
								className='w-full text-sm'
							/>
						)}
					</div>

					<div>
						<label
							htmlFor={`items-input-${stepIndex}`}
							className='block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2'
						>
							Количество предметов
						</label>
						<Input
							id={`items-amount-input-${stepIndex}`}
							type='number'
							value={amount}
							onChange={e => setAmount(e.target.value)}
							placeholder='Введите количество'
							min='0'
							step='1'
							className='w-full text-sm'
							onKeyDown={e => {
								if (e.key === 'Enter') {
									handleInputSubmit()
								}
							}}
						/>
					</div>

					<Button
						type='button'
						onClick={handleInputSubmit}
						disabled={
							isUpdating ||
							isAddingContribution ||
							!amount ||
							Number.parseFloat(amount) <= 0
						}
						className='w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md h-10 sm:h-auto text-sm sm:text-base'
					>
						<Plus className='h-4 w-4 mr-2' />
						{isAddingContribution ? 'Добавление...' : 'Добавить предметы'}
					</Button>
				</div>
			</div>
		)
	}

	return null
}
