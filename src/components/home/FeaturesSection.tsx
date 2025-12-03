import { Award, CheckCircle2, Heart, TrendingUp, Zap } from 'lucide-react'
import { useScrollAnimation } from './hooks/useScrollAnimation'

const features = [
	{
		icon: Heart,
		title: 'Помощь людям',
		description:
			'Поддержка пожилых людей, помощь детям из неблагополучных семей, забота о людях с ограниченными возможностями здоровья. Каждое действие имеет значение.',
		color: 'from-red-500 to-pink-500',
		stats: '500+ человек получили помощь',
	},
	{
		icon: Zap,
		title: 'Экология и природа',
		description:
			'Озеленение городов, уборка территорий, защита окружающей среды и продвижение идей устойчивого развития. Заботимся о планете вместе.',
		color: 'from-green-500 to-emerald-500',
		stats: '1000+ деревьев посажено',
	},
	{
		icon: Award,
		title: 'Геймификация',
		description:
			'Система уровней, опыта и достижений превращает помощь другим в увлекательное приключение. Получайте награды за каждое доброе дело!',
		color: 'from-yellow-500 to-amber-500',
		stats: '50+ уникальных достижений',
	},
	{
		icon: TrendingUp,
		title: 'Развитие территорий',
		description:
			'Улучшение инфраструктуры, развитие местных сообществ, поддержка культурных и образовательных проектов. Строим будущее вместе.',
		color: 'from-blue-500 to-cyan-500',
		stats: '200+ проектов реализовано',
	},
]

export function FeaturesSection() {
	const { ref, isVisible } = useScrollAnimation()

	return (
		<section
			ref={ref}
			className={`py-20 px-6 bg-gradient-to-b from-slate-50 to-white md:px-20 lg:px-32 transition-all duration-1000 ${
				isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
			}`}
		>
			<div className='mx-auto max-w-6xl'>
				<div className='text-center mb-16'>
					<div className='inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-green-50 text-green-600 text-sm font-medium'>
						<Zap className='h-4 w-4' />
						Направления
					</div>
					<h2 className='text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4'>
						Четыре столпа добрых дел
					</h2>
					<p className='text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed'>
						Выберите направление, которое вам близко, и начните делать добрые
						дела уже сегодня. Каждое действие имеет значение.
					</p>
				</div>

				<div className='grid md:grid-cols-2 gap-6'>
					{features.map((feature, index) => {
						const Icon = feature.icon
						return (
							<div
								key={index}
								className={`group p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 ${
									isVisible
										? 'opacity-100 translate-y-0'
										: 'opacity-0 translate-y-10'
								}`}
								style={{
									transitionDelay: `${index * 100}ms`,
								}}
							>
								<div
									className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}
								>
									<Icon className='h-7 w-7 text-white' />
								</div>
								<h3 className='text-xl font-bold text-slate-900 mb-2'>
									{feature.title}
								</h3>
								<p className='text-slate-600 mb-3 leading-relaxed'>
									{feature.description}
								</p>
								<div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-medium'>
									<CheckCircle2 className='h-3 w-3 text-green-500' />
									{feature.stats}
								</div>
							</div>
						)
					})}
				</div>
			</div>
		</section>
	)
}

