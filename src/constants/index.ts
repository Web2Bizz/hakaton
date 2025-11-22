// Общие константы приложения

export const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL ||
	'https://it-hackathon-team05.mephi.ru/api/v1'

export const DEFAULT_MAP_CENTER: [number, number] = [55.751244, 37.618423]
export const DEFAULT_MAP_ZOOM = 4
export const SEARCH_MAP_ZOOM = 15

export const ANIMATION_DURATION = 300 // ms

export const NOTIFICATION_MAX_COUNT = 50

export const QUICK_DONATION_AMOUNTS = [200, 500, 1000, 2000, 5000] as const

// Максимальное количество квестов и организаций, которые может создать пользователь
export const MAX_QUESTS_PER_USER = 2
export const MAX_ORGANIZATIONS_PER_USER = 1
