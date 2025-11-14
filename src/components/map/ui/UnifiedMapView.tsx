import L from 'leaflet'
import { useMemo } from 'react'
import {
	MapContainer,
	Marker,
	Popup,
	TileLayer,
	ZoomControl,
} from 'react-leaflet'
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/constants'
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
		const allItems = [
			...quests.map(q => q.coordinates),
			...organizations.map(o => o.coordinates),
		]

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
		<div className='map-wrapper h-full w-full'>
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

				{organizations.map(organization => (
					<Marker
						key={`org-${organization.id}`}
						position={organization.coordinates}
						icon={getMarkerIcon(organization.type)}
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
			</MapContainer>
		</div>
	)
}

