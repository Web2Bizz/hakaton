import type { Step } from 'react-joyride'

export const manageTourSteps: Step[] = [
	{
		target: '.manage-header-container',
		content: (
			<div>
				<div className='text-xs text-slate-500 mb-2 font-medium'>
					Шаг 1 из 5
				</div>
				<h3 className='text-lg font-semibold text-slate-900 mb-2'>
					⚙️ Панель управления
				</h3>
				<p className='text-slate-700 mb-2'>
					Здесь вы можете управлять всеми созданными вами квестами и организациями:
				</p>
				<ul className='text-sm text-slate-600 space-y-1 list-disc list-inside'>
					<li>Просматривайте список ваших квестов и организаций</li>
					<li>Редактируйте информацию о них</li>
					<li>Отслеживайте их статус и активность</li>
				</ul>
			</div>
		),
		placement: 'bottom',
		disableBeacon: true,
	},
	{
		target: '.manage-tabs-container',
		content: (
			<div>
				<div className='text-xs text-slate-500 mb-2 font-medium'>
					Шаг 2 из 5
				</div>
				<h3 className='text-lg font-semibold text-slate-900 mb-2'>
					📑 Вкладки
				</h3>
				<p className='text-slate-700 mb-2'>
					Переключайтесь между разделами:
				</p>
				<ul className='text-sm text-slate-600 space-y-1 list-disc list-inside'>
					<li>
						<strong>Мои квесты</strong> - управление созданными квестами
					</li>
					<li>
						<strong>Мои организации</strong> - управление созданными организациями
					</li>
					<li>Количество элементов отображается на вкладках</li>
				</ul>
			</div>
		),
		placement: 'bottom',
		disableBeacon: true,
	},
	{
		target: '.manage-quests-stats-container',
		content: (
			<div>
				<div className='text-xs text-slate-500 mb-2 font-medium'>
					Шаг 3 из 5
				</div>
				<h3 className='text-lg font-semibold text-slate-900 mb-2'>
					📊 Статистика квестов
				</h3>
				<p className='text-slate-700 mb-2'>
					Отслеживайте статистику ваших квестов:
				</p>
				<ul className='text-sm text-slate-600 space-y-1 list-disc list-inside'>
					<li>
						<strong>Всего квестов</strong> - общее количество созданных квестов
					</li>
					<li>
						<strong>Активных</strong> - квесты, которые сейчас доступны
					</li>
					<li>
						<strong>Завершено</strong> - успешно завершенные квесты
					</li>
					<li>
						<strong>Архивировано</strong> - скрытые квесты
					</li>
				</ul>
			</div>
		),
		placement: 'bottom',
		disableBeacon: true,
	},
	{
		target: '.manage-create-button-container',
		content: (
			<div>
				<div className='text-xs text-slate-500 mb-2 font-medium'>
					Шаг 4 из 5
				</div>
				<h3 className='text-lg font-semibold text-slate-900 mb-2'>
					➕ Создание нового квеста
				</h3>
				<p className='text-slate-700 mb-2'>
					Быстрое создание:
				</p>
				<ul className='text-sm text-slate-600 space-y-1 list-disc list-inside'>
					<li>Используйте кнопку "Создать квест" для быстрого перехода к форме</li>
					<li>Кнопка доступна только на вкладке "Мои квесты"</li>
					<li>После создания квест появится в списке</li>
				</ul>
			</div>
		),
		placement: 'left',
		disableBeacon: true,
	},
	{
		target: 'body',
		content: (
			<div>
				<div className='text-xs text-slate-500 mb-2 font-medium'>
					Шаг 5 из 5
				</div>
				<h3 className='text-lg font-semibold text-slate-900 mb-2'>
					✅ Готово!
				</h3>
				<p className='text-slate-700'>
					Теперь вы знаете, как управлять своими квестами и организациями. Используйте
					панель управления для редактирования и отслеживания ваших активностей!
				</p>
			</div>
		),
		placement: 'center',
		disableBeacon: true,
	},
]

