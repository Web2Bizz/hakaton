import { Button } from '@/components/ui/button'
import type { User } from '@/types/user'
import { Award, Heart, LogOut, Mail, Trophy, Users } from 'lucide-react'
import { memo } from 'react'

interface ProfileHeaderProps {
	user: User
	onLogout: () => void
}

export const ProfileHeader = memo(function ProfileHeader({
	user,
	onLogout,
}: ProfileHeaderProps) {
	const unlockedAchievements = user.achievements.filter(
		a => a.unlockedAt !== undefined
	).length

	return (
		<div className='relative overflow-hidden rounded-3xl shadow-2xl bg-linear-to-br from-blue-500 via-blue-400 to-cyan-400'>
			{/* Декоративные элементы */}
			<div className='absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2' />
			<div className='absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2' />
			{/* Затемняющий слой для лучшей читаемости */}
			<div className='absolute inset-0 bg-linear-to-b from-black/10 to-black/5' />

			<div className='relative p-6 sm:p-8 md:p-10 z-10'>
				{/* Верхняя часть с кнопкой выхода */}
				<div className='flex justify-end mb-6'>
					<Button
						variant='outline'
						onClick={onLogout}
						className='bg-white/90 backdrop-blur-sm border-white/50 text-slate-700 hover:bg-white shadow-lg'
						size='sm'
					>
						<LogOut className='h-4 w-4 mr-2' />
						Выйти
					</Button>
				</div>

				{/* Основная информация */}
				<div className='flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8'>
					{/* Аватар */}
					<div className='relative shrink-0'>
						<div className='w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-2xl bg-white/95 backdrop-blur-md border-4 border-white flex items-center justify-center text-blue-600 text-4xl sm:text-5xl md:text-6xl font-bold shadow-xl'>
							{user.name.charAt(0).toUpperCase()}
						</div>
						{/* Бейдж уровня */}
						<div className='absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 rounded-full px-3 py-1 text-xs sm:text-sm font-bold shadow-lg border-2 border-white'>
							Lv.{user.level.level}
						</div>
					</div>

					{/* Информация о пользователе */}
					<div className='flex-1 min-w-0 text-white'>
						<h1 className='text-2xl sm:text-3xl md:text-4xl font-bold mb-2 drop-shadow-lg text-white'>
							{user.name}
						</h1>
						<div className='flex items-center gap-2 mb-3 text-white'>
							<Mail className='h-4 w-4 shrink-0' />
							<p className='text-sm sm:text-base truncate'>{user.email}</p>
						</div>
						<div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm border border-white text-slate-700 shadow-md'>
							<Award className='h-4 w-4 text-blue-600' />
							<span className='text-sm sm:text-base font-semibold'>
								{user.level.title}
							</span>
						</div>
					</div>
				</div>

				{/* Быстрая статистика */}
				<div className='grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4'>
					<div className='bg-white/95 backdrop-blur-md rounded-xl p-3 sm:p-4 border border-white shadow-lg'>
						<div className='flex items-center gap-2 mb-1'>
							<Trophy className='h-4 w-4 sm:h-5 sm:w-5 text-blue-600 shrink-0' />
							<span className='text-xs sm:text-sm text-slate-700 font-medium'>
								Квестов
							</span>
						</div>
						<p className='text-xl sm:text-2xl font-bold text-slate-900'>
							{user.stats.totalQuests}
						</p>
					</div>

					<div className='bg-white/95 backdrop-blur-md rounded-xl p-3 sm:p-4 border border-white shadow-lg'>
						<div className='flex items-center gap-2 mb-1'>
							<Heart className='h-4 w-4 sm:h-5 sm:w-5 text-red-500 shrink-0' />
							<span className='text-xs sm:text-sm text-slate-700 font-medium'>
								Донатов
							</span>
						</div>
						<p className='text-lg sm:text-xl md:text-2xl font-bold text-slate-900 truncate'>
							{user.stats.totalDonations.toLocaleString()} ₽
						</p>
					</div>

					<div className='bg-white/95 backdrop-blur-md rounded-xl p-3 sm:p-4 border border-white shadow-lg'>
						<div className='flex items-center gap-2 mb-1'>
							<Users className='h-4 w-4 sm:h-5 sm:w-5 text-purple-600 shrink-0' />
							<span className='text-xs sm:text-sm text-slate-700 font-medium'>
								Часов
							</span>
						</div>
						<p className='text-xl sm:text-2xl font-bold text-slate-900'>
							{user.stats.totalVolunteerHours}
						</p>
					</div>

					<div className='bg-white/95 backdrop-blur-md rounded-xl p-3 sm:p-4 border border-white shadow-lg'>
						<div className='flex items-center gap-2 mb-1'>
							<Award className='h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 shrink-0' />
							<span className='text-xs sm:text-sm text-slate-700 font-medium'>
								Достижений
							</span>
						</div>
						<p className='text-xl sm:text-2xl font-bold text-slate-900'>
							{unlockedAchievements}
						</p>
					</div>
				</div>
			</div>
		</div>
	)
})
