import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useGetCitiesQuery } from '@/store/entities/city'
import { useGetOrganizationTypesQuery } from '@/store/entities/organization-type'
import { Spinner } from '@/components/ui/spinner'
import { useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { MediaUpload } from '../../shared/MediaUpload'
import type { OrganizationFormData } from '../schemas/organization-form.schema'

interface OrganizationBasicInfoProps {
	onCityChange?: (city: string) => void
}

export function OrganizationBasicInfo({
	onCityChange,
}: OrganizationBasicInfoProps) {
	const form = useFormContext<OrganizationFormData>()
	
	// Загружаем данные из API
	const { data: cities = [], isLoading: isLoadingCities } = useGetCitiesQuery()
	const { data: organizationTypes = [], isLoading: isLoadingTypes } = useGetOrganizationTypesQuery()

	const sortedCities = useMemo(
		() => [...cities].sort((a, b) => a.name.localeCompare(b.name)),
		[cities]
	)

	const sortedOrganizationTypes = useMemo(
		() => [...organizationTypes].sort((a, b) => a.name.localeCompare(b.name)),
		[organizationTypes]
	)

	return (
		<div className='space-y-4'>
			<FormField
				control={form.control}
				name='name'
				render={({ field }) => (
					<FormItem>
						<FormLabel>Название организации *</FormLabel>
						<FormControl>
							<Input placeholder='Например: Приют «Лапки добра»' {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<FormField
					control={form.control}
					name='cityId'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Город *</FormLabel>
							<FormControl>
								{isLoadingCities ? (
									<div className='flex items-center gap-2 h-9'>
										<div className='h-4 w-4'>
											<Spinner />
										</div>
										<span className='text-sm text-slate-500'>Загрузка...</span>
									</div>
								) : (
									<select
										value={field.value || ''}
										onChange={e => {
											const cityId = Number(e.target.value)
											field.onChange(cityId)
											const city = cities.find(c => c.id === cityId)
											if (city && onCityChange) {
												onCityChange(city.name)
											}
										}}
										className='w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm'
									>
										<option value=''>Выберите город</option>
										{sortedCities.map(city => (
											<option key={city.id} value={city.id}>
												{city.name}
											</option>
										))}
									</select>
								)}
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name='organizationTypeId'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Тип организации *</FormLabel>
							<FormControl>
								{isLoadingTypes ? (
									<div className='flex items-center gap-2 h-9'>
										<div className='h-4 w-4'>
											<Spinner />
										</div>
										<span className='text-sm text-slate-500'>Загрузка...</span>
									</div>
								) : (
									<select
										value={field.value || ''}
										onChange={e => field.onChange(Number(e.target.value))}
										className='w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm'
									>
										<option value=''>Выберите тип</option>
										{sortedOrganizationTypes.map(type => (
											<option key={type.id} value={type.id}>
												{type.name}
											</option>
										))}
									</select>
								)}
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>

			<FormField
				control={form.control}
				name='summary'
				render={({ field }) => (
					<FormItem>
						<FormLabel>Краткое описание *</FormLabel>
						<FormControl>
							<Input placeholder='Краткое описание организации' {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name='description'
				render={({ field }) => (
					<FormItem>
						<FormLabel>Подробное описание *</FormLabel>
						<FormControl>
							<textarea
								{...field}
								rows={4}
								className='w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm'
								placeholder='Подробное описание деятельности организации...'
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name='mission'
				render={({ field }) => (
					<FormItem>
						<FormLabel>Миссия *</FormLabel>
						<FormControl>
							<textarea
								{...field}
								rows={3}
								className='w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm'
								placeholder='Миссия организации...'
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name='gallery'
				render={({ field }) => (
					<FormItem>
						<FormLabel>Галерея организации</FormLabel>
						<FormControl>
							<MediaUpload
								images={field.value || []}
								onImagesChange={newImages => {
									field.onChange(newImages)
								}}
								maxImages={10}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</div>
	)
}
