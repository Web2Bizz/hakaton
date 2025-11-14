import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

interface MapControllerProps {
	readonly center: [number, number]
	readonly zoom?: number
}

export function MapController({ center, zoom }: MapControllerProps) {
	const map = useMap()

	useEffect(() => {
		if (center) {
			map.setView(center, zoom || map.getZoom())
		}
	}, [center, zoom, map])

	return null
}
