import { compressImage } from '@/utils/image'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('image utils', () => {
	// Мокируем FileReader
	const mockFileReader = {
		readAsDataURL: vi.fn(),
		result: '',
		onload: null as ((e: ProgressEvent<FileReader>) => void) | null,
		onerror: null as ((e: ProgressEvent<FileReader>) => void) | null,
	}

	// Мокируем Image
	const mockImage = {
		width: 0,
		height: 0,
		src: '',
		onload: null as (() => void) | null,
		onerror: null as (() => void) | null,
	}

	// Мокируем Canvas
	const mockCanvas = {
		width: 0,
		height: 0,
		getContext: vi.fn(),
		toDataURL: vi.fn(),
	}

	const mockContext = {
		drawImage: vi.fn(),
	}

	beforeEach(() => {
		vi.clearAllMocks()

		// Сбрасываем моки
		mockFileReader.result = ''
		mockFileReader.onload = null
		mockFileReader.onerror = null
		mockImage.onload = null
		mockImage.onerror = null
		mockImage.width = 0
		mockImage.height = 0

		// Мокируем FileReader как конструктор
		// Используем функцию-конструктор, которая возвращает мок-объект
		global.FileReader = function FileReader() {
			return mockFileReader
		} as unknown as typeof FileReader

		// Мокируем Image как конструктор
		global.Image = function Image() {
			return mockImage
		} as unknown as typeof Image

		// Мокируем createElement для canvas
		global.document.createElement = vi.fn((tagName: string) => {
			if (tagName === 'canvas') {
				return mockCanvas as unknown as HTMLCanvasElement
			}
			return document.createElement(tagName)
		})

		mockCanvas.getContext.mockReturnValue(mockContext as unknown as CanvasRenderingContext2D)
		mockCanvas.toDataURL.mockReturnValue('data:image/jpeg;base64,compressed')
	})

	it('должен сжимать изображение с дефолтными параметрами', async () => {
		const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
		mockImage.width = 2000
		mockImage.height = 1500
		mockFileReader.result = 'data:image/jpeg;base64,original'

		const promise = compressImage(file)

		// Симулируем загрузку файла
		mockFileReader.onload?.({
			target: { result: mockFileReader.result },
		} as ProgressEvent<FileReader>)

		// Симулируем загрузку изображения
		mockImage.onload?.()

		const result = await promise
		expect(result).toBe('data:image/jpeg;base64,compressed')
		expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(file)
	})

	it('должен сжимать горизонтальное изображение, превышающее maxWidth', async () => {
		const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
		mockImage.width = 3000
		mockImage.height = 2000
		mockFileReader.result = 'data:image/jpeg;base64,original'

		const promise = compressImage(file, 1920, 1080, 0.8)

		mockFileReader.onload?.({
			target: { result: mockFileReader.result },
		} as ProgressEvent<FileReader>)

		mockImage.onload?.()

		await promise

		// Проверяем, что canvas был настроен с правильными размерами
		expect(mockCanvas.width).toBe(1920)
		expect(mockCanvas.height).toBe(1280) // (2000 * 1920) / 3000
	})

	it('должен сжимать вертикальное изображение, превышающее maxHeight', async () => {
		const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
		mockImage.width = 1500
		mockImage.height = 2500
		mockFileReader.result = 'data:image/jpeg;base64,original'

		const promise = compressImage(file, 1920, 1080, 0.8)

		mockFileReader.onload?.({
			target: { result: mockFileReader.result },
		} as ProgressEvent<FileReader>)

		mockImage.onload?.()

		await promise

		expect(mockCanvas.width).toBe(648) // (1500 * 1080) / 2500
		expect(mockCanvas.height).toBe(1080)
	})

	it('должен использовать кастомные параметры сжатия', async () => {
		const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
		mockImage.width = 1000
		mockImage.height = 1000
		mockFileReader.result = 'data:image/jpeg;base64,original'

		const promise = compressImage(file, 800, 600, 0.5)

		mockFileReader.onload?.({
			target: { result: mockFileReader.result },
		} as ProgressEvent<FileReader>)

		mockImage.onload?.()

		await promise

		expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.5)
	})

	it('должен оставлять изображение без изменений, если оно меньше лимитов', async () => {
		const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
		mockImage.width = 1000
		mockImage.height = 800
		mockFileReader.result = 'data:image/jpeg;base64,original'

		const promise = compressImage(file, 1920, 1080, 0.8)

		mockFileReader.onload?.({
			target: { result: mockFileReader.result },
		} as ProgressEvent<FileReader>)

		mockImage.onload?.()

		await promise

		// Размеры должны остаться прежними
		expect(mockCanvas.width).toBe(1000)
		expect(mockCanvas.height).toBe(800)
	})

	it('должен обрабатывать квадратное изображение', async () => {
		const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
		mockImage.width = 2000
		mockImage.height = 2000
		mockFileReader.result = 'data:image/jpeg;base64,original'

		const promise = compressImage(file, 1920, 1080, 0.8)

		mockFileReader.onload?.({
			target: { result: mockFileReader.result },
		} as ProgressEvent<FileReader>)

		mockImage.onload?.()

		await promise

		// Квадратное изображение обрабатывается как горизонтальное
		expect(mockCanvas.width).toBe(1920)
		expect(mockCanvas.height).toBe(1920)
	})

	it('должен выбрасывать ошибку при ошибке чтения файла', async () => {
		const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

		const promise = compressImage(file)

		// Симулируем ошибку чтения
		mockFileReader.onerror?.(new ProgressEvent('error') as ProgressEvent<FileReader>)

		await expect(promise).rejects.toThrow('Ошибка чтения файла')
	})

	it('должен выбрасывать ошибку при ошибке загрузки изображения', async () => {
		const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
		mockFileReader.result = 'data:image/jpeg;base64,original'

		const promise = compressImage(file)

		mockFileReader.onload?.({
			target: { result: mockFileReader.result },
		} as ProgressEvent<FileReader>)

		// Симулируем ошибку загрузки изображения
		mockImage.onerror?.()

		await expect(promise).rejects.toThrow('Ошибка загрузки изображения')
	})

	it('должен выбрасывать ошибку, если не удалось создать контекст canvas', async () => {
		const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
		mockImage.width = 1000
		mockImage.height = 1000
		mockFileReader.result = 'data:image/jpeg;base64,original'
		mockCanvas.getContext.mockReturnValue(null)

		const promise = compressImage(file)

		mockFileReader.onload?.({
			target: { result: mockFileReader.result },
		} as ProgressEvent<FileReader>)

		mockImage.onload?.()

		await expect(promise).rejects.toThrow('Не удалось создать контекст canvas')
	})

	it('должен корректно рассчитывать пропорции при сжатии', async () => {
		const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
		mockImage.width = 4000
		mockImage.height = 3000
		mockFileReader.result = 'data:image/jpeg;base64,original'

		const promise = compressImage(file, 2000, 1500, 0.8)

		mockFileReader.onload?.({
			target: { result: mockFileReader.result },
		} as ProgressEvent<FileReader>)

		mockImage.onload?.()

		await promise

		// Пропорции должны сохраниться
		// 4000/3000 = 1.33, 2000/1500 = 1.33
		expect(mockCanvas.width).toBe(2000)
		expect(mockCanvas.height).toBe(1500)
	})

	it('должен устанавливать src изображения из результата FileReader', async () => {
		const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
		mockImage.width = 1000
		mockImage.height = 1000
		const imageData = 'data:image/jpeg;base64,testdata'
		mockFileReader.result = imageData

		const promise = compressImage(file)

		mockFileReader.onload?.({
			target: { result: imageData },
		} as ProgressEvent<FileReader>)

		mockImage.onload?.()

		await promise

		expect(mockImage.src).toBe(imageData)
	})

	it('должен вызывать drawImage с правильными параметрами', async () => {
		const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
		mockImage.width = 1000
		mockImage.height = 1000
		mockFileReader.result = 'data:image/jpeg;base64,original'

		const promise = compressImage(file)

		mockFileReader.onload?.({
			target: { result: mockFileReader.result },
		} as ProgressEvent<FileReader>)

		mockImage.onload?.()

		await promise

		expect(mockContext.drawImage).toHaveBeenCalledWith(
			mockImage,
			0,
			0,
			mockCanvas.width,
			mockCanvas.height
		)
	})
})

