import type { Quest } from '../../types/quest-types'

interface QuestPopupProps {
	readonly quest: Quest
	readonly onSelect: (quest: Quest) => void
}

export function QuestPopup({ quest, onSelect }: QuestPopupProps) {
	return (
		<div className='popup-content grid max-w-[280px] gap-3'>
			<div>
				<h3 className='m-0 text-base font-bold text-slate-900 mb-1'>
					{quest.title}
				</h3>
				<p className='m-0 text-xs text-slate-600 mb-2'>{quest.city}</p>
				<div className='flex items-center gap-2 mb-2'>
					<span className='text-xs font-medium text-slate-500'>
						Прогресс: {quest.overallProgress}%
					</span>
					<div className='flex-1 h-2 bg-slate-200 rounded-full overflow-hidden'>
						<div
							className='h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300'
							style={{ width: `${quest.overallProgress}%` }}
						/>
					</div>
				</div>
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
    hover:translate-y-[-1px]
    hover:shadow-[0_18px_36px_rgba(37,99,235,0.32)]'
				onClick={() => onSelect(quest)}
			>
				Участвовать в квесте
			</button>
		</div>
	)
}

