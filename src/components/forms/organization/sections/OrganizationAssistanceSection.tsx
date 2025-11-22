import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { useGetHelpTypesQuery } from '@/store/entities/help-type'
import { Spinner } from '@/components/ui/spinner'
import { useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import type { OrganizationFormData } from '../schemas/organization-form.schema'

export function OrganizationAssistanceSection() {
	const form = useFormContext<OrganizationFormData>()
	
	// Загружаем виды помощи из API
	const { data: helpTypes = [], isLoading: isLoadingHelpTypes } = useGetHelpTypesQuery()

	const sortedHelpTypes = useMemo(
		() => [...helpTypes].sort((a, b) => a.name.localeCompare(b.name)),
		[helpTypes]
	)

	return (
		<FormField
			control={form.control}
			name='helpTypeIds'
			render={({ field }) => (
				<FormItem>
					<FormLabel>Вид помощи *</FormLabel>
					<FormControl>
						{isLoadingHelpTypes ? (
							<div className='flex items-center gap-2 py-4'>
								<div className='h-4 w-4'>
									<Spinner />
								</div>
								<span className='text-sm text-slate-500'>Загрузка видов помощи...</span>
							</div>
						) : (
							<div className='grid grid-cols-2 gap-2'>
								{sortedHelpTypes.map(helpType => (
									<label
										key={helpType.id}
										className='flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-slate-50'
									>
										<input
											type='checkbox'
											checked={field.value.includes(helpType.id)}
											onChange={e => {
												const currentValue = field.value || []
												if (e.target.checked) {
													field.onChange([...currentValue, helpType.id])
												} else {
													field.onChange(
														currentValue.filter(id => id !== helpType.id)
													)
												}
											}}
											className='w-4 h-4 rounded border-slate-300 text-blue-600'
										/>
										<span className='text-sm text-slate-700'>{helpType.name}</span>
									</label>
								))}
							</div>
						)}
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}
