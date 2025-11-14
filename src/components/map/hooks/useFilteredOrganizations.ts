import { useMemo } from 'react'
import type { Organization } from '../types/types'
import type { FiltersState } from '../ui/actions/types'

export function useFilteredOrganizations(
	organizations: Organization[],
	filters: FiltersState
): Organization[] {
	return useMemo(() => {
		return organizations.filter(org => {
			// Фильтр по городу
			if (filters.city && org.city !== filters.city) {
				return false
			}

			// Фильтр по типу
			if (filters.type && org.type !== filters.type) {
				return false
			}

			// Фильтр по поисковому запросу
			if (filters.search) {
				const searchLower = filters.search.toLowerCase()
				const searchableText = [
					org.name,
					org.city,
					org.type,
					org.summary,
					org.description,
					org.address,
				]
					.join(' ')
					.toLowerCase()

				if (!searchableText.includes(searchLower)) {
					return false
				}
			}

			// Фильтр по виду помощи
			const selectedAssistance = Object.entries(filters.assistance)
				.filter(([, isSelected]) => isSelected)
				.map(([id]) => id)

			if (selectedAssistance.length > 0) {
				const hasMatchingAssistance = selectedAssistance.some(id =>
					org.assistance.includes(id as typeof org.assistance[number])
				)
				if (!hasMatchingAssistance) {
					return false
				}
			}

			return true
		})
	}, [organizations, filters])
}

