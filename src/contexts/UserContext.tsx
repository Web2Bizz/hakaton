import { useLocalStorage } from '@/hooks/useLocalStorage'
import type { User } from '@/types/user'
import { normalizeUserLevel, getLevelTitle } from '@/utils/level'
import type { ReactNode } from 'react'
import { createContext, useEffect, useMemo } from 'react'

interface UserContextType {
	user: User | null
	setUser: (user: User | null) => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: Readonly<{ children: ReactNode }>) {
	const [user, setUser] = useLocalStorage<User | null>('ecoquest_user', null)

	// Нормализуем уровень пользователя при загрузке
	useEffect(() => {
		if (user && user.level) {
			const normalized = normalizeUserLevel(
				user.level.level,
				user.level.experience,
				user.level.experienceToNext
			)

			// Если уровень изменился, обновляем пользователя
			if (
				normalized.level !== user.level.level ||
				normalized.experience !== user.level.experience ||
				normalized.experienceToNext !== user.level.experienceToNext
			) {
				setUser({
					...user,
					level: {
						...user.level,
						level: normalized.level,
						experience: normalized.experience,
						experienceToNext: normalized.experienceToNext,
						title: getLevelTitle(normalized.level),
					},
				})
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []) // Запускаем только при монтировании

	const value = useMemo(
		() => ({
			user,
			setUser,
		}),
		[user, setUser]
	)

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
