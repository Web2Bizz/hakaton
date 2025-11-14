import { organizations } from '../data/organizations'
import { MapView } from './MapView'

export const MapComponent = () => {
	return (
		<div className='relative w-full h-full'>
			<MapView
				organizations={organizations}
				onSelect={() => {}}
				onMarkerClick={() => {}}
			/>
		</div>
	)
}
