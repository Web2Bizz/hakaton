// vite.config.ts
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { w2bViteFileBasedRouting } from 'w2b-vite-filebased-routing/core'
import { swVersionPlugin } from './src/pwa/swVersionPlugin'

export default defineConfig({
	plugins: [
		react(),
		w2bViteFileBasedRouting({
			baseUrl: 'https://it-hackathon-team05.mephi.ru',
			disallowPaths: ['/health', '/api', '/sw.js', '/registerSW.js'],
			enableSEO: true,
		}),
		tailwindcss(),
		swVersionPlugin(), // Плагин для автоматического обновления версии
		VitePWA({
			registerType: 'prompt', // Используем prompt вместо autoUpdate, так как у нас кастомный SW
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
			},
			includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
			manifest: false, // Отключаем автоматическую генерацию manifest
			devOptions: {
				enabled: false, // Отключаем dev service worker, чтобы убрать сообщения в консоли
			},
		}),
	],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					// React и React DOM
					'react-vendor': ['react', 'react-dom', 'react-router-dom'],
					// Redux и связанные библиотеки
					'redux-vendor': ['react-redux', '@reduxjs/toolkit', 'redux-persist'],
					// Leaflet и карты (большая библиотека)
					'leaflet-vendor': [
						'leaflet',
						'react-leaflet',
						'leaflet.markercluster',
						'react-leaflet-cluster',
						'leaflet-defaulticon-compatibility',
					],
					// Формы и валидация
					'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
					// UI библиотеки
					'ui-vendor': [
						'@radix-ui/react-alert-dialog',
						'@radix-ui/react-label',
						'@radix-ui/react-slot',
						'sonner',
						'class-variance-authority',
						'clsx',
						'tailwind-merge',
					],
					// Иконки (lucide-react может быть большим)
					'icons-vendor': ['lucide-react'],
				},
			},
		},
		chunkSizeWarningLimit: 600,
	},
})
