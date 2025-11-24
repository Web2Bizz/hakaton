import { useEffect } from 'react'
import { MapTour } from './MapTour'
import { TourModal } from './TourModal'
import { useMapTour } from './useMapTour'

export function MapTourProvider() {
	const {
		showModal,
		runTour,
		handleAccept,
		handleDecline,
		handlePostpone,
		handleTourComplete,
		handleTourSkip,
	} = useMapTour()

	// Отключаем скролл на body во время тура, чтобы избежать мерцания
	useEffect(() => {
		if (runTour) {
			// Сохраняем текущее значение overflow
			const originalOverflow = document.body.style.overflow
			const originalPaddingRight = document.body.style.paddingRight

			// Вычисляем ширину скроллбара, если он есть
			const scrollbarWidth =
				window.innerWidth - document.documentElement.clientWidth

			// Отключаем скролл и компенсируем сдвиг от скроллбара
			document.body.style.overflow = 'hidden'
			if (scrollbarWidth > 0) {
				document.body.style.paddingRight = `${scrollbarWidth}px`
			}

			return () => {
				// Восстанавливаем исходные значения
				document.body.style.overflow = originalOverflow
				document.body.style.paddingRight = originalPaddingRight
			}
		}
	}, [runTour])

	return (
		<>
			{showModal && (
				<TourModal
					onAccept={handleAccept}
					onDecline={handleDecline}
					onPostpone={handlePostpone}
				/>
			)}
			{runTour && (
				<MapTour
					runTour={runTour}
					onComplete={handleTourComplete}
					onSkip={handleTourSkip}
				/>
			)}
		</>
	)
}
