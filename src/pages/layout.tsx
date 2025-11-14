import { Header } from '@/components'

interface LayoutProps {
	children: React.ReactNode
}

export default function Layout({ children }: Readonly<LayoutProps>) {
	return (
		<div>
			<Header />
			<main>{children}</main>
		</div>
	)
}
