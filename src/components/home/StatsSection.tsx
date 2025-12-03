import { CheckCircle2, MapPin, Target, TrendingUp, Users } from 'lucide-react'
import { useScrollAnimation } from './hooks/useScrollAnimation'

const stats = [
	{
		value: '100+',
		label: 'Организаций на карте',
		icon: MapPin,
		color: 'from-blue-400 to-cyan-400',
	},
	{
		value: '50+',
		label: 'Активных квестов',
		icon: Target,
		color: 'from-purple-400 to-pink-400',
	},
	{
		value: '1000+',
		label: 'Активных участников',
		icon: Users,
		color: 'from-green-400 to-emerald-400',
	},
	{
		value: '24/7',
		label: 'Доступность платформы',
		icon: CheckCircle2,
		color: 'from-yellow-400 to-amber-400',
	},
]

export function StatsSection() {
	const { ref, isVisible } = useScrollAnimation()

	return (
		<section
			ref={ref}
			className={`py-20 px-6 bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-600 text-white md:px-20 lg:px-32 relative overflow-hidden transition-all duration-1000 ${
				isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
			}`}
		>
			{/* Декоративные элементы */}
			<div className='absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl' />
			<div className='absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl' />

			<div className='mx-auto max-w-6xl relative z-10'>
				<div className='text-center mb-12'>
					<div className='inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium'>
						<TrendingUp className='h-4 w-4' />
						Статистика
					</div>
					<h2 className='text-3xl md:text-4xl lg:text-5xl font-bold mb-4'>
						Платформа в цифрах
					</h2>
					<p className='text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed'>
						Мы растем вместе с нашим сообществом и каждый день делаем мир лучше.
						Присоединяйтесь к движению!
					</p>
				</div>

				<div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
					{stats.map((stat, index) => {
						const Icon = stat.icon
						return (
							<div
								key={index}
								className={`text-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:-translate-y-1 ${
									isVisible
										? 'opacity-100 translate-y-0'
										: 'opacity-0 translate-y-10'
								}`}
								style={{
									transitionDelay: `${index * 100}ms`,
								}}
							>
								<div
									className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}
								>
									<Icon className='h-6 w-6 text-white' />
								</div>
								<div className='text-4xl md:text-5xl font-bold mb-2'>
									{stat.value}
								</div>
								<div className='text-blue-100'>{stat.label}</div>
							</div>
						)
					})}
				</div>
			</div>
		</section>
	)
}

