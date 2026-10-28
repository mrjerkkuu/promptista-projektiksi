# CLAUDE.md – ohjeet Claude Codelle

Tämä repo on **Promptista projektiksi**: pelillistetty verkkosivusto (suomeksi ja englanniksi), jolla täysi aloittelija saa Claude Coden käyttöön ja tekee ensimmäisen projektinsa.

## Lue ensin

- `SUUNNITELMA.md` on projektin totuuden lähde. Muutokset suunnitelmaan tehdään sinne.
- `PAATOKSET.md` sisältää toteutuksessa tehdyt tulkinnat ja niiden perustelut.
- `EDISTYMINEN.md` kertoo toteutuksen tilan.

## Komennot

- `npm run dev`: kehityspalvelin
- `npm run lint`: ESLint (sisältää jsx-a11y-säännöt)
- `npm test`: Vitest (tallennus, sisällön validointi, simulaattori, komponentit)
- `npm run build`: tyyppitarkistus + tuotantobuild. **Sisällön validointi ajetaan buildissa**: rikkinäinen viittaus kaataa buildin.
- `npm run check`: kaikki kolme peräkkäin. Aja tämä ennen jokaista committia.
- `npm run check:mobile` ja `npm run lighthouse`: 360 px:n vaakavieritystarkistus ja Lighthouse (vaativat buildin ja koneen Chromen, `CHROME_PATH`).
- `npm run screenshots`: optimoi kuvakaappaukset (`kuvakaappaukset/tyopoyta/` → `src/assets/kuvakaappaukset/`). Aja, kun lisäät tai vaihdat kuvan.

## Arkkitehtuuri lyhyesti

- Vite + React + TypeScript, reititys `HashRouter` (`react-router`).
- Sisältö: `src/content/`. MDX-tietopaketit + JSON-tiedostot. Kaikki JSON validoidaan zod-skeemoilla (`src/schemas/`).
- Sisällön lataus: `src/content/index.ts` (`import.meta.glob`). Uusi polku = uusi kansio `src/content/paths/<polku>/`, ei koodimuutoksia.
- Build-validointi: `scripts/validate-content.ts` (Vite-plugin `vite.config.ts`:ssä + testi).
- Tallennus: `src/features/progress/` (localStorage-avain `pp-progress-v1`, versioitu, migraatiot).
- Terminaalisimulaattori: `src/features/terminal-sim/` (puhtaat funktiot, testattu).
- Merkit: `src/features/badges/` (ehdot `src/content/badges.json`).
- Kielet: `src/i18n/`. Kielilista `languages.ts`, käyttöliittymän sanakirjat `ui/fi.tsx` ja `ui/en.tsx`, hookit `useT()` (tekstit), `useContent()` (sisältö kävijän kielellä) ja `useLanguage()`. Sisällön käännökset ovat lähdetiedostojen rinnalla (`glossary.en.json`, `path.en.json`, `quiz.en.json`, `index.en.mdx`), ja `translate.ts` yhdistää ne suomenkieliseen lähteeseen.

## Säännöt

- **Tyylit:** kaikki värit, fontit, välistykset, pyöristykset ja varjot tulevat `src/styles/tokens.css`:stä. Älä kovakoodaa arvoja komponenttien CSS:ään.
- **Komennot:** kaikki asennuskomennot ovat `src/content/commands.json`:ssa. Komentoja ei kirjoiteta muistista: tarkista virallisesta lähteestä ja päivitä `source` + `verifiedAt`.
- **Hintoja ei kirjoiteta sivulle**, vaan linkitetään viralliseen hinnastoon.
- **Kieli:** hyvä yleiskieli, rento sinuttelu, ei anglismeja. Termi esitellään ensimmäisellä kerralla `<Term id="…">`-komponentilla. Englanniksi sama sävy: rento sinuttelu (”you”), amerikanenglannin oikeinkirjoitus.
- **Monikielisyys: älä kovakoodaa tekstejä käyttöliittymään.** Sivu toimii suomeksi ja englanniksi, ja kieliä pitää voida lisätä myöhemmin ilman, että komponentteja muutetaan.
  - Jokainen näkyvä teksti, myös `aria-label`, `alt`, piilotettu ruudunlukijateksti, sivun otsikko ja virheilmoitus, tulee sanakirjasta (`useT()`), ei suoraan komponentista. Lisää uusi teksti **kaikkiin** sanakirjoihin (`src/i18n/ui/*.tsx`). TypeScript kaataa buildin, jos jostain kielestä puuttuu avain.
  - Muuttuva osa annetaan funktiolle (`progressOf: (title) => …`), linkki tekstin keskellä `Linker`-funktiolla. Älä liimaa lauseita kokoon komponentissa, koska sanajärjestys vaihtelee kielittäin.
  - Sisältö (polut, sanasto, komennot, merkit …) haetaan `useContent()`-hookilla, ei suoraan `src/content`:sta tuoduista vakioista. Ne ovat lähdekielisiä ja tarkoitettu vain rakenteeseen (merkkien ehdot, testit).
  - Päivämäärät ja luvut muotoillaan kielen mukaan (`formatDate(…, language)`, `toLocaleString(language)`), ei käsin.
  - Kun lisäät tai muutat suomenkielistä sisältöä, lisää tai päivitä myös käännös (`*.en.json`, `index.en.mdx`). Käännöksessä on vain tekstit, ei rakennetta. Puuttuva käännös ei kaada buildia, vaan näkyy varoituksena, ja sivu näyttää silloin suomenkielisen tekstin. Pidä varoitukset nollassa.
  - Uusi kieli: lisää tunniste `src/i18n/languages.ts`:ään, sanakirja `src/i18n/ui/<kieli>.tsx` (ja `UI`-listaan `src/i18n/index.ts`:ssä) ja käännöstiedostot `<nimi>.<kieli>.json` ja `index.<kieli>.mdx`. Lisää kielelle myös simulaattorin tekstit (`src/features/terminal-sim/shell.ts`) ja palauteviestin tekstit (`src/lib/feedback.ts`). Ohje: CONTRIBUTING.md, kohta Käännökset.
  - Tunnisteet, reitit (`/polku/…`) ja tallennuksen avaimet ovat kaikilla kielillä samat. Älä käännä niitä.
- **Tietopaketti:** noin 150–250 sanaa. Pidempi sisältö `<ReadMore>`-osioon.
- **Pikanäppäimet sulkuihin:** ensisijainen ohje on näkyvä tapa (haku, valikko, hiiren oikea painike), pikanäppäin vaihtoehtona sulkeissa. Lukija ei välttämättä käytä tietokonetta paljon.
- **Ei kolmansien osapuolten pyyntöjä:** ei analytiikkaa, ei CDN-fontteja.
- **Saavutettavuus:** WCAG 2.1 AA. Näppäimistö, näkyvä fokus, `aria-live` palautteille.
- **Edistymisen säilyminen:** käyttäjän edistyminen ei saa kadota, kun lisäämme moduuleja, ominaisuuksia tai oppitunteja. Edistyminen on käyttäjän selaimessa (localStorage), joten sitä ei voi palauttaa jälkikäteen.
  - Uuden sisällön (polku, tietopaketti, visa, merkki) lisääminen on turvallista. Vanha edistyminen säilyy.
  - **Älä vaihda äläkä poista olemassa olevia ID:itä** (polku, tietopaketti, visa, merkki). Tallennus viittaa niihin ID:llä. Jos ID on pakko muuttaa, kirjoita migraatio, joka siirtää vanhan ID:n edistymisen uudelle, ja lisää sille testi.
  - **Älä vaihda avainta `pp-progress-v1`.** Se nollaisi kaikkien edistymisen.
  - Jos tallennusmuoto muuttuu (`src/features/progress/schema.ts`): nosta `CURRENT_VERSION`, lisää migraatio `src/features/progress/storage.ts`:n `migrations`-listaan ja kirjoita sille testi (`storage.test.ts`). Migraation pitää säilyttää vanhat tiedot.
  - Uusi tallennettava kenttä tarvitsee oletusarvon, jotta vanha tallennus läpäisee validoinnin.
  - Merkkien ehdot (`badges.json`): älä kiristä ehtoja niin, että jo myönnetty merkki katoaa. Myönnetyt merkit säilyvät.
  - Kerro PAATOKSET.md:ssä, jos muutos koskee tallennusta.
- Commitit pieninä ja selkeinä.
- **Pushaus:**
  - **Pilvessä** (Claude Code verkossa tai mobiilissa; ympäristömuuttuja `CLAUDE_CODE_REMOTE=true`) saat pushata ilman erillistä lupaa istunnolle annettuun työhaaraan, kun `npm run check` menee läpi. Pilviympäristö poistuu käytöstä, joten pushaamaton työ katoaisi.
  - **Omalla koneella** älä pushaa ilman lupaa.
  - Älä koskaan pushaa suoraan `main`-haaraan äläkä avaa pull requestia pyytämättä.
