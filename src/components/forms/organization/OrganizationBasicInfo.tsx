import { Input } from '@/components/ui/input'
import { organizationTypes } from '@/components/map/data/organizations'
import { cities as orgCities } from '@/components/map/data/organizations'
import { questCities } from '@/components/map/data/quests'
import { MediaUpload } from '../shared/MediaUpload'
import { useMemo } from 'react'

interface OrganizationBasicInfoProps {
	formData: {
		name: string
		city: string
		type: string
		summary: string
		description: string
		mission: string
		gallery: string[]
	}
	onChange: (field: string, value: string | string[]) => void
	onCityChange: (city: string) => void
	onGalleryChange?: (gallery: string[]) => void
}

export function OrganizationBasicInfo({
	formData,
	onChange,
	onCityChange,
	onGalleryChange,
}: OrganizationBasicInfoProps) {
	const allCities = useMemo(
		() =>
			Array.from(new Set([...questCities, ...orgCities])).sort((a, b) =>
				a.localeCompare(b)
			),
		[]
	)

	return (
		<div className='space-y-4'>
			<div>
				<label
					htmlFor='org-name'
					className='block text-sm font-medium text-slate-700 mb-2'
				>
					Название организации *
				</label>
				<Input
					id='org-name'
					value={formData.name}
					onChange={e => onChange('name', e.target.value)}
					required
					placeholder='Например: Приют «Лапки добра»'
				/>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<div>
					<label
						htmlFor='org-city'
						className='block text-sm font-medium text-slate-700 mb-2'
					>
						Город *
					</label>
					<select
						id='org-city'
						value={formData.city}
						onChange={e => onCityChange(e.target.value)}
						required
						className='w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm'
					>
						<option value=''>Выберите город</option>
						{allCities.map(city => (
							<option key={city} value={city}>
								{city}
							</option>
						))}
					</select>
				</div>

				<div>
					<label
						htmlFor='org-type'
						className='block text-sm font-medium text-slate-700 mb-2'
					>
						Тип организации *
					</label>
					<select
						id='org-type'
						value={formData.type}
						onChange={e => onChange('type', e.target.value)}
						required
						className='w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm'
					>
						<option value=''>Выберите тип</option>
						{organizationTypes.map(type => (
							<option key={type} value={type}>
								{type}
							</option>
						))}
					</select>
				</div>
			</div>

			<div>
				<label
					htmlFor='org-summary'
					className='block text-sm font-medium text-slate-700 mb-2'
				>
					Краткое описание *
				</label>
				<Input
					id='org-summary'
					value={formData.summary}
					onChange={e => onChange('summary', e.target.value)}
					required
					placeholder='Краткое описание организации'
				/>
			</div>

			<div>
				<label
					htmlFor='org-description'
					className='block text-sm font-medium text-slate-700 mb-2'
				>
					Подробное описание *
				</label>
				<textarea
					id='org-description'
					value={formData.description}
					onChange={e => onChange('description', e.target.value)}
					required
					rows={4}
					className='w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm'
					placeholder='Подробное описание деятельности организации...'
				/>
			</div>

			<div>
				<label
					htmlFor='org-mission'
					className='block text-sm font-medium text-slate-700 mb-2'
				>
					Миссия *
				</label>
				<textarea
					id='org-mission'
					value={formData.mission}
					onChange={e => onChange('mission', e.target.value)}
					required
					rows={3}
					className='w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm'
					placeholder='Миссия организации...'
				/>
			</div>

			{/* Галерея */}
			{onGalleryChange && (
				<MediaUpload
					images={formData.gallery}
					onImagesChange={onGalleryChange}
					maxImages={10}
					label='Галерея организации'
				/>
			)}
		</div>
	)
}

