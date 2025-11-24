import { useCallback, useEffect, useState } from 'react'

type TourStatus = 'not_shown' | 'accepted' | 'declined' | 'completed'

interface UseTourOptions {
	readonly storageKey: string
	readonly showDelay?: number
}

export function useTour({ storageKey, showDelay = 1000 }: UseTourOptions) {
	const [showModal, setShowModal] = useState(false)
	const [runTour, setRunTour] = useState(false)

	useEffect(() => {
		const status = localStorage.getItem(storageKey) as TourStatus | null
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
		localStorage.setItem(storageKey, 'accepted')
		setShowModal(false)
		setRunTour(true)
	}, [storageKey])

	const handleDecline = useCallback(() => {
		localStorage.setItem(storageKey, 'declined')
		setShowModal(false)
	}, [storageKey])

	const handlePostpone = useCallback(() => {
		// Просто закрываем модальное окно без сохранения статуса
		// чтобы оно могло открыться снова
		setShowModal(false)
	}, [])

	const handleTourComplete = useCallback(() => {
		localStorage.setItem(storageKey, 'completed')
		setRunTour(false)
	}, [storageKey])

	const handleTourSkip = useCallback(() => {
		localStorage.setItem(storageKey, 'completed')
		setRunTour(false)
	}, [storageKey])

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

