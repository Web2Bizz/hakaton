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
import type { QuestFormData } from '../schemas/quest-form.schema'

interface QuestLocationSectionProps {
	onOpenMap: () => void
}

export function QuestLocationSection({
	onOpenMap,
}: QuestLocationSectionProps) {
	const form = useFormContext<QuestFormData>()
	const cityId = form.watch('cityId')

	return (
		<div>
			<FormField
				control={form.control}
				name='address'
				render={({ field }) => (
					<FormItem>
						<FormLabel>Адрес *</FormLabel>
						<FormControl>
							<div className='flex gap-2'>
								<Input
									placeholder='Например: ул. Ленина, 10'
									className='flex-1'
									{...field}
								/>
								<Button
									type='button'
									variant='outline'
									onClick={onOpenMap}
									disabled={!cityId}
								>
									Найти на карте
								</Button>
							</div>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</div>
	)
}

