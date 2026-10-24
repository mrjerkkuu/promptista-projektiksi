# Edistyminen

> Jos konteksti tiivistyy tai työ aloitetaan uudelleen: lue tämä tiedosto ja `PAATOKSET.md` ensin ja jatka kohdasta "Seuraavaksi".

## Työsuunnitelma

Toteutetaan `SUUNNITELMA.md`:n luvun 13 vaiheet 1–10 järjestyksessä. Jokaisen vaiheen lopuksi `npm run lint`, `npm test` ja `npm run build` läpi → paikallinen git commit. Ei pusheja, ei globaaleja asennuksia.

| Vaihe | Sisältö | Tila |
|---|---|---|
| 1 | Projektin pohja: Vite + React + TS, ESLint, Vitest, kansiorakenne, CLAUDE.md, tokens.css | – |
| 2 | Sisältöskeemat (zod), sisällön lataus import.meta.globilla, build-vaiheen validointi | – |
| 3 | Tallennus (progress) + testit, vienti/tuonti/nollaus | – |
| 4 | Peruskomponentit: Os, Command, Term, ReadMore, Quiz, VerifyStep | – |
| 5 | Sivut: etusivu + käyttöjärjestelmän valinta, polku, moduuli, sanasto, vianmääritys, asetukset | – |
| 6 | Terminaalisimulaattori + missiot + testit | – |
| 7 | Merkit ja edistymispalkit | – |
| 8 | Sisältö: aihealueet 0–3, komennot tarkistettuina virallisista lähteistä | – |
| 9 | Saavutettavuus- ja mobiilitarkistus, Lighthouse | – |
| 10 | GitHub Actions -julkaisu, README.md, CONTRIBUTING.md, LICENSE | – |

Komentojen tarkistus virallisista lähteistä (luku 12) ajetaan taustalla heti alussa, jotta tulokset ovat valmiina vaiheessa 8.

## Loki

- **Vaihe 1 valmis** (commit "Vaihe 1"): package.json, Vite 8 + React 19 + TS 6, ESLint 9 (+ jsx-a11y), Vitest 5 + Testing Library, tokens.css + base.css, CLAUDE.md, SUUNNITELMA.md (litteroitu PDF:stä). `npm run check` = lint + test + build.
- **Komentojen tarkistus valmis:** taustalla ajettu tarkistus virallisista lähteistä, tulokset tiedostossa `docs/komentojen-tarkistus.md` (kaksi kierrosta). Ei virallista lähdettä Macin `open index.html` -komennolle, joten se merkitään TODO:ksi tai jätetään pois.
- **Vaihe 2 valmis:** `src/schemas/content.ts` (zod), `src/content/index.ts` (import.meta.glob), `scripts/validate-content.ts` (Vite-plugin + 16 testiä). path.json kirjoitettu lopullisena, ja moduulien index.mdx-tiedostot ovat väliaikaisia tynkiä, jotka korvataan vaiheessa 8. commands.json on jo tarkistettu.
- **Vaihe 3 valmis:** `src/features/progress/` (schema, storage, model, reducer, ProgressContext) + testit. Tallennus tapahtuu dispatchin yhteydessä, ei effectissä.

- **Vaihe 4 valmis:** komponentit `src/components/` (Os, Command, Term, ReadMore, Quiz, VerifyStep, Tip, yhteinen ChoiceList), `mdxComponents.ts`, `moduleContext.ts`, testit (`components.test.tsx`, content mockattuna).
- **Vaihe 5 valmis:** `src/AppShell.tsx` (reitit), `src/layout/Layout.tsx`, sivut `src/pages/` (Home, Path, Module, Glossary, Troubleshooting, Settings, Badges [yksinkertainen], NotFound). MDX ladataan laiskasti (`ModuleEntry.Content`). Testit: `App.test.tsx`.

## Seuraavaksi

Vaihe 6: terminaalisimulaattori (`src/features/terminal-sim/`: puhtaat funktiot `fs.ts` + `shell.ts`, missioiden tarkistus, `<Terminal mission>`-komponentti, testit).

## Avoimet ongelmat

(Ei vielä.)
