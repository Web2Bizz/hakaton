import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { NOTIFICATION_MAX_COUNT } from '@/constants'
import type { Notification, NotificationType } from '@/types/notifications'
import { useLocalStorage } from '@/hooks/useLocalStorage'

interface NotificationContextType {
	notifications: Notification[]
	unreadCount: number
	addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void
	markAsRead: (id: string) => void
	markAllAsRead: () => void
	clearNotification: (id: string) => void
	clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
	const [notifications, setNotifications] = useLocalStorage<Notification[]>(
		'ecoquest_notifications',
		[]
	)

	const unreadCount = notifications.filter(n => !n.read).length

	const addNotification = useCallback(
		(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
			const newNotification: Notification = {
				...notification,
				id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
				read: false,
				createdAt: new Date().toISOString(),
			}

			setNotifications(prev => [newNotification, ...prev].slice(0, NOTIFICATION_MAX_COUNT))

			// Показываем браузерное уведомление (если разрешено)
			if ('Notification' in window && Notification.permission === 'granted') {
				new window.Notification(newNotification.title, {
					body: newNotification.message,
					icon: '/vite.svg',
				})
			}
		},
		[]
	)

	const markAsRead = useCallback((id: string) => {
		setNotifications(prev =>
			prev.map(n => (n.id === id ? { ...n, read: true } : n))
		)
	}, [])

	const markAllAsRead = useCallback(() => {
		setNotifications(prev => prev.map(n => ({ ...n, read: true })))
	}, [])

	const clearNotification = useCallback((id: string) => {
		setNotifications(prev => prev.filter(n => n.id !== id))
	}, [])

	const clearAll = useCallback(() => {
		setNotifications([])
	}, [])

	// Запрашиваем разрешение на уведомления при первом рендере
	useEffect(() => {
		if ('Notification' in window && Notification.permission === 'default') {
			Notification.requestPermission()
		}
	}, [])

	return (
		<NotificationContext.Provider
			value={{
				notifications,
				unreadCount,
				addNotification,
				markAsRead,
				markAllAsRead,
				clearNotification,
				clearAll,
			}}
		>
			{children}
		</NotificationContext.Provider>
	)
}

export function useNotifications() {
	const context = useContext(NotificationContext)
	if (context === undefined) {
		throw new Error('useNotifications must be used within a NotificationProvider')
	}
	return context
}

