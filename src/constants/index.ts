// Общие константы приложения

import type { AssistanceTypeId } from '@/types/common'

export const ASSISTANCE_OPTIONS: { id: AssistanceTypeId; label: string }[] = [
	{ id: 'volunteers', label: 'Требуются волонтеры' },
	{ id: 'donations', label: 'Нужны финансовые пожертвования' },
	{ id: 'things', label: 'Принимают вещи' },
	{ id: 'mentors', label: 'Требуются наставники' },
	{ id: 'blood', label: 'Нужны доноры' },
	{ id: 'experts', label: 'Требуются эксперты' },
]

export const DEFAULT_MAP_CENTER: [number, number] = [55.751244, 37.618423]
export const DEFAULT_MAP_ZOOM = 4
export const SEARCH_MAP_ZOOM = 15

export const ANIMATION_DURATION = 300 // ms

export const NOTIFICATION_MAX_COUNT = 50

export const QUICK_DONATION_AMOUNTS = [200, 500, 1000, 2000, 5000] as const

