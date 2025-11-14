import { ASSISTANCE_OPTIONS } from '@/constants'
import type { Organization } from '../../types/types'

interface OrganizationPopupProps {
	readonly organization: Organization
	readonly onSelect: (organization: Organization) => void
}

const assistanceLabels = ASSISTANCE_OPTIONS.reduce<Record<string, string>>(
	(acc, option) => {
		acc[option.id] = option.label
		return acc
	},
	{}
)

export function OrganizationPopup({
	organization,
	onSelect,
}: OrganizationPopupProps) {
	return (
		<div className='popup-content grid max-w-[280px] gap-3'>
			<div>
				<h3 className='m-0 text-base font-bold text-slate-900 mb-1'>
					{organization.name}
				</h3>
				<p className='m-0 text-xs text-slate-600 mb-2'>
					{organization.summary}
				</p>
				{organization.assistance.length > 0 && (
					<div className='flex flex-wrap gap-1.5 mb-2'>
						{organization.assistance.map(item => (
							<span
								key={item}
								className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200'
							>
								{assistanceLabels[item] ?? item}
							</span>
						))}
					</div>
				)}
			</div>
			<button
				type='button'
				className='inline-flex items-center justify-center
    gap-2
    px-5 py-3
    rounded-full
    font-semibold
    text-[15px]
    no-underline
    border-none
    cursor-pointer
    transition-all duration-200 ease-in-out
    bg-gradient-to-br from-[#22d3ee] to-[#0284c7]
    text-white
    shadow-[0_14px_28px_rgba(37,99,235,0.26)]
    hover:-translate-y-px
    hover:shadow-[0_18px_36px_rgba(37,99,235,0.32)]'
				onClick={() => onSelect(organization)}
			>
				Подробнее
			</button>
		</div>
	)
}
