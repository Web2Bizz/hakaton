import { quests } from '@/components/map/data/quests'
import { organizations } from '@/components/map/data/organizations'

/**
 * Получает координаты города из данных квестов и организаций
 */
export function getCityCoordinates(cityName: string): { lat: number; lng: number } | null {
	// Ищем в квестах
	const quest = quests.find(q => q.city === cityName)
	if (quest) {
		return { lat: quest.coordinates[0], lng: quest.coordinates[1] }
	}

	// Ищем в организациях
	const org = organizations.find(o => o.city === cityName)
	if (org) {
		return { lat: org.coordinates[0], lng: org.coordinates[1] }
	}

	return null
}

/**
 * Получает все города с их координатами
 */
export function getAllCityCoordinates(): Record<string, { lat: number; lng: number }> {
	const coords: Record<string, { lat: number; lng: number }> = {}

	// Добавляем города из квестов
	quests.forEach(quest => {
		if (!coords[quest.city]) {
			coords[quest.city] = {
				lat: quest.coordinates[0],
				lng: quest.coordinates[1],
			}
		}
	})

	// Добавляем города из организаций (если их еще нет)
	organizations.forEach(org => {
		if (!coords[org.city]) {
			coords[org.city] = {
				lat: org.coordinates[0],
				lng: org.coordinates[1],
			}
		}
	})

	return coords
}

