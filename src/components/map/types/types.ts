// Новые типы для организации согласно API

export interface City {
	id: number
	name: string
	latitude: string
	longitude: string
}

export interface OrganizationType {
	id: number
	name: string
}

export interface HelpType {
	id: number
	name: string
}

export interface Contact {
	name: string
	value: string
}

export interface Organization {
	id: number | string
	name: string
	latitude: string
	longitude: string
	summary: string
	mission: string
	description: string
	goals: string[]
	needs: string[]
	address: string
	contacts: Contact[]
	organizationTypes: OrganizationType[]
	gallery: string[]
	createdAt?: string
	updatedAt?: string
	city: City
	helpTypes: HelpType[]
	isApproved?: boolean
}

// Re-export для обратной совместимости (старые типы)
export type { SocialLink } from '@/types/common'
