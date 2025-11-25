import React, {
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
	type ReactNode,
} from 'react'
import { toast } from 'sonner'
import type { BeforeInstallPromptEvent, InstallPrompt } from './types/pwa'

interface PWAContextType {
	isInstalled: boolean
	isOffline: boolean
	registration: ServiceWorkerRegistration | null
	installPrompt: InstallPrompt
	setInstallPrompt: (prompt: InstallPrompt) => void
}

const PWAContext = createContext<PWAContextType | undefined>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
export const usePWA = () => {
	const context = useContext(PWAContext)
	if (context === undefined) {
		throw new Error('usePWA must be used within a PWAProvider')
	}
	return context
}

interface PWAProviderProps {
	children: ReactNode
}

export const PWAProvider: React.FC<PWAProviderProps> = ({ children }) => {
	const [isInstalled, setIsInstalled] = useState<boolean>(false)
	const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine)
	const [registration] =
		useState<ServiceWorkerRegistration | null>(null)
	const [installPrompt, setInstallPrompt] = useState<InstallPrompt>(null)
	const prevIsOfflineRef = useRef<boolean>(!navigator.onLine)

	useEffect(() => {
		const checkInstalled = (): void => {
			if (window.matchMedia('(display-mode: standalone)').matches) {
				setIsInstalled(true)
			}
		}

		checkInstalled()

		const handleAppInstalled = (): void => {
			setIsInstalled(true)
			setInstallPrompt(null)
		}

		// Отслеживание онлайн/оффлайн статуса
		const handleOnline = (): void => {
			setIsOffline(false)
		}
		const handleOffline = (): void => {
			setIsOffline(true)
		}

		window.addEventListener('appinstalled', handleAppInstalled)
		window.addEventListener('online', handleOnline)
		window.addEventListener('offline', handleOffline)

		return () => {
			window.removeEventListener('appinstalled', handleAppInstalled)
			window.removeEventListener('online', handleOnline)
			window.removeEventListener('offline', handleOffline)
		}
	}, [])

	useEffect(() => {
		if (prevIsOfflineRef.current === isOffline) {
			return
		}

		if (isOffline && !prevIsOfflineRef.current) {
			toast.warning('Вы в офлайн-режиме', {
				description: 'Некоторые функции могут быть недоступны',
				duration: 5000,
			})
		}

		if (!isOffline && prevIsOfflineRef.current) {
			toast.success('Соединение восстановлено', {
				description: 'Вы снова в сети',
				duration: 3000,
			})
		}

		prevIsOfflineRef.current = isOffline
	}, [isOffline])

	// Обработчик beforeinstallprompt
	useEffect(() => {
		const handler = (e: BeforeInstallPromptEvent): void => {
			e.preventDefault()
			setInstallPrompt(e)
		}

		window.addEventListener('beforeinstallprompt', handler as EventListener)

		return () => {
			window.removeEventListener(
				'beforeinstallprompt',
				handler as EventListener
			)
		}
	}, [])

	const value: PWAContextType = {
		isInstalled,
		isOffline,
		registration,
		installPrompt,
		setInstallPrompt,
	}

	return <PWAContext.Provider value={value}>{children}</PWAContext.Provider>
}
