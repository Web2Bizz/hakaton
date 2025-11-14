import { assistanceOptions } from '../data/organizations'
import type { Organization } from '../data/organizations'

interface OrganizationDetailsProps {
  organization?: Organization
  onClose?: () => void
}

const assistanceLabels = assistanceOptions.reduce<Record<string, string>>((acc, option) => {
  acc[option.id] = option.label
  return acc
}, {})

export function OrganizationDetails({ organization, onClose }: OrganizationDetailsProps) {
  if (!organization) {
    return null
  }

  return (
    <section className="details-panel">
      <header>
        <div className="details-header-top">
          <div>
            <p className="details-city">{organization.city}</p>
            <h2>{organization.name}</h2>
            <p className="details-type">{organization.type}</p>
          </div>
          {onClose && (
            <button className="close-details-button" onClick={onClose} type="button" title="Закрыть">
              ✕
            </button>
          )}
        </div>
      </header>

      <p className="details-summary">{organization.summary}</p>

      <div className="details-section">
        <h3>Миссия</h3>
        <p>{organization.mission}</p>
      </div>

      <div className="details-section">
        <h3>Цели</h3>
        <ul>
          {organization.goals.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="details-section">
        <h3>Актуальные нужды</h3>
        <ul>
          {organization.needs.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="details-section">
        <h3>Как можно помочь</h3>
        <div className="badge-list">
          {organization.assistance.map((item) => (
            <span key={item} className="badge">
              {assistanceLabels[item] ?? item}
            </span>
          ))}
        </div>
      </div>

      <div className="details-section">
        <h3>Контакты</h3>
        <div className="contact-grid">
          <span>Адрес</span>
          <p>{organization.address}</p>
          <span>Телефон</span>
          <a href={`tel:${organization.contacts.phone}`}>{organization.contacts.phone}</a>
          {organization.contacts.email && (
            <>
              <span>Email</span>
              <a href={`mailto:${organization.contacts.email}`}>{organization.contacts.email}</a>
            </>
          )}
          {organization.website && (
            <>
              <span>Сайт</span>
              <a href={organization.website} target="_blank" rel="noreferrer">
                {organization.website}
              </a>
            </>
          )}
          {organization.socials && organization.socials.length > 0 && (
            <>
              <span>Соцсети</span>
              <div className="social-links">
                {organization.socials.map((social) => (
                  <a key={social.url} href={social.url} target="_blank" rel="noreferrer">
                    {social.name}
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="details-section">
        <h3>Галерея</h3>
        <div className="gallery">
          {organization.gallery.map((image) => (
            <img key={image} src={image} alt={organization.name} loading="lazy" />
          ))}
        </div>
      </div>
    </section>
  )
}

