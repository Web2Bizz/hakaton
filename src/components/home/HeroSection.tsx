import { Button } from '@/components/ui/button'
import '@/styles/atomic-animation.css'
import { Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const HERO_CONTENT = {
	badge: 'ATOM ДОБРО',
	title: 'Карта добрых дел атомных городов',
	description:
		'Единая платформа для волонтеров, организаций и всех, кто хочет делать добрые дела. Находите квесты, присоединяйтесь к инициативам, получайте награды и меняйте мир к лучшему вместе с нами.',
	actions: {
		addOrganization: 'Добавить точку',
		viewMap: 'Смотреть карту',
	},
} as const

function HeroBadge() {
	return (
		<div className='mb-5 inline-flex items-center gap-2 rounded-full border border-sky-300/60 bg-sky-500/20 px-3.5 py-2 text-xs uppercase tracking-wider text-sky-200 animate-fade-in'>
			<Sparkles className='h-3 w-3' />
			{HERO_CONTENT.badge}
		</div>
	)
}

function HeroActions() {
	return (
		<div className='flex flex-wrap gap-4'>
			<Button
				size='lg'
				className='bg-linear-to-r from-cyan-400 to-blue-600 text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 hover:scale-105 animate-fade-in-up'
				asChild
			>
				<Link to='/add-organization'>
					{HERO_CONTENT.actions.addOrganization}
				</Link>
			</Button>
			<Button
				size='lg'
				variant='outline'
				className='border-slate-400/30 bg-white/8 text-white backdrop-blur-sm transition-all hover:bg-white/14 hover:-translate-y-0.5 hover:scale-105 animate-fade-in-up animation-delay-200'
				asChild
			>
				<Link to='/map'>{HERO_CONTENT.actions.viewMap}</Link>
			</Button>
		</div>
	)
}

function HeroContent() {
	return (
		<div className='relative z-10 max-w-[520px]'>
			<HeroBadge />
			<h1 className='mb-5 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl animate-fade-in-up'>
				{HERO_CONTENT.title}
			</h1>
			<p className='mb-8 text-lg leading-relaxed text-slate-200/90 animate-fade-in-up animation-delay-300'>
				{HERO_CONTENT.description}
			</p>
			<HeroActions />
		</div>
	)
}

function HeroFigure() {
	return (
		<div className='relative mx-auto flex w-full max-w-[240px] aspect-square items-center justify-center md:max-w-[360px] md:w-[360px] overflow-hidden md:overflow-visible animate-fade-in animation-delay-500'>
			<div
				className='absolute inset-0 rounded-full blur-lg z-0'
				style={{
					background:
						'radial-gradient(circle, rgba(14, 165, 233, 0.45) 0%, rgba(15, 23, 42, 0) 70%)',
				}}
			/>

			<div className='atomic-animation relative z-10'>
				<div>
					<div></div>
				</div>
				<div>
					<div></div>
				</div>
				<div>
					<div></div>
				</div>
				<div>
					<div></div>
				</div>
			</div>
		</div>
	)
}

export function HeroSection() {
	return (
		<section className='relative grid min-h-screen grid-cols-1 items-center gap-8 bg-linear-to-br from-slate-900 via-slate-800 to-sky-500 px-6 py-24 text-slate-50 md:grid-cols-[1fr_auto] md:px-20 lg:px-32 overflow-hidden'>
			{/* Декоративные элементы */}
			<div className='absolute top-20 right-20 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse' />
			<div className='absolute bottom-20 left-20 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse animation-delay-1000' />

			<HeroContent />
			<HeroFigure />
		</section>
	)
}
