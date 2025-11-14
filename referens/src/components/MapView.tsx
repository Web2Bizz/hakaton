import L from 'leaflet'
import { useMemo } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import type { Organization } from '../data/organizations'

const typeIcons: Record<string, string> = {
	'Помощь животным': '🐾',
	'Помощь пожилым': '🤝',
	'Помощь детям': '🎈',
	'Поддержка людей с ОВЗ': '🧩',
	Экология: '🌿',
	Спорт: '🏅',
	Культура: '🎭',
	Образование: '📚',
}

function getMarkerIcon(type: string) {
	const emoji = typeIcons[type] || '📍'
	return L.divIcon({
		html: `<div class="marker-icon-wrapper"><div class="marker-icon-inner">${emoji}</div></div>`,
		className: 'custom-marker',
		iconSize: [44, 44],
		iconAnchor: [22, 44],
		popupAnchor: [0, -44],
	})
}

interface MapViewProps {
	organizations: Organization[]
	onSelect: (organization: Organization) => void
	onMarkerClick?: () => void
}

export function MapView({
	organizations,
	onSelect,
	onMarkerClick,
}: MapViewProps) {
	const mapCenter = useMemo(() => {
		if (organizations.length === 0) {
			return { lat: 55.751244, lng: 37.618423, zoom: 4 }
		}

		const latSum = organizations.reduce(
			(acc, org) => acc + org.coordinates[0],
			0
		)
		const lngSum = organizations.reduce(
			(acc, org) => acc + org.coordinates[1],
			0
		)
		const avgLat = latSum / organizations.length
		const avgLng = lngSum / organizations.length

		return { lat: avgLat, lng: avgLng, zoom: 5 }
	}, [organizations])

	return (
		<div className='map-wrapper'>
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
