import { Toaster } from '@/components/ui/sonner'
import { UserProvider } from '@/contexts/UserContext'
import type { AppStore } from '@/store/store'
import { setupStore } from '@/store/store'
import { render, type RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'

// Тип для опций рендеринга с провайдерами
interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
	store?: AppStore
}

/**
 * Утилита для рендеринга компонентов с всеми необходимыми провайдерами
 * для интеграционных тестов
 */
export function renderWithProviders(
	ui: React.ReactElement,
	{ store = setupStore().store, ...renderOptions }: ExtendedRenderOptions = {}
) {
	function Wrapper({ children }: { children: React.ReactNode }) {
		return (
			<Provider store={store}>
				<UserProvider>
					<BrowserRouter>
						{children}
						<Toaster />
					</BrowserRouter>
				</UserProvider>
			</Provider>
		)
	}

	return {
		store,
		...render(ui, { wrapper: Wrapper, ...renderOptions }),
	}
}

// Реэкспорт всех утилит из @testing-library/react
export * from '@testing-library/react'
export { userEvent }
