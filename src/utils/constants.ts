// Вспомогательные константы для утилит

export const ASSISTANCE_LABELS_MAP = ASSISTANCE_OPTIONS.reduce<Record<string, string>>(
	(acc, option) => {
		acc[option.id] = option.label
		return acc
	},
	{}
)

