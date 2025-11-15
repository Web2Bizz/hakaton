import { Button } from '@/components/ui/button'
import { getCityCoordinates } from '@/utils/cityCoordinates'
import L from 'leaflet'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'

// Иконка для выбранного местоположения
const selectedMarkerIcon = L.divIcon({
	html: `<div style="
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: #3b82f6;
		border: 3px solid white;
		box-shadow: 0 2px 8px rgba(0,0,0,0.3);
	"></div>`,
	className: 'selected-marker',
	iconSize: [24, 24],
	iconAnchor: [12, 12],
	popupAnchor: [0, -12],
})

interface LocationPickerProps {
	readonly city?: string
	readonly initialCoordinates?: { lat: number; lng: number }
	readonly onSelect: (coordinates: { lat: number; lng: number }) => void
	readonly onClose: () => void
}

function MapClickHandler({
	onSelect,
}: {
	onSelect: (coordinates: { lat: number; lng: number }) => void
}) {
	useMapEvents({
		click: e => {
			onSelect({ lat: e.latlng.lat, lng: e.latlng.lng })
		},
	})
	return null
}

export function LocationPicker({
	city,
	initialCoordinates,
	onSelect,
	onClose,
}: LocationPickerProps) {
	const [selectedCoords, setSelectedCoords] = useState<{
		lat: number
		lng: number
	} | null>(initialCoordinates || null)

	// Устанавливаем начальные координаты на основе города
	useEffect(() => {
		if (city && !selectedCoords) {
			const cityCoords = getCityCoordinates(city)
			if (cityCoords) {
				// Используем setTimeout для избежания синхронного setState в эффекте
				const timeoutId = setTimeout(() => {
					setSelectedCoords(cityCoords)
				}, 0)
				return () => clearTimeout(timeoutId)
			}
		}
	}, [city, selectedCoords])

	const handleMapClick = (coords: { lat: number; lng: number }) => {
		setSelectedCoords(coords)
	}

	const handleConfirm = () => {
		if (selectedCoords) {
			onSelect(selectedCoords)
			onClose()
		}
	}

	// Определяем центр карты
	const getMapCenter = (): [number, number] => {
		if (selectedCoords) {
			return [selectedCoords.lat, selectedCoords.lng]
		}
		if (city) {
			const cityCoords = getCityCoordinates(city)
			return cityCoords
				? [cityCoords.lat, cityCoords.lng]
				: [55.751244, 37.618423] // Москва по умолчанию
		}
		return [55.751244, 37.618423] // Москва по умолчанию
	}

	const mapCenter = getMapCenter()

	return (
		<div className='fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4'>
			<div className='bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col'>
				<div className='flex items-center justify-between p-4 border-b border-slate-200'>
					<h2 className='text-xl font-bold text-slate-900'>
						Выберите местоположение на карте
					</h2>
					<button
						type='button'
						onClick={onClose}
						className='p-2 hover:bg-slate-100 rounded-full transition-colors'
					>
						<X className='h-5 w-5 text-slate-600' />
					</button>
				</div>

				<div className='flex-1 relative'>
					<MapContainer
						center={mapCenter}
						zoom={city ? 12 : 4}
						scrollWheelZoom
						style={{ height: '100%', width: '100%' }}
					>
						<TileLayer
							attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
							url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
						/>
						<MapClickHandler onSelect={handleMapClick} />
						{selectedCoords && (
							<Marker
								position={[selectedCoords.lat, selectedCoords.lng]}
								icon={selectedMarkerIcon}
							/>
						)}
					</MapContainer>
				</div>

				<div className='p-4 border-t border-slate-200 flex items-center justify-between'>
					<div className='flex-1'>
						{selectedCoords ? (
							<p className='text-sm text-slate-600'>
								Координаты: {selectedCoords.lat.toFixed(6)},{' '}
								{selectedCoords.lng.toFixed(6)}
							</p>
						) : (
							<p className='text-sm text-slate-500'>
								Кликните на карте, чтобы выбрать местоположение
							</p>
						)}
					</div>
					<div className='flex gap-2'>
						<Button variant='outline' onClick={onClose}>
							Отмена
						</Button>
						<Button onClick={handleConfirm} disabled={!selectedCoords}>
							Подтвердить
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}

