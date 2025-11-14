import { useEffect, useState } from 'react'
import './App.css'
import { ModeratorPanel } from './components/moderator/ModeratorPanel'
import { Navigation } from './components/Navigation'
import { AddOrganizationPage } from './components/pages/AddOrganizationPage'
import { HomePage } from './components/pages/HomePage'
import { MapPage } from './components/pages/MapPage'

type Page = 'home' | 'map' | 'add'

function App() {
	const [isModeratorMode, setIsModeratorMode] = useState(false)
	const [currentPage, setCurrentPage] = useState<Page>('home')

	// Обработка hash навигации для обратной совместимости
	useEffect(() => {
		const handleHashChange = () => {
			const hash = window.location.hash
			if (hash === '#map-section' || hash === '#map') {
				setCurrentPage('map')
			} else if (hash === '#add-organization' || hash === '#add') {
				setCurrentPage('add')
			}
		}

		handleHashChange()
		window.addEventListener('hashchange', handleHashChange)

		return () => {
			window.removeEventListener('hashchange', handleHashChange)
		}
	}, [])

	// Обновляем hash при изменении страницы
	useEffect(() => {
		if (currentPage === 'map') {
			window.history.replaceState(null, '', '#map')
		} else if (currentPage === 'add') {
			window.history.replaceState(null, '', '#add-organization')
		} else {
			window.history.replaceState(null, '', '#')
		}
	}, [currentPage])

	const handleNavigate = (page: Page) => {
		setCurrentPage(page)
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	if (isModeratorMode) {
		return <ModeratorPanel onExit={() => setIsModeratorMode(false)} />
	}

	return (
		<div className='app-shell'>
			<button
				className='moderator-toggle'
				onClick={() => setIsModeratorMode(true)}
				type='button'
				title='Войти в панель модератора'
			>
				⚙️
			</button>

			<Navigation currentPage={currentPage} onNavigate={handleNavigate} />

			{currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
			{currentPage === 'map' && <MapPage />}
			{currentPage === 'add' && <AddOrganizationPage />}

			<footer className='app-footer'>
				<p>
					© {new Date().getFullYear()} АтомДобро. Сделано с заботой для
					волонтеров атомной отрасли.
				</p>
			</footer>
		</div>
	)
}

export default App
