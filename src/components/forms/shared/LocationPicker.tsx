import { loadLeafletStyles } from '@/components/map/lib/loadLeafletStyles'
import { Button } from '@/components/ui/button'
import { useGetCitiesQuery } from '@/store/entities/city'
import { getCityCoordinates } from '@/utils/cityCoordinates'
import L from 'leaflet'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
	MapContainer,
	Marker,
	TileLayer,
	useMap,
	useMapEvents,
} from 'react-leaflet'

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
	readonly initialCoordinates?: [number, number]
	readonly onSelect: (coordinates: [number, number]) => void
	readonly onClose: () => void
}

function MapClickHandler({
	onSelect,
}: {
	onSelect: (coordinates: [number, number]) => void
}) {
	useMapEvents({
		click: e => {
			onSelect([e.latlng.lat, e.latlng.lng])
		},
	})
	return null
}

// Компонент для обновления размера карты в модалке
function MapSizeUpdater() {
	const map = useMap()

	useEffect(() => {
		const fixSize = () => {
			if (map) {
				map.invalidateSize()
			}
		}

		// Несколько попыток с задержками для надежности
		const timeouts = [
			setTimeout(fixSize, 0),
			setTimeout(fixSize, 100),
			setTimeout(fixSize, 300),
		]

		// Обновляем при изменении размера окна
		const handleResize = () => {
			fixSize()
		}
		globalThis.addEventListener('resize', handleResize)

		return () => {
			timeouts.forEach(timeout => clearTimeout(timeout))
			globalThis.removeEventListener('resize', handleResize)
		}
	}, [map])

	return null
}

export function LocationPicker({
	city,
	initialCoordinates,
	onSelect,
	onClose,
}: LocationPickerProps) {
	const { data: cities = [] } = useGetCitiesQuery()
	const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(
		initialCoordinates || null
	)
	const [isMapReady, setIsMapReady] = useState(false)

	// Загружаем стили Leaflet при монтировании компонента
	useEffect(() => {
		loadLeafletStyles()
	}, [])

	// Задержка рендеринга карты до полного открытия модалки
	useEffect(() => {
		const timer = setTimeout(() => {
			setIsMapReady(true)
		}, 150)

		return () => clearTimeout(timer)
	}, [])

	useEffect(() => {
		if (city && !selectedCoords && cities.length > 0) {
			const cityCoords = getCityCoordinates(city, { apiCities: cities })
			if (cityCoords) {
				const timeoutId = setTimeout(() => {
					setSelectedCoords(cityCoords)
				}, 0)
				return () => clearTimeout(timeoutId)
			}
		}
	}, [city, selectedCoords, cities])

	const handleMapClick = (coords: [number, number]) => {
		setSelectedCoords(coords)
	}

	const handleConfirm = () => {
		if (selectedCoords) {
			onSelect(selectedCoords)
			onClose()
		}
	}

	const getMapCenter = (): [number, number] => {
		if (selectedCoords) {
			return selectedCoords
		}
		if (city && cities.length > 0) {
			const cityCoords = getCityCoordinates(city, { apiCities: cities })
			return cityCoords || [55.751244, 37.618423]
		}
		return [55.751244, 37.618423]
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
					{isMapReady ? (
						<MapContainer
							key={`map-${selectedCoords?.[0] || mapCenter[0]}-${
								selectedCoords?.[1] || mapCenter[1]
							}`}
							center={mapCenter}
							zoom={city ? 12 : 4}
							scrollWheelZoom
							style={{ height: '100%', width: '100%' }}
						>
							<MapSizeUpdater />
							<TileLayer
								attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
								url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
							/>
							<MapClickHandler onSelect={handleMapClick} />
							{selectedCoords && (
								<Marker position={selectedCoords} icon={selectedMarkerIcon} />
							)}
						</MapContainer>
					) : (
						<div className='h-full w-full flex items-center justify-center bg-slate-100'>
							<div className='text-slate-500'>Загрузка карты...</div>
						</div>
					)}
				</div>

				<div className='p-4 border-t border-slate-200 flex items-center justify-between'>
					<div className='flex-1'>
						{selectedCoords ? (
							<p className='text-sm text-slate-600'>
								Координаты: {selectedCoords[0].toFixed(6)},{' '}
								{selectedCoords[1].toFixed(6)}
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
