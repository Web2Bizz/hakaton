import { Plus } from 'lucide-react'
import { TourProvider } from '../../core'
import { addOrganizationTourSteps } from './addOrganizationTourSteps'

export function AddOrganizationTourProvider() {
	return (
		<TourProvider
			pageKey='add-organization'
			steps={addOrganizationTourSteps}
			modalTitle='Тур по созданию точек'
			modalDescription='Узнайте, как создавать организации и квесты на карте.'
			modalIcon={Plus}
		/>
	)
}
