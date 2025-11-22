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
	const latitude = form.watch('latitude')
	const longitude = form.watch('longitude')
	
	// Проверяем ошибки валидации для координат
	const latitudeError = form.formState.errors.latitude
	const longitudeError = form.formState.errors.longitude
	const hasLocationError = !!latitudeError || !!longitudeError
	
	// Проверяем, выбрано ли местоположение
	const hasLocation = latitude && longitude && latitude.trim() !== '' && longitude.trim() !== ''

	return (
		<div className='space-y-4'>
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
									className={
										hasLocationError
											? 'border-red-500 text-red-600 hover:bg-red-50 hover:border-red-600'
											: ''
									}
								>
									Найти на карте
								</Button>
							</div>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			
			{/* Отображение ошибки для координат */}
			{(hasLocationError || (!hasLocation && form.formState.isSubmitted)) && (
				<div className='text-sm text-red-600 flex items-center gap-2'>
					<span>⚠️</span>
					<span>
						{latitudeError?.message || longitudeError?.message || 'Выберите местоположение на карте'}
					</span>
				</div>
			)}
			
			{/* Индикатор выбранного местоположения */}
			{hasLocation && !hasLocationError && (
				<div className='text-sm text-green-600 flex items-center gap-2'>
					<span>✓</span>
					<span>Местоположение выбрано</span>
				</div>
			)}
		</div>
	)
}

