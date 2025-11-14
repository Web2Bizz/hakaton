import { Header } from '@/components'
import { Toaster } from '@/components/ui/sonner'
import { UserProvider } from '@/contexts/UserContext'
import { NotificationProvider } from '@/contexts/NotificationContext'

interface LayoutProps {
	children: React.ReactNode
}

export default function Layout({ children }: Readonly<LayoutProps>) {
	return (
		<UserProvider>
			<NotificationProvider>
				<div>
					<Header />
					<main>{children}</main>
					<Toaster />
				</div>
			</NotificationProvider>
		</UserProvider>
	)
}
