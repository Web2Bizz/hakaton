import type { Achievement, AchievementId } from '@/types/user'

export const allAchievements: Record<AchievementId, Achievement> = {
	first_quest: {
		id: 'first_quest',
		title: 'Первый шаг',
		description: 'Присоединились к своему первому квесту',
		icon: '🎯',
		rarity: 'common',
	},
	lake_saver: {
		id: 'lake_saver',
		title: 'Спаситель озер',
		description: 'Помогли очистить озеро от мусора',
		icon: '🌊',
		rarity: 'rare',
	},
	volunteer_month: {
		id: 'volunteer_month',
		title: 'Волонтер месяца',
		description: 'Активно участвовали в волонтерских мероприятиях',
		icon: '⭐',
		rarity: 'epic',
	},
	crowdfunding_master: {
		id: 'crowdfunding_master',
		title: 'Мастер краудфандинга',
		description: 'Собрали более 50 000 рублей на квесты',
		icon: '💰',
		rarity: 'epic',
	},
	tree_planter: {
		id: 'tree_planter',
		title: 'Посадил дерево',
		description: 'Внесли вклад в посадку деревьев',
		icon: '🌳',
		rarity: 'common',
	},
	wildlife_protector: {
		id: 'wildlife_protector',
		title: 'Защитник дикой природы',
		description: 'Помогли защитить диких животных',
		icon: '🐺',
		rarity: 'rare',
	},
	eco_warrior: {
		id: 'eco_warrior',
		title: 'Эко-воин',
		description: 'Участвовали в 10+ экологических квестах',
		icon: '🌿',
		rarity: 'epic',
	},
	community_hero: {
		id: 'community_hero',
		title: 'Герой сообщества',
		description: 'Помогли более 100 людям',
		icon: '🦸',
		rarity: 'legendary',
	},
	donation_champion: {
		id: 'donation_champion',
		title: 'Чемпион донатов',
		description: 'Внесли более 100 000 рублей',
		icon: '💎',
		rarity: 'legendary',
	},
	quest_completer: {
		id: 'quest_completer',
		title: 'Завершитель квестов',
		description: 'Завершили 5 квестов на 100%',
		icon: '🏆',
		rarity: 'legendary',
	},
}

export function getAchievementById(id: AchievementId): Achievement {
	return allAchievements[id]
}

export function getAchievementsByRarity(
	rarity: Achievement['rarity']
): Achievement[] {
	return Object.values(allAchievements).filter(a => a.rarity === rarity)
}

