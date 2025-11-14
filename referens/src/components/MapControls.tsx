interface MapControlsProps {
	onToggleFilters: () => void
	onToggleList: () => void
	isFiltersOpen: boolean
	isListOpen: boolean
}

export function MapControls({
	onToggleFilters,
	onToggleList,
	isFiltersOpen,
	isListOpen,
}: MapControlsProps) {
	return (
		<div className='map-controls'>
			<button
				className={`map-control-button ${isFiltersOpen ? 'active' : ''}`}
				onClick={onToggleFilters}
				type='button'
				title='Найти организацию'
			>
				<svg
					width='20'
					height='20'
					viewBox='0 0 20 20'
					fill='none'
					xmlns='http://www.w3.org/2000/svg'
				>
					<path
						d='M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
					<path
						d='M19 19L14.65 14.65'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
				</svg>
			</button>
			<button
				className={`map-control-button ${isListOpen ? 'active' : ''}`}
				onClick={onToggleList}
				type='button'
				title='Список организаций'
			>
				<svg
					width='20'
					height='20'
					viewBox='0 0 20 20'
					fill='none'
					xmlns='http://www.w3.org/2000/svg'
				>
					<path
						d='M3 5H17'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
					<path
						d='M3 10H17'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
					<path
						d='M3 15H17'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
				</svg>
			</button>
		</div>
	)
}

