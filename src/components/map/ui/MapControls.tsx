import { Actions } from './actions/Actions'
import { FiltersPanel } from './actions/FiltersPanel'
import { UnifiedList } from './actions/UnifiedList'
import type { FiltersState } from './actions/types'
import type { Quest } from '../types/quest-types'
import type { Organization } from '../types/types'

interface MapControlsProps {
	isFiltersOpen: boolean
	isListOpen: boolean
	isFiltersClosing: boolean
	isListClosing: boolean
	filters: FiltersState
	cities: string[]
	types: string[]
	helpTypes: Array<{ id: number; name: string }>
	quests: Quest[]
	organizations: Organization[]
	activeQuestId?: string
	activeOrgId?: string
	onToggleFilters: () => void
	onToggleList: () => void
	onFiltersChange: (filters: FiltersState) => void
	onSelectQuest: (quest: Quest) => void
	onSelectOrganization: (org: Organization) => void
}

export function MapControls({
	isFiltersOpen,
	isListOpen,
	isFiltersClosing,
	isListClosing,
	filters,
	cities,
	types,
	helpTypes,
	quests,
	organizations,
	activeQuestId,
	activeOrgId,
	onToggleFilters,
	onToggleList,
	onFiltersChange,
	onSelectQuest,
	onSelectOrganization,
}: MapControlsProps) {
	return (
		<>
			<Actions
				isFiltersOpen={isFiltersOpen}
				isListOpen={isListOpen}
				onToggleFilters={onToggleFilters}
				onToggleList={onToggleList}
			/>

			{(isFiltersOpen || isFiltersClosing) && (
				<FiltersPanel
					filters={filters}
					cities={cities}
					types={types}
					helpTypes={helpTypes}
					onFiltersChange={onFiltersChange}
					onClose={onToggleFilters}
					isClosing={isFiltersClosing}
					isOrganizationView={true}
				/>
			)}

			{(isListOpen || isListClosing) && (
				<UnifiedList
					quests={quests}
					organizations={organizations}
					activeQuestId={activeQuestId}
					activeOrgId={activeOrgId}
					onSelectQuest={onSelectQuest}
					onSelectOrganization={onSelectOrganization}
					onClose={onToggleList}
					isClosing={isListClosing}
				/>
			)}
		</>
	)
}

