import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo/logo_mobydickets-1-3.png'],
      manifest: {
        name: 'Moby Dick — Presenze',
        short_name: 'Moby App',
        description: 'Sistema di gestione presenze volontari Moby Dick ETS',
        theme_color: '#4A8EAA',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'logo/logo_mobydickets-1-3.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
