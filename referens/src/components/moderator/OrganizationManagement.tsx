import { useMemo, useState } from 'react'
import type { Organization } from '../../data/organizations'
import { organizations } from '../../data/organizations'
import { assistanceOptions } from '../../data/organizations'

export function OrganizationManagement() {
	const [orgs] = useState<Organization[]>(organizations)
	const [search, setSearch] = useState('')
	const [filterCity, setFilterCity] = useState('')
	const [selectedOrg, setSelectedOrg] = useState<string | null>(null)

	const cities = useMemo(
		() => Array.from(new Set(orgs.map(org => org.city))).sort(),
		[orgs]
	)

	const filteredOrgs = useMemo(() => {
		return orgs.filter(org => {
			const matchesSearch = search
				? [org.name, org.city, org.type, org.summary]
						.join(' ')
						.toLowerCase()
						.includes(search.toLowerCase())
				: true
			const matchesCity = filterCity ? org.city === filterCity : true
			return matchesSearch && matchesCity
		})
	}, [orgs, search, filterCity])

	const selectedOrganization = useMemo(() => {
		return orgs.find(org => org.id === selectedOrg) || null
	}, [orgs, selectedOrg])

	const handleDelete = (id: string) => {
		if (confirm('Вы уверены, что хотите удалить эту организацию?')) {
			// В реальном приложении здесь был бы API вызов
			alert('Организация удалена (в демо-версии)')
			if (selectedOrg === id) setSelectedOrg(null)
		}
	}

	return (
		<div className='organization-management'>
			<header className='management-header'>
				<div>
					<h1>Управление организациями</h1>
					<p>Редактирование и удаление организаций на карте</p>
				</div>
			</header>

			<div className='management-filters'>
				<input
					className='search-input'
					type='search'
					placeholder='Поиск по названию, городу, типу...'
					value={search}
					onChange={e => setSearch(e.target.value)}
				/>
				<select
					className='filter-select'
					value={filterCity}
					onChange={e => setFilterCity(e.target.value)}
				>
					<option value=''>Все города</option>
					{cities.map(city => (
						<option key={city} value={city}>
							{city}
						</option>
					))}
				</select>
			</div>

			<div className='management-layout'>
				<div className='organizations-table'>
					<div className='table-header'>
						<div className='table-cell'>Название</div>
						<div className='table-cell'>Город</div>
						<div className='table-cell'>Тип</div>
						<div className='table-cell'>Действия</div>
					</div>
					{filteredOrgs.length > 0 ? (
						filteredOrgs.map(org => (
							<div
								key={org.id}
								className={`table-row ${selectedOrg === org.id ? 'selected' : ''}`}
								onClick={() => setSelectedOrg(org.id)}
							>
								<div className='table-cell'>
									<strong>{org.name}</strong>
								</div>
								<div className='table-cell'>{org.city}</div>
								<div className='table-cell'>{org.type}</div>
								<div className='table-cell'>
									<button
										className='icon-button'
										onClick={e => {
											e.stopPropagation()
											handleDelete(org.id)
										}}
										type='button'
										title='Удалить'
									>
										🗑️
									</button>
								</div>
							</div>
						))
					) : (
						<div className='empty-state'>Организации не найдены</div>
					)}
				</div>

				{selectedOrganization && (
					<div className='organization-editor'>
						<div className='editor-header'>
							<h2>Редактирование организации</h2>
							<button
								className='close-button'
								onClick={() => setSelectedOrg(null)}
								type='button'
							>
								✕
							</button>
						</div>

						<div className='editor-content'>
							<div className='form-field'>
								<label>
									<span>Название</span>
									<input type='text' value={selectedOrganization.name} readOnly />
								</label>
							</div>

							<div className='form-grid'>
								<div className='form-field'>
									<label>
										<span>Город</span>
										<input type='text' value={selectedOrganization.city} readOnly />
									</label>
								</div>
								<div className='form-field'>
									<label>
										<span>Тип</span>
										<input type='text' value={selectedOrganization.type} readOnly />
									</label>
								</div>
							</div>

							<div className='form-field'>
								<label>
									<span>Краткое описание</span>
									<textarea
										value={selectedOrganization.summary}
										readOnly
										rows={2}
									/>
								</label>
							</div>

							<div className='form-field'>
								<label>
									<span>Полное описание</span>
									<textarea
										value={selectedOrganization.description}
										readOnly
										rows={4}
									/>
								</label>
							</div>

							<div className='form-field'>
								<label>
									<span>Миссия</span>
									<textarea
										value={selectedOrganization.mission}
										readOnly
										rows={3}
									/>
								</label>
							</div>

							<div className='form-field'>
								<label>
									<span>Контакты</span>
									<div className='info-grid'>
										<span>Телефон:</span>
										<span>{selectedOrganization.contacts.phone}</span>
										{selectedOrganization.contacts.email && (
											<>
												<span>Email:</span>
												<span>{selectedOrganization.contacts.email}</span>
											</>
										)}
									</div>
								</label>
							</div>

							<div className='form-field'>
								<label>
									<span>Виды помощи</span>
									<div className='badge-list'>
										{selectedOrganization.assistance.map(id => {
											const option = assistanceOptions.find(opt => opt.id === id)
											return (
												<span key={id} className='badge'>
													{option?.label || id}
												</span>
											)
										})}
									</div>
								</label>
							</div>

							<div className='editor-actions'>
								<button className='primary-button' type='button'>
									💾 Сохранить изменения
								</button>
								<button
									className='ghost-button'
									onClick={() => handleDelete(selectedOrganization.id)}
									type='button'
								>
									🗑️ Удалить организацию
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

