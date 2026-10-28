// Kuvakaappausten optimointi: kuvakaappaukset/tyopoyta/*.png → src/assets/kuvakaappaukset/*.webp
//
// Käyttö: npm run screenshots
// Alkuperäiset PNG-kuvat säilyvät ennallaan. Skripti rajaa, pienentää ja pakkaa
// vain alla listatut kuvat ja kirjoittaa niiden näyttökoot tiedostoon kuvat.json,
// jota <Screenshot>-komponentti käyttää (width/height estävät sivun hyppimisen).
// Kun lisäät kuvan aiheeseen, lisää se ensin tähän listaan ja aja skripti.
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const SOURCE_DIR = 'kuvakaappaukset/tyopoyta'
const OUT_DIR = 'src/assets/kuvakaappaukset'

// Kuvat otettiin näytöllä, jonka skaalaus on 150 %: 1,5 kuvapikseliä = 1 CSS-pikseli.
// Kuva näytetään oletuksena samankokoisena kuin sovellus näytöllä.
const SOURCE_DENSITY = 1.5
// Tallennettu kuva on enintään kaksi kertaa näyttökoon levyinen (tarkka myös
// tiheillä näytöillä) ja enintään tämän levyinen (iso kuva ei hidasta mobiilia).
const MAX_PIXEL_WIDTH = 1400

/**
 * Käytetyt kuvat. crop = rajaus alkuperäisen kuvan pikseleinä (tyhjä tila tai
 * aloittelijaa hämmentävä kohta pois). displayWidth = näyttöleveys CSS-pikseleinä,
 * jos oletus (alkuperäinen koko) on liian iso.
 */
const SHOTS = {
  'k06-valilehdet-kuvakkeina': {},
  'k07-code-valilehti': {},
  // Tyhjä tila valikon yläpuolelta pois.
  's02-ymparisto': { crop: { left: 40, top: 72, width: 988, height: 356 } },
  's03-open-folder': {},
  's04-tilat': { crop: { left: 63, top: 75, width: 987, height: 394 } },
  's05-lupakysely': {},
  's06-pysaytys': {},
  // Otsikkorivi ”main → working tree” pois: se näkyy vain Git-repossa (PAATOKSET 148).
  's08-diff': { crop: { left: 0, top: 38, width: 925, height: 232 } },
  's09-rivikommentti': { crop: { left: 0, top: 38, width: 1018, height: 322 } },
  's09b-kommentti-kirjoituskentassa': {},
  // Ikkunan otsikkorivi ja tyhjä alaosa pois, tiedostopaneelista vasen osa.
  's10-tiedostolinkki': { crop: { left: 0, top: 45, width: 1150, height: 460 } },
  // Sivun tyhjä alaosa pois. Sivu on yksinkertainen, joten pienempi kuva riittää.
  's11-browser': { crop: { left: 0, top: 0, width: 1160, height: 860 }, displayWidth: 420 },
  's14-tiedostopaneeli': {},
  's14b-tiedostopaneeli-muokkaus': {},
  's15-context-kortti': {},
  'r01-plan': {},
  'r02-valmis-sivu': { displayWidth: 600 },
  // Kapea ikkuna näytetään kapeana, ettei kuva veny näytön korkuiseksi.
  'r03-kapea-ikkuna': { displayWidth: 300 },
  'r04-istunnot': {},
  // Kuvakkeet tekstin seassa: CSS määrää korkeuden, joten tarkkuus riittää sellaisenaan.
  'i01-code': {},
  'i02-new': {},
  'i03-pysaytys': {},
  'i04-tila': {},
  'i05-browser': {},
  'i06-paivitys': {},
}

fs.mkdirSync(OUT_DIR, { recursive: true })
for (const file of fs.readdirSync(OUT_DIR)) {
  if (file.endsWith('.webp') && !(path.basename(file, '.webp') in SHOTS)) fs.rmSync(path.join(OUT_DIR, file))
}

const sizes = {}
const rows = []
for (const [id, { crop, displayWidth }] of Object.entries(SHOTS)) {
  const source = path.join(SOURCE_DIR, `${id}.png`)
  let image = sharp(source)
  const meta = await image.metadata()
  const width = crop?.width ?? meta.width
  const height = crop?.height ?? meta.height
  if (crop) image = image.extract(crop)

  const cssWidth = displayWidth ?? Math.round(width / SOURCE_DENSITY)
  const pixelWidth = Math.min(width, cssWidth * 2, MAX_PIXEL_WIDTH)
  if (pixelWidth < width) image = image.resize({ width: pixelWidth, kernel: 'lanczos3' })

  // Häviötön WebP säilyttää tekstin terävänä. Kuva, jossa on liukuvärejä tai
  // kohinaa (esim. r02:n varjot), pienenee häviöllisenä paljon: silloin valitaan
  // häviöllinen. Kuvakkeet ovat aina häviöttömiä, koska pienessä kuvassa virheet näkyvät.
  const lossless = await image.clone().webp({ lossless: true, effort: 6 }).toBuffer()
  const lossy = await image.clone().webp({ quality: 88, effort: 6, smartSubsample: true }).toBuffer()
  const best = pixelWidth >= 300 && lossy.length < lossless.length * 0.6 ? lossy : lossless
  fs.writeFileSync(path.join(OUT_DIR, `${id}.webp`), best)

  sizes[id] = { width: cssWidth, height: Math.round((height / width) * cssWidth) }
  rows.push({ id, png: fs.statSync(source).size, webp: best.length, pixels: `${pixelWidth}×${Math.round((height / width) * pixelWidth)}`, css: `${sizes[id].width}×${sizes[id].height}`, mode: best === lossy ? 'lossy' : 'lossless' })
}

fs.writeFileSync(path.join(OUT_DIR, 'kuvat.json'), `${JSON.stringify(sizes, null, 2)}\n`)
console.table(rows)
const total = (key) => rows.reduce((sum, r) => sum + r[key], 0)
console.log(`PNG yhteensä ${Math.round(total('png') / 1024)} kt → WebP ${Math.round(total('webp') / 1024)} kt`)
