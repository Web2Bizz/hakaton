import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { achievementService } from './entities/achievement'
import { authService } from './entities/auth'
import { categoryService } from './entities/category'
import { experienceService } from './entities/experience'
import { organizationService } from './entities/organization'
import { questService } from './entities/quest'

const persistConfig = {
	key: 'root',
	storage,
	whitelist: ['authApi'], // Сохраняем данные аутентификации
	// Настройки для RTK Query
	serialize: true,
	deserialize: true,
}

const rootReducer = combineReducers({
	[authService.reducerPath]: authService.reducer,
	[questService.reducerPath]: questService.reducer,
	[achievementService.reducerPath]: achievementService.reducer,
	[experienceService.reducerPath]: experienceService.reducer,
	[organizationService.reducerPath]: organizationService.reducer,
	[categoryService.reducerPath]: categoryService.reducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const setupStore = () => {
	const store = configureStore({
		reducer: persistedReducer,
		middleware: getDefaultMiddleware =>
			getDefaultMiddleware({
				serializableCheck: {
					ignoredActions: [
						'persist/PERSIST',
						'persist/REHYDRATE',
						'persist/PAUSE',
						'persist/PURGE',
						'persist/REGISTER',
					],
					ignoredPaths: ['_persist'],
				},
			}).concat(
				authService.middleware,
				questService.middleware,
				achievementService.middleware,
				experienceService.middleware,
				organizationService.middleware,
				categoryService.middleware
			),
	})

	const persistor = persistStore(store)

	return { store, persistor }
}

export type AppStore = ReturnType<typeof setupStore>['store']
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
export type AppPersistor = ReturnType<typeof setupStore>['persistor']
