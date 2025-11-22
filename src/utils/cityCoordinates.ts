import type { Quest } from '@/components/map/types/quest-types'
import type { Organization } from '@/components/map/types/types'
import type { CityResponse } from '@/store/entities/city'

export function getCityCoordinates(
	cityName: string,
	options?: {
		apiQuests?: Quest[]
		apiCities?: CityResponse[]
	}
): [number, number] | null {
	if (options?.apiQuests) {
		const quest = options.apiQuests.find(q => q.city === cityName)
		if (quest) {
			return quest.coordinates
		}
	}

	if (options?.apiCities) {
		const city = options.apiCities.find(c => c.name === cityName)
		if (city) {
			return [
				Number.parseFloat(city.latitude),
				Number.parseFloat(city.longitude),
			]
		}
	}

	return null
}

export function getOrganizationCoordinates(
	organization: Organization | { latitude: string; longitude: string }
): [number, number] {
	return [
		Number.parseFloat(organization.latitude),
		Number.parseFloat(organization.longitude),
	]
}
