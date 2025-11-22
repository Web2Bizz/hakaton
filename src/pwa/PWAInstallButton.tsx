import { logger } from '@/utils/logger'
import React from 'react'
import { usePWA } from './PWAContext'

interface PWAInstallButtonProps {
	className?: string
	style?: React.CSSProperties
	variant?: 'default' | 'minimal' | 'floating'
	children?: React.ReactNode
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
	className = '',
	style,
	variant = 'floating',
	children,
}) => {
	const { installPrompt, isInstalled, setInstallPrompt } = usePWA()

	const handleInstall = async (): Promise<void> => {
		if (!installPrompt) return

		try {
			installPrompt.prompt()
			const { outcome } = await installPrompt.userChoice

			if (outcome === 'accepted') {
				logger.info('Пользователь принял установку')
				setInstallPrompt(null)
			} else {
				logger.info('Пользователь отклонил установку')
			}
		} catch (error) {
			logger.error('Ошибка при установке:', error)
		}
	}

	// Не показываем кнопку если приложение уже установлено или нет промпта
	if (isInstalled || !installPrompt) {
		return null
	}

	const baseStyles: React.CSSProperties = {
		backgroundColor: '#0066cc',
		color: 'white',
		border: 'none',
		borderRadius: '8px',
		cursor: 'pointer',
		fontSize: '14px',
		fontWeight: 'bold',
		transition: 'all 0.3s ease',
		display: 'flex',
		alignItems: 'center',
		gap: '8px',
		...style,
	}

	const variantStyles: Record<
		'default' | 'minimal' | 'floating',
		React.CSSProperties
	> = {
		default: {
			padding: '12px 24px',
			margin: '10px 0',
		},
		minimal: {
			padding: '8px 16px',
			fontSize: '12px',
		},
		floating: {
			position: 'fixed',
			bottom: '20px',
			right: '20px',
			padding: '12px 24px',
			zIndex: 1000,
			boxShadow: '0 4px 12px rgba(0, 102, 204, 0.3)',
		},
	}

	const buttonStyle: React.CSSProperties = {
		...baseStyles,
		...variantStyles[variant],
	}

	return (
		<button
			onClick={handleInstall}
			className={`pwa-install-button ${className}`}
			style={buttonStyle}
			onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>): void => {
				e.currentTarget.style.backgroundColor = '#0052a3'
				e.currentTarget.style.transform = 'translateY(-2px)'
			}}
			onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>): void => {
				e.currentTarget.style.backgroundColor = '#0066cc'
				e.currentTarget.style.transform = 'translateY(0)'
			}}
		>
			<span>📱</span>
			{children || 'Установить АТОМ ДОБРО'}
		</button>
	)
}
