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
import { getMarkerIcon } from '../lib/markerIcon'
import type { Quest } from '../types/quest-types'
import { MapController } from './MapController'
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

interface QuestMapViewProps {
	readonly quests: Quest[]
	readonly onSelect: (quest: Quest) => void
	readonly onMarkerClick?: (quest: Quest) => void
	readonly searchCenter?: [number, number]
	readonly searchZoom?: number
}

export function QuestMapView({
	quests,
	onSelect,
	onMarkerClick,
	searchCenter,
	searchZoom,
}: QuestMapViewProps) {
	// Вычисляем центр карты для квестов
	const mapCenter = useMemo(() => {
		if (quests.length === 0) {
			return { lat: DEFAULT_MAP_CENTER[0], lng: DEFAULT_MAP_CENTER[1], zoom: DEFAULT_MAP_ZOOM }
		}

		const latSum = quests.reduce((acc, q) => acc + q.coordinates[0], 0)
		const lngSum = quests.reduce((acc, q) => acc + q.coordinates[1], 0)
		const avgLat = latSum / quests.length
		const avgLng = lngSum / quests.length

		return { lat: avgLat, lng: avgLng, zoom: 5 }
	}, [quests])
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

				<MarkerClusterGroup>
					{quests.map(quest => (
						<Marker
							key={quest.id}
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
								<QuestPopup quest={quest} onSelect={onSelect} />
							</Popup>
						</Marker>
					))}
				</MarkerClusterGroup>
			</MapContainer>
		</div>
	)
}

