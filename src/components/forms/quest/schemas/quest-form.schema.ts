import { z } from 'zod'

export const contactSchema = z.object({
	name: z.string().min(1, 'Название контакта обязательно'),
	value: z.string().min(1, 'Значение контакта обязательно'),
})

export const socialLinkSchema = z.object({
	name: z.enum(['VK', 'Telegram', 'Website']),
	url: z.string().default(''),
})

export const stageFormSchema = z.object({
	title: z.string().min(1, 'Название этапа обязательно'),
	description: z.string().min(1, 'Описание этапа обязательно'),
	status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
	progress: z.number().min(0).max(100).default(0),
	requirementType: z
		.enum(['none', 'financial', 'volunteers', 'items'])
		.default('none'),
	requirementValue: z.number().min(0).optional(),
	itemName: z
		.string()
		.optional()
		.nullable()
		.transform(val => (val === null ? undefined : val)),
	deadline: z
		.string()
		.optional()
		.nullable()
		.transform(val => (val === null ? undefined : val)),
})

export const updateFormSchema = z.object({
	id: z.string(),
	title: z.string().min(1, 'Заголовок обновления обязателен'),
	content: z.string().min(1, 'Текст обновления обязателен'),
	images: z.array(z.string()).default([]),
})

export const customAchievementSchema = z
	.object({
		icon: z.string().min(1, 'Эмодзи обязательно'),
		title: z.string().min(1, 'Название достижения обязательно'),
		description: z.string().min(1, 'Описание достижения обязательно'),
	})
	.optional()
	.nullable()

export const questFormSchema = z.object({
	title: z
		.string()
		.min(1, 'Название квеста обязательно')
		.min(3, 'Название должно содержать минимум 3 символа'),
	cityId: z.number().min(1, 'Выберите город'),
	organizationTypeId: z.number().min(1, 'Выберите тип квеста'),
	category: z.enum(['environment', 'animals', 'people', 'education', 'other']),
	story: z
		.string()
		.min(1, 'Описание квеста обязательно')
		.min(20, 'Описание должно содержать минимум 20 символов'),
	storyImage: z
		.string()
		.optional()
		.nullable()
		.transform(val => (val === null ? undefined : val)),
	gallery: z.array(z.string()).default([]),
	address: z.string().min(1, 'Адрес обязателен'),
	contacts: z.array(contactSchema).min(1, 'Добавьте хотя бы один контакт'),
	latitude: z
		.string()
		.min(1, 'Выберите местоположение на карте')
		.refine(val => {
			const num = parseFloat(val)
			return !isNaN(num) && num >= -90 && num <= 90
		}, 'Некорректная широта'),
	longitude: z
		.string()
		.min(1, 'Выберите местоположение на карте')
		.refine(val => {
			const num = parseFloat(val)
			return !isNaN(num) && num >= -180 && num <= 180
		}, 'Некорректная долгота'),
	stages: z.array(stageFormSchema).min(1, 'Добавьте хотя бы один этап квеста'),
	updates: z.array(updateFormSchema).default([]),
	customAchievement: customAchievementSchema,
	curatorName: z.string().optional(),
	curatorPhone: z.string().optional(),
	curatorEmail: z.preprocess(
		val => (val === '' || val === null ? undefined : val),
		z.string().email('Некорректный email').optional()
	),
	socials: z.array(socialLinkSchema).default([]),
})

export type QuestFormData = z.infer<typeof questFormSchema>
export type StageFormData = z.infer<typeof stageFormSchema>
export type ContactFormData = z.infer<typeof contactSchema>
export type UpdateFormData = z.infer<typeof updateFormSchema>
