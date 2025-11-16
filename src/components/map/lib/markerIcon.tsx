import L from 'leaflet'
import type { QuestProgressColor } from '../types/quest-types'

const typeIcons: Record<string, string> = {
	'Благотворительный фонд': '💝',
	'Местное сообщество и развитие территорий': '🏘️',
	'Социальная защита (помощь людям в трудной ситуации)': '🛡️',
	'Экология и устойчивое развитие': '🌿',
	'Здоровье и спорт': '🏃',
	'Культура и образование': '🎓',
	'Защита животных': '🐾',
	Другое: '📍',
	'Помощь животным': '🐾',
	'Помощь пожилым': '🤝',
	'Помощь детям': '🎈',
	'Поддержка людей с ОВЗ': '🧩',
	Экология: '🌿',
	Спорт: '🏅',
	Культура: '🎭',
	Образование: '📚',
}

const progressColors: Record<QuestProgressColor, string> = {
	red: '#ef4444',
	orange: '#f97316',
	yellow: '#eab308',
	green: '#22c55e',
	victory: '#10b981',
}

export function getMarkerIcon(
	type: string,
	progressColor?: QuestProgressColor
) {
	const emoji = typeIcons[type] || '📍'
	const bgColor = progressColor ? progressColors[progressColor] : '#63a5db'
	const displayEmoji = progressColor === 'victory' ? '🌸' : emoji

	return L.divIcon({
		html: `<div class="relative width-11 height-11 -rotate-45"><div class="w-11 h-11
    rounded-[50%_50%_50%_0]
    border-3 border-white
    shadow-[0_4px_16px_rgba(0,0,0,0.3),0_2px_8px_rgba(0,0,0,0.2)]
    grid place-items-center
    text-lg
    rotate-45
    transition-all duration-200 ease-in-out
    cursor-pointer
    relative
    z-10 hover:rotate-45 hover:scale-115
    hover:shadow-[0_6px_20px_rgba(0,0,0,0.4),0_3px_10px_rgba(0,0,0,0.3)]"
    style="background-color: ${bgColor}">${displayEmoji}</div></div>`,
		className: 'bg-transparent border-none',
		iconSize: [44, 44],
		iconAnchor: [22, 44],
		popupAnchor: [0, -44],
	})
}
