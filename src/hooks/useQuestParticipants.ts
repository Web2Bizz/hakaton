import { useGetQuestUsersQuery } from '@/store/entities/quest'
import { useMemo } from 'react'

/**
 * Хук для получения списка участников квеста
 */
export function useQuestParticipants(questId: number | string) {
	const { data: participantsResponse, isLoading } = useGetQuestUsersQuery(
		questId,
		{
			skip: !questId,
		}
	)

	const participants = useMemo(() => {
		if (!participantsResponse?.data) return []

		return participantsResponse.data.map(participant => ({
			id: String(participant.id),
			name: `${participant.firstName} ${participant.lastName}${
				participant.middleName ? ` ${participant.middleName}` : ''
			}`.trim(),
			email: '', // Email не приходит с API
			firstName: participant.firstName,
			lastName: participant.lastName,
			middleName: participant.middleName,
		}))
	}, [participantsResponse])

	return {
		participants,
		isLoading,
	}
}
