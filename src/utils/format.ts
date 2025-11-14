// Утилиты для форматирования данных

export function formatDate(dateString: string): string {
	const date = new Date(dateString)
	return date.toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	})
}

export function formatDateTime(dateString: string): string {
	const date = new Date(dateString)
	return date.toLocaleString('ru-RU', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})
}

export function formatShortDate(dateString: string): string {
	const date = new Date(dateString)
	return date.toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit',
	})
}

export function formatCurrency(amount: number, currency: string = 'RUB'): string {
	return `${amount.toLocaleString('ru-RU')} ${currency === 'RUB' ? '₽' : currency}`
}

