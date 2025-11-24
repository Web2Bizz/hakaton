import { Settings } from 'lucide-react'
import { TourProvider } from '../../core'
import { manageTourSteps } from './manageTourSteps'

export function ManageTourProvider() {
	return (
		<TourProvider
			pageKey='manage'
			steps={manageTourSteps}
			modalTitle='Тур по панели управления'
			modalDescription='Узнайте, как управлять своими квестами и организациями.'
			modalIcon={Settings}
		/>
	)
}

