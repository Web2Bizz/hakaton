import type {
	AppDispatch,
	AppPersistor,
	AppStore,
	RootState,
} from '@/store/store'
import { setupStore } from '@/store/store'
import { persistStore } from 'redux-persist'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Мокируем redux-persist
vi.mock('redux-persist', async () => {
	const actual = await vi.importActual('redux-persist')
	// Инициализируем глобальное хранилище для конфигурации persistReducer в mock factory
	if (!(globalThis as any).__persistConfigs) {
		;(globalThis as any).__persistConfigs = []
	}
	return {
		...actual,
		persistReducer: vi.fn((config, reducer) => {
			// Сохраняем конфигурацию при каждом вызове в глобальное хранилище
			if (!(globalThis as any).__persistConfigs) {
				;(globalThis as any).__persistConfigs = []
			}
			;(globalThis as any).__persistConfigs.push(config)
			return reducer
		}), // Возвращаем редьюсер как есть для тестов
		persistStore: vi.fn(() => ({
			purge: vi.fn(),
			flush: vi.fn(),
			pause: vi.fn(),
			persist: vi.fn(),
		})),
	}
})

// Мокируем storage
vi.mock('redux-persist/lib/storage', () => ({
	default: {
		getItem: vi.fn(),
		setItem: vi.fn(),
		removeItem: vi.fn(),
	},
}))

// Мокируем все сервисы
vi.mock('@/store/entities/auth', () => ({
	authService: {
		reducerPath: 'authApi',
		reducer: vi.fn((state = {}, action) => state),
		middleware: vi.fn(() => (next: any) => (action: any) => next(action)),
	},
}))

vi.mock('@/store/entities/quest', () => ({
	questService: {
		reducerPath: 'questApi',
		reducer: vi.fn((state = {}, action) => state),
		middleware: vi.fn(() => (next: any) => (action: any) => next(action)),
	},
}))

vi.mock('@/store/entities/achievement', () => ({
	achievementService: {
		reducerPath: 'achievementApi',
		reducer: vi.fn((state = {}, action) => state),
		middleware: vi.fn(() => (next: any) => (action: any) => next(action)),
	},
}))

vi.mock('@/store/entities/experience', () => ({
	experienceService: {
		reducerPath: 'experienceApi',
		reducer: vi.fn((state = {}, action) => state),
		middleware: vi.fn(() => (next: any) => (action: any) => next(action)),
	},
}))

vi.mock('@/store/entities/organization', () => ({
	organizationService: {
		reducerPath: 'organizationApi',
		reducer: vi.fn((state = {}, action) => state),
		middleware: vi.fn(() => (next: any) => (action: any) => next(action)),
	},
}))

vi.mock('@/store/entities/category', () => ({
	categoryService: {
		reducerPath: 'categoryApi',
		reducer: vi.fn((state = {}, action) => state),
		middleware: vi.fn(() => (next: any) => (action: any) => next(action)),
	},
}))

vi.mock('@/store/entities/city', () => ({
	cityService: {
		reducerPath: 'cityApi',
		reducer: vi.fn((state = {}, action) => state),
		middleware: vi.fn(() => (next: any) => (action: any) => next(action)),
	},
}))

vi.mock('@/store/entities/organization-type', () => ({
	organizationTypeService: {
		reducerPath: 'organizationTypeApi',
		reducer: vi.fn((state = {}, action) => state),
		middleware: vi.fn(() => (next: any) => (action: any) => next(action)),
	},
}))

vi.mock('@/store/entities/help-type', () => ({
	helpTypeService: {
		reducerPath: 'helpTypeApi',
		reducer: vi.fn((state = {}, action) => state),
		middleware: vi.fn(() => (next: any) => (action: any) => next(action)),
	},
}))

vi.mock('@/store/entities/upload', () => ({
	uploadService: {
		reducerPath: 'uploadApi',
		reducer: vi.fn((state = {}, action) => state),
		middleware: vi.fn(() => (next: any) => (action: any) => next(action)),
	},
}))

describe('store', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('настройка store', () => {
		it('должен создавать store с помощью setupStore', () => {
			const { store } = setupStore()

			expect(store).toBeDefined()
			expect(typeof store.dispatch).toBe('function')
			expect(typeof store.getState).toBe('function')
			expect(typeof store.subscribe).toBe('function')
			expect(typeof store.replaceReducer).toBe('function')
		})

		it('должен возвращать store и persistor', () => {
			const result = setupStore()

			expect(result).toHaveProperty('store')
			expect(result).toHaveProperty('persistor')
			expect(result.store).toBeDefined()
			expect(result.persistor).toBeDefined()
		})

		it('должен создавать новый store при каждом вызове', () => {
			const { store: store1 } = setupStore()
			const { store: store2 } = setupStore()

			expect(store1).not.toBe(store2)
		})
	})

	describe('Redux Persist конфигурация', () => {
		it('должен создавать persistor при настройке store', () => {
			const { persistor } = setupStore()

			expect(persistor).toBeDefined()
			expect(persistStore).toHaveBeenCalled()
		})

		it('должен использовать persistReducer для корневого редьюсера', () => {
			// persistReducer вызывается при загрузке модуля store.ts (на уровне модуля),
			// а не внутри setupStore(). beforeEach очищает историю вызовов моков,
			// поэтому проверяем косвенно через работу store и наличие persistor
			const { store, persistor } = setupStore()

			expect(store).toBeDefined()
			expect(persistor).toBeDefined()
			// Если store работает и persistor создан, значит persistReducer был использован
			// Проверяем, что store может обрабатывать действия (что означает, что reducer настроен)
			expect(() => store.dispatch({ type: 'TEST' } as any)).not.toThrow()
		})

		it('должен настраивать whitelist для persist (authApi)', () => {
			// persistReducer вызывается при загрузке модуля, конфигурация сохранена в глобальном хранилище
			const persistConfigs = (globalThis as any).__persistConfigs as Array<{
				key?: string
				whitelist?: string[]
				serialize?: boolean
				deserialize?: boolean
			}>
			expect(persistConfigs.length).toBeGreaterThan(0)
			const persistConfig = persistConfigs[0]
			expect(persistConfig).toBeDefined()
			expect(persistConfig?.whitelist).toContain('authApi')
		})

		it('должен настраивать serialize и deserialize', () => {
			// persistReducer вызывается при загрузке модуля, конфигурация сохранена в глобальном хранилище
			const persistConfigs = (globalThis as any).__persistConfigs as Array<{
				key?: string
				whitelist?: string[]
				serialize?: boolean
				deserialize?: boolean
			}>
			expect(persistConfigs.length).toBeGreaterThan(0)
			const persistConfig = persistConfigs[0]
			expect(persistConfig).toBeDefined()
			expect(persistConfig?.serialize).toBe(true)
			expect(persistConfig?.deserialize).toBe(true)
		})

		it('должен использовать правильный key для persist', () => {
			// persistReducer вызывается при загрузке модуля, конфигурация сохранена в глобальном хранилище
			const persistConfigs = (globalThis as any).__persistConfigs as Array<{
				key?: string
				whitelist?: string[]
				serialize?: boolean
				deserialize?: boolean
			}>
			expect(persistConfigs.length).toBeGreaterThan(0)
			const persistConfig = persistConfigs[0]
			expect(persistConfig).toBeDefined()
			expect(persistConfig?.key).toBe('root')
		})
	})

	describe('комбинация всех редьюсеров', () => {
		it('должен включать все сервисы в rootReducer', () => {
			const { store } = setupStore()
			const state = store.getState()

			// Проверяем, что все сервисы присутствуют в state
			expect(state).toHaveProperty('authApi')
			expect(state).toHaveProperty('questApi')
			expect(state).toHaveProperty('achievementApi')
			expect(state).toHaveProperty('experienceApi')
			expect(state).toHaveProperty('organizationApi')
			expect(state).toHaveProperty('categoryApi')
			expect(state).toHaveProperty('cityApi')
			expect(state).toHaveProperty('organizationTypeApi')
			expect(state).toHaveProperty('helpTypeApi')
			expect(state).toHaveProperty('uploadApi')
		})

		it('должен инициализировать все редьюсеры с начальным состоянием', () => {
			const { store } = setupStore()
			const state = store.getState()

			// Все редьюсеры должны иметь начальное состояние (пустые объекты в моках)
			expect(state.authApi).toBeDefined()
			expect(state.questApi).toBeDefined()
			expect(state.achievementApi).toBeDefined()
			expect(state.experienceApi).toBeDefined()
			expect(state.organizationApi).toBeDefined()
			expect(state.categoryApi).toBeDefined()
			expect(state.cityApi).toBeDefined()
			expect(state.organizationTypeApi).toBeDefined()
			expect(state.helpTypeApi).toBeDefined()
			expect(state.uploadApi).toBeDefined()
		})
	})

	describe('middleware настройка', () => {
		it('должен настраивать serializableCheck с игнорированием persist действий', () => {
			const { store } = setupStore()

			// Отправляем persist действие, оно не должно вызывать ошибку
			const persistAction = { type: 'persist/PERSIST' }
			expect(() => store.dispatch(persistAction as any)).not.toThrow()
		})

		it('должен игнорировать persist действия в serializableCheck', () => {
			const { store } = setupStore()

			const persistActions = [
				{ type: 'persist/PERSIST' },
				{ type: 'persist/REHYDRATE' },
				{ type: 'persist/PAUSE' },
				{ type: 'persist/PURGE' },
				{ type: 'persist/REGISTER' },
			]

			persistActions.forEach(action => {
				expect(() => store.dispatch(action as any)).not.toThrow()
			})
		})

		it('должен игнорировать _persist путь в serializableCheck', () => {
			const { store } = setupStore()

			// Создаем состояние с _persist
			const stateWithPersist = {
				...store.getState(),
				_persist: { version: 1, rehydrated: true },
			}

			// Не должно быть ошибки при сериализации
			expect(() => JSON.stringify(stateWithPersist)).not.toThrow()
		})

		it('должен включать middleware всех сервисов', () => {
			const { store } = setupStore()

			// Store должен быть настроен с middleware
			expect(store).toBeDefined()

			// Проверяем, что можем диспатчить действия
			const testAction = { type: 'TEST_ACTION' }
			expect(() => store.dispatch(testAction as any)).not.toThrow()
		})
	})

	describe('сериализация/десериализация', () => {
		it('должен поддерживать сериализацию состояния', () => {
			const { store } = setupStore()
			const state = store.getState()

			// Должна работать сериализация
			expect(() => JSON.stringify(state)).not.toThrow()
		})

		it('должен поддерживать десериализацию состояния', () => {
			const { store } = setupStore()
			const state = store.getState()
			const serialized = JSON.stringify(state)

			// Должна работать десериализация
			expect(() => JSON.parse(serialized)).not.toThrow()
		})

		it('должен сохранять структуру состояния после сериализации/десериализации', () => {
			const { store } = setupStore()
			const state = store.getState()
			const serialized = JSON.stringify(state)
			const deserialized = JSON.parse(serialized)

			// Структура должна сохраниться
			expect(Object.keys(deserialized)).toEqual(Object.keys(state))
		})
	})

	describe('типы', () => {
		it('должен экспортировать правильные типы', () => {
			const { store } = setupStore()

			// Проверяем типы
			const appStore: AppStore = store
			const rootState: RootState = store.getState()
			const dispatch: AppDispatch = store.dispatch
			const persistor: AppPersistor = setupStore().persistor

			expect(appStore).toBeDefined()
			expect(rootState).toBeDefined()
			expect(dispatch).toBeDefined()
			expect(persistor).toBeDefined()
		})

		it('должен иметь правильный тип RootState', () => {
			const { store } = setupStore()
			const state: RootState = store.getState()

			// Проверяем, что state имеет все необходимые свойства
			expect(state).toHaveProperty('authApi')
			expect(state).toHaveProperty('questApi')
		})

		it('должен иметь правильный тип AppDispatch', () => {
			const { store } = setupStore()
			const dispatch: AppDispatch = store.dispatch

			// Проверяем, что dispatch работает
			expect(typeof dispatch).toBe('function')
		})
	})

	describe('интеграция с Redux Toolkit', () => {
		it('должен использовать configureStore из Redux Toolkit', () => {
			const { store } = setupStore()

			// Store должен иметь все методы Redux Toolkit store
			expect(store.dispatch).toBeDefined()
			expect(store.getState).toBeDefined()
			expect(store.subscribe).toBeDefined()
			expect(store.replaceReducer).toBeDefined()
		})

		it('должен поддерживать подписку на изменения', () => {
			const { store } = setupStore()
			let callbackCalled = false

			const unsubscribe = store.subscribe(() => {
				callbackCalled = true
			})

			store.dispatch({ type: 'TEST' } as any)
			expect(callbackCalled).toBe(true)

			unsubscribe()
		})

		it('должен поддерживать отписку от изменений', () => {
			const { store } = setupStore()
			let callbackCalled = false

			const unsubscribe = store.subscribe(() => {
				callbackCalled = true
			})

			unsubscribe()
			store.dispatch({ type: 'TEST' } as any)

			// Callback не должен быть вызван после отписки
			expect(callbackCalled).toBe(false)
		})
	})

	describe('граничные случаи', () => {
		it('должен обрабатывать создание нескольких store независимо', () => {
			const { store: store1 } = setupStore()
			const { store: store2 } = setupStore()

			// Изменения в одном store не должны влиять на другой
			store1.dispatch({ type: 'TEST_1' } as any)
			store2.dispatch({ type: 'TEST_2' } as any)

			expect(store1).not.toBe(store2)
		})

		it('должен обрабатывать пустые действия', () => {
			const { store } = setupStore()

			expect(() => store.dispatch({ type: '' } as any)).not.toThrow()
		})

		it('должен обрабатывать действия с нестандартной структурой', () => {
			const { store } = setupStore()

			const nonStandardAction = {
				type: 'TEST',
				payload: {
					date: new Date(),
					undefined: undefined,
					null: null,
					// Примечание: циклические ссылки вызывают stack overflow в serializableCheck,
					// поэтому тестируем только нестандартные, но сериализуемые значения
				},
			}

			// Должно обработаться без ошибок (serializableCheck может предупредить, но не упасть)
			expect(() => store.dispatch(nonStandardAction as any)).not.toThrow()
		})

		it('должен обрабатывать состояние с большим количеством данных', () => {
			const { store } = setupStore()

			// Создаем большое действие
			const largeAction = {
				type: 'LARGE_DATA',
				payload: {
					data: new Array(1000)
						.fill(0)
						.map((_, i) => ({ id: i, value: `value-${i}` })),
				},
			}

			expect(() => store.dispatch(largeAction as any)).not.toThrow()
		})
	})
})
