import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { allAchievements } from '@/data/achievements'
import { useGetUserAchievementsByUserIdQuery } from '@/store/entities'
import type { UserAchievement } from '@/store/entities/achievement/model/type'
import { Award, X } from 'lucide-react'
import { memo, useEffect, useMemo, useState } from 'react'

interface ProfileAchievementsProps {
	userId: string | number
}

const rarityColors = {
	common: 'bg-slate-100 border-slate-300 text-slate-700',
	rare: 'bg-blue-100 border-blue-300 text-blue-700',
	epic: 'bg-purple-100 border-purple-300 text-purple-700',
	legendary: 'bg-yellow-100 border-yellow-400 text-yellow-800',
} as const

const MAX_DISPLAYED_ACHIEVEMENTS_MOBILE = 3 // Для мобильных устройств
const MAX_DISPLAYED_ACHIEVEMENTS_DESKTOP = 6 // Для десктопов

export const ProfileAchievements = memo(function ProfileAchievements({
	userId,
}: ProfileAchievementsProps) {
	const [showAllAchievements, setShowAllAchievements] = useState(false)
	const [isClosing, setIsClosing] = useState(false)
	const [isMobile, setIsMobile] = useState(false)

	// Определяем, является ли устройство мобильным
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768) // md breakpoint в Tailwind
		}

		checkMobile()
		window.addEventListener('resize', checkMobile)

		return () => {
			window.removeEventListener('resize', checkMobile)
		}
	}, [])

	// Адаптивное количество отображаемых достижений
	const displayLimit = useMemo(
		() =>
			isMobile
				? MAX_DISPLAYED_ACHIEVEMENTS_MOBILE
				: MAX_DISPLAYED_ACHIEVEMENTS_DESKTOP,
		[isMobile]
	)

	// Получаем достижения пользователя через API
	const {
		data: achievementsResponse,
		isLoading,
		error,
	} = useGetUserAchievementsByUserIdQuery(userId, {
		skip: !userId, // Пропускаем запрос, если userId не указан
	})

	const userAchievements: UserAchievement[] = useMemo(
		() => achievementsResponse?.data?.achievements || [],
		[achievementsResponse]
	)

	const unlockedAchievements = useMemo(
		() => userAchievements.filter(a => a.unlockedAt),
		[userAchievements]
	)

	// Разделяем на системные и пользовательские достижения
	const { systemAchievements, customAchievements } = useMemo(() => {
		const system: UserAchievement[] = []
		const custom: UserAchievement[] = []

		unlockedAchievements.forEach(achievement => {
			// Пользовательские достижения имеют ID вида "custom-*" или type === 'custom'
			// Преобразуем id в строку на случай, если он приходит как число
			const achievementId = String(achievement.id)
			if (
				achievementId.startsWith('custom-') ||
				achievement.type === 'custom'
			) {
				custom.push(achievement)
			} else {
				system.push(achievement)
			}
		})

		return { systemAchievements: system, customAchievements: custom }
	}, [unlockedAchievements])

	const lockedAchievements = useMemo(
		() =>
			Object.values(allAchievements).filter(
				a => !userAchievements.some(ua => ua.id === a.id)
			),
		[userAchievements]
	)

	// Обработка закрытия модального окна по Escape
	useEffect(() => {
		if (!showAllAchievements) return

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && !isClosing) {
				handleCloseModal()
			}
		}

		document.addEventListener('keydown', handleEscape)
		return () => {
			document.removeEventListener('keydown', handleEscape)
		}
	}, [showAllAchievements, isClosing])

	// Функция для плавного закрытия модального окна
	const handleCloseModal = () => {
		setIsClosing(true)
		setTimeout(() => {
			setShowAllAchievements(false)
			setIsClosing(false)
		}, 300) // Длительность анимации закрытия
	}

	// Функция для открытия модального окна
	const handleOpenModal = () => {
		setShowAllAchievements(true)
		setIsClosing(false)
	}

	if (isLoading) {
		return (
			<div className='bg-white rounded-2xl shadow-lg p-8'>
				<div className='flex items-center justify-center py-12'>
					<Spinner />
				</div>
			</div>
		)
	}

	if (error) {
		console.error('Error loading achievements:', error)
		console.error('UserId:', userId)
		return (
			<div className='bg-white rounded-2xl shadow-lg p-8'>
				<div className='text-center py-12 text-slate-500'>
					Не удалось загрузить достижения
					{'status' in error && (
						<div className='text-xs mt-2'>Ошибка: {String(error.status)}</div>
					)}
				</div>
			</div>
		)
	}

	return (
		<div className='bg-white rounded-2xl shadow-lg p-8'>
			<h2 className='text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2'>
				<Award className='h-6 w-6 text-yellow-600' />
				Достижения
			</h2>

			{unlockedAchievements.length > 0 && (
				<div className='mb-8'>
					<div className='flex items-center justify-between mb-4'>
						<h3 className='text-lg font-semibold text-slate-700'>
							Разблокированные ({unlockedAchievements.length})
						</h3>
						{unlockedAchievements.length > displayLimit && (
							<Button
								variant='outline'
								size='sm'
								onClick={handleOpenModal}
								className='text-sm'
							>
								Показать все
							</Button>
						)}
					</div>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
						{/* Показываем все достижения вместе, но ограничиваем количество */}
						{unlockedAchievements.slice(0, displayLimit).map(achievement => {
							return (
								<div
									key={achievement.id}
									className={`p-4 rounded-xl border-2 ${
										rarityColors[achievement.rarity]
									}`}
								>
									<div className='flex items-start gap-3'>
										<div className='text-3xl'>{achievement.icon}</div>
										<div className='flex-1'>
											<h4 className='font-semibold text-slate-900 mb-1'>
												{achievement.title}
											</h4>
											<p className='text-sm text-slate-600 mb-2'>
												{achievement.description}
											</p>
											{achievement.unlockedAt && (
												<p className='text-xs text-slate-500'>
													Разблокировано:{' '}
													{new Date(achievement.unlockedAt).toLocaleDateString(
														'ru-RU'
													)}
												</p>
											)}
										</div>
									</div>
								</div>
							)
						})}
					</div>
				</div>
			)}

			{lockedAchievements.length > 0 && (
				<div>
					<h3 className='text-lg font-semibold text-slate-700 mb-4'>
						Заблокированные ({lockedAchievements.length})
					</h3>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
						{lockedAchievements.slice(0, 5).map(achievement => (
							<div
								key={achievement.id}
								className='p-4 rounded-xl border-2 border-slate-200 bg-slate-50 opacity-60'
							>
								<div className='flex items-start gap-3'>
									<div className='text-3xl grayscale'>{achievement.icon}</div>
									<div className='flex-1'>
										<h4 className='font-semibold text-slate-600 mb-1'>???</h4>
										<p className='text-sm text-slate-500'>
											Достижение заблокировано
										</p>
									</div>
								</div>
							</div>
						))}
						{lockedAchievements.length > 5 && (
							<div className='p-4 rounded-xl border-2 border-slate-200 bg-slate-50 opacity-60 flex items-center justify-center'>
								<div className='text-center'>
									<div className='text-3xl text-slate-400 mb-2'>...</div>
									<p className='text-sm text-slate-500'>
										Еще {lockedAchievements.length - 5} заблокированных
									</p>
								</div>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Модальное окно для просмотра всех достижений */}
			{(showAllAchievements || isClosing) && (
				<div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
					{/* Overlay с анимацией */}
					<button
						type='button'
						className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
							isClosing ? 'opacity-0' : 'opacity-100'
						}`}
						onClick={handleCloseModal}
						aria-label='Закрыть модальное окно'
					/>
					{/* Модальное окно с анимацией */}
					<div
						className={`relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col z-10 transition-all duration-300 ${
							isClosing
								? 'opacity-0 scale-95 translate-y-4'
								: 'opacity-100 scale-100 translate-y-0'
						}`}
						role='dialog'
						aria-modal='true'
						aria-labelledby='achievements-modal-title'
					>
						{/* Заголовок */}
						<div className='flex items-center justify-between p-6 border-b border-slate-200'>
							<h2
								id='achievements-modal-title'
								className='text-2xl font-bold text-slate-900 flex items-center gap-2'
							>
								<Award className='h-6 w-6 text-yellow-600' />
								Все достижения ({unlockedAchievements.length})
							</h2>
							<Button
								variant='ghost'
								size='sm'
								onClick={handleCloseModal}
								className='h-8 w-8 p-0 hover:bg-slate-100 transition-colors'
							>
								<X className='h-5 w-5' />
							</Button>
						</div>

						{/* Контент с прокруткой */}
						<div className='flex-1 overflow-y-auto p-6'>
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
								{/* Системные достижения */}
								{systemAchievements.map((achievement, index) => {
									return (
										<div
											key={achievement.id}
											className={`p-4 rounded-xl border-2 transition-all duration-300 ${
												rarityColors[achievement.rarity]
											} ${
												isClosing
													? 'opacity-0 scale-95 translate-y-2'
													: 'opacity-100 scale-100 translate-y-0'
											}`}
											style={{
												transitionDelay: isClosing ? '0ms' : `${index * 30}ms`,
											}}
										>
											<div className='flex items-start gap-3'>
												<div className='text-3xl'>{achievement.icon}</div>
												<div className='flex-1'>
													<h4 className='font-semibold text-slate-900 mb-1'>
														{achievement.title}
													</h4>
													<p className='text-sm text-slate-600 mb-2'>
														{achievement.description}
													</p>
													{achievement.unlockedAt && (
														<p className='text-xs text-slate-500'>
															Разблокировано:{' '}
															{new Date(
																achievement.unlockedAt
															).toLocaleDateString('ru-RU')}
														</p>
													)}
												</div>
											</div>
										</div>
									)
								})}

								{/* Пользовательские достижения */}
								{customAchievements.map((achievement, index) => {
									const delayIndex = systemAchievements.length + index
									return (
										<div
											key={achievement.id}
											className={`p-4 rounded-xl border-2 transition-all duration-300 ${
												rarityColors[achievement.rarity]
											} ${
												isClosing
													? 'opacity-0 scale-95 translate-y-2'
													: 'opacity-100 scale-100 translate-y-0'
											}`}
											style={{
												transitionDelay: isClosing
													? '0ms'
													: `${delayIndex * 30}ms`,
											}}
										>
											<div className='flex items-start gap-3'>
												<div className='text-3xl'>{achievement.icon}</div>
												<div className='flex-1'>
													<h4 className='font-semibold text-slate-900 mb-1'>
														{achievement.title}
													</h4>
													<p className='text-sm text-slate-600 mb-2'>
														{achievement.description}
													</p>
													{achievement.unlockedAt && (
														<p className='text-xs text-slate-500'>
															Разблокировано:{' '}
															{new Date(
																achievement.unlockedAt
															).toLocaleDateString('ru-RU')}
														</p>
													)}
												</div>
											</div>
										</div>
									)
								})}
							</div>
						</div>

						{/* Футер */}
						<div className='p-6 border-t border-slate-200 flex justify-end'>
							<Button onClick={() => setShowAllAchievements(false)}>
								Закрыть
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
})
