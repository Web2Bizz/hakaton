import type { User } from '@/types/user'
import { Award, Heart, Trophy, Users } from 'lucide-react'
import { memo } from 'react'

interface ProfileStatsProps {
	stats: User['stats']
	unlockedAchievementsCount: number
}

export const ProfileStats = memo(function ProfileStats({
	stats,
	unlockedAchievementsCount,
}: ProfileStatsProps) {
	return (
		<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
			<div className='p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200'>
				<div className='flex items-center gap-2 mb-2'>
					<Trophy className='h-5 w-5 text-blue-600' />
					<span className='text-sm font-medium text-slate-700'>Квестов</span>
				</div>
				<p className='text-2xl font-bold text-slate-900'>{stats.totalQuests}</p>
			</div>

			<div className='p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200'>
				<div className='flex items-center gap-2 mb-2'>
					<Heart className='h-5 w-5 text-green-600' />
					<span className='text-sm font-medium text-slate-700'>Донатов</span>
				</div>
				<p className='text-2xl font-bold text-slate-900'>
					{stats.totalDonations.toLocaleString()} ₽
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
					{stats.totalVolunteerHours} ч
				</p>
			</div>

			<div className='p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200'>
				<div className='flex items-center gap-2 mb-2'>
					<Award className='h-5 w-5 text-yellow-600' />
					<span className='text-sm font-medium text-slate-700'>Достижений</span>
				</div>
				<p className='text-2xl font-bold text-slate-900'>
					{unlockedAchievementsCount}
				</p>
			</div>
		</div>
	)
})
