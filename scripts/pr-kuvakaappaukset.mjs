// Ennen/jälkeen-kuvakaappaukset palauteautomaation PR:ään (.github/workflows/claude.yml).
//
// Käyttö: node scripts/pr-kuvakaappaukset.mjs <kuvat.json> <dist-ennen> <dist-jalkeen> <ulos>
//   kuvat.json: Clauden pyytämät kuvat, enintään 3:
//     [{ "reitti": "/sanasto", "kohde": "h1", "kuvaus": "…", "nakyma": "tyopoyta", "kieli": "fi" }]
//   dist-ennen ja dist-jalkeen: buildit ennen muutosta ja sen jälkeen.
//   ulos: kansio, johon tulevat NN-ennen.png, NN-jalkeen.png ja kuvat.json (siistitty luettelo).
// Vaatii Chromen (CHROME_PATH tai oletussijainti).
//
// kuvat.json tulee Claudelta, jota issuen teksti on voinut yrittää ohjata, joten kentät tarkistetaan:
// virheellinen kohde jätetään pois.
import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'
import { preview } from 'vite'

const [pyyntoPolku, distEnnen, distJalkeen, ulos] = process.argv.slice(2)
if (!pyyntoPolku || !distEnnen || !distJalkeen || !ulos) {
  console.error('Käyttö: node scripts/pr-kuvakaappaukset.mjs <kuvat.json> <dist-ennen> <dist-jalkeen> <ulos>')
  process.exit(1)
}

const MAX_KUVIA = 3
const NAKYMAT = {
  tyopoyta: { width: 1280, height: 800, deviceScaleFactor: 1 },
  mobiili: { width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
}
const KIELET = ['fi', 'en']
const VAIHEET = { ennen: 'ennen', jalkeen: 'jälkeen' }

/** Tarkistaa yhden pyynnön. Palauttaa siistityn kohteen tai null. */
function tarkista(k) {
  if (typeof k !== 'object' || k === null) return null
  if (typeof k.reitti !== 'string' || !/^\/[A-Za-z0-9/_-]{0,100}$/.test(k.reitti)) return null
  const kohde = typeof k.kohde === 'string' && k.kohde.length <= 200 ? k.kohde : null
  const kuvaus = typeof k.kuvaus === 'string' ? k.kuvaus.replace(/[^\p{L}\p{N} .,:;!?()/-]/gu, '').slice(0, 120) : ''
  const nakyma = k.nakyma === 'mobiili' ? 'mobiili' : 'tyopoyta'
  const kieli = KIELET.includes(k.kieli) ? k.kieli : 'fi'
  return { reitti: k.reitti, kohde, kuvaus, nakyma, kieli }
}

let pyynnot
try {
  const data = JSON.parse(fs.readFileSync(pyyntoPolku, 'utf8'))
  pyynnot = (Array.isArray(data) ? data : []).slice(0, MAX_KUVIA).map(tarkista).filter(Boolean)
} catch (e) {
  console.error(`kuvat.json ei kelpaa: ${e.message}`)
  process.exit(1)
}
if (pyynnot.length === 0) {
  console.log('Ei kelvollisia kuvapyyntöjä.')
  process.exit(0)
}

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

fs.mkdirSync(ulos, { recursive: true })

/** Kuvaa kaikki pyynnöt yhdestä buildista. */
async function kuvaa(browser, distDir, port, vaihe) {
  const server = await preview({
    build: { outDir: path.resolve(distDir) },
    preview: { port, strictPort: true },
    logLevel: 'warn',
  })
  const base = server.resolvedUrls.local[0]
  try {
    for (const [i, k] of pyynnot.entries()) {
      const nro = String(i + 1).padStart(2, '0')
      const page = await browser.newPage()
      await page.setViewport(NAKYMAT[k.nakyma])
      // Vaalea teema ja ei animaatioita, jotta ennen- ja jälkeen-kuvat ovat vertailukelpoisia.
      await page.emulateMediaFeatures([
        { name: 'prefers-color-scheme', value: 'light' },
        { name: 'prefers-reduced-motion', value: 'reduce' },
      ])
      await page.goto(base, { waitUntil: 'networkidle0' })
      // Käyttöjärjestelmä valittuna (kuten check-mobile.mjs), jotta aiheiden sivut näkyvät kokonaan.
      // Vanha versio 1 kelpaa: migraatio päivittää sen. Uudelleenlataus, jotta sovellus lukee tallennuksen
      // eikä kirjoita muistissa olevaa tilaa sen päälle.
      await page.evaluate(() => {
        localStorage.setItem(
          'pp-progress-v1',
          JSON.stringify({ version: 1, os: 'windows', theme: 'system', modules: {}, quizAnswers: {}, verify: {}, missions: {}, badges: {}, stats: { commandsRun: 0 } }),
        )
      })
      await page.reload({ waitUntil: 'networkidle0' })
      // Kielireitti (#/fi tai #/en) tallentaa kielen ja ohjaa etusivulle. Odotetaan ohjaus ennen varsinaista sivua.
      await page.goto(`${base}#/${k.kieli}`, { waitUntil: 'networkidle0' })
      await page.waitForFunction((kieli) => location.hash !== `#/${kieli}`, { timeout: 10_000 }, k.kieli)
      await page.goto(`${base}#${k.reitti}`, { waitUntil: 'networkidle0' })
      await page.reload({ waitUntil: 'networkidle0' })
      await page.waitForSelector('h1', { timeout: 10_000 }).catch(() => {})
      await page.evaluate(() => document.fonts.ready)
      if (k.kohde) {
        // Valitsin voi puuttua ennen-versiosta (uusi elementti) tai olla virheellinen: kuvataan silloin sivun alku.
        const loytyi = await page
          .evaluate((sel) => {
            const el = document.querySelector(sel)
            if (!el) return false
            el.scrollIntoView({ block: 'center', behavior: 'instant' })
            return true
          }, k.kohde)
          .catch(() => false)
        if (!loytyi) console.log(`[${VAIHEET[vaihe]} ${nro}] kohdetta ei löytynyt: ${k.kohde}`)
      }
      await page.screenshot({ path: path.join(ulos, `${nro}-${vaihe}.png`) })
      await page.close()
      console.log(`[${VAIHEET[vaihe]} ${nro}] ${k.reitti}`)
    }
  } finally {
    await new Promise((resolve) => server.httpServer.close(resolve))
  }
}

// Root-käyttäjänä ja CI:ssä (Ubuntun AppArmor) Chrome ei käynnisty ilman --no-sandbox-valintaa.
// Sivu on oma paikallinen build, ei vierasta sisältöä.
const sandboxPois = process.env.CI === 'true' || process.getuid?.() === 0
const browser = await puppeteer.launch({ executablePath, headless: true, args: sandboxPois ? ['--no-sandbox'] : [] })
try {
  await kuvaa(browser, distEnnen, 4181, 'ennen')
  await kuvaa(browser, distJalkeen, 4182, 'jalkeen')
} finally {
  await browser.close()
}

// Luettelo kirjoitetaan vasta, kun kaikki kuvat onnistuivat. PR-työ käyttää vain luettelon kuvia.
const luettelo = pyynnot.map((k, i) => ({ nro: String(i + 1).padStart(2, '0'), reitti: k.reitti, kuvaus: k.kuvaus, nakyma: k.nakyma, kieli: k.kieli }))
fs.writeFileSync(path.join(ulos, 'kuvat.json'), JSON.stringify(luettelo, null, 2))
console.log(`OK: ${luettelo.length} kuvaparia kansioon ${ulos}`)
