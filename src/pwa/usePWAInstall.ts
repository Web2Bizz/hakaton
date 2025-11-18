import { usePWA } from './PWAContext'

interface UsePWAInstallReturn {
	canInstall: boolean
	isInstalled: boolean
	install: () => Promise<boolean>
}

export const usePWAInstall = (): UsePWAInstallReturn => {
	const { installPrompt, isInstalled, setInstallPrompt } = usePWA()

	const install = async (): Promise<boolean> => {
		if (!installPrompt) return false

		try {
			installPrompt.prompt()
			const { outcome } = await installPrompt.userChoice

			if (outcome === 'accepted') {
				setInstallPrompt(null)
				return true
			}
			return false
		} catch (error) {
			console.error('Installation error:', error)
			return false
		}
	}

	// Проверяем, является ли устройство мобильным
	const isMobile =
		/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
			navigator.userAgent
		)

	return {
		// Установка доступна только на мобильных устройствах
		canInstall: !!installPrompt && isMobile,
		isInstalled,
		install,
	}
}
