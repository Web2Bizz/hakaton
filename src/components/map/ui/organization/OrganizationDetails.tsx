import { X } from 'lucide-react'
import { useState } from 'react'
import { ASSISTANCE_OPTIONS } from '@/constants'
import { ImageGallery } from '@/components/ui/ImageGallery'
import type { Organization } from '../../types/types'

interface OrganizationDetailsProps {
	readonly organization?: Organization
	readonly onClose?: () => void
	readonly isClosing?: boolean
}

const assistanceLabels = ASSISTANCE_OPTIONS.reduce<Record<string, string>>(
	(acc, option) => {
		acc[option.id] = option.label
		return acc
	},
	{}
)

export function OrganizationDetails({
	organization,
	onClose,
	isClosing = false,
}: OrganizationDetailsProps) {
	const [galleryIndex, setGalleryIndex] = useState<number | null>(null)

	if (!organization && !isClosing) {
		return null
	}

	return (
		<>
			<section
				className={`fixed left-5 top-[88px] bottom-20 w-[420px] max-w-[calc(100vw-40px)] z-[100] bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/80 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
					isClosing ? 'animate-slide-out-left' : 'animate-slide-in-left'
				}`}
			>
			{organization && (
				<>
					<header className='sticky top-0 bg-white/98 backdrop-blur-xl border-b border-slate-200 p-6 z-10'>
						<div className='flex items-start justify-between gap-4'>
							<div className='flex-1 min-w-0'>
								<p className='text-xs font-medium text-slate-500 uppercase tracking-wider mb-1'>
									{organization.city}
								</p>
								<h2 className='text-2xl font-bold text-slate-900 m-0 mb-2'>
									{organization.name}
								</h2>
								<p className='text-sm text-slate-600 m-0'>
									{organization.type}
								</p>
							</div>
							{onClose && (
								<button
									className='shrink-0 w-8 h-8 cursor-pointer rounded-full bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center text-slate-600 hover:text-slate-900'
									onClick={onClose}
									type='button'
									title='Закрыть'
								>
									<X className='h-4 w-4' />
								</button>
							)}
						</div>
					</header>

					<div className='p-6 space-y-6'>
						<p className='text-base text-slate-700 leading-relaxed m-0'>
							{organization.summary}
						</p>

						<div className='space-y-1'>
							<h3 className='text-lg font-semibold text-slate-900 m-0'>
								Миссия
							</h3>
							<p className='text-sm text-slate-600 leading-relaxed m-0'>
								{organization.mission}
							</p>
						</div>

						<div className='space-y-2'>
							<h3 className='text-lg font-semibold text-slate-900 m-0'>Цели</h3>
							<ul className='list-none m-0 p-0 space-y-1.5'>
								{organization.goals.map(item => (
									<li
										key={item}
										className='text-sm text-slate-600 pl-4 relative before:content-["•"] before:absolute before:left-0 before:text-slate-400'
									>
										{item}
									</li>
								))}
							</ul>
						</div>

						<div className='space-y-2'>
							<h3 className='text-lg font-semibold text-slate-900 m-0'>
								Актуальные нужды
							</h3>
							<ul className='list-none m-0 p-0 space-y-1.5'>
								{organization.needs.map(item => (
									<li
										key={item}
										className='text-sm text-slate-600 pl-4 relative before:content-["•"] before:absolute before:left-0 before:text-slate-400'
									>
										{item}
									</li>
								))}
							</ul>
						</div>

						<div className='space-y-2'>
							<h3 className='text-lg font-semibold text-slate-900 m-0'>
								Как можно помочь
							</h3>
							<div className='flex flex-wrap gap-2'>
								{organization.assistance.map(item => (
									<span
										key={item}
										className='inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200'
									>
										{assistanceLabels[item] ?? item}
									</span>
								))}
							</div>
						</div>

						<div className='space-y-2'>
							<h3 className='text-lg font-semibold text-slate-900 m-0'>
								Контакты
							</h3>
							<div className='grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm'>
								<span className='font-medium text-slate-500'>Адрес</span>
								<p className='text-slate-700 m-0'>{organization.address}</p>

								<span className='font-medium text-slate-500'>Телефон</span>
								<a
									href={`tel:${organization.contacts.phone}`}
									className='text-blue-600 hover:text-blue-700 hover:underline m-0'
								>
									{organization.contacts.phone}
								</a>

								{organization.contacts.email && (
									<>
										<span className='font-medium text-slate-500'>Email</span>
										<a
											href={`mailto:${organization.contacts.email}`}
											className='text-blue-600 hover:text-blue-700 hover:underline m-0'
										>
											{organization.contacts.email}
										</a>
									</>
								)}

								{organization.website && (
									<>
										<span className='font-medium text-slate-500'>Сайт</span>
										<a
											href={organization.website}
											target='_blank'
											rel='noreferrer'
											className='text-blue-600 hover:text-blue-700 hover:underline m-0 break-all'
										>
											{organization.website}
										</a>
									</>
								)}

								{organization.socials && organization.socials.length > 0 && (
									<>
										<span className='font-medium text-slate-500'>Соцсети</span>
										<div className='flex flex-wrap gap-2'>
											{organization.socials.map(social => (
												<a
													key={social.url}
													href={social.url}
													target='_blank'
													rel='noreferrer'
													className='text-blue-600 hover:text-blue-700 hover:underline text-sm'
												>
													{social.name}
												</a>
											))}
										</div>
									</>
								)}
							</div>
						</div>

						{/* Галерея */}
						{organization.gallery && organization.gallery.length > 0 && (
							<div className='space-y-3'>
								<h3 className='text-lg font-semibold text-slate-900 m-0'>
									Галерея
								</h3>
								<div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
									{organization.gallery.map((image, index) => (
										<button
											key={`gallery-${index}-${image.slice(0, 20)}`}
											type='button'
											onClick={() => setGalleryIndex(index)}
											className='relative aspect-square rounded-lg overflow-hidden group cursor-pointer'
										>
											<img
												src={image}
												alt={`Фото ${index + 1} из галереи организации`}
												className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-200'
												loading='lazy'
											/>
											<div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors' />
										</button>
									))}
								</div>
							</div>
						)}
					</div>
				</>
			)}
			</section>

			{/* Галерея изображений */}
			{galleryIndex !== null && organization && (
				<ImageGallery
					images={organization.gallery}
					currentIndex={galleryIndex}
					onClose={() => setGalleryIndex(null)}
					onChangeIndex={setGalleryIndex}
				/>
			)}
		</>
	)
}
