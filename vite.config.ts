// vite.config.ts
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { w2bViteFileBasedRouting } from 'w2b-vite-filebased-routing/core'

export default defineConfig({
	plugins: [
		react(),
		w2bViteFileBasedRouting(),
		tailwindcss(),
		VitePWA({
			registerType: 'autoUpdate',
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
			},
			includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
			manifest: false, // Отключаем автоматическую генерацию manifest
		}),
	],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
})
