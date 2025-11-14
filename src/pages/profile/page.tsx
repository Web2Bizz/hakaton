import { ActiveQuests } from '@/components/profile/ActiveQuests'
import { allAchievements } from '@/data/achievements'
import { useUser } from '@/hooks/useUser'
import { Award, Heart, TrendingUp, Trophy, Users } from 'lucide-react'

const rarityColors = {
	common: 'bg-slate-100 border-slate-300 text-slate-700',
	rare: 'bg-blue-100 border-blue-300 text-blue-700',
	epic: 'bg-purple-100 border-purple-300 text-purple-700',
	legendary: 'bg-yellow-100 border-yellow-400 text-yellow-800',
}

export default function ProfilePage() {
	const { user } = useUser()

	if (!user) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<p className='text-slate-600'>Пожалуйста, войдите в систему</p>
			</div>
		)
	}

	const unlockedAchievements = user.achievements.filter(a => a.unlockedAt)
	const lockedAchievements = Object.values(allAchievements).filter(
		a => !user.achievements.some(ua => ua.id === a.id)
	)

	const levelProgress =
		(user.level.experience / user.level.experienceToNext) * 100

	return (
		<div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 mt-16'>
			<div className='max-w-4xl mx-auto space-y-8'>
				{/* Профиль пользователя */}
				<div className='bg-white rounded-2xl shadow-lg p-8'>
					<div className='flex items-start gap-6 mb-6'>
						<div className='w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-3xl font-bold'>
							{user.name.charAt(0).toUpperCase()}
						</div>
						<div className='flex-1'>
							<h1 className='text-3xl font-bold text-slate-900 mb-2'>
								{user.name}
							</h1>
							<p className='text-slate-600 mb-4'>{user.email}</p>
							<div className='flex items-center gap-4'>
								<div className='px-4 py-2 rounded-full bg-blue-50 border border-blue-200'>
									<span className='text-sm font-semibold text-blue-700'>
										Уровень {user.level.level}: {user.level.title}
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Прогресс уровня */}
					<div className='mb-6'>
						<div className='flex items-center justify-between mb-2'>
							<span className='text-sm font-medium text-slate-700'>
								Опыт до следующего уровня
							</span>
							<span className='text-sm font-semibold text-slate-900'>
								{user.level.experience} / {user.level.experienceToNext}
							</span>
						</div>
						<div className='h-3 bg-slate-200 rounded-full overflow-hidden'>
							<div
								className='h-full bg-gradient-to-r from-blue-500 to-cyan-600 transition-all duration-500'
								style={{ width: `${levelProgress}%` }}
							/>
						</div>
					</div>

					{/* Статистика */}
					<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
						<div className='p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200'>
							<div className='flex items-center gap-2 mb-2'>
								<Trophy className='h-5 w-5 text-blue-600' />
								<span className='text-sm font-medium text-slate-700'>
									Квестов
								</span>
							</div>
							<p className='text-2xl font-bold text-slate-900'>
								{user.stats.totalQuests}
							</p>
						</div>

						<div className='p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200'>
							<div className='flex items-center gap-2 mb-2'>
								<Heart className='h-5 w-5 text-green-600' />
								<span className='text-sm font-medium text-slate-700'>
									Донатов
								</span>
							</div>
							<p className='text-2xl font-bold text-slate-900'>
								{user.stats.totalDonations.toLocaleString()} ₽
							</p>
						</div>

						<div className='p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200'>
							<div className='flex items-center gap-2 mb-2'>
								<Users className='h-5 w-5 text-purple-600' />
								<span className='text-sm font-medium text-slate-700'>
									Волонтерство
								</span>
							</div>
							<p className='text-2xl font-bold text-slate-900'>
								{user.stats.totalVolunteerHours} ч
							</p>
						</div>

						<div className='p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200'>
							<div className='flex items-center gap-2 mb-2'>
								<Award className='h-5 w-5 text-yellow-600' />
								<span className='text-sm font-medium text-slate-700'>
									Достижений
								</span>
							</div>
							<p className='text-2xl font-bold text-slate-900'>
								{unlockedAchievements.length}
							</p>
						</div>
					</div>
				</div>

				{/* Влияние */}
				<div className='bg-white rounded-2xl shadow-lg p-8'>
					<h2 className='text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2'>
						<TrendingUp className='h-6 w-6 text-blue-600' />
						Ваше влияние
					</h2>
					<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
						<div className='text-center p-4 rounded-xl bg-green-50 border border-green-200'>
							<p className='text-3xl mb-1'>🌳</p>
							<p className='text-2xl font-bold text-slate-900'>
								{user.stats.totalImpact.treesPlanted}
							</p>
							<p className='text-sm text-slate-600'>Деревьев посажено</p>
						</div>
						<div className='text-center p-4 rounded-xl bg-blue-50 border border-blue-200'>
							<p className='text-3xl mb-1'>🐾</p>
							<p className='text-2xl font-bold text-slate-900'>
								{user.stats.totalImpact.animalsHelped}
							</p>
							<p className='text-sm text-slate-600'>Животных помогли</p>
						</div>
						<div className='text-center p-4 rounded-xl bg-cyan-50 border border-cyan-200'>
							<p className='text-3xl mb-1'>🧹</p>
							<p className='text-2xl font-bold text-slate-900'>
								{user.stats.totalImpact.areasCleaned}
							</p>
							<p className='text-sm text-slate-600'>Зон очищено</p>
						</div>
						<div className='text-center p-4 rounded-xl bg-purple-50 border border-purple-200'>
							<p className='text-3xl mb-1'>❤️</p>
							<p className='text-2xl font-bold text-slate-900'>
								{user.stats.totalImpact.livesChanged}
							</p>
							<p className='text-sm text-slate-600'>Жизней изменено</p>
						</div>
					</div>
				</div>

				{/* Достижения */}
				<div className='bg-white rounded-2xl shadow-lg p-8'>
					<h2 className='text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2'>
						<Award className='h-6 w-6 text-yellow-600' />
						Достижения ({unlockedAchievements.length} /{' '}
						{Object.keys(allAchievements).length})
					</h2>

					{/* Разблокированные */}
					{unlockedAchievements.length > 0 && (
						<div className='mb-8'>
							<h3 className='text-lg font-semibold text-slate-700 mb-4'>
								Разблокированные
							</h3>
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
								{unlockedAchievements.map(achievement => (
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
														{new Date(
															achievement.unlockedAt
														).toLocaleDateString('ru-RU')}
													</p>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Заблокированные */}
					{lockedAchievements.length > 0 && (
						<div>
							<h3 className='text-lg font-semibold text-slate-700 mb-4'>
								Заблокированные
							</h3>
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
								{lockedAchievements.map(achievement => (
									<div
										key={achievement.id}
										className='p-4 rounded-xl border-2 border-slate-200 bg-slate-50 opacity-60'
									>
										<div className='flex items-start gap-3'>
											<div className='text-3xl grayscale'>
												{achievement.icon}
											</div>
											<div className='flex-1'>
												<h4 className='font-semibold text-slate-600 mb-1'>
													???
												</h4>
												<p className='text-sm text-slate-500'>
													Достижение заблокировано
												</p>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Последняя активность */}
			<ActiveQuests />
		</div>
	)
}
