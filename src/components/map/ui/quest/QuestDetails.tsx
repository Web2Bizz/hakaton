import { Button } from '@/components/ui/button'
import { ImageGallery } from '@/components/ui/ImageGallery'
import { Skeleton } from '@/components/ui/skeleton'
import { useNotifications } from '@/hooks/useNotifications'
import { useQuestActions } from '@/hooks/useQuestActions'
import { useUser } from '@/hooks/useUser'
import { formatCurrency, formatDate } from '@/utils/format'
import {
	CheckCircle2,
	Circle,
	Clock,
	Share2,
	Users,
	X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { Quest, QuestStage } from '../../types/quest-types'
import { AmbassadorShare } from './AmbassadorShare'
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
	quest: Quest | undefined
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
	quest,
	onClose,
	isClosing = false,
	onParticipate,
}: QuestDetailsProps) {
	const {
		user,
		setUser,
		participateInQuest,
		contributeToQuest,
		checkAndUnlockAchievements,
	} = useUser()
	const { checkQuestCompletion } = useQuestActions()
	const { addNotification } = useNotifications()
	const [activeTab, setActiveTab] = useState<'stages' | 'updates'>('stages')
	const [showVolunteerRegistration, setShowVolunteerRegistration] = useState<{
		stage: QuestStage
	} | null>(null)
	const [showAmbassadorShare, setShowAmbassadorShare] = useState(false)
	const [galleryIndex, setGalleryIndex] = useState<number | null>(null)

	const isParticipating =
		user?.participatingQuests.includes(quest?.id ?? '') ?? false

	// Проверка завершения квеста и отправка уведомлений
	useEffect(() => {
		if (!quest || !isParticipating) return

		// Проверяем завершение квеста
		if (quest.overallProgress === 100) {
			// Проверяем, было ли уже отправлено уведомление о завершении этого квеста
			// Проверяем существующие уведомления в localStorage
			const existingNotifications = JSON.parse(
				localStorage.getItem('ecoquest_notifications') || '[]'
			) as Array<{ type: string; questId?: string; achievementId?: string }>

			const hasQuestNotification = existingNotifications.some(
				n => n.type === 'quest_completed' && n.questId === quest.id
			)

			// Уведомление о завершении квеста (отправляем только один раз)
			if (!hasQuestNotification) {
				checkQuestCompletion(
					quest,
					// Callback для уведомления о завершении квеста
					completedQuest => {
						// Дополнительная проверка перед добавлением
						const currentNotifications = JSON.parse(
							localStorage.getItem('ecoquest_notifications') || '[]'
						) as Array<{ type: string; questId?: string }>

						const alreadyExists = currentNotifications.some(
							n =>
								n.type === 'quest_completed' && n.questId === completedQuest.id
						)

						if (!alreadyExists) {
							addNotification({
								type: 'quest_completed',
								title: '🎉 Квест завершен!',
								message: `Квест "${completedQuest.title}" успешно завершен на 100%!`,
								questId: completedQuest.id,
								icon: '🎉',
								actionUrl: `/map?quest=${completedQuest.id}`,
							})
						}
					},
					// Callback для уведомления о разблокировке достижения
					achievement => {
						// Проверяем, было ли уже отправлено уведомление об этом достижении
						const currentNotifications = JSON.parse(
							localStorage.getItem('ecoquest_notifications') || '[]'
						) as Array<{ type: string; achievementId?: string }>

						const alreadyExists = currentNotifications.some(
							n =>
								n.type === 'achievement_unlocked' &&
								n.achievementId === achievement.id
						)

						if (!alreadyExists) {
							addNotification({
								type: 'achievement_unlocked',
								title: '🏆 Достижение разблокировано!',
								message: `${achievement.icon} "${achievement.title}" - Вы получили пользовательское достижение за завершение квеста!`,
								questId: quest.id,
								achievementId: achievement.id,
								icon: achievement.icon,
								actionUrl: '/profile',
							})

							// Показываем toast уведомление
							toast.success('🏆 Достижение разблокировано!', {
								description: `${achievement.icon} "${achievement.title}"`,
								duration: 5000,
							})
						}
					}
				)
			}
		}
	}, [quest, isParticipating, checkQuestCompletion, addNotification])

	// Если quest undefined, возвращаем null (во время анимации закрытия или когда не выбран)
	if (!quest) {
		return null
	}

	const handleParticipate = () => {
		if (quest) {
			// Автоматически добавляем пользователя в квест
			participateInQuest(quest.id)
			checkAndUnlockAchievements(quest.id)

			// Добавляем уведомление об успешном участии
			addNotification({
				type: 'quest_update',
				title: 'Добро пожаловать в квест!',
				message: `Вы успешно присоединились к квесту "${quest.title}"`,
				questId: quest.id,
				icon: '🎯',
			})

			if (onParticipate) {
				onParticipate(quest.id)
			}
		}
	}

	const handleVolunteerRegister = (
		stageId: string,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_data: { name: string; phone: string; email?: string }
	) => {
		// Здесь будет API вызов для регистрации
		// _data будет использоваться для будущей реализации API
		addNotification({
			type: 'volunteer_registered',
			title: 'Регистрация успешна!',
			message: `Вы зарегистрировались на событие "${
				quest?.stages.find((s: QuestStage) => s.id === stageId)?.title
			}"`,
			questId: quest!.id,
			stageId,
			icon: '👷',
		})
	}

	const handleShare = (platform: string) => {
		if (quest) {
			// Засчитываем шаринг как вклад в квест
			contributeToQuest({
				questId: quest.id,
				stageId: quest.stages[0]?.id || '', // Используем первый этап или пустую строку
				action: `Поделился в ${platform}`,
				contributedAt: new Date().toISOString(),
				impact: `Поделился квестом "${quest.title}" в ${platform}`,
			})

			// Проверяем и разблокируем достижение за шаринг
			if (user) {
				const hasSocialAmbassador = user.achievements.some(
					a => a.id === 'social_ambassador'
				)

				if (!hasSocialAmbassador) {
					const updatedUser = {
						...user,
						achievements: [
							...user.achievements,
							{
								id: 'social_ambassador' as const,
								title: 'Социальный амбассадор',
								description: 'Поделились квестом в социальных сетях',
								icon: '📢',
								rarity: 'common' as const,
								unlockedAt: new Date().toISOString(),
							},
						],
					}

					setUser(updatedUser)

					// Показываем уведомление о достижении
					addNotification({
						type: 'achievement_unlocked',
						title: '🎉 Достижение разблокировано!',
						message:
							'Социальный амбассадор - Поделились квестом в социальных сетях',
						questId: quest.id,
						icon: '🏆',
					})
				}
			}

			checkAndUnlockAchievements(quest.id)

			// Показываем благодарность за репост через toast
			toast.success('🙏 Спасибо за распространение!', {
				description: `Ваш репост поможет квесту "${quest.title}" найти больше участников! Вы получили опыт за помощь.`,
				duration: 5000,
			})

			// Также добавляем в систему уведомлений
			addNotification({
				type: 'quest_update',
				title: '🙏 Спасибо за распространение!',
				message: `Ваш репост поможет квесту "${quest.title}" найти больше участников! Вы получили опыт за помощь.`,
				questId: quest.id,
				icon: '📢',
			})
		}
	}

	return (
		<>
			{showVolunteerRegistration && quest && (
				<VolunteerRegistration
					stage={showVolunteerRegistration.stage}
					questTitle={quest.title}
					onRegister={handleVolunteerRegister}
					onClose={() => setShowVolunteerRegistration(null)}
				/>
			)}

			{showAmbassadorShare && quest && (
				<AmbassadorShare
					quest={quest}
					onShare={handleShare}
					onClose={() => setShowAmbassadorShare(false)}
				/>
			)}

			<section
				className={`fixed left-5 top-[88px] bottom-20 w-[480px] max-w-[calc(100vw-40px)] z-[100] bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/80 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
					isClosing ? 'animate-slide-out-left' : 'animate-slide-in-left'
				}`}
			>
				{quest && (
					<>
						<header className='sticky top-0 bg-white/98 backdrop-blur-xl border-b border-slate-200 p-6 z-10'>
							<div className='flex items-start justify-between gap-4 mb-4'>
								<div className='flex-1 min-w-0'>
									<p className='text-xs font-medium text-slate-500 uppercase tracking-wider mb-1'>
										{quest.city} • {quest.type}
									</p>
									<div className='flex items-start justify-between gap-3 mb-2'>
										<h2 className='text-2xl font-bold text-slate-900 m-0 flex-1'>
											{quest.title}
										</h2>
										{quest.customAchievement && (
											<span
												className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold border border-amber-200 shadow-sm shrink-0'
												title={`Достижение: ${quest.customAchievement.title} - ${quest.customAchievement.description}`}
											>
												<span>Есть достижение</span>
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
										{quest.overallProgress}%
									</span>
								</div>
								<div className='h-3 bg-slate-200 rounded-full overflow-hidden'>
									<div
										className='h-full bg-gradient-to-r from-blue-500 via-blue-400 to-green-500 transition-all duration-500'
										style={{ width: `${quest.overallProgress}%` }}
									/>
								</div>
							</div>

							{/* Кнопки участия */}
							{!isParticipating ? (
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
								</div>
							)}
						</header>

						<div className='p-6 space-y-6'>
							{/* История/Лор */}
							<div className='space-y-3'>
								<h3 className='text-lg font-semibold text-slate-900 m-0'>
									История
								</h3>
								{quest.storyMedia?.image && (
									<StoryImage
										image={quest.storyMedia.image}
										alt={quest.title}
										onClick={() => {
											const allImages = [
												quest.storyMedia?.image,
												...(quest.gallery || []),
											].filter(Boolean) as string[]
											const index = allImages.indexOf(quest.storyMedia!.image!)
											setGalleryIndex(Math.max(index, 0))
										}}
									/>
								)}
								<p className='text-base text-slate-700 leading-relaxed m-0'>
									{quest.story}
								</p>
							</div>

							{/* Галерея */}
							{quest.gallery && quest.gallery.length > 0 && (
								<div className='space-y-3'>
									<h3 className='text-lg font-semibold text-slate-900 m-0'>
										Галерея
									</h3>
									<div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
										{quest.gallery.map((image, index) => {
											const galleryIndexInAll = quest.storyMedia?.image
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
										Этапы ({quest.stages.length})
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
										Обновления ({quest.updates.length})
									</button>
								</div>
							</div>

							{/* Контент табов */}
							{activeTab === 'stages' && (
								<div className='space-y-4'>
									{quest.stages.map((stage: QuestStage, index: number) => (
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
																	{stage.requirements.volunteers.registered} из{' '}
																	{stage.requirements.volunteers.needed}
																</span>
															</div>
															{isParticipating &&
																stage.status !== 'completed' && (
																	<Button
																		size='sm'
																		onClick={() =>
																			setShowVolunteerRegistration({ stage })
																		}
																		className='bg-gradient-to-br from-blue-500 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-700'
																		type='button'
																	>
																		<Users className='h-3 w-3 mr-1' />
																		Записаться
																	</Button>
																)}
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
									))}
								</div>
							)}

							{activeTab === 'updates' && (
								<div className='space-y-4'>
									{quest.updates.length === 0 ? (
										<p className='text-sm text-slate-500 text-center py-8'>
											Пока нет обновлений
										</p>
									) : (
										quest.updates.map(
											(update: {
												id: string
												title: string
												date: string
												author: string
												content: string
												images?: string[]
											}) => (
												<div
													key={update.id}
													className='p-4 rounded-xl border border-slate-200 bg-white'
												>
													<div className='flex items-start justify-between mb-2'>
														<div>
															<h4 className='text-base font-semibold text-slate-900 m-0'>
																{update.title}
															</h4>
															<p className='text-xs text-slate-500 m-0 mt-1'>
																{formatDate(update.date)} • {update.author}
															</p>
														</div>
													</div>
													<p className='text-sm text-slate-700 leading-relaxed m-0 mb-3'>
														{update.content}
													</p>
													{update.images && update.images.length > 0 && (
														<div className='grid grid-cols-2 gap-2'>
															{update.images.map((img: string, idx: number) => (
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
										)
									)}
								</div>
							)}

							{/* Контакты куратора */}
							<div className='space-y-2 pt-4 border-t border-slate-200'>
								<h3 className='text-lg font-semibold text-slate-900 m-0'>
									Куратор проекта
								</h3>
								<div className='grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm'>
									<span className='font-medium text-slate-500'>Имя</span>
									<p className='text-slate-700 m-0'>{quest.curator.name}</p>

									{quest.curator.organization && (
										<>
											<span className='font-medium text-slate-500'>
												Организация
											</span>
											<p className='text-slate-700 m-0'>
												{quest.curator.organization}
											</p>
										</>
									)}

									<span className='font-medium text-slate-500'>Телефон</span>
									<a
										href={`tel:${quest.curator.phone}`}
										className='text-blue-600 hover:text-blue-700 hover:underline m-0'
									>
										{quest.curator.phone}
									</a>

									{quest.curator.email && (
										<>
											<span className='font-medium text-slate-500'>Email</span>
											<a
												href={`mailto:${quest.curator.email}`}
												className='text-blue-600 hover:text-blue-700 hover:underline m-0'
											>
												{quest.curator.email}
											</a>
										</>
									)}
								</div>
							</div>

							{/* Социальные сети */}
							{quest.socials && quest.socials.length > 0 && (
								<div className='space-y-2'>
									<h3 className='text-lg font-semibold text-slate-900 m-0'>
										Соцсети
									</h3>
									<div className='flex flex-wrap gap-2'>
										{quest.socials.map(
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
				)}
			</section>

			{/* Галерея изображений */}
			{galleryIndex !== null && quest && (
				<ImageGallery
					images={
						[quest.storyMedia?.image, ...(quest.gallery || [])].filter(
							Boolean
						) as string[]
					}
					currentIndex={galleryIndex}
					onClose={() => setGalleryIndex(null)}
					onChangeIndex={setGalleryIndex}
				/>
			)}
		</>
	)
}
