import type { KeyboardEvent } from 'react'
import { assistanceOptions } from '../data/organizations'
import type { Organization } from '../data/organizations'

const assistanceLabels = assistanceOptions.reduce<Record<string, string>>((acc, option) => {
  acc[option.id] = option.label
  return acc
}, {})

interface OrganizationListProps {
  organizations: Organization[]
  activeId?: string
  onSelect: (organization: Organization) => void
}

export function OrganizationList({ organizations, activeId, onSelect }: OrganizationListProps) {
  return (
    <section className="organizations-list">
      <div className="list-header">
        <h2>Организации</h2>
      </div>

      <div className="list-content-wrapper">
        <div className="list-content">
          {organizations.map((organization) => {
            const isActive = organization.id === activeId
            return (
              <article
                key={organization.id}
                className={`organization-card${isActive ? ' active' : ''}`}
                onClick={() => onSelect(organization)}
                role="button"
                tabIndex={0}
                onKeyDown={(event: KeyboardEvent<HTMLElement>) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onSelect(organization)
                  }
                }}
              >
                <div className="card-header">
                  <span className="card-city">{organization.city}</span>
                  <span className="card-type">{organization.type}</span>
                </div>
                <h3>{organization.name}</h3>
                <p>{organization.summary}</p>
                <div className="card-tags">
                  {organization.assistance.map((item) => (
                    <span key={item} className="tag">
                      {assistanceLabels[item] ?? item}
                    </span>
                  ))}
                </div>
              </article>
            )
          })}
          {organizations.length === 0 && (
            <p className="empty-state">
              Не найдено организаций, подходящих под выбранные фильтры. Попробуйте изменить запрос.
            </p>
          )}
        </div>
        {organizations.length > 0 && (
          <div className="list-footer">
            <p>
              Найдено: <strong>{organizations.length}</strong>
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

