import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useLazyGetUserQuery } from '@/store/entities'
import type { User } from '@/types/user'
import { getToken, transformUserFromAPI } from '@/utils/auth'
import { getLevelTitle, normalizeUserLevel } from '@/utils/level'
import { logger } from '@/utils/logger'
import type { ReactNode } from 'react'
import { createContext, useEffect, useMemo, useRef } from 'react'

interface UserContextType {
	user: User | null
	setUser: (user: User | null | ((prev: User | null) => User | null)) => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: Readonly<{ children: ReactNode }>) {
	const [user, setUser] = useLocalStorage<User | null>('ecoquest_user', null)
	const [getUser] = useLazyGetUserQuery()
	const hasFetchedRef = useRef(false) // Флаг, чтобы не делать повторные запросы

	// При загрузке приложения проверяем наличие токенов
	// Если токенов нет, но пользователь есть в localStorage - очищаем пользователя
	// Если токен есть и пользователь есть - загружаем актуальные данные с сервера
	useEffect(() => {
		const token = getToken()
		
		if (!token && user) {
			// Токенов нет, но пользователь есть - это невалидное состояние
			// Очищаем пользователя, чтобы приложение перенаправило на страницу входа
			setUser(null)
			return
		}

		// Если есть токен и пользователь, загружаем актуальные данные с сервера
		// Показываем данные из localStorage сразу, а потом обновим когда придут с сервера
		if (token && user?.id && !hasFetchedRef.current) {
			hasFetchedRef.current = true
			
			// Загружаем данные асинхронно, не блокируя рендер
			getUser(user.id)
				.then(result => {
					if (result.data) {
						try {
							const transformedUser = transformUserFromAPI(result.data)
							setUser(transformedUser)
							logger.debug('User data updated from API:', transformedUser)
						} catch (error) {
							logger.error('Error transforming user data:', error)
						}
					} else if (result.error) {
						// Если ошибка 401 - токен невалидный, очищаем пользователя
						const errorStatus = 'status' in result.error ? result.error.status : 
							('data' in result.error && result.error.data && typeof result.error.data === 'object' && 'statusCode' in result.error.data) 
								? result.error.data.statusCode 
								: null
						
						if (errorStatus === 401) {
							logger.warn('Token invalid, clearing user')
							setUser(null)
						} else {
							logger.warn('Failed to fetch user data, using cached data:', result.error)
						}
					}
				})
				.catch(error => {
					logger.error('Error fetching user data:', error)
					// В случае ошибки продолжаем использовать данные из localStorage
				})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []) // Запускаем только при монтировании

	// Нормализуем уровень пользователя при загрузке и обновлении данных
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
	}, [user?.id, user?.level?.level, user?.level?.experience]) // Обновляем при изменении пользователя или его уровня

	const value = useMemo(
		() => ({
			user,
			setUser,
		}),
		[user, setUser]
	)

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
