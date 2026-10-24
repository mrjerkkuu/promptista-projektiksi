# Edistyminen

> Jos konteksti tiivistyy tai työ aloitetaan uudelleen: lue tämä tiedosto ja `PAATOKSET.md` ensin ja jatka kohdasta "Seuraavaksi".

## Työsuunnitelma

Toteutetaan `SUUNNITELMA.md`:n luvun 13 vaiheet 1–10 järjestyksessä. Jokaisen vaiheen lopuksi `npm run lint`, `npm test` ja `npm run build` läpi → paikallinen git commit. Ei pusheja, ei globaaleja asennuksia.

| Vaihe | Sisältö | Tila |
|---|---|---|
| 1 | Projektin pohja: Vite + React + TS, ESLint, Vitest, kansiorakenne, CLAUDE.md, tokens.css | ✅ |
| 2 | Sisältöskeemat (zod), sisällön lataus import.meta.globilla, build-vaiheen validointi | ✅ |
| 3 | Tallennus (progress) + testit, vienti/tuonti/nollaus | ✅ |
| 4 | Peruskomponentit: Os, Command, Term, ReadMore, Quiz, VerifyStep | ✅ |
| 5 | Sivut: etusivu + käyttöjärjestelmän valinta, polku, moduuli, sanasto, vianmääritys, asetukset | ✅ |
| 6 | Terminaalisimulaattori + missiot + testit | ✅ |
| 7 | Merkit ja edistymispalkit | ✅ |
| 8 | Sisältö: aihealueet 0–3, komennot tarkistettuina virallisista lähteistä | ✅ |
| 9 | Saavutettavuus- ja mobiilitarkistus, Lighthouse | ✅ |
| 10 | GitHub Actions -julkaisu, README.md, CONTRIBUTING.md, LICENSE | ✅ |

Komentojen tarkistus virallisista lähteistä (luku 12) ajettiin taustalla heti alussa, jotta tulokset olivat valmiina vaiheessa 8.

## Loki

- **Vaihe 1 valmis:** package.json, Vite 8 + React 19 + TS 6, ESLint 9 (+ jsx-a11y), Vitest 5 + Testing Library, tokens.css + base.css, CLAUDE.md, SUUNNITELMA.md (litteroitu PDF:stä). `npm run check` = lint + test + build.
- **Komentojen tarkistus valmis:** taustalla ajettu tarkistus virallisista lähteistä kahdessa erässä, tulokset tiedostossa `docs/komentojen-tarkistus.md`.
- **Vaihe 2 valmis:** `src/schemas/content.ts` (zod), `src/content/index.ts` (import.meta.glob), `scripts/validate-content.ts` (Vite-plugin + testit).
- **Vaihe 3 valmis:** `src/features/progress/` (schema, storage, model, reducer, ProgressContext) + testit.
- **Vaihe 4 valmis:** komponentit `src/components/` (Os, Command, Term, ReadMore, Quiz, VerifyStep, Tip, yhteinen ChoiceList) + testit.
- **Vaihe 5 valmis:** `src/AppShell.tsx` (reitit), `src/layout/Layout.tsx`, sivut `src/pages/`. MDX ladataan laiskasti.
- **Vaihe 6 valmis:** `src/features/terminal-sim/shell.ts`, `src/components/Terminal.tsx`, `missions.json` (4 missiota) + testit.
- **Vaihe 7 valmis:** `src/features/badges/`, `BadgeToaster`, `Badge`, `ProgressBar`, merkkisivu, `badges.json` (9 merkkiä), `verify.json` (5 varmistusta), `troubleshooting.json` (15 kohtaa).
- **Vaihe 8 valmis:** 25 tietopakettia, 12 visaa, sanastossa 41 termiä, 31 komentoa.
- **Vaihe 9 valmis:** axe-testit, kontrastitestit, `npm run check:mobile`, `npm run lighthouse`, CLS-korjaus.
- **Vaihe 10 valmis:** `.github/workflows/deploy.yml`, README.md, CONTRIBUTING.md, LICENSE, `engines.node`. Lisäksi kokeiltiin, että uusi polku löytyy ilman koodimuutoksia.

## Seuraavaksi

Kaikki vaiheet on tehty. Seuraavaksi omistaja tarkistaa työn (lista alla). Sen jälkeen vuorossa ovat design ja julkaisu.

## Avoimet ongelmat

1. **Macin `open index.html` (commands.json: `open-file-mac`) on tarkistamatta.** Applen virallinen Terminal-ohje näyttää vain muodon `open -a MyProg.app`, eikä tiedoston avaamista kuvaavaa virallista lähdettä löytynyt. Komento on merkitty `verifiedAt: "TODO"`, ja build tulostaa siitä varoituksen. Oppitunnilla 3.3 neuvotaan rinnalla avaamaan tiedosto Finderista.

---

## Loppuyhteenveto (24.10.2026)

### Mitä tehtiin

Suunnitelman luvun 13 kaikki kymmenen vaihetta on toteutettu, ja jokainen on oma paikallinen committinsa (`git log --oneline`). Mitään ei ole pushattu eikä julkaistu, eikä mitään ole asennettu globaalisti.

- **Sovellus:** Vite 8 + React 19 + TypeScript 6, HashRouter. Sivut: etusivu ja käyttöjärjestelmän valinta, polku, moduuli, sanasto, vianmääritys, merkit, asetukset ja 404.
- **Sisältö (suomeksi, valmis):**
  - 4 aihealuetta ja 25 tietopakettia (95–196 sanaa + komennot ja harjoitukset)
  - 12 visaa (2–3 kysymystä, joka vaihtoehdolla selitys)
  - sanastossa 41 termiä
  - vianmäärityksessä 15 kohtaa käyttöjärjestelmittäin
  - 5 asennusten varmistusta
  - 4 simulaattoriharjoitusta
  - 9 merkkiä
  - 31 komentoa. Jokaisella on lähde ja tarkistuspäivä, ja yksi on merkitty TODO:ksi.
- **Sisällön validointi buildissa:** zod-skeemat ja kaikkien viittausten tarkistus. Esimerkiksi tuntematon komento, termi, missio tai varmistus, puuttuva visa, tuntematon MDX-komponentti, listaamaton moduulikansio, merkin rikkinäinen ehto tai #-pääotsikko kaataa buildin.
- **Tallennus:** localStorage-avain `pp-progress-v1`, versioitu skeema ja migraatioketju, try/catch kaikkialla ja huomautus, jos tallennus ei toimi. Siirto toiselle laitteelle onnistuu koodina (base64-JSON) tai tiedostona, ja tuonti validoidaan zodilla. Nollauksessa on sivun sisäinen vahvistuskysymys.
- **Terminaalisimulaattori:** PowerShell- ja zsh-tyyliset kehotteet, virtuaalinen kansiorakenne, `help`/`pwd`/`ls`/`dir`/`cd`/`cd ..`/`mkdir`/`clear` sekä esimerkinomaiset versiotarkistukset. Tuntemattomasta komennosta tulee ystävällinen virhe ja vihje. Mukana ovat myös komentohistoria nuolinäppäimillä ja mobiiliin sopiva Suorita-painike.
- **Pelillistäminen:**
  - edistymispalkit aihealueittain ja koko polulle
  - moduulin tila (ei aloitettu / kesken / valmis)
  - merkit ja niiden ilmoitus, joka kunnioittaa reduced-motion-asetusta
  - "Jatka siitä mihin jäit" -painike.
- **Laatu:**
  - 219 testiä, joista 57 on axe-saavutettavuustestejä ja 59 kontrastitestejä tokens.css:stä molemmille teemoille.
  - 360 px:n mobiilitarkistus kaikille 31 sivulle kummallakin käyttöjärjestelmävalinnalla.
  - Lighthouse: mobiilissa 99/100/100/100, desktopissa 100/100/100/100.
- **Ulkoasu:** neutraali placeholder. Kaikki arvot tulevat `src/styles/tokens.css`:stä, ja mukana ovat vaalea ja tumma teema sekä manuaalinen vaihto. Fontteina ovat järjestelmäfontit (ei kolmansien osapuolten pyyntöjä).
- **Julkaisu valmiina:** GitHub Actions -workflow ajaa lintin, testit ja buildin ja julkaisee GitHub Pagesiin. Base-polku tulee automaattisesti repon nimestä.
- **Dokumentaatio:** README.md, CONTRIBUTING.md (uuden polun, moduulin, visan ja komennon lisääminen), CLAUDE.md, PAATOKSET.md (56 kirjattua päätöstä) ja `docs/komentojen-tarkistus.md`.

### Avoimet ongelmat

1. `open-file-mac` (`open index.html`) on tarkistamatta, ks. yllä. Muita avoimia ongelmia ei jäänyt. Kaikki vaiheet menivät läpi ilman kiertoteitä.

### Tarkista nämä ennen julkaisua

**Komennot ja ohjeet (tärkein):**

1. Käy läpi `src/content/commands.json` ja `docs/komentojen-tarkistus.md`. Komennot on tarkistettu virallisilta sivuilta 24.10.2026 taustalla ajetulla tarkistuksella, mutta niitä kannattaa testata itse oikealla Windows- ja Mac-koneella ennen julkaisua.
2. `gh repo create oma-sivu --public --source=. --remote=origin --push` on koottu manuaalissa dokumentoiduista valitsimista, mutta täsmälleen tätä riviä ei ole manuaalissa. Testaa se.
3. Päätä, mitä tehdään Macin `open index.html` -komennolle (TODO): hyväksytkö sen, vaihdatko toiseen lähteeseen vai poistatko sen.
4. Tietopaketeissa ja vianmäärityksessä on muutama komento tavallisena tekstinä ilman `<Command>`-komponenttia: `gh auth status`, `brew --version`, `$PSVersionTable`, `cd`/`mkdir`/`pwd` ja `/init`, `/rewind`, `/context`, `/compact`, `/clear`, `/exit`, `/help`, `/login`, `/plan`. Ne on tarkistettu (`docs/komentojen-tarkistus.md`) paitsi `gh auth status` ja `brew --version`.
5. Käyttöliittymän kuvaukset, jotka voivat muuttua tai joiden suomenkielinen asu kannattaa tarkistaa:
   - Claude Coden kirjautumisen kulku (1.7) ja "Yes / Yes, and don't ask again / No" -lupakyselyt (2.5)
   - Shift+Tab-kierto (2.3) ja suunnitelman hyväksymisen vaihtoehdot (3.3)
   - VS Coden "Do you trust the authors" -kysymys
   - `gh auth login` -kysymysten sanamuodot (1.5)
   - winget-ehtojen hyväksyntä
   - macOS:n suomenkieliset nimet (Pääte, Ohjelmat → Lisäohjelmat, Dockin Valinnat → Pidä Dockissa)
   - Windowsin "Kiinnitä tehtäväpalkkiin"
   - GitHubin Settings → Password and authentication.
6. Vianmäärityksen neuvo "App Installer / Sovellusasennusohjelma Microsoft Storesta" (winget puuttuu) on kirjoitettu yleistiedon pohjalta eikä tarkistettu virallisesta lähteestä.

**Sisältö:**

7. Oikolue tietopaketit (`src/content/paths/claude-code/**/index.mdx`), visat, sanasto, vianmääritys ja missiot. Tarkista sävy (rento sinuttelu) ja asiasisältö.
8. Faktaväite: "Andrej Karpathy käytti ilmausta vibe coding helmikuussa 2025" (0.1, Lue lisää).
9. Sanaston "Lue lisää" -linkkejä (MDN, Wikipedia, GitHub Docs, Microsoft, Apple) ei ole avattu yksitellen. Tarkista, että ne toimivat.
10. Simulaattorin versiotulosteet ovat esimerkkejä: Git 2.56.0 on oikea versio (24.10.2026), mutta "2.1.0 (Claude Code)" on keksitty.
11. Tilaussivu (1.6): Anthropicin ohjeen mukaan Claude Code vaatii Pro-, Max-, Team-, Enterprise- tai Console-tilin. Hintoja ei ole kirjoitettu sivulle. Varmista, että tilanne on ajan tasalla julkaisuhetkellä.

**Tekniset ja hallinnolliset:**

12. `LICENSE`: tekijänoikeuden haltijaksi on merkitty "Jeremia Vepsäläinen" (gitin asetuksista). Vaihda tarvittaessa.
13. Commitit on tehty gitin globaaleilla tekijätiedoillasi (gmail-osoite). Tarkista, että haluat julkaista ne sellaisenaan.
14. Repon nimi: base-polku tulee workflowssa automaattisesti repon nimestä. GitHubissa pitää valita Settings → Pages → Source: **GitHub Actions** ennen ensimmäistä julkaisua.
15. Workflow käyttää actioneiden pääversiotageja (`@v7` jne.). Harkitse lukitsemista commit-tunnisteisiin (SHA) kuten Viten virallisessa esimerkissä.
16. `SUUNNITELMA.md` on litteroitu `SUUNNITELMA.pdf`:stä. Tarkista, että litterointi vastaa alkuperäistä, ja päätä, pidetäänkö PDF repossa.
17. Kokeile sivustoa itse oikealla puhelimella, pelkällä näppäimistöllä ja mieluiten ruudunlukijalla. Automaattiset tarkistukset eivät korvaa niitä.
18. Design v2 on toteutettu (`design-handoff/`, ks. PAATOKSET.md 57–65). Tarkista ulkoasu itse oikealla laitteella, ja ota halutessasi uudet vertailukuvat kansioon `design-kuvat-uusi/` (CLAUDE-CODE-OHJE.md, luku 6).
19. Pääpaketin koko on noin 400 kt (gzip noin 125 kt), josta osa on zod-ajonaikaista validointia. Lighthousen suorituskyky on silti 99–100. Optimointi ei ole tarpeen nyt.
