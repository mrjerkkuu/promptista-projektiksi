/// <reference types="vitest/config" />
import path from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'
import { validateContent } from './scripts/validate-content.ts'

const contentDir = path.resolve(import.meta.dirname, 'src/content')

/** Validoi sisällön buildin alussa. Rikkinäinen viittaus kaataa buildin. */
function contentValidation(): Plugin {
  return {
    name: 'content-validation',
    buildStart() {
      const { errors, warnings } = validateContent(contentDir)
      for (const w of warnings) this.warn(w)
      if (errors.length > 0) {
        this.error(`Sisällön validointi epäonnistui (${errors.length} virhettä):\n- ${errors.join('\n- ')}`)
      }
    },
    handleHotUpdate({ file, server }) {
      if (!file.startsWith(contentDir)) return
      const { errors } = validateContent(contentDir)
      if (errors.length > 0) server.config.logger.error(`Sisältövirheitä:\n- ${errors.join('\n- ')}`)
    },
  }
}

// GitHub Pages palvelee sivua osoitteessa https://<käyttäjä>.github.io/<repo>/.
// Repon nimen voi vaihtaa ympäristömuuttujalla BASE_PATH (ks. README.md).
const base = process.env.BASE_PATH ?? '/promptista-projektiksi/'

export default defineConfig({
  base,
  plugins: [
    contentValidation(),
    { enforce: 'pre', ...mdx({ remarkPlugins: [remarkGfm] }) },
    react({ include: /\.(mdx|jsx|tsx|ts|js)$/ }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    // Pois päältä: välimuisti tunnistaa muuttumattoman src/content/index.ts:n eikä huomaa, että
    // import.meta.glob löytäisi uusia sisältökansioita. Testit kaatuisivat ”Tietopaketti puuttuu”
    // -virheeseen, vaikka uusi aihe on oikein (PAATOKSET.md, kohta 125).
    fsModuleCache: false,
  },
})
