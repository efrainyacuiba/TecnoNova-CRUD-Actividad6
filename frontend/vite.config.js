import { defineConfig } from 'vite'
import path from 'node:path'

// Genera UN solo archivo IIFE (sin módulos ES, sin CDN) que _Layout.cshtml carga con <script src="~/js/tecnonova-motion.js">.
export default defineConfig({
  publicDir: false,
  build: {
    outDir: path.resolve(__dirname, '../wwwroot/js'),
    emptyOutDir: false,
    sourcemap: false,
    lib: {
      entry: path.resolve(__dirname, 'src/main.js'),
      name: 'TecnoNovaMotion',
      formats: ['iife'],
      fileName: () => 'tecnonova-motion.js',
    },
  },
})
