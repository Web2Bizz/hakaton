import { Button } from '@/components/ui/button'
import { useNotifications } from '@/hooks/useNotifications'
import type { Notification } from '@/types/notifications'
import { formatShortDate } from '@/utils/format'
import { Bell, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export function NotificationBell() {
	const {
		notifications,
		unreadCount,
		markAsRead,
		markAllAsRead,
		clearNotification,
	} = useNotifications()
	const [isOpen, setIsOpen] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const handleNotificationClick = (notification: Notification) => {
		markAsRead(notification.id)
		if (notification.actionUrl) {
			// Используем setTimeout для избежания прямого изменения window.location в обработчике
			setTimeout(() => {
				window.location.href = notification.actionUrl!
			}, 0)
		}
	}

	const getNotificationIcon = (type: string) => {
		switch (type) {
			case 'quest_completed':
				return '🎉'
			case 'stage_completed':
				return '✅'
			case 'achievement_unlocked':
				return '🏆'
			case 'donation_received':
				return '💰'
			case 'volunteer_registered':
				return '👷'
			case 'quest_update':
				return '📢'
			case 'milestone_reached':
				return '🎯'
			default:
				return '🔔'
		}
	}

	return (
		<div className='relative' ref={dropdownRef}>
			<button
				type='button'
				onClick={() => setIsOpen(!isOpen)}
				className='relative p-2 rounded-full hover:bg-slate-100 transition-colors'
			>
				<Bell className='h-5 w-5 text-slate-700' />
				{unreadCount > 0 && (
					<span className='absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white'>
						{unreadCount > 9 ? '9+' : unreadCount}
					</span>
				)}
			</button>

			{isOpen && (
				<div className='absolute -right-12 top-12 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-slate-200 z-[3000] max-h-[600px] overflow-hidden flex flex-col'>
					<div className='p-4 border-b border-slate-200 flex items-center justify-between'>
						<h3 className='font-semibold text-slate-900'>Уведомления</h3>
						{unreadCount > 0 && (
							<Button
								variant='ghost'
								size='sm'
								onClick={markAllAsRead}
								className='text-xs'
								type='button'
							>
								Отметить все как прочитанные
							</Button>
						)}
					</div>

					<div className='overflow-y-auto flex-1'>
						{notifications.length === 0 ? (
							<div className='p-8 text-center text-slate-500'>
								<Bell className='h-12 w-12 mx-auto mb-3 text-slate-300' />
								<p>Нет уведомлений</p>
							</div>
						) : (
							<div className='divide-y divide-slate-100'>
								{notifications.map((notification: Notification) => (
									<button
										key={notification.id}
										type='button'
										className={`w-full text-left p-4 hover:bg-slate-50 transition-colors cursor-pointer ${
											notification.read ? '' : 'bg-blue-50/50'
										}`}
										onClick={() => handleNotificationClick(notification)}
									>
										<div className='flex items-start gap-3'>
											<div className='text-2xl shrink-0'>
												{notification.icon ||
													getNotificationIcon(notification.type)}
											</div>
											<div className='flex-1 min-w-0'>
												<div className='flex items-start justify-between gap-2 mb-1'>
													<h4 className='font-semibold text-slate-900 text-sm'>
														{notification.title}
													</h4>
													{!notification.read && (
														<div className='w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1' />
													)}
												</div>
												<p className='text-sm text-slate-600 mb-2'>
													{notification.message}
												</p>
												<p className='text-xs text-slate-400'>
													{formatShortDate(notification.createdAt)}
												</p>
											</div>
											<button
												type='button'
												onClick={e => {
													e.stopPropagation()
													clearNotification(notification.id)
												}}
												className='shrink-0 p-1 rounded hover:bg-slate-200 transition-colors'
											>
												<X className='h-3 w-3 text-slate-400' />
											</button>
										</div>
									</button>
								))}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	)
}
