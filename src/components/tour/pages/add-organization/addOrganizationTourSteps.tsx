import type { Step } from 'react-joyride'

export const addOrganizationTourSteps: Step[] = [
	{
		target: '.add-organization-tabs-container',
		content: (
			<div>
				<div className='text-xs text-slate-500 mb-2 font-medium'>
					Шаг 1 из 3
				</div>
				<h3 className='text-lg font-semibold text-slate-900 mb-2'>
					📋 Выбор типа
				</h3>
				<p className='text-slate-700 mb-2'>
					Выберите, что вы хотите создать:
				</p>
				<ul className='text-sm text-slate-600 space-y-1 list-disc list-inside'>
					<li>
						<strong>Организация</strong> - создайте волонтерскую организацию
					</li>
					<li>
						<strong>Квест</strong> - создайте квест для участников
					</li>
				</ul>
			</div>
		),
		placement: 'bottom',
		disableBeacon: true,
	},
	{
		target: '.add-organization-limits-container',
		content: (
			<div>
				<div className='text-xs text-slate-500 mb-2 font-medium'>
					Шаг 2 из 3
				</div>
				<h3 className='text-lg font-semibold text-slate-900 mb-2'>
					⚠️ Ограничения на создание
				</h3>
				<p className='text-slate-700 mb-2'>
					У каждого пользователя есть ограничения на количество создаваемых элементов:
				</p>
				<ul className='text-sm text-slate-600 space-y-1 list-disc list-inside'>
					<li>
						<strong>Организации:</strong> максимум 1 организация на пользователя
					</li>
					<li>
						<strong>Квесты:</strong> максимум 5 квестов на пользователя
					</li>
					<li>Текущее количество созданных элементов отображается на вкладках</li>
					<li>После достижения лимита создание новых элементов будет недоступно</li>
				</ul>
			</div>
		),
		placement: 'bottom',
		disableBeacon: true,
	},
	{
		target: 'body',
		content: (
			<div>
				<div className='text-xs text-slate-500 mb-2 font-medium'>
					Шаг 3 из 3
				</div>
				<h3 className='text-lg font-semibold text-slate-900 mb-2'>
					✅ Готово!
				</h3>
				<p className='text-slate-700'>
					Теперь вы знаете, как создавать организации и квесты. Заполните форму
					и добавьте свою точку на карту!
				</p>
			</div>
		),
		placement: 'center',
		disableBeacon: true,
	},
]

