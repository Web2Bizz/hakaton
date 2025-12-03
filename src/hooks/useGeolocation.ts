import { logger } from '@/utils/logger'
import { useCallback, useEffect, useRef, useState } from 'react'

interface GeolocationPosition {
	latitude: number
	longitude: number
	accuracy?: number
}

interface UseGeolocationOptions {
	enableHighAccuracy?: boolean
	timeout?: number
	maximumAge?: number
	watch?: boolean // Если true, отслеживает изменения позиции
	minAccuracy?: number // Минимальная требуемая точность в метрах (по умолчанию 50)
	maxRetries?: number // Максимальное количество попыток для получения точной позиции
}

interface UseGeolocationReturn {
	position: GeolocationPosition | null
	error: GeolocationPositionError | null
	isLoading: boolean
	getCurrentPosition: () => void
	clearWatch: () => void
}

interface GeolocationPositionError {
	code: number
	message: string
}

/**
 * Хук для получения геолокации пользователя
 *
 * @example
 * ```tsx
 * const { position, error, isLoading, getCurrentPosition } = useGeolocation()
 *
 * useEffect(() => {
 *   getCurrentPosition()
 * }, [])
 *
 * if (isLoading) return <div>Получение местоположения...</div>
 * if (error) return <div>Ошибка: {error.message}</div>
 * if (position) {
 *   console.log(`Широта: ${position.latitude}, Долгота: ${position.longitude}`)
 * }
 * ```
 */
export function useGeolocation(
	options: UseGeolocationOptions = {}
): UseGeolocationReturn {
	const {
		enableHighAccuracy = true,
		timeout = 20000, // Увеличено до 20 секунд для получения более точных данных
		maximumAge = 0, // Используем только свежие данные
		watch = false,
		minAccuracy = 50, // Минимальная требуемая точность в метрах
		maxRetries = 3, // Максимальное количество попыток
	} = options

	const [position, setPosition] = useState<GeolocationPosition | null>(null)
	const [error, setError] = useState<GeolocationPositionError | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const watchIdRef = useRef<number | null>(null)
	const retryCountRef = useRef<number>(0)

	// Проверка поддержки геолокации в браузере
	const isGeolocationSupported = useCallback(() => {
		return 'geolocation' in navigator && navigator.geolocation !== undefined
	}, [])

	// Обработчик успешного получения позиции
	const handleSuccess = useCallback(
		(pos: GeolocationPosition, retryCallback?: () => void) => {
			// Если accuracy не указан (undefined), не делаем retry, так как точность неизвестна
			if (pos.accuracy === undefined) {
				setPosition({
					latitude: pos.latitude,
					longitude: pos.longitude,
					accuracy: pos.accuracy,
				})
				setError(null)
				setIsLoading(false)
				retryCountRef.current = 0
				return
			}

			const accuracy = pos.accuracy

			// Если точность недостаточна и есть попытки, повторяем запрос
			if (
				accuracy > minAccuracy &&
				retryCountRef.current < maxRetries &&
				retryCallback
			) {
				retryCountRef.current += 1
				logger.debug(
					`Geolocation accuracy ${accuracy.toFixed(
						0
					)}m is too low, retrying... (attempt ${
						retryCountRef.current
					}/${maxRetries})`
				)
				// Небольшая задержка перед повторной попыткой
				setTimeout(() => {
					retryCallback()
				}, 1000)
				return
			}

			// Сбрасываем счетчик попыток при успехе
			retryCountRef.current = 0

			setPosition({
				latitude: pos.latitude,
				longitude: pos.longitude,
				accuracy: pos.accuracy,
			})
			setError(null)
			setIsLoading(false)
			logger.debug('Geolocation success:', {
				latitude: pos.latitude,
				longitude: pos.longitude,
				accuracy: `${accuracy.toFixed(0)}m`,
			})
		},
		[minAccuracy, maxRetries]
	)

	// Обработчик ошибки получения позиции
	const handleError = useCallback((err: GeolocationPositionError) => {
		// Коды ошибок геолокации
		const PERMISSION_DENIED = 1
		const POSITION_UNAVAILABLE = 2
		const TIMEOUT = 3

		let errorMessage: string
		switch (err.code) {
			case PERMISSION_DENIED:
				errorMessage =
					'Доступ к геолокации запрещен. Разрешите доступ в настройках браузера.'
				break
			case POSITION_UNAVAILABLE:
				errorMessage = 'Информация о местоположении недоступна.'
				break
			case TIMEOUT:
				errorMessage = 'Превышено время ожидания получения местоположения.'
				break
			default:
				errorMessage = `Неизвестная ошибка: ${err.message}`
				break
		}

		setError({
			code: err.code,
			message: errorMessage,
		})
		setPosition(null)
		setIsLoading(false)
		logger.error('Geolocation error:', err)
	}, [])

	// Получение текущей позиции
	const getCurrentPosition = useCallback(() => {
		if (!isGeolocationSupported()) {
			setError({
				code: -1,
				message: 'Геолокация не поддерживается в этом браузере',
			})
			return
		}

		// Сбрасываем счетчик попыток при новом запросе
		retryCountRef.current = 0

		const requestPosition = () => {
			setIsLoading(true)
			setError(null)

			navigator.geolocation.getCurrentPosition(
				pos => {
					handleSuccess(
						{
							latitude: pos.coords.latitude,
							longitude: pos.coords.longitude,
							accuracy: pos.coords.accuracy,
						},
						requestPosition // Передаем функцию для повторной попытки
					)
				},
				err => {
					// Если это последняя попытка или ошибка не связана с точностью, показываем ошибку
					if (retryCountRef.current >= maxRetries || err.code !== 0) {
						retryCountRef.current = 0
						handleError({
							code: err.code,
							message: err.message,
						})
					} else {
						// Повторяем попытку при ошибке
						retryCountRef.current += 1
						setTimeout(() => {
							requestPosition()
						}, 1000)
					}
				},
				{
					enableHighAccuracy: true, // Всегда используем высокую точность
					timeout,
					maximumAge: 0, // Всегда запрашиваем свежие данные
				}
			)
		}

		requestPosition()
	}, [timeout, handleSuccess, handleError, isGeolocationSupported, maxRetries])

	// Отслеживание изменений позиции (watch)
	useEffect(() => {
		if (!watch || !isGeolocationSupported()) {
			return
		}

		const id = navigator.geolocation.watchPosition(
			pos => {
				handleSuccess({
					latitude: pos.coords.latitude,
					longitude: pos.coords.longitude,
					accuracy: pos.coords.accuracy,
				})
			},
			err => {
				handleError({
					code: err.code,
					message: err.message,
				})
			},
			{
				enableHighAccuracy: true, // Всегда используем высокую точность
				timeout,
				maximumAge: 0, // Всегда запрашиваем свежие данные
			}
		)

		watchIdRef.current = id

		return () => {
			if (id !== null) {
				navigator.geolocation.clearWatch(id)
				watchIdRef.current = null
			}
		}
	}, [
		watch,
		enableHighAccuracy,
		timeout,
		maximumAge,
		handleSuccess,
		handleError,
		isGeolocationSupported,
	])

	// Очистка отслеживания
	const clearWatch = useCallback(() => {
		if (watchIdRef.current !== null) {
			navigator.geolocation.clearWatch(watchIdRef.current)
			watchIdRef.current = null
			setIsLoading(false)
		}
	}, [])

	return {
		position,
		error,
		isLoading,
		getCurrentPosition,
		clearWatch,
	}
}
