import {
	ANIMATION_DURATION,
	ASSISTANCE_OPTIONS,
	SEARCH_MAP_ZOOM,
} from '@/constants'
import { getAllQuests, getAllOrganizations } from '@/utils/userData'
import { useMemo, useState } from 'react'
import {
	cities as orgCities,
	organizationTypes,
	organizations as baseOrganizations,
} from '../data/organizations'
import { questCities, questTypes, quests as baseQuests } from '../data/quests'
import { useFilteredOrganizations } from '../hooks/useFilteredOrganizations'
import { useFilteredQuests } from '../hooks/useFilteredQuests'
import type { GeocodeResult } from '../hooks/useGeocode'
import type { Quest } from '../types/quest-types'
import type { Organization } from '../types/types'
import { Actions } from './actions/Actions'
import { FiltersPanel } from './actions/FiltersPanel'
import type { FiltersState } from './actions/types'
import { UnifiedList } from './actions/UnifiedList'
import { AddressSearchInput } from './AddressSearchInput'
import { OrganizationDetails } from './organization/OrganizationDetails'
import { QuestDetails } from './quest/QuestDetails'
import { UnifiedMapView } from './UnifiedMapView'

const initialFilters: FiltersState = {
	city: '',
	type: '',
	assistance: ASSISTANCE_OPTIONS.reduce((acc, item) => {
		acc[item.id] = false
		return acc
	}, {} as FiltersState['assistance']),
	search: '',
}

export const MapComponent = () => {
	const [searchCenter, setSearchCenter] = useState<
		[number, number] | undefined
	>()
	const [searchZoom, setSearchZoom] = useState<number | undefined>()
	const [selectedQuest, setSelectedQuest] = useState<Quest | undefined>()
	const [selectedOrganization, setSelectedOrganization] = useState<
		Organization | undefined
	>()
	const [isClosing, setIsClosing] = useState(false)
	const [filters, setFilters] = useState<FiltersState>(initialFilters)
	const [isFiltersOpen, setIsFiltersOpen] = useState(false)
	const [isListOpen, setIsListOpen] = useState(false)
	const [isFiltersClosing, setIsFiltersClosing] = useState(false)
	const [isListClosing, setIsListClosing] = useState(false)

	// Объединяем базовые данные с созданными пользователями
	const allQuests = useMemo(() => getAllQuests(baseQuests), [])
	const allOrganizations = useMemo(() => getAllOrganizations(baseOrganizations), [])

	const filteredQuests = useFilteredQuests(allQuests, filters)
	const filteredOrganizations = useFilteredOrganizations(allOrganizations, filters)

	// Объединяем города и типы из обоих источников
	const allCities = useMemo(
		() =>
			Array.from(new Set([...questCities, ...orgCities])).sort((a, b) =>
				a.localeCompare(b)
			),
		[]
	)

	const allTypes = useMemo(
		() =>
			Array.from(new Set([...questTypes, ...organizationTypes])).sort((a, b) =>
				a.localeCompare(b)
			),
		[]
	)

	const handleAddressSelect = (result: GeocodeResult) => {
		setSearchCenter([result.lat, result.lon])
		setSearchZoom(SEARCH_MAP_ZOOM)
	}

	const handleSelectQuest = (quest: Quest) => {
		setSearchCenter(quest.coordinates)
		setSearchZoom(SEARCH_MAP_ZOOM)
		// Закрываем организацию, если открыта
		if (selectedOrganization) {
			setSelectedOrganization(undefined)
		}
		// Если уже открыт другой квест, закрываем панель перед открытием новой
		if (selectedQuest && selectedQuest.id !== quest.id) {
			setIsClosing(true)
			setTimeout(() => {
				setSelectedQuest(quest)
				setIsClosing(false)
			}, ANIMATION_DURATION)
		} else {
			setSelectedQuest(quest)
			setIsClosing(false)
		}
	}

	const handleSelectOrganization = (organization: Organization) => {
		setSearchCenter(organization.coordinates)
		setSearchZoom(SEARCH_MAP_ZOOM)
		// Закрываем квест, если открыт
		if (selectedQuest) {
			setSelectedQuest(undefined)
		}
		// Если уже открыта другая организация, закрываем панель перед открытием новой
		if (selectedOrganization && selectedOrganization.id !== organization.id) {
			setIsClosing(true)
			setTimeout(() => {
				setSelectedOrganization(organization)
				setIsClosing(false)
			}, ANIMATION_DURATION)
		} else {
			setSelectedOrganization(organization)
			setIsClosing(false)
		}
	}

	const handleMarkerClick = (item: Quest | Organization) => {
		// При клике на маркер закрываем открытую панель
		if ('story' in item) {
			// Это квест
			if (selectedQuest && selectedQuest.id !== item.id) {
				setIsClosing(true)
				setTimeout(() => {
					setSelectedQuest(undefined)
					setIsClosing(false)
				}, ANIMATION_DURATION)
			}
			if (selectedOrganization) {
				setSelectedOrganization(undefined)
			}
		} else {
			// Это организация
			if (selectedOrganization && selectedOrganization.id !== item.id) {
				setIsClosing(true)
				setTimeout(() => {
					setSelectedOrganization(undefined)
					setIsClosing(false)
				}, ANIMATION_DURATION)
			}
			if (selectedQuest) {
				setSelectedQuest(undefined)
			}
		}
	}

	const handleCloseDetails = () => {
		setIsClosing(true)
		setTimeout(() => {
			setSelectedQuest(undefined)
			setSelectedOrganization(undefined)
			setIsClosing(false)
		}, ANIMATION_DURATION)
	}

	const handleParticipate = (questId: string) => {
		// Здесь будет логика участия в квесте
		console.log('Участие в квесте:', questId)
		// В будущем здесь будет API вызов для регистрации участия
	}

	const handleToggleFilters = () => {
		if (isFiltersOpen) {
			setIsFiltersClosing(true)
			setTimeout(() => {
				setIsFiltersOpen(false)
				setIsFiltersClosing(false)
			}, ANIMATION_DURATION)
		} else {
			setIsFiltersOpen(true)
			setIsFiltersClosing(false)
		}
	}

	const handleToggleList = () => {
		if (isListOpen) {
			setIsListClosing(true)
			setTimeout(() => {
				setIsListOpen(false)
				setIsListClosing(false)
			}, ANIMATION_DURATION)
		} else {
			setIsListOpen(true)
			setIsListClosing(false)
		}
	}

	// Объединяем данные для поиска
	const searchItems = useMemo(() => {
		const questItems = filteredQuests.map(q => ({
			id: q.id,
			name: q.title,
			city: q.city,
			type: q.type,
			assistance: [],
			summary: q.story,
			description: '',
			mission: '',
			goals: [],
			needs: [],
			coordinates: q.coordinates,
			address: q.address,
			contacts: { phone: q.curator.phone },
			gallery: q.gallery,
			isQuest: true as const,
		}))

		const orgItems = filteredOrganizations.map(o => ({
			...o,
			isQuest: false as const,
		}))

		return [...questItems, ...orgItems]
	}, [filteredQuests, filteredOrganizations])

	return (
		<div className='relative w-full h-full'>
			<UnifiedMapView
				quests={filteredQuests}
				organizations={filteredOrganizations}
				onSelectQuest={handleSelectQuest}
				onSelectOrganization={handleSelectOrganization}
				onMarkerClick={handleMarkerClick}
				searchCenter={searchCenter}
				searchZoom={searchZoom}
			/>
			<div className='absolute top-20 left-5 w-full max-w-[400px] z-999'>
				<AddressSearchInput
					organizations={searchItems}
					onAddressSelect={handleAddressSelect}
					onOrganizationSelect={item => {
						if (item.isQuest) {
							const quest = filteredQuests.find(q => q.id === item.id)
							if (quest) {
								handleSelectQuest(quest)
							}
						} else {
							const org = filteredOrganizations.find(o => o.id === item.id)
							if (org) {
								handleSelectOrganization(org)
							}
						}
					}}
					placeholder='Поиск по адресу, квесту или организации...'
				/>
			</div>

			<Actions
				isFiltersOpen={isFiltersOpen}
				isListOpen={isListOpen}
				onToggleFilters={handleToggleFilters}
				onToggleList={handleToggleList}
			/>

			{(isFiltersOpen || isFiltersClosing) && (
				<FiltersPanel
					filters={filters}
					cities={allCities}
					types={allTypes}
					onFiltersChange={setFilters}
					onClose={handleToggleFilters}
					isClosing={isFiltersClosing}
					isOrganizationView={true}
				/>
			)}

			{(isListOpen || isListClosing) && (
				<UnifiedList
					quests={filteredQuests}
					organizations={filteredOrganizations}
					activeQuestId={selectedQuest?.id}
					activeOrgId={selectedOrganization?.id}
					onSelectQuest={handleSelectQuest}
					onSelectOrganization={handleSelectOrganization}
					onClose={handleToggleList}
					isClosing={isListClosing}
				/>
			)}

			{selectedQuest && (
				<QuestDetails
					quest={selectedQuest}
					onClose={handleCloseDetails}
					isClosing={isClosing}
					onParticipate={handleParticipate}
				/>
			)}

			{selectedOrganization && (
				<OrganizationDetails
					organization={selectedOrganization}
					onClose={handleCloseDetails}
					isClosing={isClosing}
				/>
			)}
		</div>
	)
}
