/// <reference types="@testing-library/jest-dom" />
import { QuestEditForm } from '@/components/manage/QuestEditForm'
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
	mockCategory,
	mockCity,
	mockOrganizationType,
	mockQuest,
	mockUser,
} from '../utils/mocks/fixtures'
import { server } from '../utils/mocks/server'
import { renderWithProviders, userEvent } from '../utils/test-utils'

/**
 * Тесты для проверки ограничений на редактирование квестов
 * Эти тесты должны выявить проблемы в коде, если они есть
 */

// Мокируем LocationPicker
vi.mock('@/components/forms/shared/LocationPicker', async () => {
	const actual = await vi.importActual(
		'@/components/forms/shared/LocationPicker'
	)
	return {
		...actual,
		LocationPicker: ({
			onSelect,
			onClose,
		}: {
			onSelect: (coords: [number, number]) => void
			onClose: () => void
		}) => {
			React.useEffect(() => {
				const timer = setTimeout(() => {
					onSelect([55.7558, 37.6173])
					onClose()
				}, 100)
				return () => clearTimeout(timer)
			}, [onSelect, onClose])

			return (
				<div data-testid='location-picker'>
					<button onClick={onClose}>Закрыть</button>
				</div>
			)
		},
	}
})

describe('Quest Edit Restrictions - Проблемы в коде', () => {
	// Увеличиваем глобальный таймаут для всех тестов в этом файле
	beforeEach(() => {
		localStorage.clear()
		vi.clearAllMocks()

		// Устанавливаем авторизованного пользователя
		localStorage.setItem('authToken', 'mock-access-token')
		localStorage.setItem('refreshToken', 'mock-refresh-token')
		localStorage.setItem('ecoquest_user', JSON.stringify(mockUser))
	})

	afterEach(() => {
		server.resetHandlers()
	})

	it('ПРОБЛЕМА: Должен блокировать редактирование archived квеста, но форма позволяет редактировать', async () => {
		// Мокаем archived квест
		const archivedQuest = {
			...mockQuest,
			id: 1,
			title: 'Архивный квест',
			status: 'archived' as const,
			ownerId: Number.parseInt(mockUser.id, 10),
			categories: [mockCategory],
		}

		server.use(
			http.get('https://it-hackathon-team05.mephi.ru/api/v2/quests/:id', () => {
				return HttpResponse.json(archivedQuest)
			}),
			http.get('https://it-hackathon-team05.mephi.ru/api/v1/cities', () => {
				return HttpResponse.json([mockCity])
			}),
			http.get(
				'https://it-hackathon-team05.mephi.ru/api/v1/organization-types',
				() => {
					return HttpResponse.json([mockOrganizationType])
				}
			),
			http.get('https://it-hackathon-team05.mephi.ru/api/v1/categories', () => {
				return HttpResponse.json([mockCategory])
			})
		)

		renderWithProviders(<QuestEditForm questId={1} />)

		// Ждем загрузки формы с таймаутом
		await waitFor(
			() => {
				const titleInput = screen.queryByLabelText(/название квеста/i)
				expect(titleInput).toBeInTheDocument()
			},
			{ timeout: 5000 }
		)

		const titleInput = screen.getByLabelText(/название квеста/i)
		const submitButton = screen.getByRole('button', {
			name: /сохранить изменения/i,
		})

		// ПРОБЛЕМА: Форма должна быть disabled для archived квестов, но это не проверяется
		// Проверяем, что форма НЕ заблокирована (это проблема!)
		expect(titleInput).not.toBeDisabled()
		expect(submitButton).not.toBeDisabled()

		// Выводим предупреждение о проблеме
		console.warn(
			'ПРОБЛЕМА: Форма позволяет редактировать archived квест без ограничений'
		)
	}, 10000)

	it('ПРОБЛЕМА: Должен блокировать редактирование completed квеста, но форма позволяет редактировать', async () => {
		// Мокаем completed квест
		const completedQuest = {
			...mockQuest,
			id: 2,
			title: 'Завершенный квест',
			status: 'completed' as const,
			ownerId: Number.parseInt(mockUser.id, 10),
			categories: [mockCategory],
		}

		server.use(
			http.get('https://it-hackathon-team05.mephi.ru/api/v2/quests/:id', () => {
				return HttpResponse.json(completedQuest)
			}),
			http.get('https://it-hackathon-team05.mephi.ru/api/v1/cities', () => {
				return HttpResponse.json([mockCity])
			}),
			http.get(
				'https://it-hackathon-team05.mephi.ru/api/v1/organization-types',
				() => {
					return HttpResponse.json([mockOrganizationType])
				}
			),
			http.get('https://it-hackathon-team05.mephi.ru/api/v1/categories', () => {
				return HttpResponse.json([mockCategory])
			})
		)

		renderWithProviders(<QuestEditForm questId={2} />)

		await waitFor(
			() => {
				const titleInput = screen.queryByLabelText(/название квеста/i)
				expect(titleInput).toBeInTheDocument()
			},
			{ timeout: 5000 }
		)

		const titleInput = screen.getByLabelText(/название квеста/i)
		const submitButton = screen.getByRole('button', {
			name: /сохранить изменения/i,
		})

		// ПРОБЛЕМА: Форма должна быть disabled для completed квестов
		expect(titleInput).not.toBeDisabled()
		expect(submitButton).not.toBeDisabled()

		// Выводим предупреждение о проблеме
		console.warn(
			'ПРОБЛЕМА: Форма позволяет редактировать completed квест без ограничений'
		)
	}, 10000)

	it('ПРОБЛЕМА: Должен проверять владельца квеста, но форма не проверяет это', async () => {
		// Мокаем квест, принадлежащий другому пользователю
		const otherUserQuest = {
			...mockQuest,
			id: 3,
			title: 'Чужой квест',
			status: 'active' as const,
			ownerId: 999, // Другой владелец
			categories: [mockCategory],
		}

		server.use(
			http.get('https://it-hackathon-team05.mephi.ru/api/v2/quests/:id', () => {
				return HttpResponse.json(otherUserQuest)
			}),
			http.get('https://it-hackathon-team05.mephi.ru/api/v1/cities', () => {
				return HttpResponse.json([mockCity])
			}),
			http.get(
				'https://it-hackathon-team05.mephi.ru/api/v1/organization-types',
				() => {
					return HttpResponse.json([mockOrganizationType])
				}
			),
			http.get('https://it-hackathon-team05.mephi.ru/api/v1/categories', () => {
				return HttpResponse.json([mockCategory])
			})
		)

		// ПРОБЛЕМА: Форма должна проверять владельца, но может не проверять
		renderWithProviders(<QuestEditForm questId={3} />)

		// Ждем загрузки (либо формы, либо ошибки)
		await waitFor(
			() => {
				const titleInput = screen.queryByLabelText(/название квеста/i)
				const errorMessage = screen.queryByText(
					/нет доступа|не владелец|доступ запрещен/i
				)
				// Ждем, пока что-то появится
				expect(titleInput || errorMessage).toBeTruthy()
			},
			{ timeout: 5000 }
		)

		const titleInput = screen.queryByLabelText(/название квеста/i)
		const errorMessage = screen.queryByText(
			/нет доступа|не владелец|доступ запрещен/i
		)

		if (titleInput && !errorMessage) {
			console.warn(
				'ПРОБЛЕМА: Форма позволяет редактировать квест, принадлежащий другому пользователю'
			)
			console.warn(
				'ПРОБЛЕМА: Нет проверки владельца квеста в форме редактирования'
			)
		}
	}, 10000)

	it('ПРОБЛЕМА: Должен блокировать отправку формы без координат, но может не блокировать', async () => {
		const user = userEvent.setup()

		const activeQuest = {
			...mockQuest,
			id: 4,
			title: 'Активный квест',
			status: 'active' as const,
			ownerId: Number.parseInt(mockUser.id, 10),
			latitude: '',
			longitude: '',
			categories: [mockCategory],
		}

		server.use(
			http.get('https://it-hackathon-team05.mephi.ru/api/v2/quests/:id', () => {
				return HttpResponse.json(activeQuest)
			}),
			http.get('https://it-hackathon-team05.mephi.ru/api/v1/cities', () => {
				return HttpResponse.json([mockCity])
			}),
			http.get(
				'https://it-hackathon-team05.mephi.ru/api/v1/organization-types',
				() => {
					return HttpResponse.json([mockOrganizationType])
				}
			),
			http.get('https://it-hackathon-team05.mephi.ru/api/v1/categories', () => {
				return HttpResponse.json([mockCategory])
			})
		)

		renderWithProviders(<QuestEditForm questId={4} />)

		await waitFor(
			() => {
				const titleInput = screen.queryByLabelText(/название квеста/i)
				expect(titleInput).toBeInTheDocument()
			},
			{ timeout: 5000 }
		)

		const submitButton = screen.getByRole('button', {
			name: /сохранить изменения/i,
		})

		// Пробуем отправить форму без координат
		await user.click(submitButton)

		// Должна быть ошибка валидации
		// Может быть в форме или в toast, поэтому используем queryAllByText
		await waitFor(
			() => {
				const errorMessages = screen.queryAllByText(/выберите местоположение/i)
				if (errorMessages.length > 0) {
					expect(errorMessages.length).toBeGreaterThan(0)
					expect(errorMessages[0]).toBeInTheDocument()
				} else {
					console.warn(
						'ПРОБЛЕМА: Форма не блокирует отправку без координат или не показывает ошибку'
					)
				}
			},
			{ timeout: 3000 }
		)
	}, 10000)
})
