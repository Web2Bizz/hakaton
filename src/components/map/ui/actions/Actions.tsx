import { Button } from '@/components/ui/button'
import { Filter, List, Navigation } from 'lucide-react'

interface ActionsProps {
	readonly isFiltersOpen: boolean
	readonly isListOpen: boolean
	readonly onToggleFilters: () => void
	readonly onToggleList: () => void
	readonly onCenterOnUserLocation: () => void
	readonly isGeolocationLoading?: boolean
	readonly hasUserLocation?: boolean
}

export function Actions({
	isFiltersOpen,
	isListOpen,
	onToggleFilters,
	onToggleList,
	onCenterOnUserLocation,
	isGeolocationLoading = false,
	hasUserLocation = false,
}: ActionsProps) {
	return (
		<div className='map-actions-container absolute right-5 top-32 flex flex-col gap-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-2 z-10'>
			<Button
				variant='ghost'
				size='icon'
				onClick={onCenterOnUserLocation}
				className={`h-10 w-10 ${
					hasUserLocation ? 'bg-green-100 text-green-600' : ''
				}`}
				title='Мое местоположение'
				disabled={isGeolocationLoading}
			>
				<Navigation className='h-4 w-4' />
			</Button>
			<Button
				variant='ghost'
				size='icon'
				onClick={onToggleFilters}
				className={`h-10 w-10 ${
					isFiltersOpen ? 'bg-blue-100 text-blue-600' : ''
				}`}
				title='Фильтры'
			>
				<Filter className='h-4 w-4' />
			</Button>
			<Button
				variant='ghost'
				size='icon'
				onClick={onToggleList}
				className={`h-10 w-10 ${isListOpen ? 'bg-blue-100 text-blue-600' : ''}`}
				title='Список организаций'
			>
				<List className='h-4 w-4' />
			</Button>
		</div>
	)
}
