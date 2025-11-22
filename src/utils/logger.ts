/**
 * Утилита для логирования с проверкой окружения
 * В production режиме логи не выводятся (кроме ошибок)
 */

class Logger {
	private readonly isDev = import.meta.env.DEV

	log(...args: unknown[]): void {
		if (this.isDev) {
			console.log(...args)
		}
	}

	info(...args: unknown[]): void {
		if (this.isDev) {
			console.info(...args)
		}
	}

	warn(...args: unknown[]): void {
		if (this.isDev) {
			console.warn(...args)
		}
	}

	error(...args: unknown[]): void {
		// Ошибки всегда логируем, даже в production
		console.error(...args)
	}

	debug(...args: unknown[]): void {
		if (this.isDev) {
			console.debug(...args)
		}
	}

	/**
	 * Группировка логов (только в dev режиме)
	 */
	group(label: string, collapsed = false): void {
		if (this.isDev) {
			if (collapsed) {
				console.groupCollapsed(label)
			} else {
				console.group(label)
			}
		}
	}

	groupEnd(): void {
		if (this.isDev) {
			console.groupEnd()
		}
	}
}

export const logger = new Logger()
