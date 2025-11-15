import { useUser } from '@/hooks/useUser'
import { useEffect } from 'react'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
	children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { user } = useUser()

	useEffect(() => {
		if (!user) {
			window.location.href = '/login'
		}
	}, [user])

	if (!user) {
		return null
	}

	return <>{children}</>
}

