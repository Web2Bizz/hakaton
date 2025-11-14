type Page = 'home' | 'map' | 'add'

export function HomePage({ onNavigate }: { onNavigate: (page: Page) => void }) {
	return (
		<header className='hero'>
			<div className='hero-content'>
				<div className='hero-badge'>ATOM ДОБРО</div>
				<h1>Карта добрых дел атомных городов</h1>
				<p>
					Узнайте, как волонтерские организации помогают жителям, природе и
					сообществам. Выберите город, направление и вид помощи, чтобы
					присоединиться к инициативам или поддержать их ресурсами.
				</p>
				<div className='hero-actions'>
					<button
						className='primary-button'
						onClick={() => onNavigate('add')}
						type='button'
					>
						Добавить точку
					</button>
					<button
						className='ghost-button'
						onClick={() => onNavigate('map')}
						type='button'
					>
						Смотреть карту
					</button>
				</div>
			</div>
			<div className='hero-figure'>
				<div className='hero-glow' />
				<div className='hero-orbits'>
					<span />
					<span />
					<span />
				</div>
			</div>
		</header>
	)
}
