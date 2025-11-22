// Типы для работы с городами через API

export interface CityResponse {
	id: number
	name: string
	latitude: string
	longitude: string
	regionId: number
	region: {
		id: number
		name: string
	}
	createdAt: string
	updatedAt: string
}
