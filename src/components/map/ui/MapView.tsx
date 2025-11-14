import L from 'leaflet'
import {
	MapContainer,
	Marker,
	Popup,
	TileLayer,
	ZoomControl,
} from 'react-leaflet'
import { useMapCenter } from '../hooks/useMapCenter'
import { getMarkerIcon } from '../lib/markerIcon'
import type { Organization } from '../types/types'
import { MapController } from './MapController'

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

interface MapViewProps {
	readonly organizations: Organization[]
	readonly onSelect: (organization: Organization) => void
	readonly onMarkerClick?: () => void
	readonly searchCenter?: [number, number]
	readonly searchZoom?: number
}

export function MapView({
	organizations,
	onSelect,
	onMarkerClick,
	searchCenter,
	searchZoom,
}: MapViewProps) {
	const mapCenter = useMapCenter(organizations)
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

				{organizations.map(organization => (
					<Marker
						key={organization.id}
						position={organization.coordinates}
						icon={getMarkerIcon(organization.type)}
						eventHandlers={{
							click: () => {
								if (onMarkerClick) {
									onMarkerClick()
								}
							},
						}}
					>
						<Popup>
							<div className='popup-content'>
								<h3>{organization.name}</h3>
								<p>{organization.summary}</p>
								<button
									type='button'
									className='primary-button'
									onClick={() => onSelect(organization)}
								>
									Подробнее
								</button>
							</div>
						</Popup>
					</Marker>
				))}
			</MapContainer>
		</div>
	)
}
