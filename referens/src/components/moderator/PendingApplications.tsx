import { useMemo, useState } from 'react'
import type { PendingApplication } from '../../data/moderation'
import { mockPendingApplications } from '../../data/moderation'
import { assistanceOptions } from '../../data/organizations'

interface PendingApplicationsProps {
	onApplicationUpdate: () => void
}

export function PendingApplications({
	onApplicationUpdate,
}: PendingApplicationsProps) {
	const [applications, setApplications] =
		useState<PendingApplication[]>(mockPendingApplications)
	const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>(
		'all'
	)
	const [selectedApp, setSelectedApp] = useState<string | null>(null)
	const [rejectionReason, setRejectionReason] = useState('')

	const filteredApplications = useMemo(() => {
		if (filter === 'all') return applications
		return applications.filter(app => app.status === filter)
	}, [applications, filter])

	const selectedApplication = useMemo(() => {
		return applications.find(app => app.id === selectedApp) || null
	}, [applications, selectedApp])

	const handleApprove = (id: string) => {
		setApplications(prev =>
			prev.map(app =>
				app.id === id
					? {
							...app,
							status: 'approved' as const,
							reviewedBy: 'Текущий модератор',
							reviewedAt: new Date().toISOString(),
						}
					: app
			)
		)
		onApplicationUpdate()
		if (selectedApp === id) setSelectedApp(null)
	}

	const handleReject = (id: string) => {
		if (!rejectionReason.trim()) {
			alert('Укажите причину отклонения')
			return
		}
		setApplications(prev =>
			prev.map(app =>
				app.id === id
					? {
							...app,
							status: 'rejected' as const,
							rejectionReason: rejectionReason,
							reviewedBy: 'Текущий модератор',
							reviewedAt: new Date().toISOString(),
						}
					: app
			)
		)
		setRejectionReason('')
		onApplicationUpdate()
		if (selectedApp === id) setSelectedApp(null)
	}

	const assistanceLabels = assistanceOptions.reduce<Record<string, string>>(
		(acc, option) => {
			acc[option.id] = option.label
			return acc
		},
		{}
	)

	return (
		<div className='pending-applications'>
			<header className='applications-header'>
				<div>
					<h1>Модерация заявок</h1>
					<p>Проверка и одобрение новых организаций</p>
				</div>
				<div className='filter-tabs'>
					{[
						{ id: 'all', label: 'Все' },
						{ id: 'pending', label: 'На проверке' },
						{ id: 'approved', label: 'Одобренные' },
						{ id: 'rejected', label: 'Отклоненные' },
					].map(tab => (
						<button
							key={tab.id}
							className={`filter-tab ${filter === tab.id ? 'active' : ''}`}
							onClick={() => setFilter(tab.id as typeof filter)}
							type='button'
						>
							{tab.label}
							{tab.id === 'pending' &&
								applications.filter(app => app.status === 'pending').length >
									0 && (
									<span className='tab-badge'>
										{applications.filter(app => app.status === 'pending').length}
									</span>
								)}
						</button>
					))}
				</div>
			</header>

			<div className='applications-layout'>
				<div className='applications-list'>
					{filteredApplications.length > 0 ? (
						filteredApplications.map(app => (
							<div
								key={app.id}
								className={`application-card ${app.status} ${
									selectedApp === app.id ? 'selected' : ''
								}`}
								onClick={() => setSelectedApp(app.id)}
							>
								<div className='card-status'>
									<span
										className={`status-badge ${app.status}`}
									>
										{app.status === 'pending'
											? 'На проверке'
											: app.status === 'approved'
												? 'Одобрено'
												: 'Отклонено'}
									</span>
									<span className='card-date'>
										{new Date(app.submittedAt).toLocaleDateString('ru-RU', {
											day: 'numeric',
											month: 'short',
										})}
									</span>
								</div>
								<h3>{app.organization.name}</h3>
								<p className='card-city'>{app.organization.city}</p>
								<p className='card-summary'>{app.organization.summary}</p>
								<div className='card-submitter'>
									<strong>Заявитель:</strong> {app.submittedBy.name}
								</div>
							</div>
						))
					) : (
						<div className='empty-state'>Заявки не найдены</div>
					)}
				</div>

				{selectedApplication && (
					<div className='application-details'>
						<div className='details-header'>
							<h2>{selectedApplication.organization.name}</h2>
							<button
								className='close-button'
								onClick={() => setSelectedApp(null)}
								type='button'
							>
								✕
							</button>
						</div>

						<div className='details-content'>
							<div className='details-section'>
								<h3>Информация о заявителе</h3>
								<div className='info-grid'>
									<span>Имя:</span>
									<span>{selectedApplication.submittedBy.name}</span>
									<span>Email:</span>
									<a href={`mailto:${selectedApplication.submittedBy.email}`}>
										{selectedApplication.submittedBy.email}
									</a>
									<span>Телефон:</span>
									<a href={`tel:${selectedApplication.submittedBy.phone}`}>
										{selectedApplication.submittedBy.phone}
									</a>
									<span>Дата подачи:</span>
									<span>
										{new Date(selectedApplication.submittedAt).toLocaleString(
											'ru-RU'
										)}
									</span>
								</div>
							</div>

							<div className='details-section'>
								<h3>Организация</h3>
								<div className='info-grid'>
									<span>Название:</span>
									<span>{selectedApplication.organization.name}</span>
									<span>Город:</span>
									<span>{selectedApplication.organization.city}</span>
									<span>Направление:</span>
									<span>{selectedApplication.organization.type}</span>
									<span>Адрес:</span>
									<span>{selectedApplication.organization.address}</span>
									<span>Телефон:</span>
									<a
										href={`tel:${selectedApplication.organization.contacts.phone}`}
									>
										{selectedApplication.organization.contacts.phone}
									</a>
									{selectedApplication.organization.contacts.email && (
										<>
											<span>Email:</span>
											<a
												href={`mailto:${selectedApplication.organization.contacts.email}`}
											>
												{selectedApplication.organization.contacts.email}
											</a>
										</>
									)}
								</div>
							</div>

							<div className='details-section'>
								<h3>Описание</h3>
								<p>{selectedApplication.organization.description}</p>
							</div>

							<div className='details-section'>
								<h3>Миссия</h3>
								<p>{selectedApplication.organization.mission}</p>
							</div>

							<div className='details-section'>
								<h3>Цели</h3>
								<ul>
									{selectedApplication.organization.goals.map((goal, idx) => (
										<li key={idx}>{goal}</li>
									))}
								</ul>
							</div>

							<div className='details-section'>
								<h3>Актуальные нужды</h3>
								<ul>
									{selectedApplication.organization.needs.map((need, idx) => (
										<li key={idx}>{need}</li>
									))}
								</ul>
							</div>

							<div className='details-section'>
								<h3>Виды помощи</h3>
								<div className='badge-list'>
									{selectedApplication.organization.assistance.map(id => (
										<span key={id} className='badge'>
											{assistanceLabels[id] || id}
										</span>
									))}
								</div>
							</div>

							{selectedApplication.status === 'rejected' &&
								selectedApplication.rejectionReason && (
									<div className='details-section warning'>
										<h3>Причина отклонения</h3>
										<p>{selectedApplication.rejectionReason}</p>
									</div>
								)}

							{selectedApplication.status === 'pending' && (
								<div className='moderation-actions'>
									<div className='form-field'>
										<label>
											<span>Причина отклонения (если отклоняете)</span>
											<textarea
												value={rejectionReason}
												onChange={e => setRejectionReason(e.target.value)}
												placeholder='Укажите причину отклонения заявки...'
												rows={3}
											/>
										</label>
									</div>
									<div className='action-buttons'>
										<button
											className='approve-button'
											onClick={() => handleApprove(selectedApplication.id)}
											type='button'
										>
											✅ Одобрить
										</button>
										<button
											className='reject-button'
											onClick={() => handleReject(selectedApplication.id)}
											type='button'
										>
											❌ Отклонить
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

