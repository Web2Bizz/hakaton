import { Header } from '@/components'
import { Toaster } from '@/components/ui/sonner'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { UserProvider } from '@/contexts/UserContext'
import { ReduxProvider } from '@/provider/Redux-provider'

interface LayoutProps {
	children: React.ReactNode
}

export default function Layout({ children }: Readonly<LayoutProps>) {
	return (
		<ReduxProvider>
			<UserProvider>
				<NotificationProvider>
					<div>
						<Header />
						<main>{children}</main>
						<Toaster />
					</div>
				</NotificationProvider>
			</UserProvider>
		</ReduxProvider>
	)
}
