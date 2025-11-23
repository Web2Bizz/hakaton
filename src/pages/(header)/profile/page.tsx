/**
 * @title Профиль пользователя
 * @description Личный профиль пользователя с достижениями, статистикой участия в квестах, уровнем и опытом. Управляйте своими организациями и квестами
 * @keywords профиль, пользователь, достижения, статистика, уровень, опыт, мои квесты, мои организации
 * @changefreq daily
 * @priority 0.8
 */

import { ActiveQuests } from '@/components/profile/ActiveQuests'
import { ProfileAchievements } from '@/components/profile/ProfileAchievements'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ProfileLevelProgress } from '@/components/profile/ProfileLevelProgress'
import { MyQuests } from '@/components/profile/MyQuests'
import { MyOrganizations } from '@/components/profile/MyOrganizations'
import { Spinner } from '@/components/ui/spinner'
import { useUser } from '@/hooks/useUser'
import { ProtectedRoute } from '@/provider/ProtectedRoute'
import { useEffect } from 'react'
import { toast } from 'sonner'

export default function ProfilePage() {
	const { user, logout } = useUser()

	useEffect(() => {
		if (!user) {
			const timer = setTimeout(() => {
				globalThis.location.href = '/login'
			}, 800) // Задержка 800ms перед переадресацией

			return () => clearTimeout(timer)
		}
	}, [user])

	if (!user) {
		return <Spinner />
	}

	const handleLogout = () => {
		logout()
		toast.success('👋 Вы вышли из аккаунта', {
			description: 'До встречи! Надеемся увидеть вас снова.',
			duration: 3000,
		})

		// Небольшая задержка перед редиректом, чтобы пользователь увидел toast
		setTimeout(() => {
			globalThis.location.href = '/login'
		}, 500)
	}

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

					<MyQuests />

					<MyOrganizations />

					<ActiveQuests />
				</div>
			</div>
		</ProtectedRoute>
	)
}
