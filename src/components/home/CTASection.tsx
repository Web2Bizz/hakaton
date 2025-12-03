import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useScrollAnimation } from './hooks/useScrollAnimation'

export function CTASection() {
	const { ref, isVisible } = useScrollAnimation()

	return (
		<section
			ref={ref}
			className={`py-20 px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white md:px-20 lg:px-32 relative overflow-hidden transition-all duration-1000 ${
				isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
			}`}
		>
			{/* Декоративные элементы */}
			<div className='absolute top-0 left-0 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse' />
			<div className='absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse animation-delay-1000' />

			<div className='mx-auto max-w-4xl text-center relative z-10'>
				<div className='inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium'>
					<Sparkles className='h-4 w-4' />
					Присоединяйтесь
				</div>
				<h2 className='text-3xl md:text-4xl lg:text-5xl font-bold mb-6'>
					Готовы начать делать добрые дела?
				</h2>
				<p className='text-lg text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed'>
					Присоединяйтесь к сообществу волонтеров и организаций, которые меняют
					жизнь к лучшему в атомных городах России. Каждое действие имеет
					значение, и вместе мы можем больше!
				</p>
				<div className='flex flex-wrap gap-4 justify-center'>
					<Button
						size='lg'
						className='bg-linear-to-r from-cyan-400 to-blue-600 text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 hover:scale-105'
						asChild
					>
						<Link to='/map'>
							Смотреть карту
							<ArrowRight className='ml-2 h-5 w-5' />
						</Link>
					</Button>
					<Button
						size='lg'
						variant='outline'
						className='border-slate-400/30 bg-white/8 text-white backdrop-blur-sm transition-all hover:bg-white/14 hover:scale-105'
						asChild
					>
						<Link to='/registartion'>Зарегистрироваться</Link>
					</Button>
				</div>
			</div>
		</section>
	)
}

