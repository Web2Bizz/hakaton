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
import { ImageGallery } from '@/components/ui/ImageGallery'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '@/hooks/useAuth'
import { useUser } from '@/hooks/useUser'
import {
	useAssignAchievementMutation,
	useLazyGetUserQuery,
} from '@/store/entities'
import {
	useGetQuestQuery,
	useGetQuestUpdatesQuery,
} from '@/store/entities/quest'
import { transformUserFromAPI } from '@/utils/auth'
import { formatCurrency, formatDate } from '@/utils/format'
import { transformApiQuestToComponentQuest } from '@/utils/quest'
import { CheckCircle2, Circle, Clock, LogOut, Share2, Settings, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { QuestStage } from '../../types/quest-types'
import { AmbassadorShare } from './AmbassadorShare'
import { AuthRequiredDialog } from './AuthRequiredDialog'
import { VolunteerRegistration } from './VolunteerRegistration'

// Компонент для изображения истории с скелетоном
function StoryImage({
	image,
	alt,
	onClick,
}: {
	image: string
	alt: string
	onClick: () => void
}) {
	const [loading, setLoading] = useState(true)

	return (
		<button
			type='button'
			onClick={onClick}
			className='relative w-full h-48 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity'
			aria-label='Открыть изображение в галерее'
		>
			{loading && (
				<Skeleton className='absolute inset-0 w-full h-full rounded-xl' />
			)}
			<img
				src={image}
				alt={alt}
				className={`w-full h-full object-cover transition-opacity duration-300 ${
					loading ? 'opacity-0' : 'opacity-100'
				}`}
				onLoad={() => setLoading(false)}
				onError={() => setLoading(false)}
			/>
		</button>
	)
}

// Компонент для изображения галереи с скелетоном
function GalleryImage({
	image,
	index,
	onClick,
}: {
	image: string
	index: number
	onClick: () => void
}) {
	const [loading, setLoading] = useState(true)

	return (
		<button
			type='button'
			onClick={onClick}
			className='relative aspect-square rounded-lg overflow-hidden group cursor-pointer'
		>
			{loading && (
				<Skeleton className='absolute inset-0 w-full h-full rounded-lg' />
			)}
			<img
				src={image}
				alt={`Фото ${index + 1} из галереи квеста`}
				className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-200 ${
					loading ? 'opacity-0' : 'opacity-100'
				}`}
				loading='lazy'
				onLoad={() => setLoading(false)}
				onError={() => setLoading(false)}
			/>
			<div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors' />
		</button>
	)
}

interface QuestDetailsProps {
	questId: string | number | undefined
	onClose?: () => void
	isClosing?: boolean
	onParticipate?: (questId: string) => void
}

function getStageIcon(stage: QuestStage) {
	switch (stage.status) {
		case 'completed':
			return <CheckCircle2 className='h-5 w-5 text-green-600' />
		case 'in_progress':
			return <Clock className='h-5 w-5 text-blue-600' />
		default:
			return <Circle className='h-5 w-5 text-slate-300' />
	}
}

export function QuestDetails({
	questId,
	onClose,
	isClosing = false,
	onParticipate,
}: QuestDetailsProps) {
	const {
		user,
		setUser,
		participateInQuest,
		leaveQuest,
		contributeToQuest,
		checkAndUnlockAchievements,
	} = useUser()
	const { isAuthenticated } = useAuth()
	const navigate = useNavigate()
	const [assignAchievement] = useAssignAchievementMutation()
	const [getUser] = useLazyGetUserQuery()
	const [activeTab, setActiveTab] = useState<'stages' | 'updates'>('stages')
	const [showVolunteerRegistration, setShowVolunteerRegistration] = useState<{
		stage: QuestStage
	} | null>(null)
	const [showAmbassadorShare, setShowAmbassadorShare] = useState(false)
	const [showLeaveDialog, setShowLeaveDialog] = useState(false)
	const [galleryIndex, setGalleryIndex] = useState<number | null>(null)
	const [updateGalleryState, setUpdateGalleryState] = useState<{
		updateId: number
		imageIndex: number
	} | null>(null)
	const [showAuthDialog, setShowAuthDialog] = useState(false)

	// Загружаем детали квеста через API
	const numericQuestId = questId ? Number(questId) : undefined
	const {
		data: quest,
		isLoading: isLoadingQuest,
		error: questError,
	} = useGetQuestQuery(numericQuestId!, {
		skip: !numericQuestId,
	})

	// Получаем обновления квеста через API
	const { data: questUpdatesRaw = [], isLoading: isLoadingUpdates } =
		useGetQuestUpdatesQuery(numericQuestId!, {
			skip: !numericQuestId,
		})

	// Преобразуем квест из API в формат компонента
	const transformedQuest = useMemo(() => {
		if (!quest) return null
		return transformApiQuestToComponentQuest(quest)
	}, [quest])

	// Преобразуем обновления квеста из API в формат компонента
	const questUpdates = useMemo(() => {
		return questUpdatesRaw.map(update => ({
			id: String(update.id),
			date: update.createdAt || new Date().toISOString(),
			title: update.title,
			content: update.text,
			images: update.photos || [],
			author: 'Куратор квеста',
		}))
	}, [questUpdatesRaw])

	// Используем поле isParticipating из API
	const isParticipating = transformedQuest?.isParticipating ?? false

	// Проверяем, является ли текущий пользователь создателем квеста
	const isOwner = useMemo(() => {
		if (!user?.id || !quest?.ownerId) return false
		// Преобразуем user.id (строка) в число для сравнения
		const userId = Number.parseInt(user.id, 10)
		return userId === quest.ownerId
	}, [user?.id, quest?.ownerId])

	// Если quest undefined, возвращаем null (во время анимации закрытия или когда не выбран)
	if (!transformedQuest) {
		return null
	}

	const handleParticipate = async () => {
		if (!transformedQuest) return

		// Проверяем авторизацию перед участием в квесте
		if (!isAuthenticated) {
			setShowAuthDialog(true)
			return
		}

		// Автоматически добавляем пользователя в квест
		await participateInQuest(transformedQuest.id)
		checkAndUnlockAchievements()

		if (onParticipate) {
			onParticipate(transformedQuest.id)
		}
	}

	const handleLeaveClick = () => {
		// Проверяем авторизацию
		if (!isAuthenticated) {
			setShowAuthDialog(true)
			return
		}

		// Открываем диалог подтверждения
		setShowLeaveDialog(true)
	}

	const handleLeaveConfirm = async () => {
		if (!transformedQuest) return

		// Выходим из квеста
		await leaveQuest(transformedQuest.id)
		setShowLeaveDialog(false)
	}

	const handleVolunteerRegister = (
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_stageId: string,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_data: { name: string; phone: string; email?: string }
	) => {
		// Здесь будет API вызов для регистрации
		// _data будет использоваться для будущей реализации API
	}

	const handleShare = (platform: string) => {
		if (transformedQuest && user) {
			// Проверяем, делился ли пользователь уже этим квестом
			const sharedQuestsKey = `shared_quests_${user.id}`
			const sharedQuestsJson = localStorage.getItem(sharedQuestsKey)
			const sharedQuests: string[] = sharedQuestsJson
				? JSON.parse(sharedQuestsJson)
				: []

			const hasSharedQuest = sharedQuests.includes(transformedQuest.id)
			const isFirstShare = !hasSharedQuest

			// Засчитываем шаринг как вклад в квест только при первом шаринге
			if (isFirstShare) {
				contributeToQuest({
					questId: transformedQuest.id,
					stageId: transformedQuest.stages[0]?.id || '', // Используем первый этап или пустую строку
					action: `Поделился в ${platform}`,
					contributedAt: new Date().toISOString(),
					impact: `Поделился квестом "${transformedQuest.title}" в ${platform}`,
				})

				// Сохраняем информацию о том, что пользователь поделился этим квестом
				sharedQuests.push(transformedQuest.id)
				localStorage.setItem(sharedQuestsKey, JSON.stringify(sharedQuests))

				// Проверяем и разблокируем достижение за шаринг через API
				const hasSocialAmbassadorBefore = user.achievements.some(
					a => String(a.id) === '17'
				)

				if (!hasSocialAmbassadorBefore && user.id) {
					// Используем API для назначения достижения
					assignAchievement({
						id: 17,
						userId: user.id,
					})
						.unwrap()
						.then(async () => {
							// Показываем toast уведомление сразу после успешного назначения
							toast.success('📢 Достижение разблокировано!', {
								description:
									'Социальный амбассадор - Поделились квестом в социальных сетях',
								duration: 5000,
							})

							// Обновляем данные пользователя, чтобы получить новое достижение
							try {
								const userResult = await getUser(user.id).unwrap()
								if (userResult && setUser) {
									const transformedUser = transformUserFromAPI(userResult)
									setUser(transformedUser)
								}
							} catch (error) {
								console.error('Error fetching updated user data:', error)
							}
						})
						.catch(error => {
							// Логируем ошибку, но не показываем пользователю, чтобы не мешать UX
							console.error('Failed to assign achievement:', error)
						})
				}

				checkAndUnlockAchievements()

				// Показываем благодарность за репост через toast
				toast.success('🙏 Спасибо за распространение!', {
					description: `Ваш репост поможет квесту "${transformedQuest.title}" найти больше участников! Вы получили опыт за помощь.`,
					duration: 5000,
				})
			}
			// При повторном шаринге ничего не делаем - просто открывается окно поделиться
		}
	}

	return (
		<>
			<AuthRequiredDialog
				open={showAuthDialog}
				onOpenChange={setShowAuthDialog}
				questTitle={transformedQuest?.title}
			/>

			{showVolunteerRegistration && transformedQuest && (
				<VolunteerRegistration
					stage={showVolunteerRegistration.stage}
					questTitle={transformedQuest.title}
					onRegister={handleVolunteerRegister}
					onClose={() => setShowVolunteerRegistration(null)}
				/>
			)}

			{showAmbassadorShare && transformedQuest && (
				<AmbassadorShare
					quest={transformedQuest}
					onShare={handleShare}
					onClose={() => setShowAmbassadorShare(false)}
				/>
			)}

			<AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Выход из квеста</AlertDialogTitle>
						<AlertDialogDescription>
							{transformedQuest
								? `Вы уверены, что хотите выйти из квеста "${transformedQuest.title}"? Вы больше не будете участвовать в этом квесте.`
								: 'Вы уверены, что хотите выйти из квеста? Вы больше не будете участвовать в этом квесте.'}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Отмена</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleLeaveConfirm}
							className='bg-red-600 hover:bg-red-700 text-white'
						>
							Выйти из квеста
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<section
				className={`fixed left-5 top-[88px] bottom-20 w-[480px] max-w-[calc(100vw-40px)] z-[100] bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/80 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
					isClosing ? 'animate-slide-out-left' : 'animate-slide-in-left'
				}`}
			>
				{isLoadingQuest ? (
					<div className='flex items-center justify-center min-h-[400px]'>
						<Spinner />
					</div>
				) : questError ? (
					<div className='p-6'>
						<div className='text-center py-8'>
							<p className='text-red-600 font-medium mb-2'>
								Ошибка загрузки квеста
							</p>
							<p className='text-sm text-slate-500'>
								Не удалось загрузить информацию о квесте
							</p>
						</div>
					</div>
				) : transformedQuest ? (
					<>
						<header className='sticky top-0 bg-white/98 backdrop-blur-xl border-b border-slate-200 p-6 z-10'>
							<div className='flex items-start justify-between gap-4 mb-4'>
								<div className='flex-1 min-w-0'>
									<p className='text-xs font-medium text-slate-500 uppercase tracking-wider mb-1'>
										{transformedQuest.city} • {transformedQuest.type}
									</p>
									<div className='flex items-start justify-between gap-3 mb-2'>
										<h2 className='text-2xl font-bold text-slate-900 m-0 flex-1 min-w-0 break-words'>
											{transformedQuest.title}
										</h2>
										{transformedQuest.customAchievement && (
											<span
												className='inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200 shadow-sm shrink-0 whitespace-nowrap'
												title={`Достижение: ${transformedQuest.customAchievement.title} - ${transformedQuest.customAchievement.description}`}
											>
												🏆 Есть достижение
											</span>
										)}
									</div>
								</div>
								{onClose && (
									<button
										className='shrink-0 w-8 h-8 cursor-pointer rounded-full bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center text-slate-600 hover:text-slate-900'
										onClick={onClose}
										type='button'
										title='Закрыть'
									>
										<X className='h-4 w-4' />
									</button>
								)}
							</div>

							{/* Общий прогресс-бар */}
							<div className='mb-4'>
								<div className='flex items-center justify-between mb-2'>
									<span className='text-sm font-semibold text-slate-700'>
										Общий прогресс квеста
									</span>
									<span className='text-sm font-bold text-blue-600'>
										{transformedQuest.overallProgress}%
									</span>
								</div>
								<div className='h-3 bg-slate-200 rounded-full overflow-hidden'>
									<div
										className='h-full bg-gradient-to-r from-blue-500 via-blue-400 to-green-500 transition-all duration-500'
										style={{ width: `${transformedQuest.overallProgress}%` }}
									/>
								</div>
							</div>

							{/* Кнопки участия / управления */}
							{isOwner ? (
								<div className='space-y-2'>
									<div className='px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 text-center'>
										<span className='text-sm font-semibold text-blue-700'>
											👑 Вы создатель этого квеста
										</span>
									</div>
									<Button
										type='button'
										onClick={() => {
											const questId =
												typeof transformedQuest.id === 'string'
													? Number.parseInt(transformedQuest.id, 10)
													: transformedQuest.id
											navigate(`/quests/${questId}/manage`)
										}}
										className='w-full bg-gradient-to-br from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700'
									>
										<Settings className='h-4 w-4 mr-2' />
										Управлять квестом
									</Button>
									<Button
										type='button'
										onClick={() => setShowAmbassadorShare(true)}
										className='w-full bg-gradient-to-br from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-900'
									>
										<Share2 className='h-4 w-4 mr-2' />
										Поделиться квестом
									</Button>
								</div>
							) : !isParticipating ? (
								<button
									type='button'
									onClick={handleParticipate}
									className='w-full px-4 py-3 rounded-xl font-semibold text-white bg-gradient-to-br from-[#22d3ee] to-[#0284c7] hover:from-[#06b6d4] hover:to-[#0369a1] transition-all shadow-lg hover:shadow-xl'
								>
									Вступить в квест
								</button>
							) : (
								<div className='space-y-2'>
									<div className='px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-center'>
										<span className='text-sm font-semibold text-green-700'>
											✅ Вы участвуете в этом квесте!
										</span>
									</div>
									<Button
										type='button'
										onClick={() => setShowAmbassadorShare(true)}
										className='w-full bg-gradient-to-br from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-900'
									>
										<Share2 className='h-4 w-4 mr-2' />
										Поделиться квестом
									</Button>
									<Button
										type='button'
										onClick={handleLeaveClick}
										variant='outline'
										className='w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700'
									>
										<LogOut className='h-4 w-4 mr-2' />
										Выйти из квеста
									</Button>
								</div>
							)}
						</header>

						<div className='p-6 space-y-6'>
							{/* История/Лор */}
							<div className='space-y-3'>
								<h3 className='text-lg font-semibold text-slate-900 m-0'>
									История
								</h3>
								{transformedQuest.storyMedia?.image && (
									<StoryImage
										image={transformedQuest.storyMedia.image}
										alt={transformedQuest.title}
										onClick={() => {
											const allImages = [
												transformedQuest.storyMedia?.image,
												...(transformedQuest.gallery || []),
											].filter(Boolean) as string[]
											const index = allImages.indexOf(
												transformedQuest.storyMedia!.image!
											)
											setGalleryIndex(Math.max(index, 0))
										}}
									/>
								)}
								<p className='text-base text-slate-700 leading-relaxed m-0'>
									{transformedQuest.story}
								</p>
							</div>

							{/* Галерея */}
							{transformedQuest.gallery &&
								transformedQuest.gallery.length > 0 && (
									<div className='space-y-3'>
										<h3 className='text-lg font-semibold text-slate-900 m-0'>
											Галерея
										</h3>
										<div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
											{transformedQuest.gallery.map((image, index) => {
												const galleryIndexInAll = transformedQuest.storyMedia
													?.image
													? index + 1
													: index

												return (
													<GalleryImage
														key={`gallery-${index}-${image.slice(0, 20)}`}
														image={image}
														index={index}
														onClick={() => setGalleryIndex(galleryIndexInAll)}
													/>
												)
											})}
										</div>
									</div>
								)}

							{/* Табы для этапов и обновлений */}
							<div className='border-b border-slate-200'>
								<div className='flex gap-4'>
									<button
										type='button'
										onClick={() => setActiveTab('stages')}
										className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
											activeTab === 'stages'
												? 'border-blue-600 text-blue-600'
												: 'border-transparent text-slate-500 hover:text-slate-700'
										}`}
									>
										Этапы ({transformedQuest.stages.length})
									</button>
									<button
										type='button'
										onClick={() => setActiveTab('updates')}
										className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
											activeTab === 'updates'
												? 'border-blue-600 text-blue-600'
												: 'border-transparent text-slate-500 hover:text-slate-700'
										}`}
									>
										Обновления ({questUpdates.length})
									</button>
								</div>
							</div>

							{/* Контент табов */}
							{activeTab === 'stages' && (
								<div className='space-y-4'>
									{transformedQuest.stages.map(
										(stage: QuestStage, index: number) => (
											<div
												key={stage.id}
												className='p-4 rounded-xl border border-slate-200 bg-slate-50/50'
											>
												<div className='flex items-start gap-3 mb-3'>
													{getStageIcon(stage)}
													<div className='flex-1'>
														<div className='flex items-center justify-between mb-1'>
															<h4 className='text-base font-semibold text-slate-900 m-0'>
																Этап {index + 1}: {stage.title}
															</h4>
															<span className='text-sm font-medium text-slate-600'>
																{stage.progress}%
															</span>
														</div>
														<p className='text-sm text-slate-600 m-0 mb-2'>
															{stage.description}
														</p>
														{stage.progress > 0 && (
															<div className='h-2 bg-slate-200 rounded-full overflow-hidden mb-2'>
																<div
																	className='h-full bg-blue-500 transition-all duration-300'
																	style={{ width: `${stage.progress}%` }}
																/>
															</div>
														)}
													</div>
												</div>

												{/* Требования этапа */}
												{stage.requirements && (
													<div className='ml-8 space-y-2'>
														{stage.requirements.financial && (
															<div className='text-sm'>
																<span className='font-medium text-slate-700'>
																	💰 Собрано:{' '}
																</span>
																<span className='text-slate-600'>
																	{formatCurrency(
																		stage.requirements.financial.collected,
																		stage.requirements.financial.currency
																	)}{' '}
																	из{' '}
																	{formatCurrency(
																		stage.requirements.financial.needed,
																		stage.requirements.financial.currency
																	)}
																</span>
															</div>
														)}
														{stage.requirements.volunteers && (
															<div className='flex items-center justify-between'>
																<div className='text-sm'>
																	<span className='font-medium text-slate-700'>
																		👥 Волонтеров:{' '}
																	</span>
																	<span className='text-slate-600'>
																		{stage.requirements.volunteers.registered}{' '}
																		из {stage.requirements.volunteers.needed}
																	</span>
																</div>
															</div>
														)}
														{stage.requirements.items && (
															<div className='text-sm'>
																<span className='font-medium text-slate-700'>
																	📦 {stage.requirements.items.itemName}:{' '}
																</span>
																<span className='text-slate-600'>
																	{stage.requirements.items.collected} из{' '}
																	{stage.requirements.items.needed}
																</span>
															</div>
														)}
													</div>
												)}

												{stage.deadline && (
													<div className='ml-8 mt-2 text-xs text-slate-500'>
														📅 Срок: {formatDate(stage.deadline)}
													</div>
												)}
											</div>
										)
									)}
								</div>
							)}

							{activeTab === 'updates' && (
								<div className='space-y-4'>
									{isLoadingUpdates ? (
										<div className='flex items-center justify-center py-8'>
											<Skeleton className='h-8 w-8' />
										</div>
									) : questUpdates.length === 0 ? (
										<p className='text-sm text-slate-500 text-center py-8'>
											Пока нет обновлений
										</p>
									) : (
										questUpdates.map(update => (
											<div
												key={update.id}
												className='p-4 rounded-xl border border-slate-200 bg-white'
											>
												<div className='flex items-start justify-between mb-2'>
													<div>
														<h4 className='text-base font-semibold text-slate-900 m-0'>
															{update.title}
														</h4>
														{update.date && (
															<p className='text-xs text-slate-500 m-0 mt-1'>
																{formatDate(update.date)}
															</p>
														)}
													</div>
												</div>
												<p className='text-sm text-slate-700 leading-relaxed m-0 mb-3'>
													{update.content}
												</p>
												{update.images && update.images.length > 0 && (
													<div className='grid grid-cols-2 gap-2'>
														{update.images.map((img: string, idx: number) => (
															<GalleryImage
																key={`${update.id}-${idx}`}
																image={img}
																index={idx}
																onClick={() =>
																	setUpdateGalleryState({
																		updateId: Number(update.id),
																		imageIndex: idx,
																	})
																}
															/>
														))}
													</div>
												)}
											</div>
										))
									)}
								</div>
							)}

							{/* Контакты куратора */}
							<div className='space-y-2 pt-4 border-t border-slate-200'>
								<h3 className='text-lg font-semibold text-slate-900 m-0'>
									Куратор проекта
								</h3>
								<div className='grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm'>
									<span className='font-medium text-slate-500'>Куратор</span>
									<p className='text-slate-700 m-0'>
										{transformedQuest.curator.name}
									</p>

									{transformedQuest.curator.organization && (
										<>
											<span className='font-medium text-slate-500'>
												Организация
											</span>
											<p className='text-slate-700 m-0'>
												{transformedQuest.curator.organization}
											</p>
										</>
									)}

									<span className='font-medium text-slate-500'>Телефон</span>
									<a
										href={`tel:${transformedQuest.curator.phone}`}
										className='text-blue-600 hover:text-blue-700 hover:underline m-0'
									>
										{transformedQuest.curator.phone}
									</a>

									{transformedQuest.curator.email && (
										<>
											<span className='font-medium text-slate-500'>Email</span>
											<a
												href={`mailto:${transformedQuest.curator.email}`}
												className='text-blue-600 hover:text-blue-700 hover:underline m-0'
											>
												{transformedQuest.curator.email}
											</a>
										</>
									)}
								</div>
							</div>

							{/* Социальные сети */}
							{transformedQuest.socials &&
								transformedQuest.socials.length > 0 && (
									<div className='space-y-2'>
										<h3 className='text-lg font-semibold text-slate-900 m-0'>
											Соцсети
										</h3>
										<div className='flex flex-wrap gap-2'>
											{transformedQuest.socials.map(
												(social: { name: string; url: string }) => (
													<a
														key={social.url}
														href={social.url}
														target='_blank'
														rel='noreferrer'
														className='inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors'
													>
														{social.name}
													</a>
												)
											)}
										</div>
									</div>
								)}
						</div>
					</>
				) : null}
			</section>

			{/* Галерея изображений квеста */}
			{galleryIndex !== null && transformedQuest && (
				<ImageGallery
					images={
						[
							transformedQuest.storyMedia?.image,
							...(transformedQuest.gallery || []),
						].filter(Boolean) as string[]
					}
					currentIndex={galleryIndex}
					onClose={() => setGalleryIndex(null)}
					onChangeIndex={setGalleryIndex}
				/>
			)}

			{/* Галерея изображений обновлений */}
			{updateGalleryState !== null && questUpdates.length > 0 && (
				<ImageGallery
					images={
						questUpdates.find(u => Number(u.id) === updateGalleryState.updateId)
							?.images || []
					}
					currentIndex={updateGalleryState.imageIndex}
					onClose={() => setUpdateGalleryState(null)}
					onChangeIndex={index =>
						setUpdateGalleryState({
							updateId: updateGalleryState.updateId,
							imageIndex: index,
						})
					}
				/>
			)}
		</>
	)
}
