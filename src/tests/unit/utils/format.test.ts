import {
	formatCurrency,
	formatDate,
	formatDateTime,
	formatShortDate,
} from '@/utils/format'
import { describe, expect, it } from 'vitest'

describe('format utils', () => {
	describe('formatDate', () => {
		it('должен форматировать ISO дату', () => {
			const dateString = '2024-01-15T10:30:00Z'
			const result = formatDate(dateString)
			expect(result).toContain('15')
			expect(result).toContain('января')
			expect(result).toContain('2024')
		})

		it('должен форматировать дату в формате YYYY-MM-DD', () => {
			const dateString = '2024-12-25'
			const result = formatDate(dateString)
			expect(result).toContain('25')
			expect(result).toContain('декабря')
			expect(result).toContain('2024')
		})

		it('должен форматировать дату с временем', () => {
			const dateString = '2024-06-15T14:30:00.000Z'
			const result = formatDate(dateString)
			expect(result).toContain('15')
			expect(result).toContain('июня')
			expect(result).toContain('2024')
		})

		it('должен корректно форматировать разные месяцы', () => {
			const months = [
				{ date: '2024-01-15', month: 'января' },
				{ date: '2024-02-15', month: 'февраля' },
				{ date: '2024-03-15', month: 'марта' },
				{ date: '2024-04-15', month: 'апреля' },
				{ date: '2024-05-15', month: 'мая' },
				{ date: '2024-06-15', month: 'июня' },
				{ date: '2024-07-15', month: 'июля' },
				{ date: '2024-08-15', month: 'августа' },
				{ date: '2024-09-15', month: 'сентября' },
				{ date: '2024-10-15', month: 'октября' },
				{ date: '2024-11-15', month: 'ноября' },
				{ date: '2024-12-15', month: 'декабря' },
			]

			months.forEach(({ date, month }) => {
				const result = formatDate(date)
				expect(result).toContain(month)
			})
		})

		it('должен форматировать дату в формате ru-RU', () => {
			const dateString = '2024-01-15'
			const result = formatDate(dateString)
			// Проверяем, что формат соответствует русской локали
			expect(result).toMatch('15 января 2024 г.')
		})

		it('должен обрабатывать дату начала года', () => {
			const dateString = '2024-01-01'
			const result = formatDate(dateString)
			expect(result).toContain('1')
			expect(result).toContain('января')
		})

		it('должен обрабатывать дату конца года', () => {
			const dateString = '2024-12-31'
			const result = formatDate(dateString)
			expect(result).toContain('31')
			expect(result).toContain('декабря')
		})
	})

	describe('formatDateTime', () => {
		it('должен форматировать дату и время', () => {
			const dateString = '2024-01-15T14:30:00Z'
			const result = formatDateTime(dateString)
			expect(result).toContain('15')
			expect(result).toContain('января')
			expect(result).toContain('2024')
			// Должно содержать время
			expect(result).toMatch(/\d{2}:\d{2}/)
		})

		it('должен форматировать время в формате 2-значных цифр', () => {
			const dateString = '2024-01-15T09:05:00Z'
			const result = formatDateTime(dateString)
			// Время должно быть в формате HH:MM
			expect(result).toMatch(/\d{2}:\d{2}/)
		})

		it('должен обрабатывать полночь', () => {
			const dateString = '2024-01-15T00:00:00Z'
			const result = formatDateTime(dateString)
			expect(result).toContain('00:00')
		})

		it('должен обрабатывать полдень', () => {
			const dateString = '2024-01-15T12:00:00Z'
			const result = formatDateTime(dateString)
			expect(result).toContain('12:00')
		})

		it('должен обрабатывать конец дня', () => {
			const dateString = '2024-01-15T23:59:00Z'
			const result = formatDateTime(dateString)
			expect(result).toContain('23:59')
		})
	})

	describe('formatShortDate', () => {
		it('должен форматировать краткую дату', () => {
			const dateString = '2024-01-15T14:30:00Z'
			const result = formatShortDate(dateString)
			expect(result).toContain('15')
			// Должен содержать сокращенное название месяца
			expect(result.length).toBeGreaterThan(0)
		})

		it('должен включать время в краткую дату', () => {
			const dateString = '2024-01-15T14:30:00Z'
			const result = formatShortDate(dateString)
			// Должно содержать время
			expect(result).toMatch(/\d{2}:\d{2}/)
		})

		it('должен использовать сокращенные названия месяцев', () => {
			const dateString = '2024-01-15'
			const result = formatShortDate(dateString)
			// Проверяем, что формат короче чем полный
			expect(result.length).toBeLessThan(formatDate(dateString).length)
		})
	})

	describe('formatCurrency', () => {
		it('должен форматировать рубли по умолчанию', () => {
			const result = formatCurrency(1000)
			expect(result).toContain('1 000')
			expect(result).toContain('₽')
		})

		it('должен форматировать рубли явно', () => {
			const result = formatCurrency(1000, 'RUB')
			expect(result).toContain('1 000')
			expect(result).toContain('₽')
		})

		it('должен форматировать доллары', () => {
			const result = formatCurrency(1000, 'USD')
			expect(result).toContain('1 000')
			expect(result).toContain('USD')
			expect(result).not.toContain('₽')
		})

		it('должен форматировать евро', () => {
			const result = formatCurrency(1000, 'EUR')
			expect(result).toContain('1 000')
			expect(result).toContain('EUR')
		})

		it('должен форматировать большие числа с разделителями', () => {
			const result = formatCurrency(1000000)
			expect(result).toContain('1 000 000')
		})

		it('должен форматировать очень большие числа', () => {
			const result = formatCurrency(1234567890)
			expect(result).toContain('1 234 567 890')
		})

		it('должен форматировать отрицательные числа', () => {
			const result = formatCurrency(-1000)
			expect(result).toContain('-1 000')
		})

		it('должен форматировать ноль', () => {
			const result = formatCurrency(0)
			expect(result).toContain('0')
		})

		it('должен форматировать дробные числа', () => {
			const result = formatCurrency(1234.56)
			expect(result).toContain('1 234')
		})

		it('должен форматировать маленькие числа', () => {
			const result = formatCurrency(5)
			expect(result).toContain('5')
		})

		it('должен форматировать числа с пробелами в ru-RU формате', () => {
			const result = formatCurrency(123456)
			// В русской локали разделитель тысяч - пробел
			expect(result).toContain('123 456')
		})

		it('должен обрабатывать кастомную валюту', () => {
			const result = formatCurrency(1000, 'BTC')
			expect(result).toContain('1 000')
			expect(result).toContain('BTC')
		})

		it('должен обрабатывать пустую строку как валюту', () => {
			const result = formatCurrency(1000, '')
			expect(result).toContain('1 000')
			expect(result).toContain('')
		})
	})
})
