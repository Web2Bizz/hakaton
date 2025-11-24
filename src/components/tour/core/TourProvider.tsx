import { useEffect, type ReactNode } from 'react'
import { Tour } from './Tour'
import { TourModal } from './TourModal'
import { useTour } from './useTour'
import type { Step } from 'react-joyride'
import type { LucideIcon } from 'lucide-react'

interface TourProviderProps {
	readonly pageKey: string
	readonly steps: Step[]
	readonly modalTitle: string
	readonly modalDescription: string
	readonly modalIcon: LucideIcon
	readonly acceptButtonText?: string
	readonly postponeButtonText?: string
	readonly showDelay?: number
	readonly locale?: {
		back?: string
		close?: string
		last?: string
		next?: string
		skip?: string
	}
	readonly styles?: Record<string, unknown>
}

export function TourProvider({
	pageKey,
	steps,
	modalTitle,
	modalDescription,
	modalIcon,
	acceptButtonText,
	postponeButtonText,
	showDelay,
	locale,
	styles,
}: TourProviderProps) {
	const {
		showModal,
		runTour,
		handleAccept,
		handleDecline,
		handlePostpone,
		handleTourComplete,
		handleTourSkip,
	} = useTour({ pageKey, showDelay })

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
					title={modalTitle}
					description={modalDescription}
					icon={modalIcon}
					onAccept={handleAccept}
					onDecline={handleDecline}
					onPostpone={handlePostpone}
					acceptButtonText={acceptButtonText}
					postponeButtonText={postponeButtonText}
				/>
			)}
			{runTour && (
				<Tour
					steps={steps}
					runTour={runTour}
					onComplete={handleTourComplete}
					onSkip={handleTourSkip}
					locale={locale}
					styles={styles}
				/>
			)}
		</>
	)
}

