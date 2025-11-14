import { useCallback, useState } from 'react'

export interface GeocodeResult {
	lat: number
	lon: number
	display_name: string
	place_id: number
}

interface NominatimResponse {
	lat: string
	lon: string
	display_name: string
	place_id: number
}

export function useGeocode() {
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const searchAddress = useCallback(
		async (query: string): Promise<GeocodeResult[]> => {
			if (!query || query.trim().length < 3) {
				return []
			}

			setIsLoading(true)
			setError(null)

			try {
				// Используем Nominatim API от OpenStreetMap (бесплатный, не требует API ключа)
				const response = await fetch(
					`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
						query
					)}&limit=5&addressdetails=1&countrycodes=ru`,
					{
						headers: {
							'User-Agent': 'AtomDobro Map App',
						},
					}
				)

				if (!response.ok) {
					throw new Error('Ошибка при поиске адреса')
				}

				const data: NominatimResponse[] = await response.json()

				return data.map(item => ({
					lat: parseFloat(item.lat),
					lon: parseFloat(item.lon),
					display_name: item.display_name,
					place_id: item.place_id,
				}))
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : 'Неизвестная ошибка'
				setError(errorMessage)
				return []
			} finally {
				setIsLoading(false)
			}
		},
		[]
	)

	return { searchAddress, isLoading, error }
}
