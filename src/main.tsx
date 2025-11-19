import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'w2b-vite-filebased-routing/react'
import { Spinner } from './components'
import './index.css'

//react leaflet
import 'leaflet-defaulticon-compatibility'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
// @ts-expect-error - react-leaflet-cluster может иметь несовместимость версий
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css'
// @ts-expect-error - react-leaflet-cluster может иметь несовместимость версий
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<RouterProvider preloader={<Spinner />} />
	</React.StrictMode>
)
