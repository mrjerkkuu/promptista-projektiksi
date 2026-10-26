// Mobiilitarkistus: avaa jokaisen sivun 360 px leveänä ja varmistaa, ettei
// sivu vieri vaakasuunnassa (koodilohkot ja taulukot saavat vieriä itse).
//
// Käyttö: npm run build && npm run check:mobile
// Vaatii Chromen (CHROME_PATH tai oletussijainti). Kuvakaappaukset: .lighthouse/mobile/
import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'
import { preview } from 'vite'

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
].filter(Boolean)
const executablePath = CHROME_CANDIDATES.find((p) => fs.existsSync(p))
if (!executablePath) {
  console.error('Chromea ei löytynyt. Aseta CHROME_PATH.')
  process.exit(1)
}

// Kaikki polut ja niiden aiheet. Viittauksen ({ "ref": "<polku>/<aihe>" }) tunniste on viittauksen jälkiosa.
const pathsDir = 'src/content/paths'
const pathJsons = fs.readdirSync(pathsDir).map((dir) => JSON.parse(fs.readFileSync(path.join(pathsDir, dir, 'path.json'), 'utf8')))
const moduleRoutes = pathJsons.flatMap((p) => p.topics.flatMap((t) => t.modules.map((m) => `/polku/${p.id}/${m.ref ? m.ref.split('/')[1] : m.id}`)))
const pathRoutes = pathJsons.map((p) => `/polku/${p.id}`)
const routes = ['/', '/polut', ...pathRoutes, '/sanasto', '/vianmaaritys', '/merkit', '/asetukset', '/palaute', ...moduleRoutes]

const server = await preview({ preview: { port: 4179, strictPort: true } })
const base = server.resolvedUrls.local[0]
const shotDir = path.resolve('.lighthouse/mobile')
fs.mkdirSync(shotDir, { recursive: true })

const browser = await puppeteer.launch({ executablePath, headless: true })
const problems = []
try {
  for (const os of ['windows', 'mac']) {
    const page = await browser.newPage()
    await page.setViewport({ width: 360, height: 740, deviceScaleFactor: 1, isMobile: true, hasTouch: true })
    await page.goto(base, { waitUntil: 'networkidle0' })
    await page.evaluate((os) => {
      localStorage.setItem(
        'pp-progress-v1',
        JSON.stringify({ version: 1, os, theme: 'system', modules: {}, quizAnswers: {}, verify: {}, missions: {}, badges: {}, stats: { commandsRun: 0 } }),
      )
    }, os)
    for (const route of routes) {
      await page.goto(`${base}#${route}`, { waitUntil: 'networkidle0' })
      await page.reload({ waitUntil: 'networkidle0' })
      await page.waitForSelector('h1')
      const result = await page.evaluate(() => {
        const doc = document.documentElement
        const offenders = []
        if (doc.scrollWidth > doc.clientWidth) {
          for (const el of document.querySelectorAll('body *')) {
            if (el.closest('pre, table, .terminal__screen')) continue
            const r = el.getBoundingClientRect()
            if (r.right > doc.clientWidth + 1) offenders.push(`${el.tagName.toLowerCase()}.${el.className}`.slice(0, 80))
          }
        }
        return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth, offenders: offenders.slice(0, 5) }
      })
      if (result.scrollWidth > result.clientWidth) problems.push({ os, route, ...result })
      if (['/', '/polku/claude-code', '/polku/claude-code/terminaali', '/polku/claude-code/git-asennus'].includes(route)) {
        const name = `${os}${route.replaceAll('/', '_') || '_etusivu'}.png`
        await page.screenshot({ path: path.join(shotDir, name), fullPage: true })
      }
    }
    await page.close()
  }
} finally {
  await browser.close()
  await new Promise((resolve) => server.httpServer.close(resolve))
}

if (problems.length > 0) {
  console.error('Vaakavieritystä 360 px leveydellä:')
  for (const p of problems) console.error(`- [${p.os}] ${p.route}: ${p.scrollWidth} > ${p.clientWidth}`, p.offenders)
  process.exit(1)
}
console.log(`OK: ${routes.length} sivua × 2 käyttöjärjestelmää, ei vaakavieritystä 360 px leveydellä.`)
