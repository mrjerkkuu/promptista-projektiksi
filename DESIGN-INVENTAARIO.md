# Design-inventaario

Tämä dokumentti kuvaa sivuston **nykytilan** designeria varten: näkymät, komponentit, tilat, erikoistilanteet, sisällön ääripäät ja tyylitokenit. Se on koottu suoraan koodista ja sisältötiedostoista 24.10.2026 (commit `0163c1d`). Koodiin ei ole tehty muutoksia.

Kuvakaappaukset ovat kansiossa [`design-kuvat/`](design-kuvat/):

- `design-kuvat/tyopoyta/`: 1280 px leveä, koko sivu (osa vain näkymän korkeudelta, ks. taulukko)
- `design-kuvat/mobiili/`: 360 px leveä (sama leveys kuin `npm run check:mobile`), pikselitiheys 2×

Kuvat on otettu tuotantobuildista vaalealla teemalla (paitsi `36–38`, jotka ovat tummia) ja liike pois päältä (`prefers-reduced-motion`). Kuvaluettelo on [luvussa 7](#7-kuvakaappaukset).

Sisällys:

1. [Näkymät ja reitit](#1-näkymät-ja-reitit)
2. [Komponentit ja niiden tilat](#2-komponentit-ja-niiden-tilat)
3. [Erikoistilanteet](#3-erikoistilanteet)
4. [Sisällön ääripäät ja määrät](#4-sisällön-ääripäät-ja-määrät)
5. [Mikä vaihtuu Windows/Mac-valinnan mukaan](#5-mikä-vaihtuu-windowsmac-valinnan-mukaan)
6. [tokens.css ja kovakoodatut arvot](#6-tokenscss-ja-kovakoodatut-arvot)
7. [Kuvakaappaukset](#7-kuvakaappaukset)
8. [Havaintoja designerille](#8-havaintoja-designerille)

---

## 1. Näkymät ja reitit

Reititys on `HashRouter`: kaikki osoitteet ovat muotoa `…/#/reitti`. Sivun vaihtuessa näkymä vieritetään ylös ja fokus siirtyy sivun `h1`-otsikkoon. Selaimen välilehden otsikko on muotoa `<sivun nimi> – Promptista projektiksi`.

### Yhteinen kehys (kaikilla sivuilla)

| Osa | Sisältö |
| --- | --- |
| Ohituslinkki | ”Siirry sisältöön”. Näkyy vain näppäimistöfokuksessa vasemmassa yläkulmassa. |
| Yläpalkki | Sivuston nimi (linkki etusivulle) · päävalikko: Etusivu, Oppimispolku, Sanasto, Vianmääritys, Merkit, Asetukset (aktiivinen sivu lihavoituna ja tekstin värisenä) · työkalut: **Ohjeet: [Windows] [Mac]** (pieni käyttöjärjestelmän valitsin) ja **Teema** (alasvetovalikko: Laitteen mukaan / Vaalea / Tumma). Palkki rivittyy kapealla näytöllä usealle riville; hampurilaisvalikkoa ei ole. |
| Ilmoitusalue | Sisällön yläpuolella tarvittaessa varoitus: tallennus ei käytössä tai tallennus rikki (ks. luku 3). |
| Sisältö | Yksi palsta, enintään `--content-max-width` (46rem). Yläpalkin sisältö enintään `--page-max-width` (64rem). |
| Alatunniste | ”Avoin lähdekoodi (MIT). Ei evästeitä, ei seurantaa: edistymisesi tallentuu vain omaan selaimeesi.” |
| Merkki-ilmoitukset | Oikeaan alakulmaan kiinnitetty ilmoituspino (ks. luku 2, Merkki-ilmoitus). |

”Oppimispolku”-valikkolinkki näkyy vain, kun polkuja on yksi (nyt on). Jos polkuja tulee useampi, linkki poistuu ja polut listataan vain etusivulla.

### Reitit

| Reitti | Näkymä | Mitä siinä on | Mihin pääsee |
| --- | --- | --- | --- |
| `/` | **Etusivu** | Hero: h1 ”Promptista projektiksi”, johdantoteksti. Ensikäynnillä kortti ”Kumpaa tietokonetta käytät?” + Windows/Mac-painikkeet, muuten teksti ”Näet ohjeet X-koneelle”. Ensisijainen painike ”Aloita tästä: 0.1 …” tai ”Jatka siitä mihin jäit: N.N …”. Kun kaikki on tehty, painikkeen tilalla onnitteluilmoitus. Osio ”Oppimispolut”: polkukortti (otsikko-linkki, kuvaus, edistymispalkki). Osio ”Näin tämä toimii”: 4 kohdan lista. | Seuraava moduuli, polkusivu, vianmääritys, sanasto |
| `/polku/:pathId` | **Polkusivu** (nyt vain `/polku/claude-code`) | h1 polun nimi, kuvaus, koko polun edistymispalkki, ohjeteksti. Jokaiselle aiheelle (4 kpl) oma osio: h2 ”N. Aihe”, kuvaus, aiheen edistymispalkki, numeroitu moduulilista (moduulin nimi linkkinä, tiivistelmä, tilamerkintä oikealla). Bonusmoduulilla ★ ja ”Valinnainen.” | Jokainen moduuli |
| `/polku/:pathId/:moduleId` | **Moduulisivu** (25 kpl) | Murupolku (polku › aihe), h1 ”N.N Otsikko” (bonuksessa ★), tilamerkintä. Jos käyttöjärjestelmää ei ole valittu: ilmoituslaatikko, jossa käyttöjärjestelmän valitsin. Tietopaketti (MDX: tekstiä, väliotsikoita, taulukoita, koodilohkoja ja upotettuja komponentteja). Kortti ”Valmista?” + painike ”Olen lukenut tämän” / ”Luettu ✓ (peru merkintä)”. Sivutus: Edellinen / Seuraava (viimeisessä ”Polun loppu – Takaisin polun etusivulle”). Latauksen aikana teksti ”Ladataan tietopakettia…”. | Edellinen ja seuraava moduuli, polkusivu, sanasto (termeistä), vianmääritys (varmistuksista ja tekstilinkeistä), ulkoiset lähteet (komennoista) |
| `/sanasto` ja `/sanasto/:termId` | **Sanasto** | h1, johdanto, aakkosjärjestetty määritelmälista (39 termiä). Termi lihavoituna, selitys, osassa ”Lue lisää” -ulkoinen linkki. `:termId` korostaa termin taustavärillä ja vierittää sen keskelle. | Ulkoiset lähteet |
| `/vianmaaritys` ja `/vianmaaritys/:entryId` | **Vianmääritys** | h1, johdanto. Jos käyttöjärjestelmä on valittu: valintaruutu ”Näytä myös muiden käyttöjärjestelmien ongelmat (nyt näytetään: X)”. Lista avattavia kohtia (`details`): otsikko + käyttöjärjestelmät suluissa, sisällä ”Oire:”, ”Näin korjaat:” numeroitu lista ja mahdolliset kopioitavat komennot. `:entryId` avaa kohdan ja vierittää siihen. | Ulkoiset lähteet |
| `/merkit` | **Merkit** | h1, teksti ”Olet ansainnut X/9 merkkiä.” Osio ”Polun merkit” (8 kpl) ja ”Bonusmerkit” (1 kpl), kumpikin ruudukkona. | – |
| `/asetukset` | **Asetukset** | h1. Osio ”Käyttöjärjestelmä ja ulkoasu”: iso käyttöjärjestelmän valitsin ja teemavalikko. Osio ”Siirrä edistyminen toiselle laitteelle”: 1. Vie (Näytä siirtokoodi / Lataa tiedostona, siirtokoodin tekstikenttä + Kopioi koodi), 2. Tuo (tekstikenttä, Tuo koodista, tiedostovalitsin, tulosilmoitus). Osio ”Aloita alusta”: painike → vahvistuslaatikko → onnistumisilmoitus. | – |
| kaikki muut (`*`) | **Sivua ei löytynyt** | h1, selitys, linkki ”Palaa etusivulle”. Sama näkymä myös tuntemattomalle polulle tai moduulille. | Etusivu |

---

## 2. Komponentit ja niiden tilat

Tyylitiedosto on mainittu suluissa. Yleiset luokat (`.button`, `.card`, `.notice`, `.muted`, `.stack`, `.button-row`) ovat tiedostossa `src/styles/base.css`.

### Painike `.button` (base.css)

| Muunnelma | Ulkoasu | Käyttö |
| --- | --- | --- |
| Ensisijainen (oletus) | Täytetty `--color-primary`, valkoinen teksti | ”Aloita tästä”, ”Olen lukenut tämän”, ”Näytä siirtokoodi”, ”Tuo koodista”, valittu käyttöjärjestelmä |
| `--secondary` | Pinta-värinen tausta, reunaviiva ja teksti `--color-primary` | ”Lataa tiedostona”, ”Peruuta”, ”Aloita alusta…”, ”Luettu ✓”, valitsematon käyttöjärjestelmä, Sulje |
| `--danger` | Täytetty `--color-error` | ”Kyllä, aloita alusta” |
| `--small` | Pienempi fontti ja täyte, ei vähimmäiskorkeutta | Yläpalkin käyttöjärjestelmävalitsin, Kopioi, Suorita, ”Aloita harjoitus alusta”, Sulje |

Tilat:

- **Normaali**
- **Hover**: ensisijainen tummuu (`--color-primary-hover`), toissijainen saa `--color-surface-muted`-taustan. Vaarallisella painikkeella ei ole omaa hover-tilaa.
- **Fokus**: kaikille fokusoitaville sama 3 px oranssi rengas (`:focus-visible`, `--color-focus`, 2 px etäisyys).
- **Disabled**: läpinäkyvyys 0,6, kursori `not-allowed`. Käytössä vain ”Tuo koodista” -painikkeessa, kun tekstikenttä on tyhjä.
- **Painettu / valittu** (`aria-pressed`): vain käyttöjärjestelmän valitsimessa ja ”Olen lukenut tämän” -painikkeessa. Valittu käyttöjärjestelmä näkyy ensisijaisena painikkeena, valitsematon toissijaisena.
- **Active-tilaa (painalluksen hetki) ei ole määritelty.**

### Linkit

Alleviivattu `--color-link`. Hover-tilaa ei ole määritelty (selaimen oletus). Päävalikon aktiivinen linkki on lihavoitu ja tekstin värinen. Ulkoiset linkit avautuvat uuteen välilehteen. Ruudunlukijalle kerrotaan ”(avautuu uuteen välilehteen)”, mutta visuaalista kuvaketta ei ole.

### Käyttöjärjestelmän valitsin `OsPicker` (OsPicker.css)

- **Iso** (etusivun kortti, moduulin ilmoituslaatikko, asetukset): kysymys ”Kumpaa tietokonetta käytät?” + kaksi normaalikokoista painiketta.
- **Kompakti** (yläpalkki): ”Ohjeet:” + kaksi pientä painiketta.
- Tilat: **ei valintaa** (molemmat toissijaisia), **Windows valittu**, **Mac valittu**.

### Teemavalikko `ThemeSelect`

Natiivi `<select>`: Laitteen mukaan / Vaalea / Tumma. Näkyy yläpalkissa ja asetuksissa.

### Moduulin tilamerkintä `StatusLabel` (StatusLabel.css)

Pilleri, symboli + teksti (tila ei ole pelkän värin varassa):

| Tila | Symboli | Teksti | Värit |
| --- | --- | --- | --- |
| Ei aloitettu | ○ | Ei aloitettu | `--color-surface-muted` / `--color-text-muted` |
| Kesken | ◐ | Kesken | `--color-info-bg` / `--color-text` |
| Valmis | ✓ | Valmis | `--color-success-bg` / `--color-success` |

Tila lasketaan: **valmis** = merkitty luetuksi ja visa (jos on) läpäisty. **Kesken** = sivulla käyty, merkitty luetuksi tai visaan vastattu. Pelkkä sivulla käynti tekee moduulista keskeneräisen.

### Edistymispalkki `ProgressBar` (ProgressBar.css)

Pyöreäpäinen palkki + teksti ”X/Y valmiina (Z %)”. Tilat: **0 %** (tyhjä raita), **osittain**, **100 %**. Leveys animoituu (`--duration-medium`). Bonusmoduuli ei kuulu laskuun (polulla 24, ei 25). Käytössä etusivun polkukortissa, polkusivun yläosassa ja jokaisen aiheen alla.

### Kortti `.card` ja ilmoituslaatikko `.notice` (base.css)

- **Kortti**: pinta-väri, ohut reunaviiva, `--radius-lg`, pieni varjo.
- **Ilmoitus**, neljä väriä: **info** (oletus, sininen), **warning** (keltainen), **error** (punainen), **success** (vihreä). Ilmoituksissa ei ole kuvaketta eikä reunaviivaa, pelkkä taustaväri.
- Tietopaketin `<Tip>`-komponentti käyttää samaa ilmoitusta: tyypit **info** (oletus) ja **warning**, valinnainen lihavoitu otsikko.

### Monivalinta `ChoiceList` (ChoiceList.css): visa ja asennuksen varmistus

Jokainen vaihtoehto on koko levyinen painike, jossa merkki + teksti.

| Vaihtoehdon tila | Merkki | Ulkoasu |
| --- | --- | --- |
| Vastaamaton / valitsematon | ○ | Pinta-väri, harmaa reunaviiva |
| Hover | ○ | `--color-surface-muted` |
| Valittu, oikein | ✓ | Vihreä reunaviiva ja tausta |
| Valittu, väärin | ✗ | Punainen reunaviiva ja tausta |
| Muut vaihtoehdot, kun oikea on valittu | ○ | Normaali + vaimennettu selitysteksti vaihtoehdon alla (vain visassa) |

Palaute näkyy listan alla ilmoituslaatikossa: **”Oikein!”** (vihreä) tai **”Ei aivan.”** (punainen) + selitys. Varmistuksessa väärään vastaukseen voi liittyä linkki ”Vianmääritys: …”. Vastausta voi vaihtaa milloin tahansa; vain viimeisin valinta näkyy ja tallentuu.

### Visa `Quiz`

Kortti: h2 ”Visa”, ohjeteksti, 2–3 kysymystä (h3 ”1. Kysymys”), kullakin `ChoiceList`. Visan tilat:

- **Vastaamaton**: kaikki vaihtoehdot ○.
- **Osittain vastattu**: osa kysymyksistä oikein, osa väärin tai vastaamatta.
- **Läpäisty**: kaikki oikein → alareunaan vihreä ilmoitus ”Visa läpäisty! Kaikki vastaukset ovat oikein.”
- **Virhetila** (vain sisältövirheessä): ”Visaa ei löytynyt.”

### Asennuksen varmistus `VerifyStep`

Kortti: h3 ”Varmistus: X”, kysymys, kopioitava tarkistuskomento (`Command`), `ChoiceList` (3–4 vaihtoehtoa). Tilat samat kuin monivalinnassa. Virhetila: ”Varmistusta ”X” ei löytynyt.”

### ”Valmista?”-kortti (moduulisivu)

| Tila | Näkyy |
| --- | --- |
| Ei luettu | Painike ”Olen lukenut tämän” (ensisijainen) |
| Luettu, visa kesken | Info-ilmoitus ”Merkitsit tämän luetuksi. Aihe on valmis, kun olet vastannut visan kaikkiin kysymyksiin oikein.” + painike ”Luettu ✓ (peru merkintä)” (toissijainen) |
| Valmis | Vihreä ilmoitus ”Tämä aihe on valmis!” + painike ”Luettu ✓ (peru merkintä)” |

### Kopioitava komento `Command` (Command.css)

Kuvateksti (vaimennettu) · tumma laatikko, jossa komento tasalevyisellä fontilla ja oikealla pieni ”Kopioi”-painike · rivi ”Lähde: verkkotunnus · tarkistettu 24.10.2026”.

- **Normaali**
- **Kopioitu**: painikkeen teksti ”Kopioitu!” 2,5 s ajan
- **Kopiointi epäonnistui**: punainen teksti ”Kopiointi ei onnistunut, valitse teksti ja kopioi se itse.” lähderivin alussa
- **Ei käyttöjärjestelmää valittu**: molemmat versiot allekkain, kummankin yläpuolella lihavoitu ”Windows” / ”Mac”
- **Komentoa ei tarvita valitulla käyttöjärjestelmällä**: vain vaimennettu teksti ”Tätä komentoa tarvitaan vain Windows-koneilla.”
- **Tarkistamaton**: ”tarkistamatta” päivämäärän tilalla (ei tällä hetkellä yhdessäkään komennossa)
- **Virhetila**: ”Komentoa ”X” ei löytynyt.”

Pitkät komennot rivittyvät laatikon sisällä (`overflow-wrap: anywhere`), eivät vieritä.

### Terminaalisimulaattori `Terminal` (Terminal.css)

Rakenne: h3 ”Harjoitus: X”, tavoiteteksti, avattava ”Näytä vihje”, tumma ikkuna (tulosteet, kiinteä korkeus `--terminal-height` 16rem, vierittyy), syöttörivi (kehote + tekstikenttä + ”Suorita”), onnistumisilmoitus ja ”Aloita harjoitus alusta”.

| Tila | Mitä näkyy |
| --- | --- |
| Tyhjä / alku | Vaaleansininen vihjerivi ”Kirjoita komento alle ja paina Enter. Komento help näyttää ohjeen.” |
| Käytössä | Syötetty komento kehotteen (vihreä) perässä, tuloste valkoisena |
| Virheellinen komento | Tuloste punertavana (`--color-term-error`), esim. PowerShellin ”not recognized” tai zsh:n ”command not found” |
| Vihje | Rivi ”Vihje: …” vaaleansinisenä leipätekstifontilla |
| Juuri suoritettu | Vihreä ilmoitus harjoituksen omalla onnistumistekstillä (+ mahdollinen merkki-ilmoitus) |
| Aiemmin suoritettu | Vihreä ilmoitus ”Olet jo suorittanut tämän harjoituksen. Voit harjoitella lisää niin paljon kuin haluat.” |
| Käyttöjärjestelmä valitsematta | Vaimennettu teksti ”Harjoitus on nyt Windows-tyylinen. Valitse oma käyttöjärjestelmäsi yläpalkista.” |
| Tyhjennetty (`clear`/`cls`) | Ikkuna tyhjenee, vihjerivi palaa |
| Virhetila | ”Harjoitusta ”X” ei löytynyt.” |

Tekstikentän fokus näkyy samana oranssina renkaana. Nuolinäppäimet ylös/alas selaavat komentohistoriaa.

### Sanastotermi `Term` (Term.css)

Tekstin seassa pisteviivalla alleviivattu sana (painike, kursori `help`).

- **Suljettu**
- **Auki**: valkoinen ponnahdusruutu sanan alla (varjo, max 20rem): ”**termi:** selitys. Katso sanastosta”. Avautuu hiiren viennillä (vain hiiri) tai napautuksella/Enterillä (jää auki). Sulkeutuu Escillä, uudella napautuksella tai klikkaamalla muualle. Siirtyy vaakasuunnassa, jottei mene ruudun yli.
- **Fokus**: oranssi rengas sanan ympärillä.

### Avattava osio `ReadMore` (ReadMore.css)

Reunallinen laatikko, natiivi `details/summary`, lihavoitu otsikko (oletus ”Lue lisää”). Tilat: **suljettu**, **auki**. Avaus/sulku-nuoli on selaimen oletus. Samaa tyyliä käyttävät vianmäärityksen kohdat.

### Käyttöjärjestelmäkohtainen lohko `Os` (Os.css)

- Käyttöjärjestelmä valittu ja sama: sisältö näkyy sellaisenaan, ilman kehystä.
- Valittu ja eri: ei näy lainkaan.
- **Ei valintaa**: vasemmalla harmaa pystyviiva, otsikko ”Vain Windows:” / ”Vain Mac:” ja sisältö. Molemmat lohkot näkyvät peräkkäin.

### Merkki `Badge` (Badge.css)

Kortti: pyöreä kuvake (3.5rem), otsikko, kuvaus, tilarivi. Ruudukko `auto-fill`, sarakkeen vähimmäisleveys 16rem.

| Tila | Kuvake | Tilarivi |
| --- | --- | --- |
| **Saatu** | Merkin oma emoji kullanruskealla taustalla (`--color-badge-bg`) | ”Ansaittu 20.10.2026”, lihavoitu, `--color-badge` |
| **Lukittu** | 🔒 harmaalla taustalla | ”Ei vielä ansaittu”, vaimennettu |
| Bonus (kumpi tahansa) | – | Otsikon perässä vaimennettu ”(bonus)” |

Merkkien kuvakkeet ovat emojeja (⌨️ 📁 🧭 🧰 ✍️ 🛡️ 💾 🏆 🚀), joten niiden ulkoasu riippuu käyttöjärjestelmästä.

### Merkki-ilmoitus `BadgeToaster` (Badge.css)

Oikeaan alakulmaan kiinnitetty kortti (max 24rem): pieni kuvake, ”**Uusi merkki: X!**”, kuvaus + linkki ”Katso merkit”, painike ”Sulje”. Kullanruskea reunaviiva, iso varjo. Sisääntuloanimaatio (nousu + skaalaus, kuvake pyörähtää), joka jätetään pois, jos käyttäjä on pyytänyt vähemmän liikettä. Sulkeutuu itsestään 7 sekunnin kuluttua tai Sulje-painikkeesta. Useampi ilmoitus pinoutuu allekkain. Tuonti ja nollaus eivät tuota ilmoituksia.

### Murupolku ja sivutus (pages.css)

- **Murupolku**: pieni vaimennettu teksti ”Polku › N. Aihe” (polku linkkinä).
- **Sivutus**: kaksi linkkiä reunoilla (pieni ”Edellinen”/”Seuraava” + moduulin nimi). Ensimmäisessä moduulissa vasen puoli on tyhjä. Viimeisessä oikealla ”Polun loppu – Takaisin polun etusivulle”.

### Moduulilista (polkusivu, pages.css)

Rivi: lihavoitu linkki ”N.N Otsikko”, tiivistelmä vaimennettuna, tilamerkintä oikealla. Rivien välissä ohut viiva. Bonusmoduulissa ★ ja lihavoitu ”Valinnainen.”

### Lomake-elementit (base.css)

Tekstikentät, `textarea`, `select`: pinta-väri, ohut harmaa reuna, `--radius-sm`. Valintaruutu (vianmääritys) ja tiedostovalitsin (asetukset) ovat selaimen natiiveja. Tiedostovalitsimen painikkeen teksti tulee selaimen kielestä (kuvakaappauksissa englanninkielinen ”Choose File”).

### Muut sisältöelementit (MDX, base.css)

Väliotsikot h2/h3, kappaleet, listat, **taulukot** (vierittyvät vaakasuunnassa kapealla näytöllä), **koodilohkot** `pre` (tumma tausta, vierittyvät vaakasuunnassa), inline-`code` (harmaa tausta), lihavointi.

---

## 3. Erikoistilanteet

| Tilanne | Mitä näkyy | Kuva |
| --- | --- | --- |
| **Ensimmäinen käynti** (ei tallennusta) | Etusivulla käyttöjärjestelmäkortti ja painike ”Aloita tästä: 0.1 Mitä vibekoodaus on?”. Edistymispalkit 0/24. Moduulisivuilla käyttöjärjestelmän valitsin, komennot molemmille käyttöjärjestelmille ja ”Vain Windows/Mac” -lohkot. Vianmäärityksessä kaikki kohdat, ei valintaruutua. | 01, 14, 22 |
| **Käyttöjärjestelmä valittu, ei muuta edistymistä** | Etusivu: ”Näet ohjeet Windows-koneelle. Voit vaihtaa valintaa yläpalkista.” Painike ”Aloita tästä”. (Valinta yksinään ei ole ”edistymistä”, joten teksti ei vaihdu ”Jatka…”-muotoon.) | – |
| **Kesken** | Etusivun painike ”Jatka siitä mihin jäit: N.N …” (ensimmäinen keskeneräinen pakollinen moduuli). | 02 |
| **Kaikki suoritettu** | Etusivulla painikkeen tilalla vihreä ilmoitus ”Olet käynyt koko polun läpi. Mahtavaa työtä!” Polkusivu 24/24 (100 %), kaikki ”Valmis”. Merkit 9/9. Jos pakolliset on tehty mutta bonus ei, etusivu ehdottaa bonusmoduulia. | 03, 05, 26 |
| **Tyhjät tilat** | Merkkisivu ilman merkkejä: ”Olet ansainnut 0/9 merkkiä.” ja kaikki 9 lukittuina (erillistä tyhjää tilaa ei ole). Terminaalin tyhjä ikkuna: vihjerivi. Edistymispalkki 0 %. Sanasto ja vianmääritys eivät voi olla tyhjiä. | 24, 09 |
| **localStorage ei käytössä** (esim. yksityinen ikkuna tai esto) | Joka sivulla sisällön yläpuolella keltainen ilmoitus: ”Selaimesi ei salli tallennusta (esimerkiksi yksityinen selausikkuna). Sivu toimii, mutta edistymisesi ei säily, kun suljet välilehden. Voit siirtää edistymisen talteen asetuksista.” Ilmoitus ilmestyy myös kesken käytön, jos tallennus alkaa epäonnistua. | 33 |
| **Tallennus rikki** (tallennettua dataa ei voi lukea) | Keltainen ilmoitus: ”Aiemmin tallennettua edistymistä ei voitu lukea, joten aloitetaan alusta. Jos sinulla on siirtokoodi, voit tuoda sen asetuksista.” | 34 |
| **Siirtokoodi näytetty** | Tekstikenttä (vain luku, valitsee kaiken fokuksessa), ”Kopioi koodi”, tilateksti ”Koodi kopioitu!” tai ”Kopiointi ei onnistunut. Valitse koodi ja kopioi se itse.” | 28 |
| **Virheellinen tuontikoodi tai -tiedosto** | Punainen ilmoitus: ”Koodia ei voitu lukea. Tarkista, että kopioit koko koodin, ja yritä uudelleen.” Teksti jää kenttään. | 29 |
| **Tuonti onnistui** | Vihreä ilmoitus: ”Edistyminen tuotu! Olet nyt samassa kohdassa kuin toisella laitteella.” Kenttä tyhjenee. | – |
| **Nollauksen vahvistus** | ”Aloita alusta…” → keltainen laatikko (`alertdialog`): ”**Haluatko varmasti poistaa kaiken edistymisesi?** Tätä ei voi perua.” + punainen ”Kyllä, aloita alusta” ja ”Peruuta” (fokus siirtyy Peruuta-painikkeeseen). Ei modaalia. | 30 |
| **Nollattu** | Vihreä ilmoitus: ”Edistyminen nollattu. Tervetuloa uudelleen alkuun!” Teemavalinta säilyy, käyttöjärjestelmävalinta nollautuu. | 31 |
| **Uusi merkki** | Merkki-ilmoitus oikeassa alakulmassa. | 11 |
| **Sivua ei löytynyt** | Ks. reittitaulukko. | 32 |
| **Tietopaketti latautuu** | ”Ladataan tietopakettia…” koko näkymän korkuisessa tilassa (näkyy hetken hitaalla yhteydellä). | – |
| **Sisältövirhe** | Punaiset ilmoitukset ”Komentoa/Visaa/Varmistusta/Harjoitusta ”X” ei löytynyt.” Build-validointi estää nämä käytännössä. | – |
| **Kopiointi estetty** | Ks. Command ja siirtokoodi. | – |
| **Tumma teema** | Sama rakenne, tumma paletti. Valitaan teemavalikosta tai laitteen asetuksesta. | 36–38 |

---

## 4. Sisällön ääripäät ja määrät

### Määrät

| Asia | Määrä |
| --- | --- |
| Oppimispolkuja | 1 (”Claude Code alusta alkaen”) |
| Aiheita | 4 (0 Perusteet 5 · 1 Asennukset 8 · 2 Claude Code -periaatteet 7 · 3 Ensimmäinen projekti 5) |
| **Moduuleja** | **25**, joista 24 pakollista ja 1 bonus (3.5 Bonus: julkaise) |
| **Merkkejä** | **9**, joista 8 polun merkkiä ja 1 bonusmerkki |
| Visoja | 12 moduulissa, yhteensä 30 kysymystä, jokaisessa 3 vaihtoehtoa (90 vaihtoehtoa). Visassa 2–3 kysymystä. |
| Asennuksen varmistuksia | 5 (PowerShell, Git, VS Code, GitHub CLI, Claude Code), 3–4 vaihtoehtoa. Tarkistuslista-moduulissa kaikki viisi peräkkäin. |
| Terminaaliharjoituksia | 4 (moduuleissa 0.2, 0.3 ×2, 3.1) |
| Komentoja | 31 (55 käyttöjärjestelmäversiota): 24 molemmille, 5 vain Windows, 2 vain Mac |
| Sanaston termejä | 39 |
| Vianmäärityskohtia | 15: 10 molemmille, 3 vain Windows, 2 vain Mac. Ratkaisuvaiheita enintään 6. |
| Tietopaketin pituus | noin 100–250 sanaa (lyhin 1.8 Tarkistuslista 100, pisin 1.1 Terminaali 250) |

### Pisimmät ja lyhimmät tekstit

| Kohta | Ääripää | Pituus |
| --- | --- | --- |
| Moduulin otsikko (h1 numerolla) | ”0.2 Terminaali ja komennot”, ”2.1 Ensimmäinen keskustelu” | 26 merkkiä |
| Lyhin moduulin otsikko | ”1.2 Git” | 7 |
| Moduulin tiivistelmä (polkusivu) | ”Lue, mitä hyväksyt. Salasanat ja avaimet pysyvät poissa keskustelusta ja GitHubista.” | 84 |
| Aiheen otsikko | ”Claude Code -periaatteet” | 24 |
| Aiheen kuvaus | ”Asennat askel kerrallaan kaikki työkalut, joita Claude Coden kanssa tarvitaan, ja varmistat, että ne toimivat.” | 110 |
| Väliotsikko tietopaketissa | ”2. Ota käyttöön kaksivaiheinen tunnistautuminen” | 47 |
| Vianmäärityksen otsikko | ”Macissa aukeaa ikkuna komentorivityökalujen asentamisesta” (+ ”(Mac)”) | 57 |
| Vianmäärityksen ratkaisuvaihe | VS Coden `code`-komento Macilla | 276 |
| **Pisin komento** | `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"` (Homebrew, Mac) | 95 |
| Pisin Windows-komento | `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` | 68 |
| Lyhin komento | `claude` | 6 |
| Komennon kuvaus | git-restore: ”Palauttaa tiedoston siihen muotoon, jossa se oli viimeisimmässä tallennuspisteessä. Tallentamattomat muutokset katoavat.” | 120 |
| Pisin rivi koodilohkossa (vierittyy mobiilissa) | Prompti-esimerkki moduulissa 3.2 Suunnittele | 95 |
| Visan kysymys | ”Siirryt kokonaan uuteen tehtävään, ja Claude on alkanut kiertää kehää. Mitä teet?” | 81 |
| **Pisin visavaihtoehto** | ””Tee selaimessa toimiva muistipeli 8-vuotiaalle. Kortteja on 12, ja kuvina ovat eläimet. Käytä vain HTML:ää, CSS:ää ja JavaScriptiä.”” (2.2 Hyvä prompti) | 133 |
| Lyhin visavaihtoehto | ”Ctrl+P” (2.3 Plan mode) | 6 |
| Visan selitys | 2.6 Git tallennuspisteinä | 108 |
| Varmistuksen vaihtoehto, käyttöjärjestelmä valittu | ”Näytölle aukesi ikkuna komentorivityökalujen asentamisesta” (Mac) | 58 |
| Varmistuksen vaihtoehto, **ei valintaa** (molemmat yhdessä) | ”Windows: Asennus ei mennyt loppuun asti / Mac: Näytölle aukesi ikkuna komentorivityökalujen asentamisesta” | noin 110 |
| Merkin otsikko | ”Ensimmäinen komento” | 19 |
| Merkin kuvaus | ”Osaat suunnitella ennen rakentamista, pitää salaisuudet salassa ja palata tallennuspisteeseen.” | 94 |
| Sanaston termi | ”kaksivaiheinen tunnistautuminen” | 31 |
| Sanaston selitys | path | 161 |
| Pisin yksittäinen sana | ”komentorivityökalujen” (21), ”kaksivaiheisella” | – |
| Etusivun painike | ”Jatka siitä mihin jäit: 2.1 Ensimmäinen keskustelu” | 50 |
| Terminaalin pisin tuloste | PowerShellin ”not recognized” -virhe, kaksi pitkää riviä | noin 220 |

---

## 5. Mikä vaihtuu Windows/Mac-valinnan mukaan

Valinta tallennetaan, ja sen voi vaihtaa yläpalkista, asetuksista, etusivulta (vain ensikäynnillä) ja moduulisivulta (vain kun valintaa ei ole). Valinnalla on kolme tilaa: **ei valintaa**, **Windows**, **Mac**.

| Kohta | Ei valintaa | Windows / Mac valittu |
| --- | --- | --- |
| Yläpalkin ja asetusten valitsin | Molemmat painikkeet toissijaisia | Valittu painike ensisijainen |
| Etusivun hero | Käyttöjärjestelmäkortti | Teksti ”Näet ohjeet Windows-koneelle” / ”Mac-koneelle” |
| Moduulisivun yläosa | Ilmoituslaatikko, jossa valitsin | Ei laatikkoa |
| `<Os>`-lohkot tietopaketeissa (19 lohkoa 10 moduulissa: 0.2, 0.3, 1.1–1.3, 1.5, 1.7, 1.8, 3.1, 3.3) | Kumpikin näkyy kehystettynä ”Vain Windows:” / ”Vain Mac:” | Vain oman käyttöjärjestelmän sisältö ilman kehystä. Näissä on asennusohjeet, pikanäppäimet, terminaalin avaaminen jne. Tietopaketin pituus ja rakenne vaihtelevat selvästi käyttöjärjestelmän mukaan. |
| Komennot `Command` | Molemmat versiot allekkain ”Windows”/”Mac”-otsikoin | Vain oma versio, ei otsikkoa. Vain toiselle käyttöjärjestelmälle tarkoitettu komento korvautuu tekstillä ”Tätä komentoa tarvitaan vain X-koneilla.” |
| Komennot, jotka eroavat | – | `install-git`, `install-gh`, `install-claude-code` (eri komento), vain Windows: `install-powershell`, `check-powershell`, `set-execution-policy`, `get-execution-policy`, `open-file-windows`; vain Mac: `install-homebrew`, `open-file-mac`. Muut 21 ovat samat. Lähdelinkki voi myös vaihtua. |
| Varmistusten vaihtoehdot | Teksti muodossa ”Windows: … / Mac: …” (pitkä!) | Vain oma teksti. Väärän vastauksen vianmäärityslinkki voi viedä eri kohtaan (esim. Git: Windows → ”muu ongelma”, Mac → ”komentorivityökalut”). |
| Terminaalisimulaattori | Toimii Windows-tyylisenä + huomautus ”Harjoitus on nyt Windows-tyylinen…” | **Kehote**: Windows `PS C:\Users\oppija> `, Mac `oppija@MacBook ~ % ` (kehotteen pituus vaihtelee kansion mukaan). **Polut**: `C:\Users\oppija\…` vs. `/Users/oppija/…`. **Tulosteet**: PowerShell-tyyliset taulukot (`dir`, `pwd`) vs. lyhyt zsh-tuloste. **Virheet**: pitkä ”not recognized” vs. lyhyt ”zsh: command not found”. Macilla Windows-komennoista (`dir`, `md`, `cls`) tulee vihje. Vaihto aloittaa harjoituksen alusta. |
| Vianmääritys | Kaikki 15 kohtaa, ei valintaruutua | Vain oman käyttöjärjestelmän kohdat (Windows 13, Mac 12) + valintaruutu ”Näytä myös muiden käyttöjärjestelmien ongelmat”. Suoraan linkitetty kohta näkyy aina. |
| Polku, merkit, sanasto, asetukset | Ei muutoksia | Ei muutoksia |

---

## 6. tokens.css ja kovakoodatut arvot

### Mitä `src/styles/tokens.css` sisältää

Tiedosto on neutraali placeholder-teema. Tumma paletti on kirjoitettu kahdesti: `prefers-color-scheme: dark` -mediakyselyyn (ellei käyttäjä ole valinnut vaaleaa) ja `[data-theme="dark"]`-valitsimeen.

**Typografia**

| Token | Arvo |
| --- | --- |
| `--font-body` | järjestelmäfontit (`system-ui`, Segoe UI, Roboto, …) |
| `--font-heading` | `var(--font-body)` |
| `--font-mono` | `ui-monospace`, Cascadia Mono, SF Mono, Menlo, Consolas |
| `--font-size-xs / sm / md / lg / xl / 2xl` | 0.8125 / 0.9375 / 1.0625 / 1.25 / 1.5 / 2 rem |
| `--line-height-body / heading / code` | 1.6 / 1.25 / 1.45 |
| `--font-weight-normal / bold` | 400 / 650 |

Omia fontteja ei ole. Ne pitää tarvittaessa hostata itse (ei CDN-fontteja).

**Välistykset**: `--space-1…7` = 0.25 / 0.5 / 0.75 / 1 / 1.5 / 2 / 3 rem.

**Mitat**: `--content-max-width` 46rem · `--page-max-width` 64rem · `--page-gutter` 1rem · `--tap-target-min` 2.75rem · `--progress-height` 0.625rem · `--badge-size` 3.5rem · `--terminal-height` 16rem · `--focus-ring-width` 3px · `--border-width` 1px · `--term-underline-width` 2px.

**Pyöristykset**: `--radius-sm` 4px · `--radius-md` 8px · `--radius-lg` 14px · `--radius-pill` 999px.

**Liike**: `--duration-fast` 120ms · `--duration-medium` 250ms · `--duration-badge` 600ms · `--duration-toast` 5s · `--easing-standard` cubic-bezier(0.2, 0, 0, 1). Kestot ovat 0, jos käyttäjä pyytää vähemmän liikettä.

**Kerrokset**: `--z-popover` 20 · `--z-toast` 30.

**Varjot**: `--shadow-sm`, `--shadow-md` (tummassa teemassa voimakkaammat).

**Värit**

| Token | Vaalea | Tumma | Käyttö |
| --- | --- | --- | --- |
| `--color-bg` | #f7f7f5 | #15171a | sivun tausta |
| `--color-surface` | #ffffff | #1e2125 | kortit, yläpalkki, kentät |
| `--color-surface-muted` | #efefec | #2a2e33 | hover, inline-koodi, tilamerkintä |
| `--color-text` | #1d1f23 | #eceef1 | leipäteksti |
| `--color-text-muted` | #50555e | #b3b8c0 | toissijainen teksti |
| `--color-border` | #8d9096 | #7c828b | kenttien ja vaihtoehtojen reunat |
| `--color-border-subtle` | #d4d6da | #3d4248 | korttien reunat, erottimet |
| `--color-primary` | #2f4f8a | #8fb0ef | painikkeet |
| `--color-primary-hover` | #243e6e | #a9c3f5 | painikkeen hover |
| `--color-on-primary` | #ffffff | #10141c | teksti ensisijaisessa painikkeessa |
| `--color-link` | #2a4b85 | #9dbcf5 | linkit |
| `--color-focus` | #b8590b | #f0a35e | fokusrengas |
| `--color-success` / `-bg` | #1f6b3a / #e3f2e8 | #8fd6a7 / #1d3426 | oikein, valmis |
| `--color-error` / `-bg` | #a3261d / #fbe7e5 | #ffaca3 / #3d1f1c | väärin, virhe, vaarallinen painike |
| `--color-on-error` | #ffffff | #1a0b09 | teksti vaarallisessa painikkeessa |
| `--color-info-bg` | #e7edf7 | #1f2a3d | info-ilmoitus, ”Kesken”, korostettu termi |
| `--color-warning-bg` | #fdf3d8 | #3a3220 | varoitukset |
| `--color-badge` / `-bg` | #7a5000 / #fbefd2 | #f2c66d / #3a3020 | saatu merkki, ilmoituksen reuna |
| `--color-badge-locked` | #6b6f76 | #9aa0a8 | lukittu merkki |
| `--color-progress-track` / `-fill` | #d4d6da / #2f6d4a | #3d4248 / #7cc796 | edistymispalkki |
| `--color-code-bg` | #1f2329 | #0e1013 | koodilohkot, komentolaatikko |
| `--color-code-text` | #eef0f3 | (sama) | koodin teksti |
| `--color-code-muted` | #b4bac4 | (sama) | terminaalin erotinviiva ja syöttökentän reuna |
| `--color-term-bg` | #1f2329 | #0e1013 | terminaalin tausta |
| `--color-term-text` / `-prompt` / `-error` / `-hint` | #eef0f3 / #8fd19e / #ffb4a9 / #c1ceff | (sama) | terminaalin tekstit |

Kontrastit tarkistetaan automaattisesti testissä `src/styles/tokens.test.ts`.

### Kovakoodatut arvot komponenteissa

Värejä ei ole kovakoodattu mihinkään komponenttiin. Kovakoodatut arvot ovat mittoja, kestoja ja animaatioita.

| Tiedosto | Arvo | Mitä se tekee | Huomio |
| --- | --- | --- | --- |
| `src/components/BadgeToaster.tsx` | `VISIBLE_MS = 7000` | Merkki-ilmoituksen näkymisaika | **Token `--duration-toast` (5s) on käyttämättä**, ja arvot ovat ristiriidassa. |
| `src/components/Badge.css` | `minmax(min(100%, 16rem), 1fr)` | Merkkiruudukon sarakkeen vähimmäisleveys | Ei tokenia |
| `src/components/Badge.css` | `max-width: 24rem` | Merkki-ilmoituksen leveys | Ei tokenia |
| `src/components/Badge.css` | `calc(var(--badge-size) * 0.75)` | Ilmoituksen pienempi kuvake | Kerroin kovakoodattu |
| `src/components/Badge.css` | `translateY(1rem) scale(0.95)`, `rotate(-20deg) scale(0.6)` | Ilmoituksen animaatiot | Animaation muoto kovakoodattu (kesto tokenista) |
| `src/components/Term.css` | `max-width: min(20rem, …)` | Termiselityksen leveys | Ei tokenia |
| `src/components/Term.css` | `text-underline-offset: 0.2em` | Termin alleviivauksen etäisyys | – |
| `src/components/Term.tsx` | `margin = 8` (px) | Selityksen vähimmäisetäisyys ruudun reunasta | JS:ssä, ei tokenia |
| `src/components/Terminal.css` | `min-width: 8rem` | Terminaalin syöttökentän vähimmäisleveys | – |
| `src/components/Os.css` | `border-left: var(--focus-ring-width)` | ”Vain X” -lohkon pystyviiva | Käyttää fokusrenkaan tokenia reunan leveytenä (väärä semantiikka) |
| `src/components/ProgressBar.tsx` | `style={{ width: '…%' }}` | Palkin täyttö | Dataan perustuva, kuuluukin olla inline |
| `src/pages/pages.css` | `max-width: 48%` | Sivutuslinkin leveys | – |
| `src/pages/pages.css` | `min-height: 100vh` | Latausviestin tilanvaraus | Rakenteellinen |
| `src/layout/Layout.css` | `top: -10rem`, `min-height: 100vh` | Ohituslinkin piilotus, sivun korkeus | Rakenteellinen |
| `src/styles/base.css` | `outline-offset: 2px` | Fokusrenkaan etäisyys | Ei tokenia |
| `src/styles/base.css` | `font-size: 0.92em`, `padding: 0.1em 0.3em` | Inline-koodi | – |
| `src/styles/base.css` | `text-underline-offset: 0.15em` | Linkkien alleviivaus | – |
| `src/styles/base.css` | `opacity: 0.6` | Disabled-painike | – |

Lisäksi selaimen oletusulkoasuun nojaavat: `details`-nuolet, valintaruutu, tiedostovalitsin, `select`-nuoli ja linkkien hover-tila.

---

## 7. Kuvakaappaukset

Kaikki kuvat ovat sekä kansiossa `design-kuvat/tyopoyta/` että `design-kuvat/mobiili/` samalla nimellä. ”Näkymä” tarkoittaa, että kuva on näkymän korkuinen eikä koko sivu.

| Tiedosto | Näkymä ja tila |
| --- | --- |
| `01-etusivu-ensikaynti` | Etusivu, ei tallennusta |
| `02-etusivu-kesken` | Etusivu, ”Jatka siitä mihin jäit” |
| `03-etusivu-kaikki-valmis` | Etusivu, kaikki suoritettu |
| `04-polku-kesken` | Polkusivu, kaikki kolme moduulitilaa |
| `05-polku-kaikki-valmis` | Polkusivu 100 % |
| `06-moduuli-tietopaketti-ja-visa-valmis` | Moduuli 0.1, visa läpäisty, aihe valmis |
| `07-moduuli-visa-oikein-vaarin-vastaamaton` | Moduuli 0.5, visassa oikein, väärin ja vastaamaton |
| `08-moduuli-luettu-visa-kesken` | Moduuli 0.4, luettu mutta visa tekemättä |
| `09-moduuli-terminaali-alku` | Moduuli 0.2, simulaattori tyhjänä (Windows) |
| `10-moduuli-terminaali-mac` | Sama Macilla |
| `11-moduuli-terminaali-suoritettu-ja-merkki-ilmoitus` | Harjoitus suoritettu + merkki-ilmoitus (näkymä) |
| `12-moduuli-asennus-windows` | Moduuli 1.2 Git, Windows |
| `13-moduuli-asennus-mac` | Sama Macilla |
| `14-moduuli-asennus-ei-kayttojarjestelmaa` | Sama ilman valintaa: molemmat ohjeet |
| `15-moduuli-tarkistuslista-varmistukset` | Moduuli 1.8, varmistukset oikein/väärin/vastaamatta |
| `16-moduuli-bonus-viimeinen` | Bonusmoduuli 3.5, ”Polun loppu” -sivutus |
| `17-termi-selitys-auki` | Termin ponnahdusselitys (näkymä) |
| `18-lue-lisaa-auki` | ”Lue lisää” -osio avattuna |
| `19-sanasto` | Sanasto |
| `20-sanasto-korostettu-termi` | `/sanasto/terminaali` (näkymä) |
| `21-vianmaaritys-windows` | Vianmääritys suodatettuna + valintaruutu |
| `22-vianmaaritys-ei-kayttojarjestelmaa` | Kaikki kohdat |
| `23-vianmaaritys-kohta-auki` | Suoraan linkitetty kohta auki (näkymä) |
| `24-merkit-tyhja` | 0/9 merkkiä |
| `25-merkit-osittain` | 1/9 merkkiä |
| `26-merkit-kaikki` | 9/9 merkkiä |
| `27-asetukset` | Asetukset, Tuo-painike disabled |
| `28-asetukset-siirtokoodi-naytetty` | Siirtokoodi näkyvissä |
| `29-asetukset-virheellinen-tuontikoodi` | Tuontivirhe |
| `30-asetukset-nollauksen-vahvistus` | Nollauksen vahvistus |
| `31-asetukset-nollattu` | Nollauksen jälkeen |
| `32-sivua-ei-loytynyt` | 404 |
| `33-tallennus-ei-kaytossa` | localStorage estetty |
| `34-tallennus-rikki` | Rikkinäinen tallennus |
| `35-fokus-ohituslinkki` | Näppäimistöfokus ohituslinkissä (näkymä) |
| `36-tumma-etusivu` | Tumma teema, etusivu |
| `37-tumma-moduuli-visa` | Tumma teema, visa |
| `38-tumma-moduuli-terminaali` | Tumma teema, terminaali |

Kuvat otettiin tuotantobuildista repon omalla `puppeteer-core`-riippuvuudella ja koneen Chromella (ei globaaleja asennuksia). Kuvausskripti ei ole repossa. Hover-tiloja ei ole kuvattu.

---

## 8. Havaintoja designerille

Nämä huomasin inventaariota tehdessä. Mitään ei ole muutettu.

1. **Etusivun painike mobiilissa**: painike rivittyy niin, että toinen rivi alkaa kaksoispisteellä (”: 0.1 Mitä vibekoodaus on?”), koska kaksoispiste on osa tarkenneosaa (kuva 01, mobiili).
2. **Visakortin yläreunassa on ylimääräistä tilaa**: kortin h2 ”Visa” saa yleisen otsikon ylämarginaalin (`--space-6`), toisin kuin ”Valmista?”-kortin otsikko (kuva 07).
3. **Asetuksissa on samat säätimet kahdesti**: käyttöjärjestelmä ja teema ovat sekä yläpalkissa että sivun ensimmäisessä osiossa.
4. **Yläpalkki mobiilissa** vie noin kolmanneksen ensimmäisestä näkymästä (nimi, kaksi valikkoriviä, valitsin, teemavalikko). Valikko ei tiivisty.
5. **Merkki-ilmoituksen kesto**: koodissa 7 s, tokenissa 5 s (ks. luku 6).
6. **Natiivit elementit**: tiedostovalitsin (”Choose File” selaimen kielellä), valintaruutu, `select` ja `details`-nuolet eivät noudata teemaa.
7. **Linkeillä ja vaarallisella painikkeella ei ole hover-tilaa**, eikä millään painikkeella active-tilaa.
8. **Ilmoituslaatikot** erottuvat vain taustavärillä (ei kuvaketta eikä reunaa). Väri ei ole ainoa vihje, koska tekstit (”Oikein!”, ”Ei aivan.”) kertovat saman.
9. **Ilman käyttöjärjestelmävalintaa** varmistusten vaihtoehdot ovat pitkiä yhdistelmätekstejä (”Windows: … / Mac: …”) ja asennussivut lähes kaksinkertaisia (kuva 14).
10. **Merkkien kuvakkeet ovat emojeja**, joten ne näyttävät erilaisilta Windowsilla, Macilla ja Androidilla.
11. **Tumma teema**: terminaalin ja koodin tekstivärit ovat samat molemmissa teemoissa (tausta on vain hieman tummempi).
