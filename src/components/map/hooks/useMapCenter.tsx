import { useMemo } from 'react'
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/constants'
import type { Organization } from '../types/types'

interface MapCenter {
	lat: number
	lng: number
	zoom: number
}

export function useMapCenter(organizations: Organization[]): MapCenter {
	return useMemo(() => {
		if (organizations.length === 0) {
			return { lat: DEFAULT_MAP_CENTER[0], lng: DEFAULT_MAP_CENTER[1], zoom: DEFAULT_MAP_ZOOM }
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
