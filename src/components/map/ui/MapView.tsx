import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { useMapCenter } from '../hooks/useMapCenter'
import { getMarkerIcon } from '../lib/markerIcon'
import type { Organization } from '../types/types'

interface MapViewProps {
	readonly organizations: Organization[]
	readonly onSelect: (organization: Organization) => void
	readonly onMarkerClick?: () => void
}

export function MapView({
	organizations,
	onSelect,
	onMarkerClick,
}: MapViewProps) {
	const mapCenter = useMapCenter(organizations)

	return (
		<div className='map-wrapper h-full w-full'>
			<MapContainer
				center={[mapCenter.lat, mapCenter.lng]}
				zoom={mapCenter.zoom}
				minZoom={4}
				scrollWheelZoom
				style={{ height: '100%', width: '100%' }}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
					url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
				/>

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
