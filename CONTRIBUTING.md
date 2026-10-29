# Osallistuminen

Kiitos, että haluat parantaa Promptista projektiksi -sivustoa! Korjaukset kirjoitusvirheisiin, vanhentuneisiin komentoihin ja epäselviin ohjeisiin ovat erityisen arvokkaita.

Ennen kuin teet pull requestin, aja:

```bash
npm run check
```

Komento ajaa lintin, testit ja buildin. **Build validoi koko sisällön**: rikkinäinen viittaus (esimerkiksi tuntematon komento tai puuttuva visa) kaataa buildin ja kertoo, mikä on vialla.

## Kirjoitusohjeet

- Kieli on hyvää yleiskieltä ja rentoa sinuttelua. Leikkisä saa olla, lapsellinen ei. Vältä anglismeja ja selitä jokainen tekninen termi.
- Tietopaketti on enintään noin 150–250 sanaa. Syventävä sisältö laitetaan `<ReadMore>`-osioon.
- Termi esitellään ensimmäisellä kerralla `<Term id="…">`-komponentilla. Termin pitää olla `glossary.json`:ssa.
- **Ohjeista näkyvä tapa ensin, pikanäppäin sulkuihin.** Lukija ei välttämättä käytä tietokonetta paljon, joten ensisijainen ohje on haku, valikko tai hiiren oikea painike, esimerkiksi ”Napsauta Käynnistä-painiketta, kirjoita `Resurssienhallinta` ja valitse se hakutuloksista. (Voit myös painaa Windows-näppäintä ja E-kirjainta yhtä aikaa.)”. Poikkeus: kun näppäinyhdistelmä on ainoa tapa (esimerkiksi tila vaihtuu Shift+Tabilla), se kerrotaan suoraan.
- **Komentoja ei kirjoiteta muistista.** Tarkista jokainen asennuskomento virallisesta lähteestä (Anthropic, git-scm.com, cli.github.com, Microsoft, code.visualstudio.com) ja merkitse `source` ja `verifiedAt`.
- **Hintoja tai tilausten yksityiskohtia ei kirjoiteta sivulle.** Linkitä viralliseen hinnastoon.
- Lainausmerkkeinä käytetään suomalaisia lainausmerkkejä (”näin”).

## Sisältötiedostot

Kaikki sisältö on kansiossa `src/content/`. Rakenne on kuvattu zod-skeemoina tiedostossa `src/schemas/content.ts`.

### Uusi oppimispolku (esim. Lovable)

Polku lisätään pelkillä sisältötiedostoilla. Sovelluksen koodiin ei tarvitse koskea, sillä polut löydetään automaattisesti (`import.meta.glob`).

1. Luo kansio `src/content/paths/<polun-id>/`.
2. Lisää sinne `path.json`:

```json
{
  "id": "lovable",
  "title": "Lovable alusta alkaen",
  "description": "Lyhyt kuvaus polusta.",
  "order": 3,
  "audience": "Sinulle, joka haluat… (näytetään valintasivulla otsikon ”Kenelle?” jälkeen)",
  "topics": [
    {
      "id": "perusteet",
      "title": "Perusteet",
      "description": "Aihealueen kuvaus.",
      "modules": [
        { "id": "mika-on-lovable", "title": "Mikä on Lovable?", "summary": "Yhden virkkeen tiivistelmä." }
      ]
    }
  ]
}
```

3. Luo jokaiselle moduulille kansio `src/content/paths/<polku>/<aihealue>/<moduuli>/` ja sinne `index.mdx`.
4. Aja `npm run check`.

Säännöt:

- `id`:n pitää olla sama kuin kansion nimi. Tunnisteissa saa olla vain pieniä kirjaimia a–z, numeroita ja väliviivoja.
- Moduulien tunnisteiden pitää olla yksilöllisiä polun sisällä.
- Valinnainen bonusmoduuli merkitään `"optional": true`. Se ei vaikuta edistymisprosenttiin.
- Polut näytetään sivulla Oppimispolut (`/polut`) ja etusivulla `order`-kentän mukaisessa järjestyksessä. Kahdella polulla ei saa olla samaa `order`-arvoa.
- `audience` kertoo valintasivulla, kenelle polku sopii. Kirjoita se niin, että kävijä tunnistaa siitä, onko polku hänelle oikea.

### Yhteinen aihe usealla polulla

Jos aihe sopii sellaisenaan toiselle polulle, älä kopioi sitä, vaan viittaa siihen. Lisää polun `path.json`:iin aiheen paikalle:

```json
{ "ref": "claude-code/hyva-prompti" }
```

- Nimi, tiivistelmä, tietopaketti ja visa tulevat alkuperäisestä aiheesta. Viittaavalle polulle ei tehdä kansiota.
- Edistyminen tallentuu alkuperäisellä avaimella (`claude-code/hyva-prompti`), joten kerran tehty aihe on valmis kaikilla poluilla. Käytä samaa avainta myös merkkien ehdoissa.
- Osoite ja "Seuraava"-painike ovat viittaavan polun omia (`/polku/<polku>/hyva-prompti`).
- Yhteisessä aiheessa **ei saa olla linkkejä tietyn polun aiheisiin** (`#/polku/…`), koska ne veisivät toisen polun kävijän väärälle polulle. Build tarkistaa tämän.
- Viittaus ei voi osoittaa toiseen viittaukseen eikä omalle polulle.
- Jaa vain aihe, jonka sisältö pätee kaikilla poluilla. Jos aiheessa puhutaan esimerkiksi terminaalista, kirjoita toiselle polulle oma versio.
- Jos vain kappale tai pari pätee eri tavalla eri poluilla, kirjoita ne `<Path only="<polku>">`-komponentin sisään (ks. taulukko alla). Silloin aihetta ei tarvitse kopioida, ja sen ID ja edistyminen säilyvät.

### Uusi moduuli olemassa olevaan polkuun

1. Lisää moduuli oikeaan kohtaan `path.json`:n `modules`-listaan. Järjestys määrää suositellun etenemisjärjestyksen ja numeroinnin.
2. Luo kansio ja sinne `index.mdx`.
3. Halutessasi lisää samaan kansioon `quiz.json` ja tietopakettiin `<Quiz />`.

### Tietopaketti (index.mdx)

Tietopaketti on Markdownia, jonka sekaan voi kirjoittaa komponentteja. Otsikko tulee `path.json`:sta, joten **älä käytä `#`-pääotsikkoa**, vaan aloita väliotsikot tasolta `##`.

| Komponentti | Käyttö |
|---|---|
| `<Os only="windows">…</Os>` | Sisältö vain Windowsille (tai `mac`). Jätä tyhjä rivi tagien ja Markdown-sisällön väliin. |
| `<Path only="claude-code-desktop">…</Path>` | Sisältö vain polulla, jolla kävijä kulkee. Yhteisiä aiheita varten. Build tarkistaa, että polku on olemassa. |
| `<Command id="install-git" />` | Kopioitava komento `commands.json`:sta valitun käyttöjärjestelmän mukaan. |
| `<Term id="git">Gitin</Term>` | Sanastotermi, jonka selitys näkyy osoittamalla tai napauttamalla. |
| `<Quiz />` | Moduulin visa (`quiz.json` samassa kansiossa). |
| `<Terminal mission="luo-projektikansio" />` | Terminaalisimulaattorin harjoitus `missions.json`:sta. |
| `<VerifyStep id="git" />` | Asennuksen varmistus `verify.json`:sta. |
| `<ReadMore title="Otsikko">…</ReadMore>` | Avattava syventävä osio. |
| `<Tip title="Vinkki" type="warning">…</Tip>` | Vinkki- tai huomiolaatikko (`type` valinnainen). |
| `<NuppuSays pose="koodaa">…</NuppuSays>` | Nupun lyhyt kommentti puhekuplassa. Kirjoita se omalle rivilleen väliotsikon tai kappaleen edelle; leveällä näytöllä se näkyy tekstin vieressä. Asennot: `NUPPU_POSES` (`src/schemas/content.ts`). Yksi kommentti aihetta kohden riittää. |
| `<Screenshot id="s05-lupakysely" title="lupakysely" alt="…" />` | Kuvakaappaus. Kirjoita se omalle rivilleen sen kappaleen jälkeen, jota se havainnollistaa. Matala kuva (enintään 120 px, `SCREENSHOT_MAX_VISIBLE_HEIGHT`) näkyy suoraan, eikä sille kirjoiteta `title`a. Korkeampi kuva aukeaa painikkeesta ”Näytä kuva: lupakysely”, ja `title` on lyhyt nimi painikkeeseen. `alt` on pakollinen: kerro, mitä kuvassa on ja mihin lukijan pitää kiinnittää huomiota. Kuva tukee tekstiä eikä korvaa sitä. |
| `<Screenshot id="i03-pysaytys" alt="musta neliö" inline />` | Pieni kuvake tekstin seassa (”napsauta pysäytyspainiketta [kuvake]”). Näkyy aina, ei `title`a. |

**Uusi kuvakaappaus:** tallenna PNG kansioon `kuvakaappaukset/tyopoyta/`, lisää sen nimi `scripts/optimize-screenshots.mjs`:n `SHOTS`-listaan (tarvittaessa rajaus `crop` tai näyttöleveys `displayWidth`) ja aja `npm run screenshots`. Skripti tekee kuvasta WebP-version kansioon `src/assets/kuvakaappaukset/` ja päivittää näyttökoot (`kuvat.json`). Build kaatuu, jos kuvaa ei löydy tai `alt` tai (korkealta kuvalta) `title` puuttuu. Vältä `alt`-tekstissä merkkejä `>` ja `"`.

Linkit:

- Ulkoiset linkit `[teksti](https://…)` avautuvat uuteen välilehteen.
- Sivuston sisäiset linkit kirjoitetaan muodossa `[vianmääritys](#/vianmaaritys/pages-ei-nay)`.

Muut isolla alkukirjaimella alkavat tagit kaatavat buildin.

### Visa (quiz.json)

```json
{
  "questions": [
    {
      "id": "kysymys-1",
      "question": "Kysymys?",
      "options": [
        { "id": "a", "text": "Oikea vastaus", "correct": true, "explanation": "Miksi tämä on oikein." },
        { "id": "b", "text": "Väärä vastaus", "correct": false, "explanation": "Miksi tämä on väärin." },
        { "id": "c", "text": "Toinen väärä", "correct": false, "explanation": "Miksi tämäkin on väärin." }
      ]
    }
  ]
}
```

- Visassa on 2–4 kysymystä, ja kysymyksessä 3–4 vaihtoehtoa. Oikeita vaihtoehtoja on tasan yksi.
- Jokaisella vaihtoehdolla on selitys.
- Moduuli on valmis, kun tietopaketti on merkitty luetuksi ja kaikkiin kysymyksiin on vastattu oikein.

### Komennot (commands.json)

Kaikki komennot ovat yhdessä tiedostossa, joten päivitys on yksi muutos yhteen paikkaan.

```json
"install-git": {
  "description": "Asentaa Gitin.",
  "windows": "winget install --id Git.Git -e --source winget",
  "mac": "xcode-select --install",
  "source": { "windows": "https://git-scm.com/install/windows", "mac": "https://git-scm.com/install/mac" },
  "verifiedAt": "2026-10-24"
}
```

- `windows` ja `mac` ovat kumpikin valinnaisia, mutta ainakin toinen tarvitaan.
- `source` voi olla yksi osoite tai erikseen `{ "windows": …, "mac": … }`.
- `verifiedAt: "TODO"` on sallittu, jos komentoa ei ole vielä tarkistettu. Build tulostaa siitä varoituksen.
- Kirjaa tarkistukset myös tiedostoon `docs/komentojen-tarkistus.md`.

### Muut tiedostot

| Tiedosto | Sisältö |
|---|---|
| `glossary.json` | Sanasto: `term`, `definition` (1–2 virkettä), valinnainen `readMore`-linkki. |
| `missions.json` | Simulaattorin harjoitukset. Onnistumisen ehdot: `cwdIs`, `dirExists`, `visited` ja `commandUsed`. Polut kirjoitetaan muodossa `~/kansio`. |
| `verify.json` | Varmistukset: tasan yksi oikea vaihtoehto. Jokainen väärä vaihtoehto ohjaa vianmääritykseen (`troubleshooting`, voi olla eri Windowsille ja Macille). `command` on valinnainen: ilman sitä varmistus kysyy, mitä sovelluksessa näkyy. |
| `troubleshooting.json` | Vianmääritys: `os`, `symptom`, `steps` (takahipsujen väliin kirjoitettu teksti näytetään koodina), valinnaiset `commands` ja `path` (polku, jota ongelma koskee; sivu ryhmittelee kohdat poluittain, ja ilman polkua kohta näkyy kohdassa ”Kaikilla poluilla”). |
| `badges.json` | Merkit ja ehdot: `commandsRun`, `missionsComplete`, `modulesComplete` (`"polku/moduuli"`, valinnainen `"match": "any"`, kun yksikin aihe riittää), `topicComplete`, `verifyPassed` ja `pathComplete`. Valinnainen `path` kertoo, minkä polun merkki on; ilman sitä merkki on yhteinen. Älä kiristä ehtoja: jo ansaittu merkki säilyy, mutta ehto ei saa muuttua niin, ettei sitä enää voi ansaita samalla tavalla. |

## Käännökset

Sivusto on suomeksi ja englanniksi. Suomi on lähdekieli: sisältö kirjoitetaan ensin suomeksi, ja käännös tehdään sen rinnalle samaan kansioon.

| Lähdetiedosto | Käännös | Mitä käännöksessä on |
|---|---|---|
| `glossary.json`, `badges.json`, `missions.json`, `troubleshooting.json`, `verify.json`, `commands.json` | `glossary.en.json` jne. | Samat tunnisteet ja vain käännettävät kentät, esim. `{ "git": { "term": "Git", "definition": "…" } }` |
| `paths/<polku>/path.json` | `path.en.json` | `title`, `description`, `audience` ja aihealueet ja aiheet `id`:n kanssa. Viittauksia (`ref`) ei kirjoiteta käännökseen. |
| `…/<aihe>/quiz.json` | `quiz.en.json` | Kysymykset ja vaihtoehdot `id`:n kanssa: `question`, `text`, `explanation`. Oikea vastaus tulee lähteestä. |
| `…/<aihe>/index.mdx` | `index.en.mdx` | Koko tietopaketti käännettynä. Komponentit ja niiden tunnisteet (`<Term id>`, `<Command id>`, `<Screenshot id>` …) ovat samat, `alt`- ja `title`-tekstit käännetään. |

- Rakenne (tunnisteet, ehdot, järjestys, `correct`, `os`, linkit) tulee aina lähdetiedostosta, joten sitä ei kopioida käännökseen. Rakenteen kentän voi silti vaihtaa, kun käännös sitä vaatii: esimerkiksi komennon kansion nimi (`gh repo create my-site`), harjoituksen ehdon polku (`~/projects/my-site`) tai sanaston englanninkielinen `readMore`-linkki.
- Build tarkistaa käännökset: tuntematon tunniste tai kenttä, väärä tyyppi ja tuntemattoman kielen tiedosto kaatavat buildin. Puuttuva käännös on varoitus, ja sivu näyttää silloin suomenkielisen tekstin (tietopaketin kohdalla myös ilmoituksen).
- Englanninkielisissä esimerkeissä käytetään kansioita `projects`, `my-site` ja `practice` sekä käyttäjää `alex`, jotta ne vastaavat komentoja ja harjoituksia.
- Käyttöliittymän omat tekstit ovat sanakirjoissa `src/i18n/ui/fi.tsx` ja `src/i18n/ui/en.tsx`. Älä kirjoita tekstejä suoraan komponentteihin.
- Uusi kieli lisätään kuten CLAUDE.md:n kohdassa Monikielisyys kerrotaan.

## Koodi

- Kaikki tyylit tulevat `src/styles/tokens.css`:n muuttujista. Älä kovakoodaa värejä tai mittoja komponentteihin.
- Kaikki tekstit tulevat sanakirjoista (`useT()`) ja sisältö `useContent()`-hookilla. Älä kovakoodaa tekstejä komponentteihin (ks. Käännökset).
- Tallennusskeeman muutos: nosta `CURRENT_VERSION`-arvoa (`src/features/progress/schema.ts`) ja lisää migraatio tiedostoon `src/features/progress/storage.ts`.
- Saavutettavuus (WCAG 2.1 AA) tarkistetaan testeissä axe-corella ja kontrastitestillä. Pidä ne vihreinä.
