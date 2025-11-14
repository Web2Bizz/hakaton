import { useEffect, useMemo, useState } from 'react'
import type { FiltersState } from '../FiltersPanel'
import { FiltersPanel } from '../FiltersPanel'
import { MapView } from '../MapView'
import { OrganizationList } from '../OrganizationList'
import { OrganizationDetails } from '../OrganizationDetails'
import { MapControls } from '../MapControls'
import type { AssistanceTypeId, Organization } from '../../data/organizations'
import {
	assistanceOptions,
	cities,
	organizationTypes,
	organizations,
} from '../../data/organizations'

const initialFilters: FiltersState = {
	city: '',
	type: '',
	search: '',
	assistance: assistanceOptions.reduce((acc, item) => {
		acc[item.id] = false
		return acc
	}, {} as FiltersState['assistance']),
}

export function MapPage() {
	const [filters, setFilters] = useState<FiltersState>(initialFilters)
	const [activeId, setActiveId] = useState<string | undefined>(undefined)
	const [isDetailsOpen, setIsDetailsOpen] = useState(false)
	const [isFiltersOpen, setIsFiltersOpen] = useState(false)
	const [isListOpen, setIsListOpen] = useState(false)
	const [isFiltersClosing, setIsFiltersClosing] = useState(false)
	const [isListClosing, setIsListClosing] = useState(false)
	const [isDetailsClosing, setIsDetailsClosing] = useState(false)

	const selectedAssistance = useMemo<AssistanceTypeId[]>(() => {
		return assistanceOptions
			.map(option => option.id)
			.filter(id => Boolean(filters.assistance[id]))
	}, [filters.assistance])

	const filteredOrganizations = useMemo(() => {
		return organizations.filter(organization => {
			const matchesCity = filters.city
				? organization.city === filters.city
				: true
			const matchesType = filters.type
				? organization.type === filters.type
				: true
			const matchesSearch = filters.search
				? [organization.name, organization.summary, organization.description]
						.join(' ')
						.toLowerCase()
						.includes(filters.search.toLowerCase())
				: true

			const matchesAssistance =
				selectedAssistance.length === 0 ||
				selectedAssistance.every(assistance =>
					organization.assistance.includes(assistance)
				)

			return matchesCity && matchesType && matchesSearch && matchesAssistance
		})
	}, [filters, selectedAssistance])

	useEffect(() => {
		if (filteredOrganizations.length === 0) {
			if (activeId !== undefined) {
				if (isDetailsOpen) {
					setIsDetailsClosing(true)
					setTimeout(() => {
						setIsDetailsOpen(false)
						setIsDetailsClosing(false)
						setActiveId(undefined)
					}, 300)
				} else {
					setActiveId(undefined)
				}
			}
			return
		}

		// Не выбираем автоматически первую организацию
		if (
			activeId &&
			!filteredOrganizations.some(organization => organization.id === activeId)
		) {
			if (isDetailsOpen) {
				setIsDetailsClosing(true)
				setTimeout(() => {
					setIsDetailsOpen(false)
					setIsDetailsClosing(false)
					setActiveId(undefined)
				}, 300)
			} else {
				setActiveId(undefined)
			}
		}
	}, [filteredOrganizations, activeId, isDetailsOpen])

	const selectedOrganization: Organization | undefined = useMemo(() => {
		return filteredOrganizations.find(
			organization => organization.id === activeId
		)
	}, [filteredOrganizations, activeId])

	const handleSelectOrganization = (organization: Organization) => {
		setActiveId(organization.id)
		setIsDetailsOpen(true)
	}

	const handleCloseDetails = () => {
		setIsDetailsClosing(true)
		setTimeout(() => {
			setIsDetailsOpen(false)
			setIsDetailsClosing(false)
			setActiveId(undefined)
		}, 300)
	}

	const handleMarkerClick = () => {
		// Закрываем панель при клике на любой маркер
		if (isDetailsOpen) {
			setIsDetailsClosing(true)
			setTimeout(() => {
				setIsDetailsOpen(false)
				setIsDetailsClosing(false)
				setActiveId(undefined)
			}, 300)
		}
	}

	const handleToggleFilters = () => {
		if (isFiltersOpen) {
			setIsFiltersClosing(true)
			setTimeout(() => {
				setIsFiltersOpen(false)
				setIsFiltersClosing(false)
			}, 300)
		} else {
			setIsFiltersOpen(true)
			if (isListOpen) {
				setIsListClosing(true)
				setTimeout(() => {
					setIsListOpen(false)
					setIsListClosing(false)
				}, 300)
			}
		}
	}

	const handleToggleList = () => {
		if (isListOpen) {
			setIsListClosing(true)
			setTimeout(() => {
				setIsListOpen(false)
				setIsListClosing(false)
			}, 300)
		} else {
			setIsListOpen(true)
			if (isFiltersOpen) {
				setIsFiltersClosing(true)
				setTimeout(() => {
					setIsFiltersOpen(false)
					setIsFiltersClosing(false)
				}, 300)
			}
		}
	}

	return (
		<main className='map-layout' id='map-section'>
			<div className='map-fullscreen'>
				<MapView
					organizations={filteredOrganizations}
					onSelect={handleSelectOrganization}
					onMarkerClick={handleMarkerClick}
				/>
			</div>

			<MapControls
				onToggleFilters={handleToggleFilters}
				onToggleList={handleToggleList}
				isFiltersOpen={isFiltersOpen}
				isListOpen={isListOpen}
			/>

			{(isFiltersOpen || isFiltersClosing) && (
				<div className={`map-overlay-left ${isFiltersClosing ? 'closing' : ''}`}>
					<FiltersPanel
						filters={filters}
						onFiltersChange={setFilters}
						cities={cities}
						types={organizationTypes}
					/>
				</div>
			)}

			{(isListOpen || isListClosing) && (
				<div className={`map-overlay-left ${isListClosing ? 'closing' : ''}`}>
					<OrganizationList
						organizations={filteredOrganizations}
						activeId={activeId}
						onSelect={handleSelectOrganization}
					/>
				</div>
			)}

			{(isDetailsOpen || isDetailsClosing) && (
				<div className={`map-overlay-right ${isDetailsClosing ? 'closing' : ''}`}>
					<OrganizationDetails
						organization={selectedOrganization}
						onClose={handleCloseDetails}
					/>
				</div>
			)}
		</main>
	)
}

