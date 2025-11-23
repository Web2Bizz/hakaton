import { Header, SupportButton } from '@/components'
import { Toaster } from '@/components/ui/sonner'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { UserProvider } from '@/contexts/UserContext'
import { PWAProvider } from '@/pwa/PWAContext'
import { setupStore } from '@/store/store'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { useMemo } from 'react'

interface LayoutProps {
	children: React.ReactNode
}

// Создаем store один раз вне компонента (singleton pattern)
let storeInstance: ReturnType<typeof setupStore> | null = null

function getStore() {
	if (!storeInstance) {
		storeInstance = setupStore()
	}
	return storeInstance
}

export default function Layout({ children }: Readonly<LayoutProps>) {
	// Используем useMemo для гарантии, что store создается только один раз
	const { store, persistor } = useMemo(() => getStore(), [])
	
	return (
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<UserProvider>
					<NotificationProvider>
						<PWAProvider>
							<Header />
							<main>{children}</main>
							<SupportButton />
							<Toaster />
						</PWAProvider>
					</NotificationProvider>
				</UserProvider>
			</PersistGate>
		</Provider>
	)
}
