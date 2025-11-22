import type { UseFormReturn } from 'react-hook-form'
import { useEffect } from 'react'
import type { QuestFormData } from '../schemas/quest-form.schema'

/**
 * Хук для синхронизации между контактами и полями куратора в форме квеста
 */
export function useQuestContactSync(form: UseFormReturn<QuestFormData>) {
	useEffect(() => {
		const subscription = form.watch((value, { name }) => {
			const contacts = value.contacts || []

			// Синхронизация из контактов в поля куратора
			if (name?.startsWith('contacts.')) {
				const curatorContact = contacts.find(
					c =>
						c && (c.name === 'Куратор' || c.name?.toLowerCase() === 'куратор')
				)
				const phoneContact = contacts.find(
					c =>
						c && (c.name === 'Телефон' || c.name?.toLowerCase() === 'телефон')
				)
				const emailContact = contacts.find(
					c => c && (c.name === 'Email' || c.name?.toLowerCase() === 'email')
				)

				if (curatorContact && curatorContact.value !== value.curatorName) {
					form.setValue('curatorName', curatorContact.value || '', {
						shouldValidate: false,
					})
				}
				if (phoneContact && phoneContact.value !== value.curatorPhone) {
					form.setValue('curatorPhone', phoneContact.value || '', {
						shouldValidate: false,
					})
				}
				if (emailContact && emailContact.value !== value.curatorEmail) {
					form.setValue('curatorEmail', emailContact.value || '', {
						shouldValidate: false,
					})
				}
			}

			// Синхронизация из полей куратора в контакты
			if (
				name === 'curatorName' ||
				name === 'curatorPhone' ||
				name === 'curatorEmail'
			) {
				const curatorIndex = contacts.findIndex(
					c =>
						c && (c.name === 'Куратор' || c.name?.toLowerCase() === 'куратор')
				)
				const phoneIndex = contacts.findIndex(
					c =>
						c && (c.name === 'Телефон' || c.name?.toLowerCase() === 'телефон')
				)
				const emailIndex = contacts.findIndex(
					c => c && (c.name === 'Email' || c.name?.toLowerCase() === 'email')
				)

				if (name === 'curatorName' && curatorIndex >= 0) {
					form.setValue(
						`contacts.${curatorIndex}.value`,
						value.curatorName || '',
						{
							shouldValidate: false,
						}
					)
				}
				if (name === 'curatorPhone' && phoneIndex >= 0) {
					form.setValue(
						`contacts.${phoneIndex}.value`,
						value.curatorPhone || '',
						{
							shouldValidate: false,
						}
					)
				}
				if (name === 'curatorEmail' && emailIndex >= 0) {
					form.setValue(
						`contacts.${emailIndex}.value`,
						value.curatorEmail || '',
						{
							shouldValidate: false,
						}
					)
				}
			}
		})

		return () => subscription.unsubscribe()
	}, [form])
}

