import type { Step } from 'react-joyride'

export const profileTourSteps: Step[] = [
	{
		target: '.profile-header-container',
		content: (
			<div>
				<div className='text-xs text-slate-500 mb-2 font-medium'>
					Шаг 1 из 7
				</div>
				<h3 className='text-lg font-semibold text-slate-900 mb-2'>
					👤 Ваш профиль
				</h3>
				<p className='text-slate-700 mb-2'>
					Здесь отображается основная информация о вас:
				</p>
				<ul className='text-sm text-slate-600 space-y-1 list-disc list-inside'>
					<li>
						<strong>Аватар</strong> - нажмите на него, чтобы изменить фото
					</li>
					<li>
						<strong>Имя и email</strong> - ваши контактные данные
					</li>
					<li>
						<strong>Статистика</strong> - количество квестов и достижений
					</li>
					<li>
						<strong>Выход</strong> - кнопка для выхода из аккаунта
					</li>
				</ul>
			</div>
		),
		placement: 'bottom',
		disableBeacon: true,
	},
	{
		target: '.profile-level-container',
		content: (
			<div>
				<div className='text-xs text-slate-500 mb-2 font-medium'>
					Шаг 2 из 7
				</div>
				<h3 className='text-lg font-semibold text-slate-900 mb-2'>
					📊 Прогресс уровня
				</h3>
				<p className='text-slate-700 mb-2'>
					Отслеживайте свой прогресс и получайте опыт:
				</p>
				<ul className='text-sm text-slate-600 space-y-1 list-disc list-inside'>
					<li>Выполняйте квесты для получения опыта</li>
					<li>Участвуйте в активностях организаций</li>
					<li>Повышайте уровень и открывайте новые возможности</li>
				</ul>
			</div>
		),
		placement: 'bottom',
		disableBeacon: true,
	},
	{
		target: '.profile-achievements-container',
		content: (
			<div>
				<div className='text-xs text-slate-500 mb-2 font-medium'>
					Шаг 3 из 7
				</div>
				<h3 className='text-lg font-semibold text-slate-900 mb-2'>
					🏆 Достижения
				</h3>
				<p className='text-slate-700 mb-2'>
					Ваши достижения и награды:
				</p>
				<ul className='text-sm text-slate-600 space-y-1 list-disc list-inside'>
					<li>
						<strong>Разблокированные</strong> - достижения, которые вы уже получили
					</li>
					<li>
						<strong>Заблокированные</strong> - достижения, которые еще предстоит получить
					</li>
					<li>Каждое достижение имеет свою редкость и награду</li>
				</ul>
			</div>
		),
		placement: 'bottom',
		disableBeacon: true,
	},
	{
		target: '.profile-my-quests-container',
		content: (
			<div>
				<div className='text-xs text-slate-500 mb-2 font-medium'>
					Шаг 4 из 7
				</div>
				<h3 className='text-lg font-semibold text-slate-900 mb-2'>
					🎯 Мои квесты
				</h3>
				<p className='text-slate-700 mb-2'>
					Здесь отображаются квесты, которые вы создали:
				</p>
				<ul className='text-sm text-slate-600 space-y-1 list-disc list-inside'>
					<li>Просматривайте все ваши созданные квесты</li>
					<li>Отслеживайте их статус и прогресс</li>
					<li>Управляйте своими квестами</li>
				</ul>
			</div>
		),
		placement: 'top',
		disableBeacon: true,
	},
	{
		target: '.profile-my-organizations-container',
		content: (
			<div>
				<div className='text-xs text-slate-500 mb-2 font-medium'>
					Шаг 5 из 7
				</div>
				<h3 className='text-lg font-semibold text-slate-900 mb-2'>
					🏢 Мои организации
				</h3>
				<p className='text-slate-700 mb-2'>
					Организации, которыми вы управляете:
				</p>
				<ul className='text-sm text-slate-600 space-y-1 list-disc list-inside'>
					<li>Просматривайте все ваши организации</li>
					<li>Управляйте их настройками и информацией</li>
					<li>Создавайте новые организации</li>
				</ul>
			</div>
		),
		placement: 'top',
		disableBeacon: true,
	},
	{
		target: '.profile-active-quests-container',
		content: (
			<div>
				<div className='text-xs text-slate-500 mb-2 font-medium'>
					Шаг 6 из 7
				</div>
				<h3 className='text-lg font-semibold text-slate-900 mb-2'>
					⚡ Активные квесты
				</h3>
				<p className='text-slate-700 mb-2'>
					Квесты, в которых вы участвуете:
				</p>
				<ul className='text-sm text-slate-600 space-y-1 list-disc list-inside'>
					<li>Отслеживайте прогресс выполнения квестов</li>
					<li>Просматривайте активные задания</li>
					<li>Завершайте квесты и получайте награды</li>
				</ul>
			</div>
		),
		placement: 'top',
		disableBeacon: true,
	},
	{
		target: 'body',
		content: (
			<div>
				<div className='text-xs text-slate-500 mb-2 font-medium'>
					Шаг 7 из 7
				</div>
				<h3 className='text-lg font-semibold text-slate-900 mb-2'>
					✅ Готово!
				</h3>
				<p className='text-slate-700'>
					Теперь вы знаете, как работать с профилем. Отслеживайте свой прогресс,
					получайте достижения и управляйте своими квестами!
				</p>
			</div>
		),
		placement: 'center',
		disableBeacon: true,
	},
]

