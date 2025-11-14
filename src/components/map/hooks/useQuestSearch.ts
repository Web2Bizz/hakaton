import { useMemo } from 'react'
import type { Quest } from '../types/quest-types'

export function useQuestSearch(quests: Quest[]) {
	return useMemo(() => {
		return (query: string): Quest[] => {
			if (!query.trim()) {
				return []
			}

			const queryLower = query.toLowerCase().trim()

			return quests.filter(quest => {
				const matchesTitle = quest.title.toLowerCase().includes(queryLower)
				const matchesStory = quest.story.toLowerCase().includes(queryLower)
				const matchesCity = quest.city.toLowerCase().includes(queryLower)
				const matchesType = quest.type.toLowerCase().includes(queryLower)
				const matchesAddress = quest.address.toLowerCase().includes(queryLower)

				return (
					matchesTitle || matchesStory || matchesCity || matchesType || matchesAddress
				)
			})
		}
	}, [quests])
}

