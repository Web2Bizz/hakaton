import { ASSISTANCE_OPTIONS } from '@/constants'
import type { Organization } from '../../types/types'

interface OrganizationListProps {
	readonly organizations: Organization[]
	readonly activeId?: string
	readonly onSelect: (organization: Organization) => void
	readonly onClose?: () => void
	readonly isClosing?: boolean
}

const assistanceLabels = ASSISTANCE_OPTIONS.reduce<Record<string, string>>(
	(acc, option) => {
		acc[option.id] = option.label
		return acc
	},
	{}
)

export function OrganizationList({
	organizations,
	activeId,
	onSelect,
	onClose,
	isClosing = false,
}: OrganizationListProps) {
	const handleKeyDown = (
		event: React.KeyboardEvent<HTMLElement>,
		organization: Organization
	) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			onSelect(organization)
		}
	}

	return (
		<section
			className={`fixed right-5 top-[88px] bottom-20 w-[380px] max-w-[calc(100vw-40px)] z-1000 bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/80 overflow-hidden flex flex-col ${
				isClosing ? 'animate-slide-out-right' : 'animate-slide-in-right'
			}`}
		>
			<header className='sticky top-0 bg-white/98 backdrop-blur-xl border-b border-slate-200 p-6 z-10 flex-shrink-0'>
				<div className='flex items-center justify-between gap-4'>
					<h2 className='text-xl font-bold text-slate-900 m-0'>Организации</h2>
					{onClose && (
						<button
							type='button'
							onClick={onClose}
							className='shrink-0 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center text-slate-600 hover:text-slate-900'
							title='Закрыть'
						>
							<svg
								className='h-4 w-4'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M6 18L18 6M6 6l12 12'
								/>
							</svg>
						</button>
					)}
				</div>
			</header>

			<div className='flex-1 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
				<div className='p-4 space-y-3'>
					{organizations.length === 0 ? (
						<div className='text-center py-12 px-4'>
							<p className='text-slate-500 text-sm'>
								Не найдено организаций, подходящих под выбранные фильтры.
								Попробуйте изменить запрос.
							</p>
						</div>
					) : (
						organizations.map(organization => {
							const isActive = organization.id === activeId
							return (
								<article
									key={organization.id}
									onClick={() => onSelect(organization)}
									onKeyDown={e => handleKeyDown(e, organization)}
									role='button'
									tabIndex={0}
									className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
										isActive
											? 'border-blue-500 bg-blue-50 shadow-md'
											: 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
									}`}
								>
									<div className='flex items-center justify-between gap-2 mb-2'>
										<span className='text-xs font-medium text-blue-600 uppercase tracking-wider'>
											{organization.city}
										</span>
										<span className='text-xs font-medium text-slate-500'>
											{organization.type}
										</span>
									</div>
									<h3 className='text-base font-semibold text-slate-900 m-0 mb-2 line-clamp-1'>
										{organization.name}
									</h3>
									<p className='text-sm text-slate-600 m-0 mb-3 line-clamp-2'>
										{organization.summary}
									</p>
									<div className='flex flex-wrap gap-1.5'>
										{organization.assistance.map(item => (
											<span
												key={item}
												className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200'
											>
												{assistanceLabels[item] ?? item}
											</span>
										))}
									</div>
								</article>
							)
						})
					)}
				</div>
			</div>

			{organizations.length > 0 && (
				<footer className='sticky bottom-0 bg-white/98 backdrop-blur-xl border-t border-slate-200 p-4 flex-shrink-0'>
					<p className='text-sm text-slate-600 m-0 text-center'>
						Найдено: <strong className='text-slate-900'>{organizations.length}</strong>
					</p>
				</footer>
			)}
		</section>
	)
}

