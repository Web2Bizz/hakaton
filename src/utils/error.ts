/**
 * Утилиты для обработки ошибок
 */

/**
 * Извлекает сообщение об ошибке из различных форматов ответов API
 * @param error - Ошибка любого типа
 * @param defaultMessage - Сообщение по умолчанию, если не удалось извлечь
 * @returns Сообщение об ошибке
 */
export function getErrorMessage(
	error: unknown,
	defaultMessage: string = 'Произошла ошибка'
): string {
	if (!error) {
		return defaultMessage
	}

	// Если это строка, возвращаем её
	if (typeof error === 'string') {
		return error
	}

	// Если это объект с полем message
	if (typeof error === 'object') {
		// Проверяем стандартный формат ошибки
		if ('message' in error && typeof error.message === 'string') {
			return error.message
		}

		// Проверяем формат RTK Query ошибки: { data: { message: string } }
		if ('data' in error) {
			const data = error.data
			if (
				data &&
				typeof data === 'object' &&
				'message' in data &&
				typeof data.message === 'string'
			) {
				return data.message
			}
		}

		// Проверяем формат: { error: { message: string } }
		if ('error' in error) {
			const err = error.error
			if (
				err &&
				typeof err === 'object' &&
				'message' in err &&
				typeof err.message === 'string'
			) {
				return err.message
			}
		}
	}

	return defaultMessage
}

/**
 * Проверяет, является ли ошибка объектом с данными
 */
export function isErrorWithData(
	error: unknown
): error is { data: { message?: string } } {
	return (
		error !== null &&
		typeof error === 'object' &&
		'data' in error &&
		error.data !== null &&
		typeof error.data === 'object'
	)
}

