import { quests } from '@/components/map/data/quests'
import { Button } from '@/components/ui/button'
import { useUser } from '@/contexts/UserContext'
import { ArrowRight, TrendingUp } from 'lucide-react'

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

const ORBITS_CONFIG = [
	{ inset: '18%', duration: '18s', direction: 'normal' },
	{ inset: '30%', duration: '24s', direction: 'reverse' },
	{ inset: '42%', duration: '28s', direction: 'normal' },
] as const

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

function Orbit({
	inset,
	duration,
	direction,
}: Readonly<{
	inset: string
	duration: string
	direction: 'normal' | 'reverse'
}>) {
	return (
		<span
			className='absolute aspect-square animate-spin rounded-full border border-slate-400/18'
			style={{
				top: inset,
				right: inset,
				bottom: inset,
				left: inset,
				animationDuration: duration,
				animationDirection: direction,
			}}
		/>
	)
}

function HeroFigure() {
	return (
		<div className='relative mx-auto grid w-full max-w-[360px] aspect-square place-items-center md:w-[360px]'>
			<div
				className='absolute inset-0 rounded-full blur-lg'
				style={{
					background:
						'radial-gradient(circle, rgba(14, 165, 233, 0.45) 0%, rgba(15, 23, 42, 0) 70%)',
				}}
			/>

			<div className='absolute inset-[12%] aspect-square rounded-full border border-slate-400/30'>
				{ORBITS_CONFIG.map(orbit => (
					<Orbit
						key={`orbit-${orbit.inset}-${orbit.duration}`}
						inset={orbit.inset}
						duration={orbit.duration}
						direction={orbit.direction}
					/>
				))}
			</div>
		</div>
	)
}

function ActiveQuests() {
	const { user } = useUser()
	const activeQuests = quests.filter(q => q.status === 'active').slice(0, 3)

	if (activeQuests.length === 0) {
		return null
	}

	return (
		<section className='py-20 px-6 md:px-20 lg:px-32 bg-slate-50'>
			<div className='max-w-7xl mx-auto'>
				<div className='flex items-center justify-between mb-8'>
					<div>
						<h2 className='text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2'>
							<TrendingUp className='h-8 w-8 text-blue-600' />
							Активные квесты
						</h2>
						<p className='text-slate-600'>
							Присоединяйтесь к квестам и меняйте мир к лучшему
						</p>
					</div>
					<Button variant='outline' asChild>
						<a href='/map'>
							Все квесты
							<ArrowRight className='h-4 w-4 ml-2' />
						</a>
					</Button>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{activeQuests.map(quest => {
						const isParticipating = user?.participatingQuests.includes(quest.id)
						return (
							<div
								key={quest.id}
								className='bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1'
							>
								{quest.storyMedia?.image && (
									<img
										src={quest.storyMedia.image}
										alt={quest.title}
										className='w-full h-48 object-cover'
									/>
								)}
								<div className='p-6'>
									<div className='flex items-center justify-between mb-2'>
										<span className='text-xs font-medium text-blue-600 uppercase tracking-wider'>
											{quest.city}
										</span>
										<span className='text-xs font-medium text-slate-500'>
											{quest.type}
										</span>
									</div>
									<h3 className='text-lg font-bold text-slate-900 mb-2 line-clamp-2'>
										{quest.title}
									</h3>
									<p className='text-sm text-slate-600 mb-4 line-clamp-2'>
										{quest.story}
									</p>

									{/* Прогресс */}
									<div className='mb-4'>
										<div className='flex items-center justify-between mb-1'>
											<span className='text-xs font-medium text-slate-600'>
												Прогресс
											</span>
											<span className='text-xs font-bold text-blue-600'>
												{quest.overallProgress}%
											</span>
										</div>
										<div className='h-2 bg-slate-200 rounded-full overflow-hidden'>
											<div
												className='h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300'
												style={{ width: `${quest.overallProgress}%` }}
											/>
										</div>
									</div>

									<Button
										className='w-full'
										variant={isParticipating ? 'outline' : 'default'}
										asChild
									>
										<a href={`/map?quest=${quest.id}`}>
											{isParticipating ? 'Продолжить участие' : 'Участвовать'}
											<ArrowRight className='h-4 w-4 ml-2' />
										</a>
									</Button>
								</div>
							</div>
						)
					})}
				</div>
			</div>
		</section>
	)
}

export default function HomePage() {
	return (
		<>
			<header className='relative grid h-screen grid-cols-1 items-center gap-8 overflow-hidden bg-linear-to-br from-slate-900 via-slate-800 to-sky-500 px-6 py-24 text-slate-50 md:grid-cols-[1fr_auto] md:px-20 lg:px-32'>
				<HeroContent />
				<HeroFigure />
			</header>
			<ActiveQuests />
		</>
	)
}
