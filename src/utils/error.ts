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
	// Если это строка, возвращаем её (включая пустую строку)
	if (typeof error === 'string') {
		return error
	}

	if (!error) {
		return defaultMessage
	}

	// Если это объект с полем message
	if (typeof error === 'object') {
		// Проверяем стандартный формат ошибки: { message: string }
		// ВАЖНО: Проверяем message ПЕРВЫМ, так как он имеет приоритет
		if ('message' in error && typeof error.message === 'string') {
			return error.message
		}

		// Проверяем формат RTK Query ошибки: { status: 401, data: { message: string } }
		if ('data' in error) {
			const data = error.data
			
			// Если data - это объект, проверяем message
			if (data && typeof data === 'object') {
				// Проверяем data.message
				if ('message' in data && typeof data.message === 'string') {
					return data.message
				}
				
				// Проверяем data.error (альтернативный формат)
				if ('error' in data && typeof data.error === 'string') {
					return data.error
				}
			}
			// Если data - это не объект (например, строка), игнорируем его
		}

		// Проверяем формат: { error: { message: string } }
		if ('error' in error) {
			const err = error.error
			// Если error - это объект, проверяем message
			if (
				err &&
				typeof err === 'object' &&
				'message' in err &&
				typeof err.message === 'string'
			) {
				return err.message
			}
			// Если error - это не объект (например, строка), игнорируем его
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

