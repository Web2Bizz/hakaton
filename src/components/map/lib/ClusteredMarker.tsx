import L from 'leaflet'
import { useEffect, useRef } from 'react'
import type { MarkerProps } from 'react-leaflet'
import { useMarkerClusterGroup } from './useMarkerClusterGroup'

interface ClusteredMarkerProps extends MarkerProps {
	readonly position: [number, number]
	readonly icon?: L.Icon | L.DivIcon
	readonly children?: React.ReactNode
	readonly eventHandlers?: {
		click?: () => void
		[key: string]: (() => void) | undefined
	}
}

export function ClusteredMarker({
	position,
	icon,
	children,
	eventHandlers,
}: ClusteredMarkerProps) {
	const group = useMarkerClusterGroup()
	const markerRef = useRef<L.Marker | null>(null)
	const popupRef = useRef<L.Popup | null>(null)

	useEffect(() => {
		if (!group) return

		// Создаем маркер
		const marker = L.marker(position, { icon })

		// Добавляем обработчики событий
		if (eventHandlers) {
			for (const [event, handler] of Object.entries(eventHandlers)) {
				if (handler) {
					marker.on(event as keyof L.LeafletEvent, handler)
				}
			}
		}

		// Создаем popup, если есть children
		if (children) {
			const popup = L.popup({
				autoPan: true,
				closeButton: true,
			})

			const container = document.createElement('div')
			container.className = 'popup-content'

			if (typeof children === 'string') {
				container.textContent = children
			} else if (
				typeof children === 'object' &&
				children !== null &&
				'props' in children
			) {
				container.innerHTML = '<div>Popup content</div>'
			}

			popup.setContent(container)
			marker.bindPopup(popup)
			popupRef.current = popup
		}

		markerRef.current = marker
		group.addLayer(marker)

		return () => {
			if (markerRef.current && group) {
				group.removeLayer(markerRef.current)
				markerRef.current = null
			}
		}
	}, [group, position, icon, children, eventHandlers])

	// Обновляем popup при изменении children
	useEffect(() => {
		if (!markerRef.current || !children) return

		const container = document.createElement('div')
		container.className = 'popup-content'

		if (typeof children === 'string') {
			container.textContent = children
		} else {
			container.innerHTML = '<div>Popup content</div>'
		}

		if (popupRef.current) {
			popupRef.current.setContent(container)
		} else if (markerRef.current) {
			const popup = L.popup().setContent(container)
			markerRef.current.bindPopup(popup)
			popupRef.current = popup
		}
	}, [children])

	return null
}
