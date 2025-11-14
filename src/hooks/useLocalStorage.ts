// Хук для работы с localStorage

import { useState, useCallback, useEffect } from 'react'

export function useLocalStorage<T>(
	key: string,
	initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
	// Состояние для хранения значения
	const [storedValue, setStoredValue] = useState<T>(() => {
		if (typeof window === 'undefined') {
			return initialValue
		}
		try {
			const item = window.localStorage.getItem(key)
			return item ? JSON.parse(item) : initialValue
		} catch (error) {
			console.error(`Error reading localStorage key "${key}":`, error)
			return initialValue
		}
	})

	// Функция для обновления значения
	const setValue = useCallback(
		(value: T | ((val: T) => T)) => {
			try {
				// Позволяем value быть функцией, чтобы иметь ту же API, что и useState
				setStoredValue(prevValue => {
					const valueToStore = value instanceof Function ? value(prevValue) : value
					
					if (typeof window !== 'undefined') {
						window.localStorage.setItem(key, JSON.stringify(valueToStore))
					}
					
					return valueToStore
				})
			} catch (error) {
				console.error(`Error setting localStorage key "${key}":`, error)
			}
		},
		[key]
	)

	// Синхронизация с изменениями в других вкладках
	useEffect(() => {
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === key && e.newValue) {
				try {
					setStoredValue(JSON.parse(e.newValue))
				} catch (error) {
					console.error(`Error parsing storage event for key "${key}":`, error)
				}
			}
		}

		window.addEventListener('storage', handleStorageChange)
		return () => window.removeEventListener('storage', handleStorageChange)
	}, [key])

	return [storedValue, setValue]
}

