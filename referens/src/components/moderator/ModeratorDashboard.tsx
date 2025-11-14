import { useMemo } from 'react'
import { organizations } from '../../data/organizations'
import { mockPendingApplications } from '../../data/moderation'

export function ModeratorDashboard() {
	const stats = useMemo(() => {
		const totalOrgs = organizations.length
		const pendingApps = mockPendingApplications.filter(
			app => app.status === 'pending'
		).length
		const approvedToday = mockPendingApplications.filter(
			app =>
				app.status === 'approved' &&
				app.reviewedAt &&
				new Date(app.reviewedAt).toDateString() === new Date().toDateString()
		).length
		const citiesCount = new Set(organizations.map(org => org.city)).size

		return {
			totalOrgs,
			pendingApps,
			approvedToday,
			citiesCount,
		}
	}, [])

	const recentActivity = useMemo(() => {
		return mockPendingApplications
			.filter(app => app.reviewedAt)
			.sort(
				(a, b) =>
					new Date(b.reviewedAt!).getTime() -
					new Date(a.reviewedAt!).getTime()
			)
			.slice(0, 5)
	}, [])

	return (
		<div className='moderator-dashboard'>
			<header className='dashboard-header'>
				<h1>Дашборд модератора</h1>
				<p>Обзор системы и последние действия</p>
			</header>

			<div className='stats-grid'>
				<div className='stat-card'>
					<div className='stat-icon'>🏢</div>
					<div className='stat-content'>
						<div className='stat-value'>{stats.totalOrgs}</div>
						<div className='stat-label'>Организаций на карте</div>
					</div>
				</div>

				<div className='stat-card warning'>
					<div className='stat-icon'>⏳</div>
					<div className='stat-content'>
						<div className='stat-value'>{stats.pendingApps}</div>
						<div className='stat-label'>Заявок на модерацию</div>
					</div>
				</div>

				<div className='stat-card success'>
					<div className='stat-icon'>✅</div>
					<div className='stat-content'>
						<div className='stat-value'>{stats.approvedToday}</div>
						<div className='stat-label'>Одобрено сегодня</div>
					</div>
				</div>

				<div className='stat-card'>
					<div className='stat-icon'>📍</div>
					<div className='stat-content'>
						<div className='stat-value'>{stats.citiesCount}</div>
						<div className='stat-label'>Городов</div>
					</div>
				</div>
			</div>

			<div className='dashboard-sections'>
				<section className='dashboard-section'>
					<h2>Последняя активность</h2>
					<div className='activity-list'>
						{recentActivity.length > 0 ? (
							recentActivity.map(app => (
								<div key={app.id} className='activity-item'>
									<div className='activity-icon'>
										{app.status === 'approved' ? '✅' : '❌'}
									</div>
									<div className='activity-content'>
										<div className='activity-title'>
											{app.organization.name}
										</div>
										<div className='activity-meta'>
											{app.status === 'approved'
												? 'Одобрено'
												: 'Отклонено'}{' '}
											• {app.reviewedBy} •{' '}
											{new Date(app.reviewedAt!).toLocaleDateString('ru-RU', {
												day: 'numeric',
												month: 'short',
												hour: '2-digit',
												minute: '2-digit',
											})}
										</div>
									</div>
								</div>
							))
						) : (
							<div className='empty-state'>Нет недавней активности</div>
						)}
					</div>
				</section>

				<section className='dashboard-section'>
					<h2>Быстрые действия</h2>
					<div className='quick-actions'>
						<button className='action-button primary' type='button'>
							<span>📝</span>
							<span>Проверить заявки</span>
						</button>
						<button className='action-button' type='button'>
							<span>🏢</span>
							<span>Управление организациями</span>
						</button>
						<button className='action-button' type='button'>
							<span>📊</span>
							<span>Экспорт данных</span>
						</button>
					</div>
				</section>
			</div>
		</div>
	)
}

