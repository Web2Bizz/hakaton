import React from 'react'
import { usePWA } from './PWAContext'

export const PWAUpdateButton: React.FC = () => {
	const { isUpdateAvailable, registration } = usePWA()

	const handleUpdate = (): void => {
		if (registration?.waiting) {
			registration.waiting.postMessage({ type: 'SKIP_WAITING' })
			globalThis.location.reload()
		}
	}

	if (!isUpdateAvailable) {
		return null
	}

	return (
		<button
			onClick={handleUpdate}
			style={{
				position: 'fixed',
				top: '20px',
				right: '20px',
				padding: '10px 20px',
				backgroundColor: '#28a745',
				color: 'white',
				border: 'none',
				borderRadius: '6px',
				cursor: 'pointer',
				zIndex: 1000,
				fontSize: '12px',
				fontWeight: 'bold',
			}}
		>
			Обновить приложение
		</button>
	)
}
