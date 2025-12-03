import { Target } from 'lucide-react'
import { useScrollAnimation } from './hooks/useScrollAnimation'

const steps = [
	{
		number: '01',
		title: 'Зарегистрируйтесь',
		description:
			'Создайте аккаунт за минуту. Заполните профиль, выберите интересы и начните свой путь к добрым делам.',
		icon: '✨',
	},
	{
		number: '02',
		title: 'Изучите карту',
		description:
			'Откройте интерактивную карту, найдите интересующие вас квесты и организации. Используйте фильтры для удобного поиска.',
		icon: '🗺️',
	},
	{
		number: '03',
		title: 'Присоединяйтесь',
		description:
			'Участвуйте в квестах, поддерживайте организации ресурсами или временем. Каждое действие приближает нас к цели.',
		icon: '🤝',
	},
	{
		number: '04',
		title: 'Получайте награды',
		description:
			'Зарабатывайте опыт, разблокируйте достижения, повышайте уровень. Отслеживайте свой прогресс и вдохновляйте других.',
		icon: '🏆',
	},
]

export function HowItWorksSection() {
	const { ref, isVisible } = useScrollAnimation()

	return (
		<section
			ref={ref}
			className={`py-20 px-6 bg-white md:px-20 lg:px-32 transition-all duration-1000 ${
				isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
			}`}
		>
			<div className='mx-auto max-w-6xl'>
				<div className='text-center mb-16'>
					<div className='inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-purple-50 text-purple-600 text-sm font-medium'>
						<Target className='h-4 w-4' />
						Процесс
					</div>
					<h2 className='text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4'>
						Как это работает?
					</h2>
					<p className='text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed'>
						Всего четыре простых шага отделяют вас от первого доброго дела.
						Начните прямо сейчас!
					</p>
				</div>

				<div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
					{steps.map((step, index) => (
						<div
							key={index}
							className={`relative group transition-all duration-500 ${
								isVisible
									? 'opacity-100 translate-y-0'
									: 'opacity-0 translate-y-10'
							}`}
							style={{
								transitionDelay: `${index * 150}ms`,
							}}
						>
							<div className='text-6xl font-bold text-slate-100 mb-4 group-hover:text-blue-200 transition-colors'>
								{step.number}
							</div>
							<div className='text-4xl mb-3'>{step.icon}</div>
							<h3 className='text-xl font-bold text-slate-900 mb-2'>
								{step.title}
							</h3>
							<p className='text-slate-600 leading-relaxed'>
								{step.description}
							</p>
							{index < steps.length - 1 && (
								<div className='hidden lg:block absolute top-12 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 group-hover:w-12 transition-all' />
							)}
						</div>
					))}
				</div>
			</div>
		</section>
	)
}

