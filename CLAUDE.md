# CLAUDE.md – ohjeet Claude Codelle

Tämä repo on **Promptista projektiksi**: pelillistetty suomenkielinen verkkosivusto, jolla täysi aloittelija saa Claude Coden käyttöön ja tekee ensimmäisen projektinsa.

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

## Arkkitehtuuri lyhyesti

- Vite + React + TypeScript, reititys `HashRouter` (`react-router`).
- Sisältö: `src/content/`. MDX-tietopaketit + JSON-tiedostot. Kaikki JSON validoidaan zod-skeemoilla (`src/schemas/`).
- Sisällön lataus: `src/content/index.ts` (`import.meta.glob`). Uusi polku = uusi kansio `src/content/paths/<polku>/`, ei koodimuutoksia.
- Build-validointi: `scripts/validate-content.ts` (Vite-plugin `vite.config.ts`:ssä + testi).
- Tallennus: `src/features/progress/` (localStorage-avain `pp-progress-v1`, versioitu, migraatiot).
- Terminaalisimulaattori: `src/features/terminal-sim/` (puhtaat funktiot, testattu).
- Merkit: `src/features/badges/` (ehdot `src/content/badges.json`).

## Säännöt

- **Tyylit:** kaikki värit, fontit, välistykset, pyöristykset ja varjot tulevat `src/styles/tokens.css`:stä. Älä kovakoodaa arvoja komponenttien CSS:ään.
- **Komennot:** kaikki asennuskomennot ovat `src/content/commands.json`:ssa. Komentoja ei kirjoiteta muistista: tarkista virallisesta lähteestä ja päivitä `source` + `verifiedAt`.
- **Hintoja ei kirjoiteta sivulle**, vaan linkitetään viralliseen hinnastoon.
- **Kieli:** hyvä yleiskieli, rento sinuttelu, ei anglismeja. Termi esitellään ensimmäisellä kerralla `<Term id="…">`-komponentilla.
- **Tietopaketti:** noin 150–250 sanaa. Pidempi sisältö `<ReadMore>`-osioon.
- **Ei kolmansien osapuolten pyyntöjä:** ei analytiikkaa, ei CDN-fontteja.
- **Saavutettavuus:** WCAG 2.1 AA. Näppäimistö, näkyvä fokus, `aria-live` palautteille.
- Commitit pieninä ja selkeinä. Älä pushaa ilman lupaa.
