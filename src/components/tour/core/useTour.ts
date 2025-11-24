import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'tour_status'

type TourStatus = 'not_shown' | 'accepted' | 'declined' | 'completed'

interface TourStatusMap {
	[key: string]: TourStatus
}

interface UseTourOptions {
	readonly pageKey: string
	readonly showDelay?: number
}

function getTourStatuses(): TourStatusMap {
	try {
		const data = localStorage.getItem(STORAGE_KEY)
		return data ? JSON.parse(data) : {}
	} catch {
		return {}
	}
}

function setTourStatus(pageKey: string, status: TourStatus): void {
	const statuses = getTourStatuses()
	statuses[pageKey] = status
	localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses))
}

function getTourStatus(pageKey: string): TourStatus | null {
	const statuses = getTourStatuses()
	return statuses[pageKey] || null
}

export function useTour({ pageKey, showDelay = 1000 }: UseTourOptions) {
	const [showModal, setShowModal] = useState(false)
	const [runTour, setRunTour] = useState(false)

	useEffect(() => {
		const status = getTourStatus(pageKey)
		// Показываем модальное окно только если тур еще не был показан
		if (!status || status === 'not_shown') {
			// Небольшая задержка перед показом модального окна
			const timer = setTimeout(() => {
				setShowModal(true)
			}, showDelay)
			return () => clearTimeout(timer)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const handleAccept = useCallback(() => {
		setTourStatus(pageKey, 'accepted')
		setShowModal(false)
		setRunTour(true)
	}, [pageKey])

	const handleDecline = useCallback(() => {
		setTourStatus(pageKey, 'declined')
		setShowModal(false)
	}, [pageKey])

	const handlePostpone = useCallback(() => {
		// Просто закрываем модальное окно без сохранения статуса
		// чтобы оно могло открыться снова
		setShowModal(false)
	}, [])

	const handleTourComplete = useCallback(() => {
		setTourStatus(pageKey, 'completed')
		setRunTour(false)
		// Восстанавливаем скролл с небольшой задержкой, чтобы Joyride успел завершиться
		setTimeout(() => {
			// Принудительно удаляем overflow и padding-right
			document.body.style.removeProperty('overflow')
			document.body.style.removeProperty('padding-right')
			// Явно устанавливаем auto для гарантии
			document.body.style.overflow = 'auto'
			// Также проверяем html элемент
			document.documentElement.style.removeProperty('overflow')
			document.documentElement.style.overflow = 'auto'
			// Удаляем overlay от Joyride, если он остался
			const overlays = document.querySelectorAll(
				'[data-joyride-overlay], .react-joyride__overlay'
			)
			for (const overlay of overlays) {
				overlay.remove()
			}
		}, 150)
	}, [pageKey])

	const handleTourSkip = useCallback(() => {
		setTourStatus(pageKey, 'completed')
		setRunTour(false)
		// Восстанавливаем скролл с небольшой задержкой, чтобы Joyride успел завершиться
		setTimeout(() => {
			// Принудительно удаляем overflow и padding-right
			document.body.style.removeProperty('overflow')
			document.body.style.removeProperty('padding-right')
			// Явно устанавливаем auto для гарантии
			document.body.style.overflow = 'auto'
			// Также проверяем html элемент
			document.documentElement.style.removeProperty('overflow')
			document.documentElement.style.overflow = 'auto'
			// Удаляем overlay от Joyride, если он остался
			const overlays = document.querySelectorAll(
				'[data-joyride-overlay], .react-joyride__overlay'
			)
			for (const overlay of overlays) {
				overlay.remove()
			}
		}, 150)
	}, [pageKey])

	return {
		showModal,
		runTour,
		handleAccept,
		handleDecline,
		handlePostpone,
		handleTourComplete,
		handleTourSkip,
	}
}

