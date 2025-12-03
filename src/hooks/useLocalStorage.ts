import { logger } from '@/utils/logger'
import { useState, useCallback, useEffect } from 'react'

export function useLocalStorage<T>(
	key: string,
	initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
	const [storedValue, setStoredValue] = useState<T>(() => {
		if (typeof window === 'undefined') {
			return initialValue
		}
		try {
			const item = window.localStorage.getItem(key)
			return item ? JSON.parse(item) : initialValue
		} catch (error) {
			logger.error(`Error reading localStorage key "${key}":`, error)
			return initialValue
		}
	})

	const setValue = useCallback(
		(value: T | ((val: T) => T)) => {
			try {
				// Позволяем value быть функцией, чтобы иметь ту же API, что и useState
				setStoredValue(prevValue => {
					const valueToStore = value instanceof Function ? value(prevValue) : value
					
					if (typeof window !== 'undefined') {
						// JSON.stringify(undefined) возвращает undefined, а не строку
						// localStorage.setItem требует строку, поэтому обрабатываем undefined отдельно
						if (valueToStore === undefined) {
							window.localStorage.removeItem(key)
						} else {
							window.localStorage.setItem(key, JSON.stringify(valueToStore))
						}
					}
					
					return valueToStore
				})
			} catch (error) {
				logger.error(`Error setting localStorage key "${key}":`, error)
			}
		},
		[key]
	)

	useEffect(() => {
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === key && e.newValue) {
				try {
					setStoredValue(JSON.parse(e.newValue))
				} catch (error) {
					logger.error(`Error parsing storage event for key "${key}":`, error)
				}
			}
		}

		window.addEventListener('storage', handleStorageChange)
		return () => window.removeEventListener('storage', handleStorageChange)
	}, [key])

	return [storedValue, setValue]
}

