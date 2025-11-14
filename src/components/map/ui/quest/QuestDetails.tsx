import { Button } from '@/components/ui/button'
import { useNotifications } from '@/hooks/useNotifications'
import { useUser } from '@/hooks/useUser'
import { formatCurrency, formatDate } from '@/utils/format'
import {
	CheckCircle2,
	Circle,
	Clock,
	Heart,
	Share2,
	Users,
	X,
} from 'lucide-react'
import { useState } from 'react'
import type { QuestStage } from '../../types/quest-types'
import { AmbassadorShare } from './AmbassadorShare'
import { DonationPanel } from './DonationPanel'
import { RoleSelection } from './RoleSelection'
import { VolunteerRegistration } from './VolunteerRegistration'

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
		participateInQuest,
		contributeToQuest,
		checkAndUnlockAchievements,
	} = useUser()
	const { addNotification } = useNotifications()
	const [activeTab, setActiveTab] = useState<'stages' | 'updates'>('stages')
	const [showRoleSelection, setShowRoleSelection] = useState(false)
	const [showDonation, setShowDonation] = useState<{
		stage: QuestStage
	} | null>(null)
	const [showVolunteerRegistration, setShowVolunteerRegistration] = useState<{
		stage: QuestStage
	} | null>(null)
	const [showAmbassadorShare, setShowAmbassadorShare] = useState(false)

	// Если quest undefined, возвращаем null (во время анимации закрытия или когда не выбран)
	if (!quest) {
		return null
	}

	const isParticipating = user?.participatingQuests.includes(quest.id) ?? false

	const handleParticipate = () => {
		setShowRoleSelection(true)
	}

	const handleRoleSelect = (role: Parameters<typeof participateInQuest>[1]) => {
		if (quest) {
			participateInQuest(quest.id, role)
			checkAndUnlockAchievements(quest.id)

			// Добавляем уведомление об успешном участии
			addNotification({
				type: 'quest_update',
				title: 'Добро пожаловать в квест!',
				message: `Вы успешно присоединились к квесту "${quest.title}" в роли ${
					role === 'financial'
						? 'Финансового воина'
						: role === 'volunteer'
						? 'Волонтера-героя'
						: 'Амбассадора'
				}`,
				questId: quest.id,
				icon: '🎯',
			})

			setShowRoleSelection(false)
			if (onParticipate) {
				onParticipate(quest.id)
			}
		}
	}

	const handleDonate = (amount: number, stageId: string) => {
		if (quest) {
			contributeToQuest({
				questId: quest.id,
				stageId,
				role: 'financial',
				amount,
				contributedAt: new Date().toISOString(),
				impact: `Внесли ${formatCurrency(amount)} на этап "${
					quest.stages.find(s => s.id === stageId)?.title
				}"`,
			})
			checkAndUnlockAchievements(quest.id)
			addNotification({
				type: 'donation_received',
				title: 'Спасибо за поддержку!',
				message: `Вы внесли ${formatCurrency(amount)} на этап "${
					quest.stages.find(s => s.id === stageId)?.title
				}"`,
				questId: quest.id,
				stageId,
				icon: '💰',
			})
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
				quest?.stages.find(s => s.id === stageId)?.title
			}"`,
			questId: quest!.id,
			stageId,
			icon: '👷',
		})
	}

	const handleShare = () => {
		// Логика уже в AmbassadorShare
	}

	return (
		<>
			{showRoleSelection && (
				<RoleSelection
					onSelect={handleRoleSelect}
					onCancel={() => setShowRoleSelection(false)}
				/>
			)}

			{showDonation && quest && (
				<DonationPanel
					stage={showDonation.stage}
					questTitle={quest.title}
					onDonate={handleDonate}
					onClose={() => setShowDonation(null)}
				/>
			)}

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
									<h2 className='text-2xl font-bold text-slate-900 m-0 mb-2'>
										{quest.title}
									</h2>
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
									🎯 Вступить в квест
								</button>
							) : (
								<div className='space-y-2'>
									<div className='px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-center'>
										<span className='text-sm font-semibold text-green-700'>
											✅ Вы участвуете в этом квесте!
										</span>
									</div>
									{user?.role.includes('ambassador') && (
										<Button
											type='button'
											onClick={() => setShowAmbassadorShare(true)}
											className='w-full bg-gradient-to-br from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700'
										>
											<Share2 className='h-4 w-4 mr-2' />
											Поделиться квестом
										</Button>
									)}
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
									<img
										src={quest.storyMedia.image}
										alt={quest.title}
										className='w-full h-48 object-cover rounded-xl'
									/>
								)}
								<p className='text-base text-slate-700 leading-relaxed m-0'>
									{quest.story}
								</p>
							</div>

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
									{quest.stages.map((stage, index) => (
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
														<div className='flex items-center justify-between'>
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
															{isParticipating &&
																stage.status !== 'completed' && (
																	<Button
																		size='sm'
																		onClick={() => setShowDonation({ stage })}
																		className='bg-gradient-to-br from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
																		type='button'
																	>
																		<Heart className='h-3 w-3 mr-1' />
																		Поддержать
																	</Button>
																)}
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
																user?.role.includes('volunteer') &&
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
										quest.updates.map(update => (
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
														{update.images.map((img, idx) => (
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
										{quest.socials.map(social => (
											<a
												key={social.url}
												href={social.url}
												target='_blank'
												rel='noreferrer'
												className='inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors'
											>
												{social.name}
											</a>
										))}
									</div>
								</div>
							)}
						</div>
					</>
				)}
			</section>
		</>
	)
}
