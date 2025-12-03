import { MapPin, Sparkles, Target, Users } from 'lucide-react'
import { useScrollAnimation } from './hooks/useScrollAnimation'

export function AboutSection() {
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
					<div className='inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-medium'>
						<Sparkles className='h-4 w-4' />О платформе
					</div>
					<h2 className='text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4'>
						Единая экосистема добрых дел
					</h2>
					<p className='text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed'>
						АТОМ ДОБРО — это не просто карта организаций. Это живая платформа,
						объединяющая тысячи людей, которые верят, что вместе мы можем
						изменить мир. Здесь каждый найдет способ помочь: от участия в
						экологических акциях до поддержки социальных проектов.
					</p>
				</div>

				<div className='grid md:grid-cols-3 gap-8'>
					<div className='p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group'>
						<div className='w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform'>
							<MapPin className='h-6 w-6 text-white' />
						</div>
						<h3 className='text-xl font-bold text-slate-900 mb-2'>
							Интерактивная карта
						</h3>
						<p className='text-slate-600 leading-relaxed'>
							Найдите организации и квесты рядом с вами на удобной карте с
							умными фильтрами. Откройте для себя новые возможности помощи в
							своем городе.
						</p>
					</div>

					<div className='p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group'>
						<div className='w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform'>
							<Target className='h-6 w-6 text-white' />
						</div>
						<h3 className='text-xl font-bold text-slate-900 mb-2'>
							Квесты и достижения
						</h3>
						<p className='text-slate-600 leading-relaxed'>
							Участвуйте в увлекательных квестах, зарабатывайте опыт и
							разблокируйте уникальные достижения. Каждое доброе дело — это шаг
							к новому уровню.
						</p>
					</div>

					<div className='p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group'>
						<div className='w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform'>
							<Users className='h-6 w-6 text-white' />
						</div>
						<h3 className='text-xl font-bold text-slate-900 mb-2'>
							Активное сообщество
						</h3>
						<p className='text-slate-600 leading-relaxed'>
							Присоединяйтесь к волонтерским организациям, создавайте свои
							квесты и вдохновляйте других на добрые дела. Вместе мы сильнее!
						</p>
					</div>
				</div>
			</div>
		</section>
	)
}

