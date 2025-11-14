type Page = 'home' | 'map' | 'add'

interface NavigationProps {
	currentPage: Page
	onNavigate: (page: Page) => void
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
	return (
		<nav className='main-navigation'>
			<div className='nav-container'>
				<div className='nav-logo' onClick={() => onNavigate('home')}>
					<span className='logo-icon'>⚛️</span>
					<span className='logo-text'>АтомДобро</span>
				</div>

				<div className='nav-links'>
					<button
						className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
						onClick={() => onNavigate('home')}
						type='button'
					>
						Главная
					</button>
					<button
						className={`nav-link ${currentPage === 'map' ? 'active' : ''}`}
						onClick={() => onNavigate('map')}
						type='button'
					>
						Карта
					</button>
					<button
						className={`nav-link ${currentPage === 'add' ? 'active' : ''}`}
						onClick={() => onNavigate('add')}
						type='button'
					>
						Добавить организацию
					</button>
				</div>
			</div>
		</nav>
	)
}

