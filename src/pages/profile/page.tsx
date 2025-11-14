import { ActiveQuests } from '@/components/profile/ActiveQuests'
import { ProfileAchievements } from '@/components/profile/ProfileAchievements'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ProfileLevelProgress } from '@/components/profile/ProfileLevelProgress'
import { ProfileStats } from '@/components/profile/ProfileStats'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Button } from '@/components/ui/button'
import { useUser } from '@/hooks/useUser'
import type { Achievement } from '@/types/user'
import { toast } from 'sonner'

export default function ProfilePage() {
	const { user, logout } = useUser()

	if (!user) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='text-center'>
					<p className='text-slate-600 mb-4'>Пожалуйста, войдите в систему</p>
					<Button asChild>
						<a href='/login'>Войти</a>
					</Button>
				</div>
			</div>
		)
	}

	const handleLogout = () => {
		logout()
		toast.success('Вы вышли из аккаунта')
		window.location.href = '/'
	}

	const unlockedAchievements = user.achievements.filter(
		(achievement: Achievement) => achievement.unlockedAt !== undefined
	)

	return (
		<ProtectedRoute>
			<div className='min-h-screen bg-linear-to-br from-slate-50 to-blue-50 py-6 sm:py-12 px-4 mt-16'>
				<div className='max-w-4xl mx-auto space-y-4 sm:space-y-8'>
					<ProfileHeader user={user} onLogout={handleLogout} />

					<div className='bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8'>
						<ProfileLevelProgress
							level={user.level.level}
							experience={user.level.experience}
							experienceToNext={user.level.experienceToNext}
						/>
					</div>

					<ProfileAchievements userAchievements={user.achievements} />

					<ActiveQuests />
				</div>
			</div>
		</ProtectedRoute>
	)
}
