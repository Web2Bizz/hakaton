import { ASSISTANCE_OPTIONS } from '@/constants'
import {
	useGetCitiesQuery,
	useGetOrganizationTypesQuery,
	useGetOrganizationsQuery,
} from '@/store/entities/organization'
import { getAllOrganizations, getAllQuests } from '@/utils/userData'
import { useMemo, useState } from 'react'
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

	// Загружаем данные из API
	const {
		data: organizationsResponse,
		isLoading: isLoadingOrganizations,
		error: organizationsError,
	} = useGetOrganizationsQuery()

	// Загружаем города с сервера
	const { data: citiesData = [] } = useGetCitiesQuery()

	// Загружаем типы организаций с сервера
	const { data: organizationTypesData = [] } = useGetOrganizationTypesQuery()

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

	// Объединяем города из API и локальных данных квестов
	const allCities = useMemo(() => {
		// Получаем названия городов из API
		const apiCities = citiesData.map(city => city.name)
		// Объединяем с городами из квестов
		const allCitiesList = Array.from(new Set([...questCities, ...apiCities]))
		return allCitiesList.sort((a, b) => a.localeCompare(b))
	}, [citiesData])

	// Объединяем типы организаций из API и локальных данных квестов
	const allTypes = useMemo(() => {
		// Получаем названия типов организаций из API
		const apiTypes = organizationTypesData.map(type => type.name)
		// Объединяем с типами из квестов
		const allTypesList = Array.from(new Set([...questTypes, ...apiTypes]))
		return allTypesList.sort((a, b) => a.localeCompare(b))
	}, [organizationTypesData])

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
