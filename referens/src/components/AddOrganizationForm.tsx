import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { assistanceOptions, organizationTypes } from '../data/organizations'

interface FormState {
  name: string
  city: string
  type: string
  description: string
  contacts: string
  website: string
  assistance: Record<string, boolean>
}

const createInitialState = (): FormState => ({
  name: '',
  city: '',
  type: '',
  description: '',
  contacts: '',
  website: '',
  assistance: assistanceOptions.reduce<FormState['assistance']>((acc, option) => {
    acc[option.id] = false
    return acc
  }, {}),
})

export function AddOrganizationForm() {
  const [formState, setFormState] = useState<FormState>(createInitialState)
  const [submitted, setSubmitted] = useState(false)

  const selectedAssistance = useMemo(
    () => Object.entries(formState.assistance).filter(([, value]) => value).map(([key]) => key),
    [formState.assistance],
  )

  const handleInputChange = (field: keyof Omit<FormState, 'assistance'>) => (value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCheckboxChange = (id: string) => {
    setFormState((prev) => ({
      ...prev,
      assistance: {
        ...prev.assistance,
        [id]: !prev.assistance[id],
      },
    }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // имитируем отправку данных
    setSubmitted(true)
    setFormState(createInitialState())
    window.setTimeout(() => setSubmitted(false), 4000)
  }

  return (
    <section className="add-organization">
      <div className="section-header">
        <h2>Добавить свою организацию</h2>
        <p>
          Заполните информацию о вашей НКО. Заявка поступит модератору и после подтверждения организация появится на
          карте.
        </p>
      </div>

      <form className="organization-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="form-field">
            <span>Название организации *</span>
            <input
              type="text"
              required
              value={formState.name}
              onChange={(event) => handleInputChange('name')(event.target.value)}
              placeholder="Например, «Светлый город»"
            />
          </label>

          <label className="form-field">
            <span>Город *</span>
            <input
              type="text"
              required
              value={formState.city}
              onChange={(event) => handleInputChange('city')(event.target.value)}
              placeholder="Город"
            />
          </label>

          <label className="form-field">
            <span>Направление *</span>
            <select
              required
              value={formState.type}
              onChange={(event) => handleInputChange('type')(event.target.value)}
            >
              <option value="">Выберите направление</option>
              {organizationTypes.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Контакты *</span>
            <input
              type="text"
              required
              value={formState.contacts}
              onChange={(event) => handleInputChange('contacts')(event.target.value)}
              placeholder="Телефон, email или ссылки"
            />
          </label>
        </div>

        <label className="form-field">
          <span>Описание *</span>
          <textarea
            required
            rows={4}
            value={formState.description}
            onChange={(event) => handleInputChange('description')(event.target.value)}
            placeholder="Кратко расскажите о миссии, деятельности и текущих задачах."
          />
        </label>

        <label className="form-field">
          <span>Сайт или соцсети</span>
          <input
            type="url"
            value={formState.website}
            onChange={(event) => handleInputChange('website')(event.target.value)}
            placeholder="https://example.com"
          />
        </label>

        <div className="form-field">
          <span>Какая помощь требуется</span>
          <div className="assistance-list compact">
            {assistanceOptions.map((option) => (
              <label key={option.id} className="checkbox">
                <input
                  type="checkbox"
                  checked={Boolean(formState.assistance[option.id])}
                  onChange={() => handleCheckboxChange(option.id)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {selectedAssistance.length > 0 && (
          <p className="selected-assistance">
            Указаны виды помощи:{' '}
            <strong>
              {selectedAssistance
                .map((id) => assistanceOptions.find((item) => item.id === id)?.label)
                .filter(Boolean)
                .join(', ')}
            </strong>
          </p>
        )}

        <div className="form-actions">
          <button type="submit" className="primary-button">
            Отправить заявку
          </button>
          {submitted && <span className="form-success">Заявка отправлена! Мы свяжемся после модерации.</span>}
        </div>
      </form>
    </section>
  )
}

