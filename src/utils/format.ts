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
		timeZone: 'UTC',
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
	// Заменяем неразрывные пробелы на обычные для совместимости с тестами
	const formattedAmount = amount.toLocaleString('ru-RU').replace(/\u00A0/g, ' ')
	return `${formattedAmount} ${currency === 'RUB' ? '₽' : currency}`
}

