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
			if (filters.city && org.city.name !== filters.city) {
				return false
			}

			// Фильтр по типу
			// Проверяем как organizationTypes, так и type (для совместимости)
			if (filters.type) {
				const orgTypeName = 
					org.organizationTypes?.[0]?.name ||
					(org as Organization & { type?: { name: string } }).type?.name ||
					''
				
				if (orgTypeName !== filters.type) {
					return false
				}
			}

			// Фильтр по поисковому запросу
			if (filters.search) {
				const searchLower = filters.search.toLowerCase()
				const orgTypeName = 
					org.organizationTypes?.[0]?.name ||
					(org as Organization & { type?: { name: string } }).type?.name ||
					''
				
				const searchableText = [
					org.name,
					org.city.name,
					orgTypeName,
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
				// Маппинг старых ID помощи на новые helpTypes
				const helpTypeMap: Record<string, string> = {
					volunteers: 'Требуются волонтеры',
					donations: 'Нужны финансовые пожертвования',
					things: 'Принимают вещи',
					mentors: 'Требуются наставники',
					blood: 'Нужны доноры',
					experts: 'Требуются эксперты',
				}

				const hasMatchingAssistance = selectedAssistance.some(id => {
					const helpTypeName = helpTypeMap[id]
					return org.helpTypes.some(ht => ht.name === helpTypeName)
				})

				if (!hasMatchingAssistance) {
					return false
				}
			}

			return true
		})
	}, [organizations, filters])
}

