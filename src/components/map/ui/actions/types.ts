export interface FiltersState {
	readonly city: string
	readonly type: string
	readonly assistance: AssistanceFilters
	readonly search: string
}

// Теперь assistance использует названия helpTypes как ключи
export type AssistanceFilters = Record<string, boolean>
