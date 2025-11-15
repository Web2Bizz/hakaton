import { MapComponent } from '@/components'
import { ProtectedRoute } from '@/provider/ProtectedRoute'

export const MapPage = () => {
	return (
		<ProtectedRoute>
			<div className='relative h-screen w-full z-10'>
				<MapComponent />
			</div>
		</ProtectedRoute>
	)
}
