import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export interface StageFormData {
	title: string
	description: string
	status: 'pending' | 'in_progress' | 'completed'
	progress: number
	hasFinancial?: boolean
	financialNeeded?: number
	hasVolunteers?: boolean
	volunteersNeeded?: number
	hasItems?: boolean
	itemsNeeded?: number
	itemName?: string
	deadline?: string
}

interface QuestStageFormProps {
	stage: StageFormData
	index: number
	canRemove: boolean
	onUpdate: (field: keyof StageFormData, value: unknown) => void
	onRemove: () => void
}

export function QuestStageForm({
	stage,
	index,
	canRemove,
	onUpdate,
	onRemove,
}: QuestStageFormProps) {
	return (
		<div className='border border-slate-200 rounded-lg p-4 bg-slate-50'>
			<div className='flex items-center justify-between mb-3'>
				<h3 className='text-sm font-semibold text-slate-900'>
					Этап {index + 1}
				</h3>
				{canRemove && (
					<Button type='button' variant='outline' size='sm' onClick={onRemove}>
						Удалить
					</Button>
				)}
			</div>

			<div className='space-y-3'>
				<div>
					<label className='block text-xs font-medium text-slate-600 mb-1'>
						Название этапа *
					</label>
					<Input
						value={stage.title}
						onChange={e => onUpdate('title', e.target.value)}
						required
						placeholder='Например: Закупка материалов'
					/>
				</div>

				<div>
					<label className='block text-xs font-medium text-slate-600 mb-1'>
						Описание этапа *
					</label>
					<textarea
						value={stage.description}
						onChange={e => onUpdate('description', e.target.value)}
						required
						rows={2}
						className='w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm'
						placeholder='Описание этапа...'
					/>
				</div>

				<div className='grid grid-cols-2 gap-3'>
					<div>
						<label className='block text-xs font-medium text-slate-600 mb-1'>
							Статус
						</label>
						<select
							value={stage.status}
							onChange={e =>
								onUpdate('status', e.target.value as StageFormData['status'])
							}
							className='w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm'
						>
							<option value='pending'>Ожидает</option>
							<option value='in_progress'>В процессе</option>
							<option value='completed'>Завершен</option>
						</select>
					</div>

					<div>
						<label className='block text-xs font-medium text-slate-600 mb-1'>
							Прогресс (%)
						</label>
						<Input
							type='number'
							min={0}
							max={100}
							value={stage.progress}
							onChange={e => onUpdate('progress', Number(e.target.value))}
						/>
					</div>
				</div>

				{/* Требования */}
				<div className='space-y-2 pt-2 border-t border-slate-200'>
					<p className='text-xs font-medium text-slate-600 mb-2'>
						Требования этапа (необязательно)
					</p>

					<div className='space-y-4 pr-4'>
						<label className='flex items-center gap-2'>
							<input
								type='checkbox'
								checked={stage.hasFinancial || false}
								onChange={e => onUpdate('hasFinancial', e.target.checked)}
								className='w-4 h-4 rounded border-slate-300'
							/>
							<span className='text-xs text-slate-700'>
								Требуется финансовая поддержка
							</span>
						</label>
						{stage.hasFinancial && (
							<Input
								type='number'
								min={0}
								value={stage.financialNeeded || ''}
								onChange={e =>
									onUpdate('financialNeeded', Number(e.target.value))
								}
								placeholder='Сумма (руб.)'
								className='ml-6'
							/>
						)}

						<label className='flex items-center gap-2'>
							<input
								type='checkbox'
								checked={stage.hasVolunteers || false}
								onChange={e => onUpdate('hasVolunteers', e.target.checked)}
								className='w-4 h-4 rounded border-slate-300'
							/>
							<span className='text-xs text-slate-700'>
								Требуются волонтеры
							</span>
						</label>
						{stage.hasVolunteers && (
							<Input
								type='number'
								min={0}
								value={stage.volunteersNeeded || ''}
								onChange={e =>
									onUpdate('volunteersNeeded', Number(e.target.value))
								}
								placeholder='Количество волонтеров'
								className='ml-6'
							/>
						)}

						<label className='flex items-center gap-2'>
							<input
								type='checkbox'
								checked={stage.hasItems || false}
								onChange={e => onUpdate('hasItems', e.target.checked)}
								className='w-4 h-4 rounded border-slate-300'
							/>
							<span className='text-xs text-slate-700'>
								Требуются предметы/материалы
							</span>
						</label>
						{stage.hasItems && (
							<div className='ml-6 space-y-2'>
								<Input
									type='text'
									value={stage.itemName || ''}
									onChange={e => onUpdate('itemName', e.target.value)}
									placeholder='Название предмета'
								/>
								<Input
									type='number'
									min={0}
									value={stage.itemsNeeded || ''}
									onChange={e =>
										onUpdate('itemsNeeded', Number(e.target.value))
									}
									placeholder='Количество'
								/>
							</div>
						)}
					</div>

					<div>
						<label className='block text-xs font-medium text-slate-600 mb-1'>
							Дедлайн (необязательно)
						</label>
						<Input
							type='date'
							value={stage.deadline || ''}
							onChange={e => onUpdate('deadline', e.target.value)}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}
