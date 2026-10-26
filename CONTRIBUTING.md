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

### Uusi moduuli olemassa olevaan polkuun

1. Lisää moduuli oikeaan kohtaan `path.json`:n `modules`-listaan. Järjestys määrää suositellun etenemisjärjestyksen ja numeroinnin.
2. Luo kansio ja sinne `index.mdx`.
3. Halutessasi lisää samaan kansioon `quiz.json` ja tietopakettiin `<Quiz />`.

### Tietopaketti (index.mdx)

Tietopaketti on Markdownia, jonka sekaan voi kirjoittaa komponentteja. Otsikko tulee `path.json`:sta, joten **älä käytä `#`-pääotsikkoa**, vaan aloita väliotsikot tasolta `##`.

| Komponentti | Käyttö |
|---|---|
| `<Os only="windows">…</Os>` | Sisältö vain Windowsille (tai `mac`). Jätä tyhjä rivi tagien ja Markdown-sisällön väliin. |
| `<Command id="install-git" />` | Kopioitava komento `commands.json`:sta valitun käyttöjärjestelmän mukaan. |
| `<Term id="git">Gitin</Term>` | Sanastotermi, jonka selitys näkyy osoittamalla tai napauttamalla. |
| `<Quiz />` | Moduulin visa (`quiz.json` samassa kansiossa). |
| `<Terminal mission="luo-projektikansio" />` | Terminaalisimulaattorin harjoitus `missions.json`:sta. |
| `<VerifyStep id="git" />` | Asennuksen varmistus `verify.json`:sta. |
| `<ReadMore title="Otsikko">…</ReadMore>` | Avattava syventävä osio. |
| `<Tip title="Vinkki" type="warning">…</Tip>` | Vinkki- tai huomiolaatikko (`type` valinnainen). |

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
| `verify.json` | Varmistukset: tasan yksi oikea vaihtoehto. Jokainen väärä vaihtoehto ohjaa vianmääritykseen (`troubleshooting`, voi olla eri Windowsille ja Macille). |
| `troubleshooting.json` | Vianmääritys: `os`, `symptom`, `steps` (takahipsujen väliin kirjoitettu teksti näytetään koodina), valinnaiset `commands`. |
| `badges.json` | Merkit ja ehdot: `commandsRun`, `missionsComplete`, `modulesComplete` (`"polku/moduuli"`), `topicComplete`, `verifyPassed` ja `pathComplete`. |

## Koodi

- Kaikki tyylit tulevat `src/styles/tokens.css`:n muuttujista. Älä kovakoodaa värejä tai mittoja komponentteihin.
- Tallennusskeeman muutos: nosta `CURRENT_VERSION`-arvoa (`src/features/progress/schema.ts`) ja lisää migraatio tiedostoon `src/features/progress/storage.ts`.
- Saavutettavuus (WCAG 2.1 AA) tarkistetaan testeissä axe-corella ja kontrastitestillä. Pidä ne vihreinä.
