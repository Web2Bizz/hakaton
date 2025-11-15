import { memo, useCallback, useMemo } from 'react'
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
		(organization: Organization & { isQuest?: boolean }) => {
			const foundItem = searchItems.find(s => String(s.id) === String(organization.id))
			if (foundItem) {
				onItemSelect(foundItem)
			}
		},
		[searchItems, onItemSelect]
	)

	// Преобразуем SearchItem[] в формат для AddressSearchInput
	const organizationsForSearch = useMemo(() => {
		if (import.meta.env.DEV) {
			console.log('MapSearch: searchItems count:', searchItems.length)
		}
		
		return searchItems.map(item => {
			if ('isQuest' in item && item.isQuest) {
				// Quest преобразуем в Organization-подобный формат
				return {
					id: item.id,
					name: item.title,
					latitude: item.coordinates[0].toString(),
					longitude: item.coordinates[1].toString(),
					city: {
						id: 0,
						name: item.city,
						latitude: item.coordinates[0].toString(),
						longitude: item.coordinates[1].toString(),
					},
					organizationTypes: [{ id: 0, name: item.type }],
					helpTypes: [],
					summary: item.story,
					description: '',
					mission: '',
					goals: [],
					needs: [],
					address: item.address,
					contacts: [
						{ name: 'Телефон', value: item.curator.phone },
						...(item.curator.email ? [{ name: 'Email', value: item.curator.email }] : []),
					],
					gallery: item.gallery,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
					isQuest: true,
				} as Organization & { isQuest: true }
			} else {
				return {
					...item,
					isQuest: false,
				} as Organization & { isQuest: false }
			}
		})
	}, [searchItems])

	return (
		<div className='absolute top-20 left-0 right-0 max-w-[80%] lg:max-w-[400px] z-10 ml-auto mr-auto items-center justify-center lg:left-5 lg:right-auto lg:w-full placeholder:truncate'>
			<AddressSearchInput
				organizations={organizationsForSearch}
				onAddressSelect={onAddressSelect}
				onOrganizationSelect={handleOrganizationSelect}
				placeholder='Поиск по адресу, квесту или организации...'
			/>
		</div>
	)
})
