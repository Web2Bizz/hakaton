import L from 'leaflet'

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

export function getMarkerIcon(type: string) {
	const emoji = typeIcons[type] || '📍'
	return L.divIcon({
		html: `<div class="marker-icon-wrapper"><div class="marker-icon-inner">${emoji}</div></div>`,
		className: 'custom-marker',
		iconSize: [44, 44],
		iconAnchor: [22, 44],
		popupAnchor: [0, -44],
	})
}

