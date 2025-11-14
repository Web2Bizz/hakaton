import type { AssistanceTypeId, Organization } from './organizations'

export type ApplicationStatus = 'pending' | 'approved' | 'rejected'

export interface PendingApplication {
	id: string
	submittedAt: string
	status: ApplicationStatus
	submittedBy: {
		name: string
		email: string
		phone: string
	}
	organization: Omit<Organization, 'id' | 'gallery'> & {
		gallery?: string[]
	}
	rejectionReason?: string
	reviewedBy?: string
	reviewedAt?: string
}

export const mockPendingApplications: PendingApplication[] = [
	{
		id: 'app-001',
		submittedAt: '2025-01-15T10:30:00Z',
		status: 'pending',
		submittedBy: {
			name: 'Анна Петрова',
			email: 'anna.petrova@example.com',
			phone: '+7 (900) 111-22-33',
		},
		organization: {
			name: 'Центр помощи семьям "Теплый дом"',
			city: 'Саров',
			type: 'Помощь детям',
			assistance: ['volunteers', 'donations', 'things'] as AssistanceTypeId[],
			summary:
				'Поддержка многодетных и неполных семей в трудной жизненной ситуации.',
			description:
				'Организация предоставляет материальную помощь, консультации психологов, организует досуг для детей и родителей.',
			mission:
				'Создать безопасное пространство для семей, оказавшихся в сложной ситуации, и помочь им вернуться к стабильной жизни.',
			goals: [
				'Обеспечить продуктовыми наборами 50 семей ежемесячно',
				'Провести 20 консультаций психологов в месяц',
				'Организовать летний лагерь для детей из подопечных семей',
			],
			needs: [
				'Детская одежда и обувь',
				'Школьные принадлежности',
				'Волонтеры для организации мероприятий',
				'Финансовая поддержка для закупки продуктов',
			],
			coordinates: [54.9136, 43.3411],
			address: 'Саров, ул. Мира, 15',
			contacts: {
				phone: '+7 (900) 111-22-33',
				email: 'info@warmhome.ru',
			},
			website: 'https://warmhome.ru',
			socials: [
				{ name: 'VK', url: 'https://vk.com/warmhome' },
				{ name: 'Telegram', url: 'https://t.me/warmhome' },
			],
			gallery: [],
		},
	},
	{
		id: 'app-002',
		submittedAt: '2025-01-14T14:20:00Z',
		status: 'pending',
		submittedBy: {
			name: 'Дмитрий Соколов',
			email: 'dmitry.sokolov@example.com',
			phone: '+7 (900) 222-33-44',
		},
		organization: {
			name: 'Эко-движение "Чистый город"',
			city: 'Заречный',
			type: 'Экология',
			assistance: ['volunteers', 'experts'] as AssistanceTypeId[],
			summary:
				'Организация экологических акций и просветительских мероприятий.',
			description:
				'Проводим субботники, устанавливаем контейнеры для раздельного сбора мусора, организуем лекции по экологии.',
			mission:
				'Сделать Заречный примером экологически ответственного города и воспитать культуру бережного отношения к природе.',
			goals: [
				'Установить 30 контейнеров для раздельного сбора',
				'Провести 12 экологических акций в год',
				'Обучить 500 школьников основам экологии',
			],
			needs: [
				'Волонтеры для организации субботников',
				'Эксперты для проведения лекций',
				'Инвентарь для уборки территории',
			],
			coordinates: [53.1965, 45.1709],
			address: 'Заречный, ул. Экологическая, 8',
			contacts: {
				phone: '+7 (900) 222-33-44',
				email: 'info@clean-city.ru',
			},
			socials: [{ name: 'VK', url: 'https://vk.com/clean_city' }],
			gallery: [],
		},
	},
	{
		id: 'app-003',
		submittedAt: '2025-01-13T09:15:00Z',
		status: 'approved',
		submittedBy: {
			name: 'Елена Волкова',
			email: 'elena.volkova@example.com',
			phone: '+7 (900) 333-44-55',
		},
		organization: {
			name: 'Культурный центр "Атомная сцена"',
			city: 'Нововоронеж',
			type: 'Культура',
			assistance: ['volunteers', 'donations'] as AssistanceTypeId[],
			summary:
				'Развитие театрального искусства и культурных инициатив в городе.',
			description:
				'Организуем театральные постановки, концерты, мастер-классы по актерскому мастерству для всех желающих.',
			mission:
				'Сделать культуру доступной для всех жителей города и создать платформу для творческой самореализации.',
			goals: [
				'Провести 4 театральных постановки в год',
				'Организовать фестиваль уличного театра',
				'Создать детскую театральную студию',
			],
			needs: [
				'Волонтеры для помощи в организации мероприятий',
				'Финансовая поддержка для закупки реквизита',
				'Помощь в разработке декораций',
			],
			coordinates: [51.3167, 39.2167],
			address: 'Нововоронеж, ул. Театральная, 3',
			contacts: {
				phone: '+7 (900) 333-44-55',
				email: 'info@atomic-stage.ru',
			},
			website: 'https://atomic-stage.ru',
			socials: [
				{ name: 'VK', url: 'https://vk.com/atomic_stage' },
				{ name: 'Telegram', url: 'https://t.me/atomic_stage' },
			],
			gallery: [],
		},
		reviewedBy: 'Иван Модераторов',
		reviewedAt: '2025-01-13T15:30:00Z',
	},
	{
		id: 'app-004',
		submittedAt: '2025-01-12T16:45:00Z',
		status: 'rejected',
		submittedBy: {
			name: 'Тест Тестов',
			email: 'test@spam.com',
			phone: '+7 (900) 000-00-00',
		},
		organization: {
			name: 'Сомнительная организация',
			city: 'Саров',
			type: 'Помощь животным',
			assistance: ['donations'] as AssistanceTypeId[],
			summary: 'Тестовая заявка',
			description: 'Недостаточно информации',
			mission: 'Тест',
			goals: [],
			needs: [],
			coordinates: [54.9136, 43.3411],
			address: 'Тестовый адрес',
			contacts: {
				phone: '+7 (900) 000-00-00',
			},
			gallery: [],
		},
		rejectionReason:
			'Недостаточно информации о деятельности организации. Отсутствуют конкретные цели и планы. Рекомендуется предоставить более детальное описание.',
		reviewedBy: 'Иван Модераторов',
		reviewedAt: '2025-01-12T18:20:00Z',
	},
]
