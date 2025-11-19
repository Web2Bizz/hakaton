import L from 'leaflet'
import {
	MapContainer,
	Marker,
	Popup,
	TileLayer,
	ZoomControl,
} from 'react-leaflet'
// @ts-expect-error - react-leaflet-cluster может иметь несовместимость версий, но работает
import MarkerClusterGroup from 'react-leaflet-cluster'
import { getOrganizationCoordinates } from '@/utils/cityCoordinates'
import { useMapCenter } from '../hooks/useMapCenter'
import { getMarkerIcon } from '../lib/markerIcon'
import type { Organization } from '../types/types'
import { MapController } from './MapController'
import { OrganizationPopup } from './organization/OrganizationPopup'

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
	readonly onMarkerClick?: (organization: Organization) => void
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

				<MarkerClusterGroup>
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
								key={organization.id}
								position={getOrganizationCoordinates(organization)}
								icon={getMarkerIcon(organization.organizationTypes?.[0]?.name || '')}
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
										onSelect={onSelect}
									/>
								</Popup>
							</Marker>
						))}
				</MarkerClusterGroup>
			</MapContainer>
		</div>
	)
}
