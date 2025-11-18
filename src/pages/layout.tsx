import { Header } from '@/components'
import { Toaster } from '@/components/ui/sonner'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { UserProvider } from '@/contexts/UserContext'
import { PWAProvider } from '@/pwa/PWAContext'
import { setupStore } from '@/store/store'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

interface LayoutProps {
	children: React.ReactNode
}

export default function Layout({ children }: Readonly<LayoutProps>) {
	const { store, persistor } = setupStore()
	return (
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<UserProvider>
					<NotificationProvider>
						<PWAProvider>
							<Header />
							<main>{children}</main>
							<Toaster />
						</PWAProvider>
					</NotificationProvider>
				</UserProvider>
			</PersistGate>
		</Provider>
	)
}
