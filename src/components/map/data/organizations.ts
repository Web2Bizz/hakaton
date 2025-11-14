export type AssistanceTypeId =
	| 'volunteers'
	| 'donations'
	| 'things'
	| 'mentors'
	| 'blood'
	| 'experts'

export type SocialLink = {
	name: 'VK' | 'Telegram' | 'Website'
	url: string
}

export interface Organization {
	id: string
	name: string
	city: string
	type: string
	assistance: AssistanceTypeId[]
	summary: string
	description: string
	mission: string
	goals: string[]
	needs: string[]
	coordinates: [number, number]
	address: string
	contacts: {
		phone: string
		email?: string
	}
	website?: string
	socials?: SocialLink[]
	gallery: string[]
}

export const assistanceOptions: { id: AssistanceTypeId; label: string }[] = [
	{ id: 'volunteers', label: 'Требуются волонтеры' },
	{ id: 'donations', label: 'Нужны финансовые пожертвования' },
	{ id: 'things', label: 'Принимают вещи' },
	{ id: 'mentors', label: 'Требуются наставники' },
	{ id: 'blood', label: 'Нужны доноры' },
	{ id: 'experts', label: 'Требуются эксперты' },
]

export const organizations: Organization[] = [
	{
		id: 'lapki-dobra',
		name: 'Приют «Лапки добра»',
		city: 'Саров',
		type: 'Помощь животным',
		assistance: ['volunteers', 'things', 'donations'],
		summary: 'Помогаем бездомным животным найти дом и получить лечение.',
		description:
			'«Лапки добра» принимает пострадавших животных, обеспечивает медицинскую помощь и ищет для них новые семьи.',
		mission:
			'Создать безопасную среду для животных, популяризировать ответственный подход к питомцам и вовлекать жителей Сарова в волонтерство.',
		goals: [
			'Расширить сеть кураторов животных',
			'Запустить образовательные лекции для школьников',
			'Сократить количество бездомных животных на улицах города',
		],
		needs: [
			'Корм и лекарства для животных',
			'Волонтеры для выгула собак и ухода за кошками',
			'Финансовая поддержка для стерилизации',
		],
		coordinates: [54.9136, 43.3411],
		address: 'Саров, ул. Зоозащитная, 12',
		contacts: {
			phone: '+7 (900) 000-11-22',
			email: 'help@lapki-dobra.ru',
		},
		website: 'https://lapki-dobra.ru',
		socials: [
			{ name: 'VK', url: 'https://vk.com/lapki_dobra' },
			{ name: 'Telegram', url: 'https://t.me/lapki_dobra' },
		],
		gallery: [
			'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?auto=format&fit=crop&w=600&q=80',
			'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=600&q=80',
			'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80',
		],
	},
	{
		id: 'zeleny-ozersk',
		name: 'Зеленый Озёрск',
		city: 'Озёрск',
		type: 'Экология',
		assistance: ['volunteers', 'donations', 'experts'],
		summary:
			'Организуем эко-мероприятия и образовательные программы для жителей Озёрска.',
		description:
			'Команда «Зеленый Озёрск» проводит субботники, эко-фестивали, образовательные марафоны и занимается озеленением города.',
		mission:
			'Сделать Озёрск зеленым и чистым, объединяя жителей города вокруг экологичных привычек и проектов.',
		goals: [
			'Посадить 1000 деревьев в 2025 году',
			'Создать интерактивный эко-маршрут по городу',
			'Провести цикл лекций для школьников и студентов',
		],
		needs: [
			'Волонтеры для субботников и высадки деревьев',
			'Финансовая помощь на закупку саженцев и инвентаря',
			'Эксперты по экологическому просвещению',
		],
		coordinates: [55.7558, 60.7029],
		address: 'Озёрск, пр-т Победы, 5',
		contacts: {
			phone: '+7 (900) 123-45-67',
			email: 'info@green-ozersk.ru',
		},
		socials: [
			{ name: 'VK', url: 'https://vk.com/green_ozersk' },
			{ name: 'Telegram', url: 'https://t.me/green_ozersk' },
			{ name: 'Website', url: 'https://green-ozersk.ru' },
		],
		gallery: [
			'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80',
			'https://images.unsplash.com/photo-1484910292437-025e5d13ce87?auto=format&fit=crop&w=600&q=80',
			'https://images.unsplash.com/photo-1523978591478-c753949ff840?auto=format&fit=crop&w=600&q=80',
		],
	},
	{
		id: 'atom-serdce',
		name: 'Атом Сердце',
		city: 'Нововоронеж',
		type: 'Помощь пожилым',
		assistance: ['volunteers', 'donations', 'mentors'],
		summary:
			'Поддерживаем одиноких пожилых людей: помощь по дому, общение, доставка продуктов.',
		description:
			'Проект организует регулярные визиты волонтеров, мастер-классы и психологическую поддержку для пожилых жителей.',
		mission:
			'Сделать так, чтобы каждый пожилой человек чувствовал заботу, внимание и поддержку общества.',
		goals: [
			'Создать мобильную службу помощи на дому',
			'Запустить онлайн-платформу для волонтеров-наставников',
			'Организовать клубы интересов в каждом районе города',
		],
		needs: [
			'Волонтеры для адресной помощи',
			'Финансовая поддержка для закупки продуктовых наборов',
			'Наставники для дистанционного общения',
		],
		coordinates: [51.3167, 39.2167],
		address: 'Нововоронеж, ул. Дружбы, 8',
		contacts: {
			phone: '+7 (950) 555-77-88',
			email: 'support@atom-heart.ru',
		},
		website: 'https://atom-heart.ru',
		socials: [{ name: 'VK', url: 'https://vk.com/atom_serdce' }],
		gallery: [
			'https://images.unsplash.com/photo-1530023367847-a683933f4177?auto=format&fit=crop&w=600&q=80',
			'https://images.unsplash.com/photo-1492795472186-9985022f45b3?auto=format&fit=crop&w=600&q=80',
			'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
		],
	},
	{
		id: 'future-atom',
		name: 'Будущее Атома',
		city: 'Десногорск',
		type: 'Образование',
		assistance: ['volunteers', 'donations', 'experts'],
		summary:
			'Образовательные STEM-программы для школьников и студентов Десногорска.',
		description:
			'Проект объединяет наставников из атомной отрасли и университетов для проведения кружков, хакатонов и профориентации.',
		mission:
			'Подготовить новое поколение инженеров и исследователей, заинтересованных в науке и атомной энергетике.',
		goals: [
			'Запустить круглогодичный STEM-центр',
			'Обеспечить доступ к лабораториям и оборудованию',
			'Организовать стажировки на предприятиях отрасли',
		],
		needs: [
			'Эксперты-наставники для кружков',
			'Волонтеры для организации событий',
			'Стипендии для талантливых школьников',
		],
		coordinates: [54.1515, 33.2833],
		address: 'Десногорск, ул. Энергетиков, 4',
		contacts: {
			phone: '+7 (910) 123-45-67',
			email: 'hello@futureatom.ru',
		},
		socials: [
			{ name: 'VK', url: 'https://vk.com/future_atom' },
			{ name: 'Telegram', url: 'https://t.me/future_atom' },
		],
		gallery: [
			'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80',
			'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=600&q=80',
			'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=600&q=80',
		],
	},
	{
		id: 'dobry-sport',
		name: 'Добрый Спорт',
		city: 'Заречный',
		type: 'Спорт',
		assistance: ['volunteers', 'donations', 'things'],
		summary: 'Инклюзивные спортивные программы для детей и подростков.',
		description:
			'Команда запускает адаптивные секции, спортивные праздники и программы для детей с ОВЗ.',
		mission:
			'Создать равные условия для занятия спортом и развития командного духа среди всех детей города.',
		goals: [
			'Открыть инклюзивный спортивный центр',
			'Обучить тренеров адаптивным методикам',
			'Организовать турнир «Спорт объединяет»',
		],
		needs: [
			'Спортивный инвентарь и экипировка',
			'Волонтеры для сопровождения детей',
			'Средства на аренду залов',
		],
		coordinates: [53.1965, 45.1709],
		address: 'Заречный, ул. Спортивная, 22',
		contacts: {
			phone: '+7 (902) 222-33-44',
			email: 'team@kind-sport.ru',
		},
		socials: [
			{ name: 'VK', url: 'https://vk.com/kind_sport' },
			{ name: 'Telegram', url: 'https://t.me/kind_sport' },
		],
		gallery: [
			'https://images.unsplash.com/photo-1546483875-ad9014c88eba?auto=format&fit=crop&w=600&q=80',
			'https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=600&q=80',
			'https://images.unsplash.com/photo-1472653431158-6364773b2a56?auto=format&fit=crop&w=600&q=80',
		],
	},
	{
		id: 'atom-care',
		name: 'Атом Забота',
		city: 'Снежинск',
		type: 'Поддержка людей с ОВЗ',
		assistance: ['volunteers', 'donations', 'mentors', 'things'],
		summary:
			'Помогаем семьям с детьми с особенностями развития: реабилитация, занятия и поддержка специалистов.',
		description:
			'Проводим развивающие программы, арт-терапию, консультации логопедов и психологов, обеспечиваем техническими средствами.',
		mission:
			'Обеспечить доступную комплексную поддержку для людей с ОВЗ и их семей в Снежинске.',
		goals: [
			'Расширить число реабилитационных программ',
			'Создать базу волонтеров-наставников',
			'Оснастить центр современным оборудованием',
		],
		needs: [
			'Финансирование реабилитационных курсов',
			'Волонтеры для сопровождения занятий',
			'Наставники для подростков',
			'Специализированные средства ухода',
		],
		coordinates: [56.0851, 60.7314],
		address: 'Снежинск, ул. Надежды, 10',
		contacts: {
			phone: '+7 (951) 999-55-44',
			email: 'care@atom-zabota.ru',
		},
		socials: [
			{ name: 'VK', url: 'https://vk.com/atom_care' },
			{ name: 'Telegram', url: 'https://t.me/atom_care' },
		],
		gallery: [
			'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=600&q=80',
			'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80',
			'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=600&q=80',
		],
	},
]

export const cities = Array.from(
	new Set(organizations.map(item => item.city))
).sort()

export const organizationTypes = Array.from(
	new Set(organizations.map(item => item.type))
).sort()
