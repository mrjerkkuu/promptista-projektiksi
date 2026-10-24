/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'

// GitHub Pages palvelee sivua osoitteessa https://<käyttäjä>.github.io/<repo>/.
// Repon nimen voi vaihtaa ympäristömuuttujalla BASE_PATH (ks. README.md).
const base = process.env.BASE_PATH ?? '/promptista-projektiksi/'

export default defineConfig({
  base,
  plugins: [
    { enforce: 'pre', ...mdx({ remarkPlugins: [remarkGfm] }) },
    react({ include: /\.(mdx|jsx|tsx|ts|js)$/ }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
