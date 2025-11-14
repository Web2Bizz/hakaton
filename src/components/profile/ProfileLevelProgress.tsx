import { MAX_LEVEL } from '@/utils/level'

interface ProfileLevelProgressProps {
	level: number
	experience: number
	experienceToNext: number
}

export function ProfileLevelProgress({
	level,
	experience,
	experienceToNext,
}: ProfileLevelProgressProps) {
	const isMaxLevel = level >= MAX_LEVEL
	const levelProgress = isMaxLevel
		? 100
		: experienceToNext > 0
		? (experience / experienceToNext) * 100
		: 0

	return (
		<div className='mb-4 sm:mb-6'>
			<div className='flex items-center justify-between mb-2 gap-2'>
				<span className='text-xs sm:text-sm font-medium text-slate-700'>
					{isMaxLevel
						? 'Достигнут максимальный уровень'
						: 'Опыт до следующего уровня'}
				</span>
				<span className='text-xs sm:text-sm font-semibold text-slate-900 shrink-0'>
					{isMaxLevel ? (
						<span className='text-yellow-600'>Легенда</span>
					) : (
						`${experience} / ${experienceToNext}`
					)}
				</span>
			</div>
			<div className='h-2 sm:h-3 bg-slate-200 rounded-full overflow-hidden'>
				<div
					className={`h-full transition-all duration-500 ${
						isMaxLevel
							? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600'
							: 'bg-gradient-to-r from-blue-500 to-cyan-600'
					}`}
					style={{ width: `${Math.min(levelProgress, 100)}%` }}
				/>
			</div>
		</div>
	)
}

