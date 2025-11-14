interface SidebarItem {
	id: string
	label: string
	icon: string
	count?: number
}

interface ModeratorSidebarProps {
	activeView: string
	onViewChange: (view: string) => void
	pendingCount: number
}

export function ModeratorSidebar({
	activeView,
	onViewChange,
	pendingCount,
}: ModeratorSidebarProps) {
	const menuItems: SidebarItem[] = [
		{ id: 'dashboard', label: 'Дашборд', icon: '📊' },
		{ id: 'applications', label: 'Заявки', icon: '📝', count: pendingCount },
		{ id: 'organizations', label: 'Организации', icon: '🏢' },
		{ id: 'settings', label: 'Настройки', icon: '⚙️' },
	]

	return (
		<aside className='moderator-sidebar'>
			<div className='sidebar-header'>
				<div className='sidebar-logo'>
					<span className='logo-icon'>⚛️</span>
					<div>
						<div className='logo-title'>АтомДобро</div>
						<div className='logo-subtitle'>Панель модератора</div>
					</div>
				</div>
			</div>

			<nav className='sidebar-nav'>
				{menuItems.map(item => (
					<button
						key={item.id}
						className={`nav-item ${activeView === item.id ? 'active' : ''}`}
						onClick={() => onViewChange(item.id)}
						type='button'
					>
						<span className='nav-icon'>{item.icon}</span>
						<span className='nav-label'>{item.label}</span>
						{item.count !== undefined && item.count > 0 && (
							<span className='nav-badge'>{item.count}</span>
						)}
					</button>
				))}
			</nav>

			<div className='sidebar-footer'>
				<button
					className='nav-item'
					onClick={() => onViewChange('public')}
					type='button'
				>
					<span className='nav-icon'>🌐</span>
					<span className='nav-label'>Публичный сайт</span>
				</button>
			</div>
		</aside>
	)
}

