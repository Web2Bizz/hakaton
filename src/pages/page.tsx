/**
 * @title Главная страница
 * @description Карта добрых дел атомных городов - единая платформа для волонтеров, организаций и всех, кто хочет делать добрые дела
 * @keywords атом добро, карта добрых дел, волонтерство, атомные города, квесты, благотворительность, НКО, помощь, добрые дела
 * @changefreq daily
 * @priority 1.0
 */

import { Button } from '@/components/ui/button'
import '@/styles/atomic-animation.css'
import {
	ArrowRight,
	Award,
	CheckCircle2,
	Heart,
	MapPin,
	Sparkles,
	Target,
	TrendingUp,
	Users,
	Zap,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

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

// Хук для анимации при скролле
function useScrollAnimation() {
	const [isVisible, setIsVisible] = useState(false)
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true)
				}
			},
			{ threshold: 0.1 }
		)

		if (ref.current) {
			observer.observe(ref.current)
		}

		return () => {
			if (ref.current) {
				observer.unobserve(ref.current)
			}
		}
	}, [])

	return { ref, isVisible }
}

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
				<a href='/add-organization'>{HERO_CONTENT.actions.addOrganization}</a>
			</Button>
			<Button
				size='lg'
				variant='outline'
				className='border-slate-400/30 bg-white/8 text-white backdrop-blur-sm transition-all hover:bg-white/14 hover:-translate-y-0.5 hover:scale-105 animate-fade-in-up animation-delay-200'
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

function HeroSection() {
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

function AboutSection() {
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
						<Sparkles className='h-4 w-4' />
						О платформе
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

function FeaturesSection() {
	const { ref, isVisible } = useScrollAnimation()

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

function HowItWorksSection() {
	const { ref, isVisible } = useScrollAnimation()

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
							<p className='text-slate-600 leading-relaxed'>{step.description}</p>
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

function StatsSection() {
	const { ref, isVisible } = useScrollAnimation()

	const stats = [
		{ value: '100+', label: 'Организаций на карте', icon: MapPin, color: 'from-blue-400 to-cyan-400' },
		{ value: '50+', label: 'Активных квестов', icon: Target, color: 'from-purple-400 to-pink-400' },
		{ value: '1000+', label: 'Активных участников', icon: Users, color: 'from-green-400 to-emerald-400' },
		{ value: '24/7', label: 'Доступность платформы', icon: CheckCircle2, color: 'from-yellow-400 to-amber-400' },
	]

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
								<div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
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

function CTASection() {
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
						<a href='/map'>
							Смотреть карту
							<ArrowRight className='ml-2 h-5 w-5' />
						</a>
					</Button>
					<Button
						size='lg'
						variant='outline'
						className='border-slate-400/30 bg-white/8 text-white backdrop-blur-sm transition-all hover:bg-white/14 hover:scale-105'
						asChild
					>
						<a href='/registartion'>Зарегистрироваться</a>
					</Button>
				</div>
			</div>
		</section>
	)
}

export default function HomePage() {
	return (
		<main className='min-h-screen'>
			<style>{`
				@keyframes fade-in {
					from {
						opacity: 0;
					}
					to {
						opacity: 1;
					}
				}

				@keyframes fade-in-up {
					from {
						opacity: 0;
						transform: translateY(20px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}

				.animate-fade-in {
					animation: fade-in 0.8s ease-out forwards;
				}

				.animate-fade-in-up {
					animation: fade-in-up 0.8s ease-out forwards;
				}

				.animation-delay-200 {
					animation-delay: 200ms;
				}

				.animation-delay-300 {
					animation-delay: 300ms;
				}

				.animation-delay-500 {
					animation-delay: 500ms;
				}

				.animation-delay-1000 {
					animation-delay: 1000ms;
				}
			`}</style>
			<HeroSection />
			<AboutSection />
			<FeaturesSection />
			<HowItWorksSection />
			<StatsSection />
			<CTASection />
		</main>
	)
}
