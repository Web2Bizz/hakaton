import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'
import type { FiltersState } from './types'

interface FiltersPanelProps {
	readonly filters: FiltersState
	readonly cities: string[]
	readonly types: string[]
	readonly helpTypes: Array<{ id: number; name: string }>
	readonly onFiltersChange: (filters: FiltersState) => void
	readonly onClose?: () => void
	readonly isClosing?: boolean
	readonly isOrganizationView?: boolean
}

export function FiltersPanel({
	filters,
	cities,
	types,
	helpTypes,
	onFiltersChange,
	onClose,
	isClosing = false,
	isOrganizationView = false,
}: FiltersPanelProps) {
	const handleSelectChange =
		(field: 'city' | 'type') =>
		(event: React.ChangeEvent<HTMLSelectElement>) => {
			onFiltersChange({
				...filters,
				[field]: event.target.value,
			})
		}

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		onFiltersChange({
			...filters,
			search: event.target.value,
		})
	}

	const handleAssistanceToggle = (id: string) => {
		onFiltersChange({
			...filters,
			assistance: {
				...filters.assistance,
				[id]: !filters.assistance[id as keyof typeof filters.assistance],
			},
		})
	}

	const resetFilters = () => {
		onFiltersChange({
			city: '',
			type: '',
			assistance: helpTypes.reduce((acc, item) => {
				acc[item.name] = false
				return acc
			}, {} as FiltersState['assistance']),
			search: '',
		})
	}

	const hasActiveFilters =
		filters.city !== '' ||
		filters.type !== '' ||
		filters.search !== '' ||
		Object.values(filters.assistance).some(Boolean)

	return (
		<aside
			className={`fixed right-5 top-[88px] bottom-20 w-[380px] max-w-[calc(100vw-40px)] z-10 bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/80 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
				isClosing ? 'animate-slide-out-right' : 'animate-slide-in-right'
			}`}
		>
			<header className='sticky top-0 bg-white/98 backdrop-blur-xl border-b border-slate-200 p-6 z-10'>
				<div className='flex items-center justify-between gap-4'>
					<h2 className='text-xl font-bold text-slate-900 m-0'>
						Найти организацию
					</h2>
					<div className='flex items-center gap-2'>
						{hasActiveFilters && (
							<button
								type='button'
								onClick={resetFilters}
								className='text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium'
							>
								Сбросить
							</button>
						)}
						{onClose && (
							<button
								type='button'
								onClick={onClose}
								className='shrink-0 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center text-slate-600 hover:text-slate-900'
								title='Закрыть'
							>
								<X className='h-4 w-4' />
							</button>
						)}
					</div>
				</div>
			</header>

			<div className='p-6 space-y-5'>
				<div className='space-y-2'>
					<label
						htmlFor='filter-city'
						className='block text-sm font-medium text-slate-700'
					>
						Город
					</label>
					<select
						id='filter-city'
						value={filters.city}
						onChange={handleSelectChange('city')}
						className='w-full h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
					>
						<option value=''>Все города</option>
						{cities.map(city => (
							<option key={city} value={city}>
								{city}
							</option>
						))}
					</select>
				</div>

				<div className='space-y-2'>
					<label
						htmlFor='filter-type'
						className='block text-sm font-medium text-slate-700'
					>
						Тип организации
					</label>
					<select
						id='filter-type'
						value={filters.type}
						onChange={handleSelectChange('type')}
						className='w-full h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
					>
						<option value=''>Все направления</option>
						{types.map(type => (
							<option key={type} value={type}>
								{type}
							</option>
						))}
					</select>
				</div>

				<div className='space-y-2'>
					<label
						htmlFor='filter-search'
						className='block text-sm font-medium text-slate-700'
					>
						Ключевые слова
					</label>
					<Input
						id='filter-search'
						type='search'
						value={filters.search}
						onChange={handleSearchChange}
						placeholder='Название или описание'
						className='w-full'
					/>
				</div>

				{isOrganizationView && (
					<div className='space-y-3'>
						<span className='block text-sm font-medium text-slate-700'>
							Вид помощи
						</span>
						<div className='space-y-2'>
							{helpTypes.map(helpType => (
								<label
									key={helpType.id}
									className='flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-md transition-colors'
								>
									<input
										type='checkbox'
										checked={Boolean(filters.assistance[helpType.name])}
										onChange={() => handleAssistanceToggle(helpType.name)}
										className='w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-2'
									/>
									<span className='text-sm text-slate-700 flex-1'>
										{helpType.name}
									</span>
								</label>
							))}
						</div>
					</div>
				)}
			</div>
		</aside>
	)
}
