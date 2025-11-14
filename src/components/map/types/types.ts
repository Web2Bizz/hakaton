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
	coordinates: [number, number]
	address: string
	contacts: {
		phone: string
		email?: string
	}
	website?: string
	socials?: SocialLink[]
	gallery: string[]
}
