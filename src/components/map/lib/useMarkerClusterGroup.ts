import L from 'leaflet'

// Хук для получения группы кластеров
export function useMarkerClusterGroup(): L.MarkerClusterGroup | null {
	return (
		(globalThis as { __markerClusterGroup?: L.MarkerClusterGroup })
			.__markerClusterGroup || null
	)
}

