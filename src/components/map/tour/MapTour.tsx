import Joyride, {
	ACTIONS,
	EVENTS,
	type CallBackProps,
	type Step,
} from 'react-joyride'

const steps: Step[] = [
	{
		target: '.map-search-container',
		content: (
			<div>
				<div className='text-xs text-slate-500 mb-2 font-medium'>
					Шаг 1 из 4
				</div>
				<h3 className='text-lg font-semibold text-slate-900 mb-2'>
					🔍 Поиск на карте
				</h3>
				<p className='text-slate-700'>
					Используйте поиск для быстрого нахождения организаций, квестов или
					адресов. Просто начните вводить название или адрес.
				</p>
			</div>
		),
		placement: 'bottom',
		disableBeacon: true,
	},
	{
		target: '.map-actions-container',
		content: (
			<div>
				<div className='text-xs text-slate-500 mb-2 font-medium'>
					Шаг 2 из 4
				</div>
				<h3 className='text-lg font-semibold text-slate-900 mb-2'>
					⚙️ Управление картой
				</h3>
				<p className='text-slate-700 mb-2'>
					Здесь вы найдете полезные инструменты:
				</p>
				<ul className='text-sm text-slate-600 space-y-1 list-disc list-inside'>
					<li>
						<strong>📍 Геолокация</strong> - найти ваше местоположение
					</li>
					<li>
						<strong>🔽 Фильтры</strong> - настроить отображение квестов и
						организаций
					</li>
					<li>
						<strong>📋 Список</strong> - просмотреть все элементы в виде списка
					</li>
				</ul>
			</div>
		),
		placement: 'left',
		disableBeacon: true,
	},
	{
		target: '.map-wrapper',
		content: (
			<div>
				<div className='text-xs text-slate-500 mb-2 font-medium'>
					Шаг 3 из 4
				</div>
				<h3 className='text-lg font-semibold text-slate-900 mb-2'>
					🗺️ Интерактивная карта
				</h3>
				<p className='text-slate-700 mb-2'>
					На карте отображаются все квесты и организации. Вы можете:
				</p>
				<ul className='text-sm text-slate-600 space-y-1 list-disc list-inside'>
					<li>Кликнуть на маркер для просмотра деталей</li>
					<li>Использовать колесико мыши для масштабирования</li>
					<li>Перетаскивать карту для навигации</li>
				</ul>
			</div>
		),
		placement: 'center',
		disableBeacon: true,
	},
	{
		target: 'body',
		content: (
			<div>
				<div className='text-xs text-slate-500 mb-2 font-medium'>
					Шаг 4 из 4
				</div>
				<h3 className='text-lg font-semibold text-slate-900 mb-2'>
					✅ Готово!
				</h3>
				<p className='text-slate-700'>
					Теперь вы знаете основы работы с картой. Начните исследовать квесты и
					организации, участвуйте в добрых делах!
				</p>
			</div>
		),
		placement: 'center',
		disableBeacon: true,
	},
]

interface MapTourProps {
	readonly runTour: boolean
	readonly onComplete: () => void
	readonly onSkip: () => void
}

export function MapTour({ runTour, onComplete, onSkip }: MapTourProps) {
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

	return (
		<Joyride
			steps={steps}
			run={runTour}
			continuous
			showProgress={false}
			showSkipButton
			disableOverlayClose={false}
			callback={handleJoyrideCallback}
			styles={{
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
					// Яркая обводка для подсветки элемента - несколько слоев для лучшей видимости
					boxShadow:
						'0 0 0 3px rgba(14, 165, 233, 0.6), 0 0 0 6px rgba(14, 165, 233, 0.4), 0 0 0 9px rgba(14, 165, 233, 0.2), 0 0 40px rgba(14, 165, 233, 0.5)',
				},
			}}
			locale={{
				back: 'Назад',
				close: 'Закрыть',
				last: 'Завершить',
				next: 'Далее',
				skip: 'Пропустить тур',
			}}
		/>
	)
}
