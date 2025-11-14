import { useMemo, useState } from 'react'
import { ModeratorSidebar } from './ModeratorSidebar'
import { ModeratorDashboard } from './ModeratorDashboard'
import { PendingApplications } from './PendingApplications'
import { OrganizationManagement } from './OrganizationManagement'
import { ModeratorSettings } from './ModeratorSettings'
import { mockPendingApplications } from '../../data/moderation'

interface ModeratorPanelProps {
	onExit: () => void
}

export function ModeratorPanel({ onExit }: ModeratorPanelProps) {
	const [activeView, setActiveView] = useState('dashboard')

	const pendingCount = useMemo(
		() => mockPendingApplications.filter(app => app.status === 'pending').length,
		[]
	)

	const handleViewChange = (view: string) => {
		if (view === 'public') {
			onExit()
		} else {
			setActiveView(view)
		}
	}

	const handleApplicationUpdate = () => {
		// Обновление счетчика заявок происходит автоматически через useMemo
	}

	return (
		<div className='moderator-panel'>
			<ModeratorSidebar
				activeView={activeView}
				onViewChange={handleViewChange}
				pendingCount={pendingCount}
			/>
			<main className='moderator-main'>
				{activeView === 'dashboard' && <ModeratorDashboard />}
				{activeView === 'applications' && (
					<PendingApplications onApplicationUpdate={handleApplicationUpdate} />
				)}
				{activeView === 'organizations' && <OrganizationManagement />}
				{activeView === 'settings' && <ModeratorSettings />}
			</main>
		</div>
	)
}

