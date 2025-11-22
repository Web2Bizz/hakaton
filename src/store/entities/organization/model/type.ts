// Типы для работы с организациями через API

import type { Contact, Organization } from '@/components/map/types/types'

// Re-export типов для удобства использования
export type {
	City,
	Contact,
	HelpType,
	Organization,
	OrganizationType,
} from '@/components/map/types/types'

// Типы для запросов
export interface CreateOrganizationRequest {
	name: string
	latitude: number
	longitude: number
	summary: string
	mission: string
	description: string
	goals: string[]
	needs: string[]
	address: string
	contacts: Contact[]
	typeId: number
	helpTypeIds: number[]
	cityId: number
	gallery?: string[]
}

export interface UpdateOrganizationRequest {
	name?: string
	latitude?: number
	longitude?: number
	summary?: string
	mission?: string
	description?: string
	goals?: string[]
	needs?: string[]
	address?: string
	contacts?: Contact[]
	typeId?: number
	helpTypeIds?: number[]
	cityId?: number
	gallery?: string[]
}

// Типы для ответов API
export interface OrganizationsListResponse {
	data: {
		organizations: Organization[]
		pagination?: {
			page: number
			limit: number
			total: number
			totalPages: number
		}
	}
}

export interface OrganizationResponse {
	data: {
		organization: Organization
	}
}

export interface CreateOrganizationResponse {
	data: {
		organization: Organization
		message: string
	}
}

export interface UpdateOrganizationResponse {
	data: {
		organization: Organization
		message: string
	}
}

export interface DeleteOrganizationResponse {
	message: string
}
