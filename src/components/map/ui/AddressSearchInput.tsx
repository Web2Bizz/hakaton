import { Input } from '@/components/ui/input'
import { Loader2, MapPin, Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useGeocode, type GeocodeResult } from '../hooks/useGeocode'

interface AddressSearchInputProps {
	readonly onAddressSelect: (result: GeocodeResult) => void
	readonly placeholder?: string
	readonly className?: string
}

export function AddressSearchInput({
	onAddressSelect,
	placeholder = 'Поиск по адресу...',
	className,
}: AddressSearchInputProps) {
	const [query, setQuery] = useState('')
	const [suggestions, setSuggestions] = useState<GeocodeResult[]>([])
	const [showSuggestions, setShowSuggestions] = useState(false)
	const [selectedIndex, setSelectedIndex] = useState(-1)
	const { searchAddress, isLoading } = useGeocode()
	const inputRef = useRef<HTMLInputElement>(null)
	const suggestionsRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const timeoutId = setTimeout(async () => {
			if (query.trim().length >= 3) {
				const results = await searchAddress(query)
				setSuggestions(results)
				setShowSuggestions(true)
				setSelectedIndex(-1)
			} else {
				setSuggestions([])
				setShowSuggestions(false)
			}
		}, 300) // Debounce 300ms

		return () => clearTimeout(timeoutId)
	}, [query, searchAddress])

	const handleSelect = (result: GeocodeResult) => {
		setQuery(result.display_name)
		setShowSuggestions(false)
		onAddressSelect(result)
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
					{suggestions.map((result, index) => (
						<button
							key={result.place_id}
							type='button'
							onClick={() => handleSelect(result)}
							className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${
								index === selectedIndex ? 'bg-slate-100' : ''
							}`}
						>
							<div className='flex items-start gap-2'>
								<MapPin className='h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0' />
								<div className='flex-1 min-w-0'>
									<p className='text-sm text-slate-900 truncate'>
										{result.display_name}
									</p>
								</div>
							</div>
						</button>
					))}
				</div>
			)}
		</div>
	)
}
