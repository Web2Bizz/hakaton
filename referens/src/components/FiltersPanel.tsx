import type { ChangeEvent } from 'react'
import { assistanceOptions } from '../data/organizations'

export interface FiltersState {
  city: string
  type: string
  assistance: AssistanceFilters
  search: string
}

export type AssistanceFilters = Record<string, boolean>

interface FiltersPanelProps {
  filters: FiltersState
  cities: string[]
  types: string[]
  onFiltersChange: (filters: FiltersState) => void
}

export function FiltersPanel({ filters, cities, types, onFiltersChange }: FiltersPanelProps) {
  const handleSelectChange =
    (field: keyof Pick<FiltersState, 'city' | 'type'>) => (event: ChangeEvent<HTMLSelectElement>) => {
      onFiltersChange({
        ...filters,
        [field]: event.target.value,
      })
    }

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      search: event.target.value,
    })
  }

  const handleAssistanceToggle = (id: string) => {
    onFiltersChange({
      ...filters,
      assistance: {
        ...filters.assistance,
        [id]: !filters.assistance[id],
      },
    })
  }

  const resetFilters = () => {
    onFiltersChange({
      city: '',
      type: '',
      assistance: assistanceOptions.reduce<AssistanceFilters>((acc, item) => {
        acc[item.id] = false
        return acc
      }, {}),
      search: '',
    })
  }

  return (
    <aside className="filters-panel">
      <div className="filters-header">
        <h2>Найти организацию</h2>
        <button className="ghost-button" type="button" onClick={resetFilters}>
          Сбросить
        </button>
      </div>

      <label className="form-field">
        <span>Город</span>
        <select value={filters.city} onChange={handleSelectChange('city')}>
          <option value="">Все города</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </label>

      <label className="form-field">
        <span>Тип организации</span>
        <select value={filters.type} onChange={handleSelectChange('type')}>
          <option value="">Все направления</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>

      <label className="form-field">
        <span>Ключевые слова</span>
        <input
          type="search"
          value={filters.search}
          onChange={handleSearchChange}
          placeholder="Название или описание"
        />
      </label>

      <div className="form-field">
        <span>Вид помощи</span>
        <div className="assistance-list">
          {assistanceOptions.map((option) => (
            <label key={option.id} className="checkbox">
              <input
                type="checkbox"
                checked={Boolean(filters.assistance[option.id])}
                onChange={() => handleAssistanceToggle(option.id)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  )
}

