import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** WebView Telegram: crossorigin и ES modules часто ломают загрузку */
function telegramCompatPlugin(): Plugin {
  return {
    name: 'telegram-compat',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return html
          .replace(/\s+crossorigin(="[^"]*")?/gi, '')
          .replace(/\stype="module"/g, '')
          .replace(
            /<script src="\.\/assets\/app\.js"><\/script>/,
            '<script defer src="./assets/app.js"></script>',
          )
      },
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), telegramCompatPlugin()],
  base: './',
  build: {
    target: 'es2015',
    cssTarget: 'chrome61',
    cssCodeSplit: false,
    modulePreload: {
      polyfill: false,
    },
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: 'assets/app.js',
        assetFileNames: 'assets/app.[ext]',
        name: 'BrsCalculator',
      },
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
