// Утилиты для работы с квестами

import type { Quest, QuestStage } from '@/components/map/types/quest-types'

export function calculateQuestProgress(quest: Quest): number {
	if (quest.stages.length === 0) return 0
	
	const totalProgress = quest.stages.reduce((sum, stage) => sum + stage.progress, 0)
	return Math.round(totalProgress / quest.stages.length)
}

export function getQuestProgressColor(progress: number): Quest['progressColor'] {
	if (progress === 100) return 'victory'
	if (progress >= 76) return 'green'
	if (progress >= 51) return 'yellow'
	if (progress >= 26) return 'orange'
	return 'red'
}

export function findStageById(quest: Quest, stageId: string): QuestStage | undefined {
	return quest.stages.find(stage => stage.id === stageId)
}

export function getActiveStages(quest: Quest): QuestStage[] {
	return quest.stages.filter(stage => stage.status === 'in_progress')
}

export function getCompletedStages(quest: Quest): QuestStage[] {
	return quest.stages.filter(stage => stage.status === 'completed')
}

