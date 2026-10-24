# Promptista projektiksi

Pelillistetty suomenkielinen verkkosivusto, jolla täysi aloittelija saa tekoälyavusteisen ohjelmointiympäristön ([Claude Code](https://code.claude.com/docs)) käyttöön ja tekee ensimmäisen oman projektinsa. Aiempaa kokemusta komentorivistä tai ohjelmoinnista ei tarvita.

**Kokeile sivua: https://mrjerkkuu.github.io/promptista-projektiksi/**

- **Tekemällä oppiminen:** lyhyet tietopaketit, kopioitavat komennot, terminaalisimulaattori, visat ja asennusten varmistukset.
- **Windows ja Mac:** ohjeet valitun käyttöjärjestelmän mukaan.
- **Ei kirjautumista, ei seurantaa:** edistyminen tallentuu vain selaimeen (localStorage). Ei evästeitä, ei analytiikkaa, ei kolmansien osapuolten pyyntöjä.
- **Laajennettava:** uusi oppimispolku lisätään sisältötiedostoina ilman koodimuutoksia.

Suunnitelma: [SUUNNITELMA.md](SUUNNITELMA.md). Toteutuksen tulkinnat: [PAATOKSET.md](PAATOKSET.md). Toteutuksen tila ja avoimet kohdat: [EDISTYMINEN.md](EDISTYMINEN.md).

## Kehitys

Vaatimukset: Node.js 22.22 tai uudempi (suositus: uusin LTS-versio) ja npm.

```bash
npm install
npm run dev        # kehityspalvelin
npm run check      # lint + testit + build (aja ennen committia)
```

| Komento | Mitä tekee |
|---|---|
| `npm run dev` | kehityspalvelin osoitteessa http://localhost:5173/promptista-projektiksi/ |
| `npm run lint` | ESLint (myös saavutettavuussäännöt) |
| `npm test` | Vitest: tallennus, sisällön validointi, simulaattori, komponentit, saavutettavuus (axe), kontrastit |
| `npm run build` | tyyppitarkistus, sisällön validointi ja tuotantobuild kansioon `dist/` |
| `npm run preview` | buildin esikatselu |
| `npm run check:mobile` | tarkistaa 360 px leveydellä, ettei mikään sivu vieri vaakasuunnassa (vaatii buildin ja Chromen) |
| `npm run lighthouse` | Lighthouse-tarkistus, tavoite 90+ (vaatii buildin ja Chromen) |

Kaksi viimeistä käyttävät koneelle asennettua Chromea. Jos sitä ei löydy oletuspaikasta, anna polku ympäristömuuttujassa `CHROME_PATH`.

## Rakenne

```
src/
├─ content/            # KAIKKI sisältö: tietopaketit (MDX) ja JSON-tiedostot
│  ├─ commands.json    # asennuskomennot, lähteet ja tarkistuspäivät
│  ├─ glossary.json    # sanasto
│  ├─ badges.json      # merkit ja niiden ehdot
│  ├─ missions.json    # terminaalisimulaattorin harjoitukset
│  ├─ verify.json      # asennusten varmistuskysymykset
│  ├─ troubleshooting.json  # vianmääritys
│  └─ paths/<polku>/   # oppimispolut: path.json + <aihealue>/<moduuli>/index.mdx (+ quiz.json)
├─ schemas/            # zod-skeemat sisällölle
├─ features/
│  ├─ progress/        # tallennus (localStorage, vienti/tuonti, migraatiot)
│  ├─ badges/          # merkkien ehdot
│  └─ terminal-sim/    # terminaalisimulaattori
├─ components/         # Command, Os, Term, Quiz, VerifyStep, Terminal, ReadMore, Tip, ...
├─ pages/              # sivut
└─ styles/tokens.css   # design tokenit: kaikki värit, fontit ja välistykset
scripts/
├─ validate-content.ts # sisällön validointi (ajetaan buildissa)
├─ check-mobile.mjs
└─ lighthouse.mjs
```

Sisällön lisääminen ja muokkaaminen: [CONTRIBUTING.md](CONTRIBUTING.md).

## Julkaisu GitHub Pagesiin

Sivu on julkaistu osoitteessa https://mrjerkkuu.github.io/promptista-projektiksi/. Julkaisu tehdään GitHub Actionsilla (`.github/workflows/deploy.yml`) aina, kun `main`-haaraan tulee muutoksia. Workflow ajaa lintin, testit ja buildin ennen julkaisua.

Jos forkkaat repon, valitse omasta repostasi **Settings → Pages → Build and deployment → Source: GitHub Actions**. Sivu julkaistaan silloin osoitteeseen `https://<käyttäjä>.github.io/<repo>/`.

Viten `base`-polku asetetaan workflowssa automaattisesti repon nimestä (`BASE_PATH`). Paikallisesti oletus on `/promptista-projektiksi/`. Toisen polun voi antaa näin: `BASE_PATH=/oma-polku/ npm run build`.

Reitityksessä käytetään `HashRouter`ia (osoitteet muotoa `/#/polku/moduuli`), koska GitHub Pages ei tue SPA-sovellusten reititystä.

## Edistymisen säilyminen

Edistyminen on käyttäjän selaimessa (localStorage, avain `pp-progress-v1`), joten sitä ei voi palauttaa jälkikäteen. Uuden sisällön lisääminen on turvallista, mutta olemassa olevia ID:itä (polku, tietopaketti, visa, merkki) ei saa vaihtaa tai poistaa ilman migraatiota. Tallennusmuodon muutos vaatii version noston ja migraation. Säännöt ovat tiedostossa [CLAUDE.md](CLAUDE.md).

## Ulkoasu

Nykyinen ulkoasu on neutraali placeholder. Kaikki värit, fontit, välistykset, pyöristykset ja varjot ovat tiedostossa `src/styles/tokens.css`, joten designin voi vaihtaa koskematta komponentteihin. Design-brief on suunnitelman luvussa 11 ja nykyisen ulkoasun inventaari tiedostossa [DESIGN-INVENTAARIO.md](DESIGN-INVENTAARIO.md).

- Kontrastitesti (`src/styles/tokens.test.ts`) tarkistaa uudet värit automaattisesti.
- Fontit hostataan itse: lisää fonttitiedostot projektiin (esim. `src/styles/fonts/`) ja määritä `@font-face` tokens.css:ssä. Ei Google Fonts -CDN:ää.

## Lisenssi

[MIT](LICENSE). Korjausehdotukset ovat tervetulleita, ks. [CONTRIBUTING.md](CONTRIBUTING.md).
