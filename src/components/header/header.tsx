import { Button } from '@/components/ui/button'
import { useUser } from '@/hooks/useUser'
import { usePWAInstall } from '@/pwa/usePWAInstall'
import { logger } from '@/utils/logger'
import { Download, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export const Header = () => {
	const { user } = useUser()
	const { canInstall, install } = usePWAInstall()
	const location = useLocation()
	const currentPath = location.pathname
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

	// Закрываем мобильное меню при изменении пути
	useEffect(() => {
		if (isMobileMenuOpen) {
			setIsMobileMenuOpen(false)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPath])

	// Если пользователь авторизован, то добавляем ссылки на страницы для него, иначе только на главную и карту
	const navLinks = user
		? [
				{ href: '/', label: 'Главная' },
				{ href: '/map', label: 'Карта' },
				{ href: '/add-organization', label: 'Добавить точку' },
				{ href: '/profile', label: 'Профиль' },
		  ]
		: [
				{ href: '/', label: 'Главная' },
				{ href: '/map', label: 'Карта' },
		  ]

	const isActive = (href: string) => {
		if (href === '/') {
			return currentPath === '/'
		}
		return currentPath.startsWith(href)
	}

	const handleInstallClick = async (): Promise<void> => {
		const installed = await install()
		if (installed) {
			logger.info('Приложение установлено!')
		}
	}

	return (
		<>
			<nav className='fixed top-0 left-0 right-0 h-[72px] border-b border-black/8 bg-white/98 backdrop-blur-xl shadow-sm z-40'>
				<div className='flex h-full  items-center justify-between gap-4 px-4 sm:px-6 md:px-12'>
					{/* Логотип */}
					<Link to='/' className='shrink-0'>
						<img src='/logo.png' alt='Росатом - добро' className='h-20' />
					</Link>

					{/* Десктопная навигация */}
					<div className='hidden lg:flex items-center gap-4'>
						<div className='flex items-center gap-2'>
							{navLinks.map(link => {
								const active = isActive(link.href)
								return (
									<Link
										key={link.href}
										to={link.href}
										className={`relative rounded-xl px-4 xl:px-5 py-2.5 text-sm font-medium transition-all ${
											active
												? 'bg-sky-500/12 text-sky-600 font-semibold'
												: 'text-slate-600 hover:bg-sky-500/8 hover:text-slate-900'
										}`}
									>
										{link.label}
										{active && (
											<span className='absolute -bottom-px left-1/2 h-[3px] w-6 -translate-x-1/2 rounded-t-full bg-sky-500' />
										)}
									</Link>
								)
							})}
						</div>
						<div className='flex items-center gap-2'>
							{canInstall && (
								<Button
									onClick={handleInstallClick}
									variant='outline'
									size='sm'
									className='gap-2'
								>
									<Download className='h-4 w-4' />
									Установить
								</Button>
							)}
							{!user && (
								<Button asChild variant='outline' size='sm'>
									<Link to='/login'>Войти</Link>
								</Button>
							)}
						</div>
					</div>

					{/* Мобильная кнопка меню */}
					<div className='flex lg:hidden items-center gap-2'>
						<button
							type='button'
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
							className='p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors'
							aria-label='Открыть меню'
						>
							{isMobileMenuOpen ? (
								<X className='h-6 w-6' />
							) : (
								<Menu className='h-6 w-6' />
							)}
						</button>
					</div>
				</div>
			</nav>

			{/* Мобильное меню */}
			{isMobileMenuOpen && (
				<div className='fixed top-[72px] left-0 right-0 bg-white border-b border-black/8 shadow-lg z-40 lg:hidden'>
					<div className='max-w-[1400px] mx-auto px-4 py-4'>
						<nav className='flex flex-col gap-2'>
							{navLinks.map(link => {
								const active = isActive(link.href)
								return (
									<Link
										key={link.href}
										to={link.href}
										className={`rounded-xl px-4 py-3 text-base font-medium transition-all ${
											active
												? 'bg-sky-500/12 text-sky-600 font-semibold'
												: 'text-slate-600 hover:bg-sky-500/8 hover:text-slate-900'
										}`}
									>
										{link.label}
									</Link>
								)
							})}
							{canInstall && (
								<Button
									onClick={handleInstallClick}
									variant='outline'
									className='w-full gap-2'
								>
									<Download className='h-4 w-4' />
									Установить приложение
								</Button>
							)}
							{!user && (
								<div className='pt-2 border-t border-slate-200 mt-2'>
									<Button asChild variant='outline' className='w-full'>
										<Link to='/login'>Войти</Link>
									</Button>
								</div>
							)}
						</nav>
					</div>
				</div>
			)}
		</>
	)
}
