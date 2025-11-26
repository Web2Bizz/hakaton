import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'w2b-vite-filebased-routing/react'
import { Spinner } from './components'
import './index.css'

// Leaflet CSS загружаем сразу, но JS будет загружаться динамически
import 'leaflet/dist/leaflet.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
	<RouterProvider preloader={<Spinner />} />
)
