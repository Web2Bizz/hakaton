import { useMemo } from 'react'
import type { Organization } from '../types/types'

interface MapCenter {
	lat: number
	lng: number
	zoom: number
}

export function useMapCenter(organizations: Organization[]): MapCenter {
	return useMemo(() => {
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
}
