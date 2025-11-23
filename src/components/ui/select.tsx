import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import * as React from 'react'

export interface SelectOption {
	value: string | number
	label: string
	disabled?: boolean
}

interface SelectProps extends Omit<React.ComponentProps<'select'>, 'children'> {
	options: SelectOption[]
	placeholder?: string
	error?: boolean
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
	({ className, options, placeholder, error, ...props }, ref) => {
		return (
			<div className='relative'>
				<select
					ref={ref}
					className={cn(
						'h-10 w-full appearance-none rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none',
						'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
						'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
						error ? 'border-destructive ring-destructive/20' : 'border-input',
						className
					)}
					{...props}
				>
					{placeholder && !props.value && (
						<option value='' disabled>
							{placeholder}
						</option>
					)}
					{options.map(option => (
						<option
							key={option.value}
							value={option.value}
							disabled={option.disabled}
						>
							{option.label}
						</option>
					))}
				</select>
				<ChevronDown className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500' />
			</div>
		)
	}
)

Select.displayName = 'Select'

export { Select }
