// Вспомогательные константы для утилит

import { ASSISTANCE_OPTIONS } from '@/constants'

export const ASSISTANCE_LABELS_MAP = ASSISTANCE_OPTIONS.reduce<Record<string, string>>(
	(acc: Record<string, string>, option: { id: string; label: string }) => {
		acc[option.id] = option.label
		return acc
	},
	{}
)

