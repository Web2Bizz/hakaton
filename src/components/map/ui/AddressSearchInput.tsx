import { Input } from '@/components/ui/input'
import { Building2, Loader2, MapPin, Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useGeocode, type GeocodeResult } from '../hooks/useGeocode'
import { useOrganizationSearch } from '../hooks/useOrganizationSearch'
import type { Organization } from '../types/types'

type SearchResult =
	| { type: 'address'; data: GeocodeResult }
	| { type: 'organization'; data: Organization & { isQuest?: boolean } }

interface AddressSearchInputProps {
	readonly organizations: (
		| Organization
		| (Organization & { isQuest?: boolean })
	)[]
	readonly onAddressSelect: (result: GeocodeResult) => void
	readonly onOrganizationSelect: (
		organization: Organization & { isQuest?: boolean }
	) => void
	readonly placeholder?: string
	readonly className?: string
}

export function AddressSearchInput({
	organizations,
	onAddressSelect,
	onOrganizationSelect,
	placeholder = 'Поиск по адресу или организации...',
	className,
}: AddressSearchInputProps) {
	const [query, setQuery] = useState('')
	const [suggestions, setSuggestions] = useState<SearchResult[]>([])
	const [showSuggestions, setShowSuggestions] = useState(false)
	const [selectedIndex, setSelectedIndex] = useState(-1)
	const { searchAddress, isLoading: isAddressLoading } = useGeocode()
	const { searchOrganizations } = useOrganizationSearch(organizations)
	const inputRef = useRef<HTMLInputElement>(null)
	const suggestionsRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const timeoutId = setTimeout(async () => {
			if (query.trim().length >= 2) {
				const results: SearchResult[] = []

				// Поиск организаций (быстрый, локальный)
				const orgResults = searchOrganizations(query)
				for (const org of orgResults) {
					results.push({ type: 'organization', data: org })
				}

				// Поиск адресов (медленный, API)
				if (query.trim().length >= 3) {
					const addressResults = await searchAddress(query)
					for (const addr of addressResults) {
						results.push({ type: 'address', data: addr })
					}
				}

				setSuggestions(results)
				setShowSuggestions(results.length > 0)
				setSelectedIndex(-1)
			} else {
				setSuggestions([])
				setShowSuggestions(false)
			}
		}, 300) // Debounce 300ms

		return () => clearTimeout(timeoutId)
	}, [query, searchAddress, searchOrganizations])

	const handleSelect = (result: SearchResult) => {
		if (result.type === 'address') {
			setQuery(result.data.display_name)
			setShowSuggestions(false)
			onAddressSelect(result.data)
		} else {
			setQuery(result.data.name)
			setShowSuggestions(false)
			onOrganizationSelect(result.data)
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'ArrowDown') {
			e.preventDefault()
			setSelectedIndex(prev =>
				prev < suggestions.length - 1 ? prev + 1 : prev
			)
		} else if (e.key === 'ArrowUp') {
			e.preventDefault()
			setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
		} else if (e.key === 'Enter' && selectedIndex >= 0) {
			e.preventDefault()
			handleSelect(suggestions[selectedIndex])
		} else if (e.key === 'Escape') {
			setShowSuggestions(false)
		}
	}

	const organizationResults = suggestions.filter(s => s.type === 'organization')
	const addressResults = suggestions.filter(s => s.type === 'address')
	const hasOrganizations = organizationResults.length > 0
	const hasAddresses = addressResults.length > 0
	const isLoading = isAddressLoading && query.trim().length >= 3

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				suggestionsRef.current &&
				!suggestionsRef.current.contains(event.target as Node) &&
				inputRef.current &&
				!inputRef.current.contains(event.target as Node)
			) {
				setShowSuggestions(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	return (
		<div className={`relative ${className || ''}`}>
			<MapPin className='absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-600' />
			<Input
				ref={inputRef}
				type='search'
				value={query}
				onChange={e => setQuery(e.target.value)}
				onFocus={() => {
					if (suggestions.length > 0) {
						setShowSuggestions(true)
					}
				}}
				onKeyDown={handleKeyDown}
				placeholder={placeholder}
				className='bg-white/95 backdrop-blur-sm border-slate-200 pl-10 pr-10 shadow-lg text-slate-900 placeholder:text-slate-500'
			/>
			{isLoading ? (
				<Loader2 className='absolute right-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 animate-spin text-slate-600' />
			) : (
				<Search className='absolute right-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-600' />
			)}

			{showSuggestions && suggestions.length > 0 && (
				<div
					ref={suggestionsRef}
					className='absolute z-50 mt-1 w-full rounded-md bg-white shadow-lg border border-slate-200 max-h-60 overflow-auto'
				>
					{/* Организации */}
					{hasOrganizations && (
						<>
							{organizationResults.map(result => {
								const globalIndex = suggestions.indexOf(result)
								return (
									<button
										key={`org-${result.data.id}`}
										type='button'
										onClick={() => handleSelect(result)}
										className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${
											globalIndex === selectedIndex ? 'bg-slate-100' : ''
										}`}
									>
										<div className='flex items-start gap-2'>
											<Building2 className='h-4 w-4 text-blue-500 mt-0.5 shrink-0' />
											<div className='flex-1 min-w-0'>
												<p className='text-sm font-medium text-slate-900 truncate'>
													{result.data.name}
												</p>
												<p className='text-xs text-slate-500 truncate'>
													{result.data.city} • {result.data.type}
												</p>
											</div>
										</div>
									</button>
								)
							})}
						</>
					)}

					{/* Divider между организациями и адресами */}
					{hasOrganizations && hasAddresses && (
						<div className='border-t border-slate-200 my-1' />
					)}

					{/* Адреса */}
					{hasAddresses && (
						<>
							{addressResults.map(result => {
								const globalIndex = suggestions.indexOf(result)
								return (
									<button
										key={`addr-${result.data.place_id}`}
										type='button'
										onClick={() => handleSelect(result)}
										className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${
											globalIndex === selectedIndex ? 'bg-slate-100' : ''
										}`}
									>
										<div className='flex items-start gap-2'>
											<MapPin className='h-4 w-4 text-slate-400 mt-0.5 shrink-0' />
											<div className='flex-1 min-w-0'>
												<p className='text-sm text-slate-900 truncate'>
													{result.data.display_name}
												</p>
											</div>
										</div>
									</button>
								)
							})}
						</>
					)}
				</div>
			)}
		</div>
	)
}
