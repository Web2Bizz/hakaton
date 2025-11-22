import { useEffect, useMemo, useRef } from 'react'
import { loadLeafletStyles } from '../lib/loadLeafletStyles'
import { MapControls } from './MapControls'
import { MapDetails } from './MapDetails'
import { MapSearch } from './MapSearch'
import { UnifiedMapView } from './UnifiedMapView'
import { useMapControls } from './hooks/useMapControls'
import { useMapHandlers } from './hooks/useMapHandlers'
import { useMapState } from './hooks/useMapState'

export const MapComponent = () => {
	// Загружаем стили Leaflet только когда компонент монтируется
	useEffect(() => {
		loadLeafletStyles()
	}, [])
	const {
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
		allQuests,
		allOrganizations,
		filteredQuests,
		filteredOrganizations,
		allCities,
		allTypes,
		helpTypes,
	} = useMapState()

	const {
		handleAddressSelect,
		handleSelectQuest,
		handleSelectOrganization,
		handleMarkerClick,
		handleCloseDetails,
	} = useMapHandlers({
		setSearchCenter,
		setSearchZoom,
		selectedQuest,
		setSelectedQuest,
		selectedOrganization,
		setSelectedOrganization,
		setIsClosing,
	})

	const { handleToggleFilters, handleToggleList } = useMapControls({
		isFiltersOpen,
		setIsFiltersOpen,
		isListOpen,
		setIsListOpen,
		setIsFiltersClosing,
		setIsListClosing,
	})

	// Флаг для отслеживания, был ли уже обработан URL параметр
	const urlProcessedRef = useRef(false)

	// Обработка URL параметров для открытия квеста или организации
	useEffect(() => {
		// Пропускаем, если URL уже был обработан
		if (urlProcessedRef.current) {
			return
		}

		// Пропускаем, если данные еще не загружены
		if (allQuests.length === 0 && allOrganizations.length === 0) {
			return
		}

		const params = new URLSearchParams(window.location.search)
		const questId = params.get('quest')
		const orgId = params.get('organization')

		if (questId && allQuests.length > 0) {
			// Нормализуем сравнение ID (приводим оба к строке)
			const quest = allQuests.find(q => {
				const qId = typeof q.id === 'string' ? q.id : String(q.id)
				return qId === questId
			})
			if (quest) {
				urlProcessedRef.current = true
				handleSelectQuest(quest)
				// Устанавливаем зум на координаты квеста
				if (quest.coordinates && quest.coordinates.length === 2) {
					setSearchCenter([quest.coordinates[0], quest.coordinates[1]])
					setSearchZoom(15)
				}
			}
		} else if (orgId && allOrganizations.length > 0) {
			// Нормализуем сравнение ID (приводим оба к строке)
			const org = allOrganizations.find(o => {
				const oId = typeof o.id === 'string' ? o.id : String(o.id)
				return oId === orgId
			})
			if (org) {
				urlProcessedRef.current = true
				handleSelectOrganization(org)
				// Устанавливаем зум на координаты организации
				if (org.coordinates && org.coordinates.length === 2) {
					setSearchCenter([org.coordinates[0], org.coordinates[1]])
					setSearchZoom(15)
				}
			}
		} else if (!questId && !orgId) {
			// Если нет параметров в URL, помечаем как обработанное
			urlProcessedRef.current = true
		}
	}, [allQuests, allOrganizations, handleSelectQuest, handleSelectOrganization, setSearchCenter, setSearchZoom])

	// Обработка зума на созданную точку
	useEffect(() => {
		const zoomData = localStorage.getItem('zoomToCoordinates')
		if (zoomData) {
			try {
				const { lat, lng, zoom } = JSON.parse(zoomData)
				if (lat && lng) {
					setSearchCenter([lat, lng])
					setSearchZoom(zoom || 15)
					// Очищаем после использования
					localStorage.removeItem('zoomToCoordinates')
				}
			} catch {
				// Если ошибка парсинга, просто удаляем
				localStorage.removeItem('zoomToCoordinates')
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// Объединяем данные для поиска с учетом фильтра по типу меток
	const searchItems = useMemo(() => {
		const questItems = 
			(filters.markerType === 'all' || filters.markerType === 'quests')
				? filteredQuests.map(q => ({
						...q,
						isQuest: true as const,
				  }))
				: []

		const orgItems = 
			(filters.markerType === 'all' || filters.markerType === 'organizations')
				? filteredOrganizations.map(o => ({
						...o,
						isQuest: false as const,
				  }))
				: []

		return [...questItems, ...orgItems]
	}, [filteredQuests, filteredOrganizations, filters.markerType])

	const handleParticipate = () => {
		// Здесь будет логика участия в квесте
		// В будущем здесь будет API вызов для регистрации участия
	}

	return (
		<div className='relative w-full h-full'>
			<UnifiedMapView
				quests={filters.markerType === 'all' || filters.markerType === 'quests' ? filteredQuests : []}
				organizations={filters.markerType === 'all' || filters.markerType === 'organizations' ? filteredOrganizations : []}
				onSelectQuest={handleSelectQuest}
				onSelectOrganization={handleSelectOrganization}
				onMarkerClick={handleMarkerClick}
				searchCenter={searchCenter}
				searchZoom={searchZoom}
			/>

			<MapSearch
				searchItems={searchItems}
				onAddressSelect={handleAddressSelect}
				onItemSelect={item => {
					if ('story' in item) {
						handleSelectQuest(item)
					} else {
						handleSelectOrganization(item)
					}
				}}
			/>

			<MapControls
				isFiltersOpen={isFiltersOpen}
				isListOpen={isListOpen}
				isFiltersClosing={isFiltersClosing}
				isListClosing={isListClosing}
				filters={filters}
				cities={allCities}
				types={allTypes}
				helpTypes={helpTypes}
				quests={filters.markerType === 'all' || filters.markerType === 'quests' ? filteredQuests : []}
				organizations={filters.markerType === 'all' || filters.markerType === 'organizations' ? filteredOrganizations : []}
				activeQuestId={selectedQuest?.id}
				activeOrgId={selectedOrganization?.id ? String(selectedOrganization.id) : undefined}
				onToggleFilters={handleToggleFilters}
				onToggleList={handleToggleList}
				onFiltersChange={setFilters}
				onSelectQuest={handleSelectQuest}
				onSelectOrganization={handleSelectOrganization}
			/>

			<MapDetails
				selectedQuest={selectedQuest}
				selectedOrganization={selectedOrganization}
				isClosing={isClosing}
				onClose={handleCloseDetails}
				onParticipate={handleParticipate}
			/>
		</div>
	)
}
