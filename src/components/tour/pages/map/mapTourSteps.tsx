import type { Step } from 'react-joyride'

export const mapTourSteps: Step[] = [
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
