import { ANIMATION_DURATION, SEARCH_MAP_ZOOM } from '@/constants'
import { getOrganizationCoordinates } from '@/utils/cityCoordinates'
import { useCallback } from 'react'
import type { GeocodeResult } from '../../hooks/useGeocode'
import type { Quest } from '../../types/quest-types'
import type { Organization } from '../../types/types'

interface UseMapHandlersProps {
	setSearchCenter: (center: [number, number] | undefined) => void
	setSearchZoom: (zoom: number | undefined) => void
	selectedQuestId: string | number | undefined
	setSelectedQuestId: (questId: string | number | undefined) => void
	selectedOrganization: Organization | undefined
	setSelectedOrganization: (org: Organization | undefined) => void
	setIsClosing: (closing: boolean) => void
	allQuests: Quest[]
}

export function useMapHandlers({
	setSearchCenter,
	setSearchZoom,
	selectedQuestId,
	setSelectedQuestId,
	selectedOrganization,
	setSelectedOrganization,
	setIsClosing,
	allQuests,
}: UseMapHandlersProps) {
	const handleAddressSelect = useCallback(
		(result: GeocodeResult) => {
			setSearchCenter([result.lat, result.lon])
			setSearchZoom(SEARCH_MAP_ZOOM)
		},
		[setSearchCenter, setSearchZoom]
	)

	const handleSelectQuest = useCallback(
		(quest: Quest) => {
			const questId = typeof quest.id === 'string' ? quest.id : quest.id
			setSearchCenter(quest.coordinates)
			setSearchZoom(SEARCH_MAP_ZOOM)
			// Закрываем организацию, если открыта
			if (selectedOrganization) {
				setSelectedOrganization(undefined)
			}
			// Если уже открыт другой квест, закрываем панель перед открытием новой
			if (selectedQuestId && selectedQuestId !== questId) {
				setIsClosing(true)
				setTimeout(() => {
					setSelectedQuestId(questId)
					setIsClosing(false)
				}, ANIMATION_DURATION)
			} else {
				setSelectedQuestId(questId)
				setIsClosing(false)
			}
		},
		[
			setSearchCenter,
			setSearchZoom,
			selectedOrganization,
			setSelectedOrganization,
			selectedQuestId,
			setSelectedQuestId,
			setIsClosing,
		]
	)

	const handleSelectOrganization = useCallback(
		(organization: Organization) => {
			setSearchCenter(getOrganizationCoordinates(organization))
			setSearchZoom(SEARCH_MAP_ZOOM)
			// Закрываем квест, если открыт
			if (selectedQuestId) {
				setSelectedQuestId(undefined)
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
		},
		[
			setSearchCenter,
			setSearchZoom,
			selectedQuestId,
			setSelectedQuestId,
			selectedOrganization,
			setSelectedOrganization,
			setIsClosing,
		]
	)

	const handleMarkerClick = useCallback(
		(item: Quest | Organization) => {
			// При клике на маркер закрываем открытую панель
			if ('story' in item) {
				// Это квест
				const questId = typeof item.id === 'string' ? item.id : item.id
				if (selectedQuestId && selectedQuestId !== questId) {
					setIsClosing(true)
					setTimeout(() => {
						setSelectedQuestId(undefined)
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
				if (selectedQuestId) {
					setSelectedQuestId(undefined)
				}
			}
		},
		[
			selectedQuestId,
			setSelectedQuestId,
			selectedOrganization,
			setSelectedOrganization,
			setIsClosing,
		]
	)

	const handleCloseDetails = useCallback(() => {
		setIsClosing(true)
		setTimeout(() => {
			setSelectedQuestId(undefined)
			setSelectedOrganization(undefined)
			setIsClosing(false)
		}, ANIMATION_DURATION)
	}, [setSelectedQuestId, setSelectedOrganization, setIsClosing])

	return {
		handleAddressSelect,
		handleSelectQuest,
		handleSelectOrganization,
		handleMarkerClick,
		handleCloseDetails,
	}
}

