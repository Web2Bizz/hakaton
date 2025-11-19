import L from 'leaflet'
import 'leaflet.markercluster'
import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'

interface MarkerClusterGroupProps {
	readonly options?: L.MarkerClusterGroupOptions
}

// Функция для определения размера кластера
function getClusterSize(count: number): {
	size: number
	fontSize: string
} {
	if (count > 100) {
		return { size: 50, fontSize: '16px' }
	}
	if (count > 10) {
		return { size: 40, fontSize: '14px' }
	}
	return { size: 30, fontSize: '12px' }
}

export function MarkerClusterGroup({ options }: MarkerClusterGroupProps) {
	const map = useMap()
	const groupRef = useRef<L.MarkerClusterGroup | null>(null)

	useEffect(() => {
		// Создаем группу кластеров
		const group = L.markerClusterGroup({
			chunkedLoading: true,
			chunkInterval: 200,
			chunkDelay: 50,
			spiderfyOnMaxZoom: true,
			showCoverageOnHover: false,
			zoomToBoundsOnClick: true,
			maxClusterRadius: 80,
			iconCreateFunction: (cluster: L.MarkerCluster) => {
				const count = cluster.getChildCount()
				const { size, fontSize } = getClusterSize(count)

				return L.divIcon({
					html: `<div style="
						background-color: #3b82f6;
						color: white;
						border-radius: 50%;
						width: ${size}px;
						height: ${size}px;
						display: flex;
						align-items: center;
						justify-content: center;
						font-weight: bold;
						font-size: ${fontSize};
						border: 3px solid white;
						box-shadow: 0 2px 8px rgba(0,0,0,0.3);
					">${count}</div>`,
					className: 'marker-cluster',
					iconSize: L.point(size, size),
				})
			},
			...options,
		})

		groupRef.current = group
		map.addLayer(group)

		// Сохраняем группу в globalThis для доступа из других компонентов
		;(
			globalThis as { __markerClusterGroup?: L.MarkerClusterGroup }
		).__markerClusterGroup = group

		return () => {
			if (groupRef.current) {
				map.removeLayer(groupRef.current)
				groupRef.current.clearLayers()
			}
			delete (globalThis as { __markerClusterGroup?: L.MarkerClusterGroup })
				.__markerClusterGroup
		}
	}, [map, options])

	return null
}
