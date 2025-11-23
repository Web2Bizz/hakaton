import { memo } from 'react'
import { OrganizationDetails } from './organization/OrganizationDetails'
import { QuestDetails } from './quest/QuestDetails'
import type { Organization } from '../types/types'

interface MapDetailsProps {
	selectedQuestId?: string | number
	selectedOrganization?: Organization
	isClosing: boolean
	onClose: () => void
	onParticipate?: (questId: string) => void
}

export const MapDetails = memo(function MapDetails({
	selectedQuestId,
	selectedOrganization,
	isClosing,
	onClose,
	onParticipate,
}: MapDetailsProps) {
	return (
		<>
			{selectedQuestId && (
				<QuestDetails
					questId={selectedQuestId}
					onClose={onClose}
					isClosing={isClosing}
					onParticipate={onParticipate}
				/>
			)}

			{selectedOrganization && (
				<OrganizationDetails
					organization={selectedOrganization}
					onClose={onClose}
					isClosing={isClosing}
				/>
			)}
		</>
	)
})

