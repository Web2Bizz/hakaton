import Joyride, {
	ACTIONS,
	EVENTS,
	type CallBackProps,
	type Step,
} from 'react-joyride'

interface TourProps {
	readonly steps: Step[]
	readonly runTour: boolean
	readonly onComplete: () => void
	readonly onSkip: () => void
	readonly locale?: {
		back?: string
		close?: string
		last?: string
		next?: string
		skip?: string
	}
	readonly styles?: Record<string, unknown>
}

export function Tour({
	steps,
	runTour,
	onComplete,
	onSkip,
	locale = {
		back: 'Назад',
		close: 'Закрыть',
		last: 'Завершить',
		next: 'Далее',
		skip: 'Пропустить тур',
	},
	styles,
}: TourProps) {
	const handleJoyrideCallback = (data: CallBackProps) => {
		const { action, status, type } = data

		if (
			// Если тур завершен или пропущен
			(status === 'finished' || status === 'skipped') &&
			(action === ACTIONS.CLOSE || action === ACTIONS.SKIP)
		) {
			if (status === 'skipped') {
				onSkip()
			} else {
				onComplete()
			}
		} else if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
			// Если шаг завершен или цель не найдена, продолжаем
		}
	}

	if (!runTour) {
		return null
	}

	const defaultStyles = {
		options: {
			primaryColor: '#0ea5e9', // blue-500
			zIndex: 10000,
			arrowColor: '#ffffff',
		},
		tooltip: {
			borderRadius: '16px',
			padding: '24px',
			boxShadow:
				'0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
			border: '1px solid rgba(226, 232, 240, 0.8)',
			minWidth: '360px',
			maxWidth: '400px',
			minHeight: '200px',
			width: '360px',
			transition: 'none', // Отключаем переходы, чтобы избежать мерцания
		},
		tooltipContainer: {
			textAlign: 'left',
		},
		tooltipTitle: {
			fontSize: '18px',
			fontWeight: '600',
			marginBottom: '8px',
		},
		tooltipContent: {
			padding: '0',
			fontSize: '14px',
			lineHeight: '1.6',
		},
		buttonNext: {
			backgroundColor: '#0ea5e9',
			borderRadius: '8px',
			padding: '10px 20px',
			fontSize: '14px',
			fontWeight: '600',
			outline: 'none',
			boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.3)',
		},
		buttonBack: {
			color: '#64748b',
			marginRight: '10px',
			borderRadius: '8px',
			padding: '10px 20px',
			fontSize: '14px',
			outline: 'none',
			backgroundColor: 'transparent',
		},
		buttonSkip: {
			color: '#64748b',
			fontSize: '14px',
			outline: 'none',
			textDecoration: 'none',
		},
		spotlight: {
			borderRadius: '12px',
			boxShadow:
				'0 0 0 3px rgba(14, 165, 233, 0.6), 0 0 0 6px rgba(14, 165, 233, 0.4), 0 0 0 9px rgba(14, 165, 233, 0.2), 0 0 40px rgba(14, 165, 233, 0.5)',
		},
	}

	return (
		<Joyride
			steps={steps}
			run={runTour}
			continuous
			showProgress={false}
			showSkipButton
			disableOverlayClose={false}
			callback={handleJoyrideCallback}
			styles={styles || defaultStyles}
			locale={locale}
		/>
	)
}

