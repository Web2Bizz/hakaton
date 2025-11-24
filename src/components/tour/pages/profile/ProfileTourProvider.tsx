import { User } from 'lucide-react'
import { TourProvider } from '../../core'
import { profileTourSteps } from './profileTourSteps'

export function ProfileTourProvider() {
	return (
		<TourProvider
			pageKey='profile'
			steps={profileTourSteps}
			modalTitle='Тур по профилю'
			modalDescription='Узнайте, как работать с вашим профилем и настройками.'
			modalIcon={User}
		/>
	)
}

