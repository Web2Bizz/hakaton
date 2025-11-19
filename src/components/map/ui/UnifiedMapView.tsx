import L from 'leaflet'
import { useMemo } from 'react'
import {
	MapContainer,
	Marker,
	Popup,
	TileLayer,
	ZoomControl,
} from 'react-leaflet'
// @ts-expect-error - react-leaflet-cluster может иметь несовместимость версий, но работает
import MarkerClusterGroup from 'react-leaflet-cluster'
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/constants'
import { getOrganizationCoordinates } from '@/utils/cityCoordinates'
import { getMarkerIcon } from '../lib/markerIcon'
import type { Organization } from '../types/types'
import type { Quest } from '../types/quest-types'
import { MapController } from './MapController'
import { OrganizationPopup } from './organization/OrganizationPopup'
import { QuestPopup } from './quest/QuestPopup'

// Иконка для найденного адреса
const searchMarkerIcon = L.divIcon({
	html: `<div style="
		width: 24px;
		height: 24px;
		border-radius: 50% 50% 50% 0;
		background: #3b82f6;
		border: 3px solid white;
		box-shadow: 0 2px 8px rgba(0,0,0,0.3);
		transform: rotate(-45deg);
	"></div>`,
	className: 'search-marker',
	iconSize: [24, 24],
	iconAnchor: [12, 24],
	popupAnchor: [0, -24],
})

interface UnifiedMapViewProps {
	readonly quests: Quest[]
	readonly organizations: Organization[]
	readonly onSelectQuest: (quest: Quest) => void
	readonly onSelectOrganization: (organization: Organization) => void
	readonly onMarkerClick?: (item: Quest | Organization) => void
	readonly searchCenter?: [number, number]
	readonly searchZoom?: number
}

export function UnifiedMapView({
	quests,
	organizations,
	onSelectQuest,
	onSelectOrganization,
	onMarkerClick,
	searchCenter,
	searchZoom,
}: UnifiedMapViewProps) {
	// Вычисляем центр карты для всех элементов
	const mapCenter = useMemo(() => {
		const questCoords = quests.map(q => q.coordinates)
		const orgCoords = organizations
			.filter(o => o && o.latitude && o.longitude)
			.map(o => getOrganizationCoordinates(o))
		const allItems = [...questCoords, ...orgCoords]

		if (allItems.length === 0) {
			return { lat: DEFAULT_MAP_CENTER[0], lng: DEFAULT_MAP_CENTER[1], zoom: DEFAULT_MAP_ZOOM }
		}

		const latSum = allItems.reduce((acc, [lat]) => acc + lat, 0)
		const lngSum = allItems.reduce((acc, [, lng]) => acc + lng, 0)
		const avgLat = latSum / allItems.length
		const avgLng = lngSum / allItems.length

		return { lat: avgLat, lng: avgLng, zoom: 5 }
	}, [quests, organizations])

	const initialCenter: [number, number] = searchCenter || [
		mapCenter.lat,
		mapCenter.lng,
	]

	return (
		<div className='map-wrapper h-full w-full relative z-0'>
			<MapContainer
				center={initialCenter}
				zoom={searchZoom || mapCenter.zoom}
				minZoom={4}
				scrollWheelZoom
				zoomControl={false}
				style={{ height: '100%', width: '100%' }}
			>
				{searchCenter && (
					<MapController center={searchCenter} zoom={searchZoom || 15} />
				)}
				<ZoomControl position='topright' />
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
					url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
				/>

				{searchCenter && (
					<Marker position={searchCenter} icon={searchMarkerIcon}>
						<Popup>
							<div className='popup-content'>
								<p className='text-sm font-medium'>Найденный адрес</p>
							</div>
						</Popup>
					</Marker>
				)}

				<MarkerClusterGroup>
					{quests.map(quest => (
						<Marker
							key={`quest-${quest.id}`}
							position={quest.coordinates}
							icon={getMarkerIcon(quest.type, quest.progressColor)}
							eventHandlers={{
								click: () => {
									if (onMarkerClick) {
										onMarkerClick(quest)
									}
								},
							}}
						>
							<Popup>
								<QuestPopup quest={quest} onSelect={onSelectQuest} />
							</Popup>
						</Marker>
					))}

					{organizations
						.filter(organization => {
							// Фильтруем организации с валидными координатами
							return (
								organization &&
								organization.latitude &&
								organization.longitude &&
								!Number.isNaN(Number.parseFloat(organization.latitude)) &&
								!Number.isNaN(Number.parseFloat(organization.longitude))
							)
						})
						.map(organization => (
							<Marker
								key={`org-${organization.id}`}
								position={getOrganizationCoordinates(organization)}
								icon={getMarkerIcon(
									organization.organizationTypes?.[0]?.name || ''
								)}
								eventHandlers={{
									click: () => {
										if (onMarkerClick) {
											onMarkerClick(organization)
										}
									},
								}}
							>
								<Popup>
									<OrganizationPopup
										organization={organization}
										onSelect={onSelectOrganization}
									/>
								</Popup>
							</Marker>
						))}
				</MarkerClusterGroup>
			</MapContainer>
		</div>
	)
}

