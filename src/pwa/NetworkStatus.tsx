import React from 'react'
import { usePWA } from './PWAContext'

export const NetworkStatus: React.FC = () => {
	const { isOffline } = usePWA()

	if (!isOffline) {
		return null
	}

	return (
		<div
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				backgroundColor: '#ffc107',
				color: '#856404',
				padding: '8px',
				textAlign: 'center',
				fontSize: '14px',
				fontWeight: 'bold',
				zIndex: 1001,
			}}
		>
			Вы в оффлайн-режиме. Некоторые функции могут быть недоступны.
		</div>
	)
}
