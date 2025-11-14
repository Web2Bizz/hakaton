import type { AssistanceTypeId, SocialLink, Coordinates, ContactInfo } from '@/types/common'

export interface Organization {
	id: string
	name: string
	city: string
	type: string
	assistance: AssistanceTypeId[]
	summary: string
	description: string
	mission: string
	goals: string[]
	needs: string[]
	coordinates: Coordinates
	address: string
	contacts: ContactInfo
	website?: string
	socials?: SocialLink[]
	gallery: string[]
}

// Re-export для обратной совместимости
export type { AssistanceTypeId, SocialLink }
