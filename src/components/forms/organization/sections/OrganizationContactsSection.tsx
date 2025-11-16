import { Button } from '@/components/ui/button'
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Trash2 } from 'lucide-react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import type { OrganizationFormData } from '../schemas/organization-form.schema'

export function OrganizationContactsSection() {
	const form = useFormContext<OrganizationFormData>()

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: 'contacts',
	})

	return (
		<div className='space-y-4'>
			<FormLabel>Контакты *</FormLabel>
			{fields.map((field, index) => (
				<div
					key={field.id}
					className='grid grid-cols-[1fr_auto] gap-2 items-end'
				>
					<div className='grid grid-cols-2 gap-2'>
						<FormField
							control={form.control}
							name={`contacts.${index}.name`}
							render={({ field: nameField }) => (
								<FormItem>
									<FormControl>
										<select
											{...nameField}
											className='w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm'
										>
											<option value='Телефон'>Телефон</option>
											<option value='Email'>Email</option>
											<option value='WhatsApp'>WhatsApp</option>
											<option value='Telegram'>Telegram</option>
											<option value='Вконтакте'>Вконтакте</option>
											<option value='TicTok'>TicTok</option>
											<option value='Другое'>Другое</option>
										</select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name={`contacts.${index}.value`}
							render={({ field: valueField }) => (
								<FormItem>
									<FormControl>
										<Input
											placeholder={
												form.watch(`contacts.${index}.name`) === 'Телефон'
													? '+7 (XXX) XXX-XX-XX'
													: form.watch(`contacts.${index}.name`) === 'Email'
													? 'email@example.com'
													: 'Значение'
											}
											type={
												form.watch(`contacts.${index}.name`) === 'Email'
													? 'email'
													: form.watch(`contacts.${index}.name`) === 'Телефон'
													? 'tel'
													: 'text'
											}
											{...valueField}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					{fields.length > 1 && (
						<Button
							type='button'
							variant='outline'
							size='icon'
							onClick={() => remove(index)}
							className='h-9'
						>
							<Trash2 className='h-4 w-4' />
						</Button>
					)}
				</div>
			))}
			<Button
				type='button'
				variant='outline'
				onClick={() => append({ name: 'Другое', value: '' })}
				size='sm'
			>
				+ Добавить контакт
			</Button>
		</div>
	)
}
