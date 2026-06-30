import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** WebView Telegram блокирует module/script с crossorigin → белый экран */
function removeCrossoriginPlugin(): Plugin {
  return {
    name: 'remove-crossorigin',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return html.replace(/\s+crossorigin(="[^"]*")?/gi, '')
      },
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), removeCrossoriginPlugin()],
  base: './',
  build: {
    target: 'es2015',
    cssTarget: 'chrome61',
    modulePreload: {
      polyfill: false,
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    open: true,
  },
  preview: {
    host: true,
    port: 4173,
    open: true,
  },
})
