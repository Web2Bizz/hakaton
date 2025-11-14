import { useUser } from '@/hooks/useUser'
import { getCityCoordinates } from '@/utils/cityCoordinates'
import {
	getUserOrganization as getUserOrganizationById,
	updateUserOrganization,
} from '@/utils/userData'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { Organization } from '@/components/map/types/types'
import type { AssistanceTypeId } from '@/types/common'
import type { SocialFormData } from '../quest/QuestSocialsSection'

export interface OrganizationFormData {
	name: string
	city: string
	type: string
	assistance: AssistanceTypeId[]
	summary: string
	description: string
	mission: string
	goals: string[]
	needs: string[]
	address: string
	phone: string
	email: string
	website: string
	coordinates: { lat: number; lng: number }
	socials: SocialFormData[]
	gallery: string[]
}

export function useOrganizationForm(onSuccess?: (organizationId: string) => void) {
	const {
		user,
		createOrganization,
		canCreateOrganization,
		deleteOrganization,
		getUserOrganization: getUserOrgId,
	} = useUser()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isDataLoaded, setIsDataLoaded] = useState(false)

	const existingOrgId = getUserOrgId()
	const existingOrg = existingOrgId
		? getUserOrganizationById(existingOrgId)
		: null
	const isEditMode = !!existingOrg

	const [formData, setFormData] = useState<OrganizationFormData>({
		name: '',
		city: '',
		type: '',
		assistance: [],
		summary: '',
		description: '',
		mission: '',
		goals: [''],
		needs: [''],
		address: '',
		phone: '',
		email: user?.email || '',
		website: '',
		coordinates: { lat: 0, lng: 0 },
		socials: [{ name: 'VK', url: '' }],
		gallery: [],
	})

	useEffect(() => {
		if (existingOrg?.contacts && !isDataLoaded) {
			setFormData({
				name: existingOrg.name || '',
				city: existingOrg.city || '',
				type: existingOrg.type || '',
				assistance: existingOrg.assistance || [],
				summary: existingOrg.summary || '',
				description: existingOrg.description || '',
				mission: existingOrg.mission || '',
				goals:
					existingOrg.goals && existingOrg.goals.length > 0
						? existingOrg.goals
						: [''],
				needs:
					existingOrg.needs && existingOrg.needs.length > 0
						? existingOrg.needs
						: [''],
				address: existingOrg.address || '',
				phone: existingOrg.contacts?.phone || '',
				email: existingOrg.contacts?.email || user?.email || '',
				website: existingOrg.website || '',
				coordinates:
					existingOrg.coordinates && existingOrg.coordinates.length >= 2
						? {
								lat: existingOrg.coordinates[0],
								lng: existingOrg.coordinates[1],
						  }
						: { lat: 0, lng: 0 },
				socials:
					existingOrg.socials && existingOrg.socials.length > 0
						? existingOrg.socials.map(s => ({
								name: s.name,
								url: s.url || '',
						  }))
						: [{ name: 'VK' as const, url: '' }],
				gallery: existingOrg.gallery || [],
			})
			setIsDataLoaded(true)
		} else if (!existingOrg) {
			setIsDataLoaded(false)
		}
	}, [existingOrg, user?.email, isDataLoaded])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!isEditMode && !canCreateOrganization()) {
			toast.error(
				'Вы уже создали организацию. Один пользователь может создать только одну организацию.'
			)
			return
		}

		if (!formData.coordinates.lat || !formData.coordinates.lng) {
			toast.error('Пожалуйста, выберите местоположение на карте.')
			return
		}

		setIsSubmitting(true)

		try {
			const organizationId =
				existingOrg?.id || `user-${user?.id}-org-${Date.now()}`

			const newOrganization: Organization = {
				id: organizationId,
				name: formData.name,
				city: formData.city,
				type: formData.type,
				assistance: formData.assistance,
				summary: formData.summary,
				description: formData.description,
				mission: formData.mission,
				goals: formData.goals.filter(g => g.trim() !== ''),
				needs: formData.needs.filter(n => n.trim() !== ''),
				coordinates: [formData.coordinates.lat, formData.coordinates.lng],
				address: formData.address,
				contacts: {
					phone: formData.phone,
					email: formData.email || undefined,
				},
				website: formData.website || undefined,
				socials: formData.socials
					.filter(social => social.url.trim() !== '')
					.map(social => ({
						name: social.name,
						url: social.url,
					})),
				gallery: formData.gallery,
			}

			if (isEditMode) {
				updateUserOrganization(newOrganization)
			} else {
				const existingOrganizations = JSON.parse(
					localStorage.getItem('user_created_organizations') || '[]'
				)
				existingOrganizations.push(newOrganization)
				localStorage.setItem(
					'user_created_organizations',
					JSON.stringify(existingOrganizations)
				)
				createOrganization(organizationId)
			}

			toast.success(
				isEditMode
					? 'Организация успешно обновлена!'
					: 'Организация успешно создана!'
			)

			if (onSuccess) {
				onSuccess(organizationId)
			}
		} catch (error) {
			if (process.env.NODE_ENV === 'development') {
				console.error('Error creating organization:', error)
			}
			toast.error('Не удалось создать организацию. Попробуйте еще раз.')
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleCityChange = (city: string) => {
		setFormData(prev => {
			const cityCoords = getCityCoordinates(city)
			return {
				...prev,
				city,
				coordinates: cityCoords || prev.coordinates,
			}
		})
	}

	const handleDelete = async () => {
		if (!existingOrgId) return
		deleteOrganization(existingOrgId)
		toast.success('Организация успешно удалена.')
		setFormData({
			name: '',
			city: '',
			type: '',
			assistance: [],
			summary: '',
			description: '',
			mission: '',
			goals: [''],
			needs: [''],
			address: '',
			phone: '',
			email: user?.email || '',
			website: '',
			coordinates: { lat: 0, lng: 0 },
			socials: [{ name: 'VK', url: '' }],
		})
	}

	return {
		formData,
		setFormData,
		isSubmitting,
		isEditMode,
		handleSubmit,
		handleCityChange,
		handleDelete,
	}
}

