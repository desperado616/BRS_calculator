import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** Совместимость с WebView Telegram: IIFE, абсолютные пути, без module/crossorigin */
function telegramCompatPlugin(): Plugin {
  return {
    name: 'telegram-compat',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const scriptMatch = html.match(
          /<script[^>]+src="(\/?assets\/[^"]+\.js)"[^>]*><\/script>/,
        )
        const cssMatch = html.match(
          /<link[^>]+href="(\/?assets\/[^"]+\.css)"[^>]*>/,
        )

        const jsPath = scriptMatch?.[1]?.replace(/^\.\//, '/') ?? '/assets/app.js'
        const cssPath = cssMatch?.[1]?.replace(/^\.\//, '/') ?? '/assets/app.css'

        let result = html
          .replace(/\s+crossorigin(="[^"]*")?/gi, '')
          .replace(/\stype="module"/g, '')
          .replace(/<script[^>]+src="\/?assets\/[^"]+\.js"[^>]*><\/script>\n?/g, '')
          .replace(/<link[^>]+href="\/?assets\/[^"]+\.css"[^>]*>\n?/g, '')
          .replace(/<script[^>]+src="\/src\/main\.tsx"[^>]*><\/script>\n?/g, '')

        result = result.replace(
          '</head>',
          `    <link rel="stylesheet" href="${cssPath}">\n  </head>`,
        )
        result = result.replace(
          '</body>',
          `    <script src="${jsPath}" onerror="window.__brsShowBootError && window.__brsShowBootError('Не удалось загрузить ' + this.src)"></script>\n  </body>`,
        )
        return result
      },
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), telegramCompatPlugin()],
  base: '/',
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
        entryFileNames: 'assets/app-[hash].js',
        assetFileNames: 'assets/app-[hash].[ext]',
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
