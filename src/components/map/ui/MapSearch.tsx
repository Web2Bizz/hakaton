import { memo, useCallback } from 'react'
import type { GeocodeResult } from '../hooks/useGeocode'
import type { Quest } from '../types/quest-types'
import type { Organization } from '../types/types'
import { AddressSearchInput } from './AddressSearchInput'

type SearchItem =
	| (Quest & { isQuest: true })
	| (Organization & { isQuest: false })

interface MapSearchProps {
	searchItems: SearchItem[]
	onAddressSelect: (result: GeocodeResult) => void
	onItemSelect: (item: Quest | Organization) => void
}

export const MapSearch = memo(function MapSearch({
	searchItems,
	onAddressSelect,
	onItemSelect,
}: MapSearchProps) {
	const handleOrganizationSelect = useCallback(
		(item: SearchItem) => {
			const foundItem = searchItems.find(s => s.id === item.id)
			if (foundItem) {
				onItemSelect(foundItem)
			}
		},
		[searchItems, onItemSelect]
	)
	return (
		<div className='absolute top-20 left-0 right-0 max-w-[80%] lg:max-w-[400px] z-10 ml-auto mr-auto items-center justify-center lg:left-5 lg:right-auto lg:w-full placeholder:truncate'>
			<AddressSearchInput
				organizations={searchItems}
				onAddressSelect={onAddressSelect}
				onOrganizationSelect={handleOrganizationSelect}
				placeholder='Поиск по адресу, квесту или организации...'
			/>
		</div>
	)
})
