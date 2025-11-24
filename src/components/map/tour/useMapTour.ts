import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'map_tour_status'

type TourStatus = 'not_shown' | 'accepted' | 'declined' | 'completed'

export function useMapTour() {
	const [showModal, setShowModal] = useState(false)
	const [runTour, setRunTour] = useState(false)

	useEffect(() => {
		const status = localStorage.getItem(STORAGE_KEY) as TourStatus | null
		// Показываем модальное окно только если тур еще не был показан
		if (!status || status === 'not_shown') {
			// Небольшая задержка перед показом модального окна
			const timer = setTimeout(() => {
				setShowModal(true)
			}, 1000)
			return () => clearTimeout(timer)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const handleAccept = useCallback(() => {
		localStorage.setItem(STORAGE_KEY, 'accepted')
		setShowModal(false)
		setRunTour(true)
	}, [])

	const handleDecline = useCallback(() => {
		localStorage.setItem(STORAGE_KEY, 'declined')
		setShowModal(false)
	}, [])

	const handlePostpone = useCallback(() => {
		// Просто закрываем модальное окно без сохранения статуса
		// чтобы оно могло открыться снова
		setShowModal(false)
	}, [])

	const handleTourComplete = useCallback(() => {
		localStorage.setItem(STORAGE_KEY, 'completed')
		setRunTour(false)
	}, [])

	const handleTourSkip = useCallback(() => {
		localStorage.setItem(STORAGE_KEY, 'completed')
		setRunTour(false)
	}, [])

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
