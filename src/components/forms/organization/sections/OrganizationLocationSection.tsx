import { Button } from '@/components/ui/button'
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useFormContext } from 'react-hook-form'
import type { OrganizationFormData } from '../schemas/organization-form.schema'

interface OrganizationLocationSectionProps {
	onOpenMap: () => void
}

export function OrganizationLocationSection({
	onOpenMap,
}: OrganizationLocationSectionProps) {
	const form = useFormContext<OrganizationFormData>()
	const cityId = form.watch('cityId')
	const latitude = form.watch('latitude')
	const longitude = form.watch('longitude')

	return (
		<div className='space-y-4'>
			<FormField
				control={form.control}
				name='address'
				render={({ field }) => (
					<FormItem>
						<FormLabel>Адрес *</FormLabel>
						<FormControl>
							<Input placeholder='Например: ул. Ленина, 10' {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<Button
				type='button'
				variant='outline'
				onClick={onOpenMap}
				disabled={!cityId}
				className='w-full'
			>
				{latitude && longitude
					? 'Изменить местоположение на карте'
					: 'Выбрать местоположение на карте'}
			</Button>
		</div>
	)
}
