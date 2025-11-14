import { useMemo } from 'react'
import type { Quest } from '../types/quest-types'
import type { FiltersState } from '../ui/actions/types'

export function useFilteredQuests(
	quests: Quest[],
	filters: FiltersState
): Quest[] {
	return useMemo(() => {
		return quests.filter(quest => {
			// Фильтр по городу
			if (filters.city && quest.city !== filters.city) {
				return false
			}

			// Фильтр по типу
			if (filters.type && quest.type !== filters.type) {
				return false
			}

			// Фильтр по поисковому запросу
			if (filters.search) {
				const searchLower = filters.search.toLowerCase()
				const matchesSearch =
					quest.title.toLowerCase().includes(searchLower) ||
					quest.story.toLowerCase().includes(searchLower) ||
					quest.city.toLowerCase().includes(searchLower) ||
					quest.type.toLowerCase().includes(searchLower)

				if (!matchesSearch) {
					return false
				}
			}

			// Фильтр по помощи (для квестов это не применимо напрямую, но оставляем для совместимости)
			// Можно добавить фильтр по категории квеста в будущем

			return true
		})
	}, [quests, filters])
}

