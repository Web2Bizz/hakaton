import { useEffect, useMemo } from 'react'
import { MapControls } from './MapControls'
import { MapDetails } from './MapDetails'
import { MapSearch } from './MapSearch'
import { UnifiedMapView } from './UnifiedMapView'
import { useMapControls } from './hooks/useMapControls'
import { useMapHandlers } from './hooks/useMapHandlers'
import { useMapState } from './hooks/useMapState'

export const MapComponent = () => {
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

	// Обработка URL параметров для открытия квеста или организации
	useEffect(() => {
		const params = new URLSearchParams(window.location.search)
		const questId = params.get('quest')
		const orgId = params.get('organization')

		if (questId) {
			const quest = allQuests.find(q => q.id === questId)
			if (quest) {
				handleSelectQuest(quest)
			}
		} else if (orgId) {
			const org = allOrganizations.find(o => o.id === orgId)
			if (org) {
				handleSelectOrganization(org)
			}
		}
		// Запускаем только при монтировании, handlers стабильны благодаря useCallback
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

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

	// Объединяем данные для поиска
	const searchItems = useMemo(() => {
		const questItems = filteredQuests.map(q => ({
			...q,
			isQuest: true as const,
		}))

		const orgItems = filteredOrganizations.map(o => ({
			...o,
			isQuest: false as const,
		}))

		return [...questItems, ...orgItems]
	}, [filteredQuests, filteredOrganizations])

	const handleParticipate = () => {
		// Здесь будет логика участия в квесте
		// В будущем здесь будет API вызов для регистрации участия
	}

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
				quests={filteredQuests}
				organizations={filteredOrganizations}
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
