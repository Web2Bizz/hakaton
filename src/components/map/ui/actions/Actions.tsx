import { Button } from '@/components/ui/button'
import { Filter, List } from 'lucide-react'

interface ActionsProps {
	readonly isFiltersOpen: boolean
	readonly isListOpen: boolean
	readonly onToggleFilters: () => void
	readonly onToggleList: () => void
}

export function Actions({
	isFiltersOpen,
	isListOpen,
	onToggleFilters,
	onToggleList,
}: ActionsProps) {
	return (
		<div className='absolute right-5 top-32 flex flex-col gap-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-2 z-1000'>
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
