import type { LucideIcon } from 'lucide-react'
import type { Step } from 'react-joyride'
import { Tour } from './Tour'
import { TourModal } from './TourModal'
import { useTour } from './useTour'

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
