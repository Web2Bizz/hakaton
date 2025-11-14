// Общие типы для всего приложения

export type AssistanceTypeId =
	| 'volunteers'
	| 'donations'
	| 'things'
	| 'mentors'
	| 'blood'
	| 'experts'

export type SocialLink = {
	name: 'VK' | 'Telegram' | 'Website'
	url: string
}

export type Coordinates = [number, number]

export interface ContactInfo {
	phone: string
	email?: string
}

export interface BaseEntity {
	id: string
	name: string
	city: string
	type: string
	coordinates: Coordinates
	address: string
	contacts: ContactInfo
	socials?: SocialLink[]
}

