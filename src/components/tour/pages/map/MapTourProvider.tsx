import { Map } from 'lucide-react'
import { TourProvider } from '../../core'
import { mapTourSteps } from './mapTourSteps'

export function MapTourProvider() {
	return (
		<TourProvider
			storageKey='map_tour_status'
			steps={mapTourSteps}
			modalTitle='Тур по карте'
			modalDescription='Хотите узнать, как работать с картой? Пройдите краткий тур за 2 минуты.'
			modalIcon={Map}
		/>
	)
}
