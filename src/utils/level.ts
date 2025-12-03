//Утилиты для работы с уровнями пользователя

/**
 * Максимальный уровень пользователя
 */
export const MAX_LEVEL = 50

/**
 * Получает название уровня на основе номера уровня
 */
export function getLevelTitle(level: number): string {
	if (level >= MAX_LEVEL) return 'Легенда'
	if (level >= 40) return 'Мастер'
	if (level >= 30) return 'Эксперт'
	if (level >= 20) return 'Профессионал'
	if (level >= 15) return 'Опытный'
	if (level >= 10) return 'Продвинутый'
	if (level >= 5) return 'Активный'
	if (level >= 3) return 'Начинающий'
	if (level >= 2) return 'Ученик'
	return 'Новичок'
}

/**
 * Рассчитывает необходимое количество опыта для следующего уровня
 * на основе текущего уровня
 */
export function calculateExperienceToNext(currentLevel: number): number {
	// Базовая формула: 100 * 1.5^(level - 1)
	// Округляем до целого
	return Math.floor(100 * Math.pow(1.5, currentLevel - 1))
}

/**
 * Нормализует уровень и опыт пользователя, обрабатывая избыточный опыт
 * и ограничивая уровень максимальным значением
 */
export function normalizeUserLevel(
	level: number,
	experience: number,
	experienceToNext: number
): { level: number; experience: number; experienceToNext: number } {
	let currentLevel = Math.min(level, MAX_LEVEL)
	const currentExp = experience
	let currentExpToNext = experienceToNext

	// Если уровень уже максимальный, ограничиваем опыт
	if (currentLevel >= MAX_LEVEL) {
		return {
			level: MAX_LEVEL,
			experience: 0,
			experienceToNext: 0,
		}
	}

	// Если опыт очень большой (>= 1,000,000), сразу капаем на MAX_LEVEL
	// Это обрабатывает случаи с очень большим избыточным опытом
	if (currentExp >= 1000000) {
		return {
			level: MAX_LEVEL,
			experience: 0,
			experienceToNext: 0,
		}
	}

	// Обрабатываем повышение уровня: повышаем уровень, если опыт >= experienceToNext
	// Опыт не вычитается, он продолжает накапливаться
	while (currentExp >= currentExpToNext && currentLevel < MAX_LEVEL) {
		currentLevel += 1
		currentExpToNext = calculateExperienceToNext(currentLevel)
	}

	// Если после обработки уровень стал максимальным, обнуляем опыт
	if (currentLevel >= MAX_LEVEL) {
		return {
			level: MAX_LEVEL,
			experience: 0,
			experienceToNext: 0,
		}
	}

	return {
		level: currentLevel,
		experience: currentExp,
		experienceToNext: currentExpToNext,
	}
}
