import type { AssistanceTypeId } from '@/types/common'

export interface FiltersState {
	readonly city: string
	readonly type: string
	readonly assistance: AssistanceFilters
	readonly search: string
}

export type AssistanceFilters = Record<AssistanceTypeId, boolean>
