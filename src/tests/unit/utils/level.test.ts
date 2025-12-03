import {
	MAX_LEVEL,
	calculateExperienceToNext,
	getLevelTitle,
	normalizeUserLevel,
} from '@/utils/level'
import { describe, expect, it } from 'vitest'

describe('level utils', () => {
	describe('getLevelTitle', () => {
		it('должен возвращать "Новичок" для уровня 0', () => {
			expect(getLevelTitle(0)).toBe('Новичок')
		})

		it('должен возвращать "Новичок" для уровня 1', () => {
			expect(getLevelTitle(1)).toBe('Новичок')
		})

		it('должен возвращать "Ученик" для уровня 2', () => {
			expect(getLevelTitle(2)).toBe('Ученик')
		})

		it('должен возвращать "Начинающий" для уровня 3', () => {
			expect(getLevelTitle(3)).toBe('Начинающий')
		})

		it('должен возвращать "Начинающий" для уровня 4', () => {
			expect(getLevelTitle(4)).toBe('Начинающий')
		})

		it('должен возвращать "Активный" для уровня 5', () => {
			expect(getLevelTitle(5)).toBe('Активный')
		})

		it('должен возвращать "Активный" для уровня 9', () => {
			expect(getLevelTitle(9)).toBe('Активный')
		})

		it('должен возвращать "Продвинутый" для уровня 10', () => {
			expect(getLevelTitle(10)).toBe('Продвинутый')
		})

		it('должен возвращать "Продвинутый" для уровня 14', () => {
			expect(getLevelTitle(14)).toBe('Продвинутый')
		})

		it('должен возвращать "Опытный" для уровня 15', () => {
			expect(getLevelTitle(15)).toBe('Опытный')
		})

		it('должен возвращать "Опытный" для уровня 19', () => {
			expect(getLevelTitle(19)).toBe('Опытный')
		})

		it('должен возвращать "Профессионал" для уровня 20', () => {
			expect(getLevelTitle(20)).toBe('Профессионал')
		})

		it('должен возвращать "Профессионал" для уровня 29', () => {
			expect(getLevelTitle(29)).toBe('Профессионал')
		})

		it('должен возвращать "Эксперт" для уровня 30', () => {
			expect(getLevelTitle(30)).toBe('Эксперт')
		})

		it('должен возвращать "Эксперт" для уровня 39', () => {
			expect(getLevelTitle(39)).toBe('Эксперт')
		})

		it('должен возвращать "Мастер" для уровня 40', () => {
			expect(getLevelTitle(40)).toBe('Мастер')
		})

		it('должен возвращать "Мастер" для уровня 49', () => {
			expect(getLevelTitle(49)).toBe('Мастер')
		})

		it('должен возвращать "Легенда" для уровня 50 (MAX_LEVEL)', () => {
			expect(getLevelTitle(MAX_LEVEL)).toBe('Легенда')
		})

		it('должен возвращать "Легенда" для уровня больше MAX_LEVEL', () => {
			expect(getLevelTitle(51)).toBe('Легенда')
			expect(getLevelTitle(100)).toBe('Легенда')
		})

		it('должен возвращать "Легенда" для очень большого уровня', () => {
			expect(getLevelTitle(999)).toBe('Легенда')
		})
	})

	describe('calculateExperienceToNext', () => {
		it('должен рассчитывать опыт для уровня 1', () => {
			const result = calculateExperienceToNext(1)
			// 100 * 1.5^(1-1) = 100 * 1.5^0 = 100 * 1 = 100
			expect(result).toBe(100)
		})

		it('должен рассчитывать опыт для уровня 2', () => {
			const result = calculateExperienceToNext(2)
			// 100 * 1.5^(2-1) = 100 * 1.5^1 = 100 * 1.5 = 150
			expect(result).toBe(150)
		})

		it('должен рассчитывать опыт для уровня 3', () => {
			const result = calculateExperienceToNext(3)
			// 100 * 1.5^(3-1) = 100 * 1.5^2 = 100 * 2.25 = 225
			expect(result).toBe(225)
		})

		it('должен рассчитывать опыт для уровня 5', () => {
			const result = calculateExperienceToNext(5)
			// 100 * 1.5^4 = 100 * 5.0625 = 506.25 -> 506 (Math.floor)
			expect(result).toBe(506)
		})

		it('должен рассчитывать опыт для уровня 10', () => {
			const result = calculateExperienceToNext(10)
			expect(result).toBeGreaterThan(0)
			expect(result).toBe(Math.floor(100 * Math.pow(1.5, 9)))
		})

		it('должен рассчитывать опыт для уровня 20', () => {
			const result = calculateExperienceToNext(20)
			expect(result).toBeGreaterThan(0)
			expect(result).toBe(Math.floor(100 * Math.pow(1.5, 19)))
		})

		it('должен рассчитывать опыт для уровня 50 (MAX_LEVEL)', () => {
			const result = calculateExperienceToNext(MAX_LEVEL)
			expect(result).toBeGreaterThan(0)
			expect(result).toBe(Math.floor(100 * Math.pow(1.5, MAX_LEVEL - 1)))
		})

		it('должен округлять результат вниз (Math.floor)', () => {
			const result = calculateExperienceToNext(4)
			// 100 * 1.5^3 = 100 * 3.375 = 337.5 -> 337
			expect(result).toBe(337)
			expect(result % 1).toBe(0) // Должно быть целое число
		})

		it('должен возвращать положительное число для любого уровня', () => {
			for (let level = 1; level <= 100; level++) {
				const result = calculateExperienceToNext(level)
				expect(result).toBeGreaterThan(0)
			}
		})

		it('должен увеличивать требуемый опыт с каждым уровнем', () => {
			const exp1 = calculateExperienceToNext(1)
			const exp2 = calculateExperienceToNext(2)
			const exp3 = calculateExperienceToNext(3)
			expect(exp2).toBeGreaterThan(exp1)
			expect(exp3).toBeGreaterThan(exp2)
		})
	})

	describe('normalizeUserLevel', () => {
		it('должен возвращать уровень без изменений, если опыт недостаточен', () => {
			const result = normalizeUserLevel(5, 50, 100)
			expect(result.level).toBe(5)
			expect(result.experience).toBe(50)
			expect(result.experienceToNext).toBe(100)
		})

		it('должен повышать уровень при избыточном опыте', () => {
			const result = normalizeUserLevel(5, 200, 100)
			// Опыта хватает на повышение уровня
			// Опыт не вычитается, он продолжает накапливаться
			expect(result.level).toBeGreaterThan(5)
			expect(result.experience).toBe(200)
		})

		it('должен обрабатывать несколько повышений уровня', () => {
			const result = normalizeUserLevel(1, 500, 100)
			// С 500 опытом можно повыситься несколько раз
			expect(result.level).toBeGreaterThan(1)
		})

		it('должен ограничивать уровень MAX_LEVEL', () => {
			const result = normalizeUserLevel(60, 1000000, 100)
			expect(result.level).toBe(MAX_LEVEL)
			expect(result.experience).toBe(0)
			expect(result.experienceToNext).toBe(0)
		})

		it('должен корректно рассчитывать experienceToNext после повышения уровня', () => {
			const result = normalizeUserLevel(5, 200, 100)
			// После повышения должен быть новый experienceToNext
			expect(result.experienceToNext).toBe(
				calculateExperienceToNext(result.level)
			)
		})

		it('должен обрабатывать уровень 0', () => {
			const result = normalizeUserLevel(0, 50, 100)
			expect(result.level).toBe(0)
			expect(result.experience).toBe(50)
		})

		it('должен обрабатывать отрицательный опыт', () => {
			const result = normalizeUserLevel(5, -10, 100)
			expect(result.level).toBe(5)
			expect(result.experience).toBe(-10)
		})

		it('должен обрабатывать нулевой опыт', () => {
			const result = normalizeUserLevel(5, 0, 100)
			expect(result.level).toBe(5)
			expect(result.experience).toBe(0)
		})

		it('должен обрабатывать точное количество опыта для повышения', () => {
			const expToNext = 100
			const result = normalizeUserLevel(5, expToNext, expToNext)
			// Опыта ровно хватает, должен повыситься уровень
			// Опыт не обнуляется, он продолжает накапливаться
			expect(result.level).toBe(6)
			expect(result.experience).toBe(expToNext)
		})

		it('должен обрабатывать опыт чуть меньше необходимого', () => {
			const expToNext = 100
			const result = normalizeUserLevel(5, expToNext - 1, expToNext)
			// Опыта не хватает
			expect(result.level).toBe(5)
			expect(result.experience).toBe(expToNext - 1)
		})

		it('должен обрабатывать очень большой избыточный опыт', () => {
			const result = normalizeUserLevel(1, 1000000, 100)
			// Должен достичь MAX_LEVEL
			expect(result.level).toBe(MAX_LEVEL)
			expect(result.experience).toBe(0)
		})

		it('должен корректно обрабатывать повышение до MAX_LEVEL', () => {
			const expToNext = calculateExperienceToNext(49)
			const result = normalizeUserLevel(49, expToNext, expToNext)
			// Должен повыситься до 50
			expect(result.level).toBe(MAX_LEVEL)
			expect(result.experience).toBe(0)
		})

		it('должен обрабатывать уровень равный MAX_LEVEL с опытом', () => {
			const result = normalizeUserLevel(MAX_LEVEL, 500, 100)
			expect(result.level).toBe(MAX_LEVEL)
			expect(result.experience).toBe(0)
			expect(result.experienceToNext).toBe(0)
		})
	})
})
