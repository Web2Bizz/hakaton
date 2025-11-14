import { useEffect, useState } from 'react'

export const Header = () => {
	const [currentPath, setCurrentPath] = useState(
		globalThis.location?.pathname || '/'
	)

	useEffect(() => {
		const updatePath = () => {
			setCurrentPath(globalThis.location?.pathname || '/')
		}

		globalThis.addEventListener('popstate', updatePath)

		const handleClick = () => {
			setTimeout(updatePath, 100)
		}

		globalThis.addEventListener('click', handleClick, true)

		const interval = setInterval(updatePath, 200)

		return () => {
			globalThis.removeEventListener('popstate', updatePath)
			globalThis.removeEventListener('click', handleClick, true)
			clearInterval(interval)
		}
	}, [])

	const navLinks = [
		{ href: '/', label: 'Главная' },
		{ href: '/map', label: 'Карта' },
		{ href: '/add-organization', label: 'Добавить организацию' },
	]

	const isActive = (href: string) => {
		if (href === '/') {
			return currentPath === '/'
		}
		return currentPath.startsWith(href)
	}

	return (
		<nav className='fixed top-0 left-0 right-0 h-[72px] border-b border-black/8 bg-white/98 backdrop-blur-xl shadow-sm z-999'>
			<div className='mx-auto flex h-full max-w-[1400px] items-center justify-between gap-8 px-6 md:px-12'>
				<span className='text-xl font-bold tracking-tight text-slate-900'>
					АТОМ ДОБРО
				</span>

				<div className='flex items-center gap-2'>
					{navLinks.map(link => {
						const active = isActive(link.href)
						return (
							<a
								key={link.href}
								href={link.href}
								className={`relative rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
									active
										? 'bg-sky-500/12 text-sky-600 font-semibold'
										: 'text-slate-600 hover:bg-sky-500/8 hover:text-slate-900'
								}`}
							>
								{link.label}
								{active && (
									<span className='absolute -bottom-px left-1/2 h-[3px] w-6 -translate-x-1/2 rounded-t-full bg-sky-500' />
								)}
							</a>
						)
					})}
				</div>
			</div>
		</nav>
	)
}
