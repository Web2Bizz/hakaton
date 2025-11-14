import { useState } from 'react'

export function ModeratorSettings() {
	const [settings, setSettings] = useState({
		emailNotifications: true,
		approvalRequired: true,
		autoApprove: false,
		moderationDelay: '24',
		rejectionEmailTemplate: 'Ваша заявка была отклонена по следующей причине: {reason}',
	})

	return (
		<div className='moderator-settings'>
			<header className='settings-header'>
				<h1>Настройки системы</h1>
				<p>Управление параметрами модерации и уведомлений</p>
			</header>

			<div className='settings-content'>
				<section className='settings-section'>
					<h2>Уведомления</h2>
					<div className='settings-group'>
						<label className='switch-field'>
							<input
								type='checkbox'
								checked={settings.emailNotifications}
								onChange={e =>
									setSettings(prev => ({
										...prev,
										emailNotifications: e.target.checked,
									}))
								}
							/>
							<span>Email-уведомления о новых заявках</span>
						</label>
					</div>
				</section>

				<section className='settings-section'>
					<h2>Модерация</h2>
					<div className='settings-group'>
						<label className='switch-field'>
							<input
								type='checkbox'
								checked={settings.approvalRequired}
								onChange={e =>
									setSettings(prev => ({
										...prev,
										approvalRequired: e.target.checked,
									}))
								}
							/>
							<span>Требовать одобрения перед публикацией</span>
						</label>

						<label className='switch-field'>
							<input
								type='checkbox'
								checked={settings.autoApprove}
								onChange={e =>
									setSettings(prev => ({
										...prev,
										autoApprove: e.target.checked,
									}))
								}
								disabled={settings.approvalRequired}
							/>
							<span>Автоматическое одобрение проверенных организаций</span>
						</label>

						<label className='form-field'>
							<span>Задержка перед публикацией (часы)</span>
							<input
								type='number'
								value={settings.moderationDelay}
								onChange={e =>
									setSettings(prev => ({
										...prev,
										moderationDelay: e.target.value,
									}))
								}
								min='0'
								max='168'
							/>
						</label>
					</div>
				</section>

				<section className='settings-section'>
					<h2>Шаблоны писем</h2>
					<div className='settings-group'>
						<label className='form-field'>
							<span>Шаблон письма об отклонении</span>
							<textarea
								value={settings.rejectionEmailTemplate}
								onChange={e =>
									setSettings(prev => ({
										...prev,
										rejectionEmailTemplate: e.target.value,
									}))
								}
								rows={4}
								placeholder='Текст письма...'
							/>
							<small>Используйте {'{reason}'} для подстановки причины отклонения</small>
						</label>
					</div>
				</section>

				<section className='settings-section'>
					<h2>Экспорт данных</h2>
					<div className='settings-group'>
						<button className='primary-button' type='button'>
							📥 Экспортировать все организации (CSV)
						</button>
						<button className='ghost-button' type='button'>
							📥 Экспортировать статистику (JSON)
						</button>
					</div>
				</section>

				<div className='settings-actions'>
					<button className='primary-button' type='button'>
						💾 Сохранить настройки
					</button>
					<button className='ghost-button' type='button'>
						↺ Сбросить к значениям по умолчанию
					</button>
				</div>
			</div>
		</div>
	)
}

