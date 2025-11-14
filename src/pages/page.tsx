import { Button } from '@/components/ui/button'
import '@/styles/atomic-animation.css'

const HERO_CONTENT = {
	badge: 'ATOM ДОБРО',
	title: 'Карта добрых дел атомных городов',
	description:
		'Узнайте, как волонтерские организации помогают жителям, природе и сообществам. Выберите город, направление и вид помощи, чтобы присоединиться к инициативам или поддержать их ресурсами.',
	actions: {
		addOrganization: 'Добавить точку',
		viewMap: 'Смотреть карту',
	},
} as const

function HeroBadge() {
	return (
		<div className='mb-5 inline-flex items-center gap-2 rounded-full border border-sky-300/60 bg-sky-500/20 px-3.5 py-2 text-xs uppercase tracking-wider text-sky-200'>
			{HERO_CONTENT.badge}
		</div>
	)
}

function HeroActions() {
	return (
		<div className='flex flex-wrap gap-4'>
			<Button
				size='lg'
				className='bg-linear-to-r from-cyan-400 to-blue-600 text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5'
				asChild
			>
				<a href='/add-organization'>{HERO_CONTENT.actions.addOrganization}</a>
			</Button>
			<Button
				size='lg'
				variant='outline'
				className='border-slate-400/30 bg-white/8 text-white backdrop-blur-sm transition-all hover:bg-white/14 hover:-translate-y-0.5'
				asChild
			>
				<a href='/map'>{HERO_CONTENT.actions.viewMap}</a>
			</Button>
		</div>
	)
}

function HeroContent() {
	return (
		<div className='relative z-10 max-w-[520px]'>
			<HeroBadge />
			<h1 className='mb-5 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl'>
				{HERO_CONTENT.title}
			</h1>
			<p className='mb-8 text-lg leading-relaxed text-slate-200/90'>
				{HERO_CONTENT.description}
			</p>
			<HeroActions />
		</div>
	)
}

function HeroFigure() {
	return (
		<div className='relative mx-auto flex w-full max-w-[360px] aspect-square items-center justify-center md:w-[360px] overflow-visible'>
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

export default function HomePage() {
	return (
		<header className='relative grid h-screen grid-cols-1 items-center gap-8 bg-linear-to-br from-slate-900 via-slate-800 to-sky-500 px-6 py-24 text-slate-50 md:grid-cols-[1fr_auto] md:px-20 lg:px-32'>
			<HeroContent />
			<HeroFigure />
		</header>
	)
}
