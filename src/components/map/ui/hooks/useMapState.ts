import { useGetCitiesQuery } from '@/store/entities/city'
import { useGetHelpTypesQuery } from '@/store/entities/help-type'
import { useGetOrganizationTypesQuery } from '@/store/entities/organization-type'
import { useGetOrganizationsQuery } from '@/store/entities/organization'
import { useGetQuestsQuery } from '@/store/entities/quest'
import { getAllOrganizations, getAllQuests } from '@/utils/userData'
import { transformApiQuestsToComponentQuests } from '@/utils/quest'
import { useEffect, useMemo, useState } from 'react'
import { useFilteredOrganizations } from '../../hooks/useFilteredOrganizations'
import { useFilteredQuests } from '../../hooks/useFilteredQuests'
import type { Quest } from '../../types/quest-types'
import type { Organization } from '../../types/types'
import type { FiltersState } from '../actions/types'

// Создаем начальные фильтры на основе helpTypes (будет обновлено после загрузки)
const createInitialFilters = (helpTypes: { name: string }[]): FiltersState => ({
	city: '',
	type: '',
	assistance: helpTypes.reduce((acc, item) => {
		acc[item.name] = false
		return acc
	}, {} as FiltersState['assistance']),
	search: '',
	markerType: 'all', // По умолчанию показываем все метки
})

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

	// Загружаем квесты с сервера
	const {
		data: questsResponse,
		isLoading: isLoadingQuests,
		error: questsError,
	} = useGetQuestsQuery()

	// Загружаем города с сервера
	const { data: citiesData = [] } = useGetCitiesQuery()

	// Загружаем типы организаций с сервера
	const { data: organizationTypesData = [] } = useGetOrganizationTypesQuery()

	// Загружаем виды помощи с сервера
	const { data: helpTypesData = [] } = useGetHelpTypesQuery()

	// Создаем начальные фильтры на основе загруженных helpTypes
	const initialFilters = useMemo(
		() => createInitialFilters(helpTypesData),
		[helpTypesData]
	)

	// Вычисляем обновленные фильтры с учетом новых helpTypes
	const computedFilters = useMemo(() => {
		if (helpTypesData.length === 0) {
			return initialFilters
		}

		const newAssistance: FiltersState['assistance'] = {
			...initialFilters.assistance,
		}
		// Добавляем новые helpTypes, которых еще нет в фильтрах
		for (const ht of helpTypesData) {
			if (!(ht.name in newAssistance)) {
				newAssistance[ht.name] = false
			}
		}

		return {
			...initialFilters,
			assistance: newAssistance,
		}
	}, [initialFilters, helpTypesData])

	const [filters, setFilters] = useState<FiltersState>(computedFilters)

	// Синхронизируем фильтры с вычисленными значениями при изменении helpTypes
	// Используем setTimeout для избежания синхронного обновления в эффекте
	useEffect(() => {
		const hasNewTypes = helpTypesData.some(
			ht => !(ht.name in filters.assistance)
		)
		if (!hasNewTypes) {
			return
		}

		// Используем setTimeout для асинхронного обновления
		const timeoutId = setTimeout(() => {
			setFilters(prev => {
				const newAssistance: FiltersState['assistance'] = { ...prev.assistance }
				// Добавляем новые helpTypes, которых еще нет в фильтрах
				for (const ht of helpTypesData) {
					if (!(ht.name in newAssistance)) {
						newAssistance[ht.name] = false
					}
				}
				return { ...prev, assistance: newAssistance }
			})
		}, 0)

		return () => clearTimeout(timeoutId)
	}, [helpTypesData, filters.assistance])

	// Получаем организации из API или пустой массив
	// Нормализуем данные: преобразуем type в organizationTypes если нужно
	const apiOrganizations = useMemo(() => {
		if (!organizationsResponse) return []

		const orgs = Array.isArray(organizationsResponse)
			? organizationsResponse
			: []

		// Нормализуем структуру: если есть type, преобразуем в organizationTypes
		return orgs.map(org => {
			// Если есть type, но нет organizationTypes, создаем массив
			if (
				(org as Organization & { type?: { id: number; name: string } }).type &&
				(!org.organizationTypes || org.organizationTypes.length === 0)
			) {
				const typeObj = (
					org as Organization & { type: { id: number; name: string } }
				).type
				return {
					...org,
					organizationTypes: [typeObj],
				}
			}
			// Если organizationTypes пустой массив, но есть type
			const orgType = (
				org as Organization & { type?: { id: number; name: string } }
			).type
			if (org.organizationTypes?.length === 0 && orgType) {
				return {
					...org,
					organizationTypes: [orgType],
				}
			}
			return org
		})
	}, [organizationsResponse])

	// Преобразуем квесты с сервера в формат компонентов
	const apiQuests = useMemo(() => {
		if (!questsResponse?.data?.quests) return []
		return transformApiQuestsToComponentQuests(questsResponse.data.quests)
	}, [questsResponse])

	// Объединяем квесты с сервера с созданными пользователями
	const allQuests = useMemo(() => getAllQuests(apiQuests), [apiQuests])

	// Используем организации из API вместо mock данных
	// getAllOrganizations может добавить организации, созданные пользователем локально
	const allOrganizations = useMemo(() => {
		const userOrganizations = getAllOrganizations([])

		// Объединяем API организации с локальными (если есть)
		return [...apiOrganizations, ...userOrganizations]
	}, [apiOrganizations])

	const filteredQuests = useFilteredQuests(allQuests, filters)
	const filteredOrganizations = useFilteredOrganizations(
		allOrganizations,
		filters
	)

	// Объединяем города из API и квестов с сервера
	const allCities = useMemo(() => {
		// Получаем названия городов из API
		const apiCities = citiesData.map(city => city.name)
		// Получаем города из квестов с сервера
		const questCitiesFromApi = apiQuests.map(quest => quest.city).filter(Boolean)
		// Объединяем все города
		const allCitiesList = Array.from(new Set([...apiCities, ...questCitiesFromApi]))
		return allCitiesList.sort((a, b) => a.localeCompare(b))
	}, [citiesData, apiQuests])

	// Получаем типы организаций из API (без объединения с типами квестов)
	const allTypes = useMemo(() => {
		// Получаем названия типов организаций из API
		// НЕ объединяем с типами квестов, так как это разные сущности
		const apiTypes = organizationTypesData
			.filter(type => type?.name) // Фильтруем валидные типы
			.map(type => type.name)

		return apiTypes.sort((a, b) => a.localeCompare(b))
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
		helpTypes: helpTypesData,
		// Loading states
		isLoadingOrganizations,
		isLoadingQuests,
		organizationsError,
		questsError,
	}
}
