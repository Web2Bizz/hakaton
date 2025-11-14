import { Input } from '@/components/ui/input'
import { MapPin, Search } from 'lucide-react'

interface SearchInputProps {
	readonly value: string
	readonly onChange: (value: string) => void
	readonly placeholder?: string
	readonly className?: string
}

export function SearchInput({
	value,
	onChange,
	placeholder = 'Поиск организаций...',
	className,
}: SearchInputProps) {
	return (
		<div className={`relative ${className || ''}`}>
			<MapPin className='absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-600' />
			<Input
				type='search'
				value={value}
				onChange={e => onChange(e.target.value)}
				placeholder={placeholder}
				className='bg-white/95 backdrop-blur-sm border-slate-200 pl-10 pr-10 shadow-lg text-slate-900 placeholder:text-slate-500 text-3xl'
			/>
			<Search className='absolute right-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-600' />
		</div>
	)
}
