// Lighthouse-tarkistus tuotantobuildille (tavoite 90+ kaikissa kategorioissa).
//
// Käyttö: npm run build && npm run lighthouse
// Vaatii Chromen (CHROME_PATH tai oletussijainti). Raportit: .lighthouse/
import fs from 'node:fs'
import path from 'node:path'
import * as chromeLauncher from 'chrome-launcher'
import lighthouse from 'lighthouse'
import desktopConfig from 'lighthouse/core/config/desktop-config.js'
import { preview } from 'vite'

const TARGET = 90
// Suunnitelman luku 10: tavoite 90+ Lighthousen neljässä vakiokategoriassa.
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo']
const pages = [
  '/',
  '/polut',
  '/polku/claude-code',
  '/polku/claude-code/terminaali',
  '/polku/claude-code/git-asennus',
  '/polku/claude-code-desktop',
  '/polku/claude-code-desktop/mita-on-vibekoodaus',
  '/polku/claude-code-desktop/code-valilehti',
  '/merkit',
  '/vianmaaritys',
  '/asetukset',
]

const server = await preview({ preview: { port: 4180, strictPort: true } })
const base = server.resolvedUrls.local[0]
const outDir = path.resolve('.lighthouse')
fs.mkdirSync(outDir, { recursive: true })

const chrome = await chromeLauncher.launch({
  chromePath: process.env.CHROME_PATH,
  // Root-käyttäjänä (esim. kontit ja pilviympäristöt) Chrome ei käynnisty ilman --no-sandbox-valintaa.
  chromeFlags: ['--headless=new', '--no-first-run', ...(process.getuid?.() === 0 ? ['--no-sandbox'] : [])],
})
const rows = []
let failed = false
try {
  for (const formFactor of ['mobile', 'desktop']) {
    for (const route of pages) {
      const url = `${base}#${route}`
      const config = formFactor === 'desktop' ? desktopConfig : { extends: 'lighthouse:default' }
      const result = await lighthouse(url, { port: chrome.port, output: 'html', logLevel: 'error', onlyCategories: CATEGORIES }, config)
      const scores = Object.fromEntries(Object.entries(result.lhr.categories).map(([k, c]) => [k, Math.round((c.score ?? 0) * 100)]))
      const name = `${formFactor}${route.replaceAll('/', '_') || '_etusivu'}`
      fs.writeFileSync(path.join(outDir, `${name}.html`), result.report)
      rows.push({ formFactor, route, ...scores })
      if (Object.values(scores).some((s) => s < TARGET)) failed = true
    }
  }
} finally {
  chrome.kill()
  await new Promise((resolve) => server.httpServer.close(resolve))
}

console.table(rows)
if (failed) {
  console.error(`Jokin tulos on alle ${TARGET}. Raportit: ${outDir}`)
  process.exit(1)
}
console.log(`OK: kaikki tulokset vähintään ${TARGET}.`)
