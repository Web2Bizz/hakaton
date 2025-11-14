// vite.config.ts
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'
import { w2bViteFileBasedRouting } from 'w2b-vite-filebased-routing/core'

export default defineConfig({
	plugins: [react(), w2bViteFileBasedRouting(), tailwindcss()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
})
