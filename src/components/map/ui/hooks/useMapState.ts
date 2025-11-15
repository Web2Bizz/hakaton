import { ASSISTANCE_OPTIONS } from '@/constants'
import { useGetOrganizationsQuery } from '@/store/entities/organization'
import { getAllOrganizations, getAllQuests } from '@/utils/userData'
import { useMemo, useState } from 'react'
import {
	cities as orgCities,
	organizationTypes,
} from '../../data/organizations'
import {
	quests as baseQuests,
	questCities,
	questTypes,
} from '../../data/quests'
import { useFilteredOrganizations } from '../../hooks/useFilteredOrganizations'
import { useFilteredQuests } from '../../hooks/useFilteredQuests'
import type { Quest } from '../../types/quest-types'
import type { Organization } from '../../types/types'
import type { FiltersState } from '../actions/types'

const initialFilters: FiltersState = {
	city: '',
	type: '',
	assistance: ASSISTANCE_OPTIONS.reduce((acc, item) => {
		acc[item.id] = false
		return acc
	}, {} as FiltersState['assistance']),
	search: '',
}

export function useMapState() {
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

	// Загружаем организации из API
	const {
		data: organizationsResponse,
		isLoading: isLoadingOrganizations,
		error: organizationsError,
	} = useGetOrganizationsQuery()

	// Получаем организации из API или пустой массив
	const apiOrganizations = useMemo(() => {
		if (organizationsResponse && Array.isArray(organizationsResponse)) {
			return organizationsResponse
		}
		return []
	}, [organizationsResponse])

	// Объединяем базовые данные с созданными пользователями
	const allQuests = useMemo(() => getAllQuests(baseQuests), [])

	// Используем организации из API вместо mock данных
	// getAllOrganizations может добавить организации, созданные пользователем локально
	const allOrganizations = useMemo(() => {
		const userOrganizations = getAllOrganizations([])

		console.log(userOrganizations, apiOrganizations)
		// Объединяем API организации с локальными (если есть)
		return [...apiOrganizations, ...userOrganizations]
	}, [apiOrganizations])

	const filteredQuests = useFilteredQuests(allQuests, filters)
	const filteredOrganizations = useFilteredOrganizations(
		allOrganizations,
		filters
	)

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

	return {
		// State
		searchCenter,
		setSearchCenter,
		searchZoom,
		setSearchZoom,
		selectedQuest,
		setSelectedQuest,
		selectedOrganization,
		setSelectedOrganization,
		isClosing,
		setIsClosing,
		filters,
		setFilters,
		isFiltersOpen,
		setIsFiltersOpen,
		isListOpen,
		setIsListOpen,
		isFiltersClosing,
		setIsFiltersClosing,
		isListClosing,
		setIsListClosing,
		// Data
		allQuests,
		allOrganizations,
		filteredQuests,
		filteredOrganizations,
		allCities,
		allTypes,
		// Loading states
		isLoadingOrganizations,
		organizationsError,
	}
}
