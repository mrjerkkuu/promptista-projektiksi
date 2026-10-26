# Työpöytäpolun tarkistus

Tämä lista kokoaa sen, mitä polusta ”Claude Code työpöytäsovelluksessa” (`claude-code-desktop`) jää omistajan tarkistettavaksi ennen julkaisua. Rastita kohdat sitä mukaa, kun ne ovat valmiita (`- [x]`, taulukoissa ☐ → ☑). Kun jokin pitää korjata, kirjoita huomio kohdan perään tai kerro Claudelle.

Tekstit näkee helpoimmin selaimessa: aja `npm run dev` ja avaa Oppimispolut → Claude Code työpöytäsovelluksessa.

## 1. Luettavat tekstit

Tarkista sävy (rento sinuttelu), asiat ja se, ymmärtääkö täysi aloittelija ohjeen.

| Aihe | Tiedosto (`src/content/paths/…`) | Huomio |
|---|---|---|
| ☐ 0.1 Mitä vibekoodaus on? | `claude-code/perusteet/mita-on-vibekoodaus` | yhteinen terminaalipolun kanssa |
| ☐ 0.2 Chat vai AI-agentti? | `claude-code-desktop/perusteet/chat-vai-agentti` | oma versio, visa |
| ☐ 0.3 Kansiot ja tiedostot | `claude-code-desktop/perusteet/kansiot-ja-tiedostot` | Windows- ja Mac-ohjeet erikseen |
| ☐ 0.4 Git ja GitHub | `claude-code/perusteet/git-ja-github` | yhteinen |
| ☐ 1.1 Claude-tilaus | `claude-code-desktop/kayttoonotto/claude-tilaus` | visa |
| ☐ 1.2 Sovelluksen asennus | `claude-code-desktop/kayttoonotto/sovelluksen-asennus` | varmistus |
| ☐ 1.3 Kirjautuminen ja Code-välilehti | `claude-code-desktop/kayttoonotto/code-valilehti` | varmistus |
| ☐ 1.4 Tarkistuslista | `claude-code-desktop/kayttoonotto/tarkistuslista` | |
| ☐ 2.1 Ensimmäinen istunto | `claude-code-desktop/sovellus-tutuksi/ensimmainen-istunto` | visa |
| ☐ 2.2 Tilat ja turvallisuus | `claude-code-desktop/sovellus-tutuksi/tilat-ja-turvallisuus` | visa |
| ☐ 2.3 Muutosten tarkistus | `claude-code-desktop/sovellus-tutuksi/muutosten-tarkistus` | visa |
| ☐ 2.4 Esikatselu | `claude-code-desktop/sovellus-tutuksi/esikatselu` | |
| ☐ 2.5 Hyvä prompti | `claude-code/periaatteet/hyva-prompti` | yhteinen |
| ☐ 2.6 CLAUDE.md | `claude-code-desktop/sovellus-tutuksi/claude-md` | oma versio |
| ☐ 2.7 Konteksti | `claude-code-desktop/sovellus-tutuksi/konteksti` | oma versio, visa |
| ☐ 3.1 Projektikansio | `claude-code-desktop/ensimmainen-projekti/projektikansio` | |
| ☐ 3.2 Suunnittele | `claude-code-desktop/ensimmainen-projekti/suunnittele` | visa |
| ☐ 3.3 Rakenna | `claude-code-desktop/ensimmainen-projekti/rakenna` | |
| ☐ 3.4 Viimeistele | `claude-code-desktop/ensimmainen-projekti/viimeistele` | |
| ☐ ★ 3.5 GitHub-tili | `claude-code/asennukset/github-tili` | yhteinen, bonus |
| ☐ ★ 3.6 Bonus: julkaise | `claude-code-desktop/ensimmainen-projekti/julkaise` | GitHubin verkkosivun kautta |

Lisäksi:

- [ ] Uudet vianmäärityksen kohdat (`src/content/troubleshooting.json`): `tyopoyta-jumissa`, `tyopoyta-ei-loydy`, `code-tilaus`, `code-403`, `code-vanha-nakyma`, `tyopoyta-muu-ongelma`.
- [ ] Uudet varmistukset (`src/content/verify.json`): `claude-sovellus`, `code-valilehti`.
- [ ] Sanaston uudet termit: Clauden työpöytäsovellus, istunto, diff. Claude Coden määritelmä muuttui (”käytetään terminaalissa tai Clauden työpöytäsovelluksessa”).
- [ ] Polun kuvaus ja ”Kenelle?”-teksti valintasivulla (`claude-code-desktop/path.json`).

## 2. Tehdyt valinnat, jotka voit muuttaa

Nämä tehtiin ilman erillistä päätöstäsi. Perustelut ovat `PAATOKSET.md`:ssä.

- [x] **3.4 on ”Viimeistele” eikä ”Tallenna”.** Ydinpolku toimii ilman Gitiä. Viimeistelyssä tarkistetaan sivu kapealla näytöllä, päivitetään CLAUDE.md ja opitaan jatkamaan myöhemmin. *Omistaja vahvisti 26.10.2026: Gitin tallennuspisteet eivät kuulu ydinpolkuun, vaan ne tehdään myöhemmin bonusaiheena.*
- [ ] **Bonus julkaistaan GitHubin verkkosivun kautta.** Repo luodaan selaimessa, tiedostot raahataan sinne ja Pages otetaan käyttöön asetuksista. Gitiä, GitHub CLI:tä tai terminaalia ei tarvita. Vaihtoehto olisi asentaa Git ja GitHub CLI kuten terminaalipolulla.
- [ ] **GitHub-tili on bonus** (yhteinen aihe, merkitty valinnaiseksi tällä polulla).
- [ ] **Polku on valintasivulla toisena** (terminaalipolun jälkeen).
- [ ] **Muutos terminaalipolkuun:** GitHub-tili-aiheesta poistettiin lause ”annat saman osoitteen Gitille seuraavassa aiheessa”, jotta aihe sopii molemmille poluille. Git-aihe kertoo saman asian itse.

## 3. Käyttöliittymän nimet

Näitä ei voitu tarkistaa ilman oikeaa konetta. Jos nimi on koneellasi erilainen, merkitse oikea nimi perään.

**Clauden työpöytäsovellus** (oppaassa englanniksi kuten Anthropicin ohjeissa):

- [ ] Onko sovellus saatavilla suomeksi? Jos on, kirjoitetaanko nimet suomeksi?
- [ ] Macin asennus: tuleeko näkyviin ikkuna, jossa Clauden kuvake vedetään Ohjelmat-kansioon (1.2)?
- [ ] Kirjautumisen kulku ensimmäisellä käynnistyksellä (1.3).
- [ ] Välilehdet sivupalkin yläosassa ja **Code** (1.3).
- [ ] Kirjoituskentän alla oleva valintarivi: ympäristö, projektikansio, tila ja malli (1.3, 2.1).
- [ ] Sivupalkin **+ New** (2.1, 2.7, 3.1, 3.4).
- [ ] Ympäristövalikon **Local**-ryhmä (2.1).
- [ ] Kansion valinnan **Open folder…** (2.1, 3.1).
- [ ] Tilat **Manual**, **Accept edits**, **Plan** ja **Auto** (2.2).
- [ ] Manual-tilan hyväksyminen: miltä lupakysely näyttää ja mitä painikkeissa lukee? Oppaassa lukee vain ”hyväksy” (2.1, 3.3).
- [ ] Pysäytyspainike (2.1, 2.3).
- [ ] **Changes**-kortti ja luvut kuten `+12 -1` (2.3).
- [ ] Rivikommentit diffissä ja niiden lähetys Ctrl+Enter / Cmd+Enter (2.3).
- [ ] Browser-paneeli, joka aukeaa HTML-tiedoston nimeä napsauttamalla, ja keskustelun kortin **Open**-painike (2.4).
- [ ] Sivuston lupakysely **Allow once**, **Always allow**, **Deny** (2.4).
- [ ] Tiedostopaneeli, joka aukeaa tiedoston nimeä napsauttamalla, ja automaattinen tallennus (2.6).
- [ ] **Context**-kortin prosenttiluku sekä `/context` ja `/compact` kirjoituskentässä (2.7).
- [ ] Päivitys: Windowsilla **Help → Check for Updates…**, Macilla **Claude → Check for Updates…** (1.3, vianmääritys).

**macOS** (suomenkieliset nimet):

- [ ] omenavalikko → Tietoja tästä Macista (1.2)
- [ ] Finderin Siirry → Koti, Arkisto → Uusi kansio ja Näytä → Näytä polkupalkki (0.3)
- [ ] Finderin sivupalkin Ohjelmat (1.2)
- [ ] Terminaalipolku: Pääte → Lopeta Pääte, Muokkaa → Sijoita, valikkorivin Spotlight-suurennuslasi (1.1, vianmääritys).

**Windows:**

- [ ] Resurssienhallinta: Tämä tietokone → Paikallinen levy (C:) → Käyttäjät (0.3)
- [ ] Hiiren oikean painikkeen valikko Uusi → Kansio (0.3)
- [ ] Asetukset → Järjestelmä → Tietoja → Järjestelmän tyyppi (1.2, ARM)

**GitHub** (selaimessa, bonus 3.6):

- [ ] Plusvalikko → **New repository**, nimi, **Public**, README-tiedoston lisääminen ja **Create repository**.
- [ ] **Add file** → **Upload files**, kuvauskenttä, main-haaran valinta ja vahvistuspainike.
- [ ] **Settings** → **Pages** → **Deploy from a branch** → **main**, **/ (root)** → **Save**.

**Selaimet:**

- [ ] ”Uusi yksityinen ikkuna” (vianmääritys: GitHub Pages). Nimi vaihtelee selaimittain.

## 4. Kuvakaappaukset

Tähän asti polulla on vain tekstiä. Kuvat helpottavat aloittelijaa löytämään oikean painikkeen. Kun kuvat ovat valmiina, Claude lisää ne aiheisiin (vaihtoehtoiset tekstit, koot ja tumman teeman tarkistus).

### Ohjeet kuvaamiseen

- **Tallenna** kuvat kansioon `kuvakaappaukset/tyopoyta/` PNG-muodossa ja nimeä ne alla olevan taulukon mukaan.
- **Yksityisyys:** ennen kuvaamista piilota tai rajaa pois sähköpostiosoite, nimi, tilin tiedot, muiden istuntojen nimet ja polut, joissa näkyy käyttäjänimesi (esimerkiksi `C:\Users\nimi`). Kuvat päätyvät julkiselle sivulle.
- **Ikkuna:** sovellus noin 1280 × 800 pikselin kokoisena, vaalea teema. Rajaa kuva niin, että olennainen kohta näkyy selvästi. Koko ikkunaa ei tarvita.
- **Käyttöjärjestelmä:** kun sovellus näyttää samalta kummallakin koneella, yksi kuva riittää (merkintä *kumpi tahansa*). Resurssienhallinnasta ja Finderista tarvitaan omat kuvat.
- **Kuvaustapa:** Windowsilla Käynnistä → `Näyttökuvatyökalu`, Macilla Finder → Ohjelmat → Lisäohjelmat → Kuvakaappaus.

### Käyttöönotto (aihealue 1)

| Tehty | Tiedostonimi | Mitä kuvaan | Kone | Aihe |
|---|---|---|---|---|
| ☐ | `k01-lataussivu.png` | claude.ai/download, latauspainikkeet näkyvissä | kumpi tahansa | 1.2 |
| ☐ | `k02-mac-asennusikkuna.png` | ladatun asennustiedoston ikkuna (Clauden kuvake ja Ohjelmat-kansio) | Mac | 1.2 |
| ☐ | `k03-win-asennus.png` | asennusohjelma käynnissä tai valmis | Windows | 1.2 |
| ☐ | `k04-kirjautuminen.png` | kirjautumisnäkymä ensimmäisellä käynnistyksellä | kumpi tahansa | 1.3 |
| ☐ | `k05-valilehdet.png` | sivupalkin välilehdet nimineen, Code korostettuna | kumpi tahansa | 1.3 |
| ☐ | `k06-valilehdet-kuvakkeina.png` | sama, kun välilehdissä näkyy pelkät kuvakkeet | kumpi tahansa | 1.3 |
| ☐ | `k07-code-valilehti.png` | tyhjä Code-välilehti: kirjoituskenttä ja valintarivi | kumpi tahansa | 1.3 |
| ☐ | `k08-tilauskehotus.png` | kehotus päivittää tilaus (vain jos saat sen esiin, esimerkiksi ilmaistilillä) | kumpi tahansa | vianmääritys |

### Perusteet (aihe 0.3)

| Tehty | Tiedostonimi | Mitä kuvaan | Kone | Aihe |
|---|---|---|---|---|
| ☐ | `p01-win-kayttajat.png` | Resurssienhallinta: vasen reuna (Tämä tietokone) ja Käyttäjät-kansio | Windows | 0.3 |
| ☐ | `p02-win-uusi-kansio.png` | hiiren oikean painikkeen valikko Uusi → Kansio | Windows | 0.3 |
| ☐ | `p03-mac-finder-dock.png` | Finderin kuvake Dockissa | Mac | 0.3 |
| ☐ | `p04-mac-siirry-koti.png` | valikkorivin Siirry → Koti | Mac | 0.3 |
| ☐ | `p05-mac-uusi-kansio.png` | valikkorivin Arkisto → Uusi kansio | Mac | 0.3 |

### Sovellus tutuksi (aihealue 2)

| Tehty | Tiedostonimi | Mitä kuvaan | Kone | Aihe |
|---|---|---|---|---|
| ☐ | `s01-new.png` | sivupalkin **+ New** | kumpi tahansa | 2.1 |
| ☐ | `s02-ymparisto.png` | ympäristövalikko auki, Local-ryhmä näkyvissä | kumpi tahansa | 2.1 |
| ☐ | `s03-open-folder.png` | kansion valinta auki, **Open folder…** näkyvissä | kumpi tahansa | 2.1 |
| ☐ | `s04-tilat.png` | tilavalikko auki: Manual, Accept edits, Plan, Auto | kumpi tahansa | 2.2 |
| ☐ | `s05-lupakysely.png` | Manual-tilan lupakysely: Claude ehdottaa muutosta ja odottaa (painikkeet näkyvissä) | kumpi tahansa | 2.1, 2.2 |
| ☐ | `s06-pysaytys.png` | pysäytyspainike, kun Claude työskentelee | kumpi tahansa | 2.1, 2.3 |
| ☐ | `s07-changes-kortti.png` | Changes-kortti ja luvut kuten `+12 -1` | kumpi tahansa | 2.3 |
| ☐ | `s08-diff.png` | diff-näkymä, jossa on lisättyjä ja poistettuja rivejä | kumpi tahansa | 2.3 |
| ☐ | `s09-rivikommentti.png` | diffin rivikommentin kenttä auki | kumpi tahansa | 2.3 |
| ☐ | `s10-tiedostolinkki.png` | tiedoston nimi keskustelussa (napsautettava) | kumpi tahansa | 2.1, 2.4 |
| ☐ | `s11-browser.png` | Browser-paneeli, jossa näkyy ”Hei maailma” -sivu | kumpi tahansa | 2.4 |
| ☐ | `s12-open-kortti.png` | keskustelun kortti, jossa on **Open**-painike (jos tulee vastaan) | kumpi tahansa | 2.4 |
| ☐ | `s13-sivuston-lupa.png` | sivuston lupakysely Allow once / Always allow / Deny (jos tulee vastaan) | kumpi tahansa | 2.4 |
| ☐ | `s14-tiedostopaneeli.png` | CLAUDE.md auki tiedostopaneelissa | kumpi tahansa | 2.6 |
| ☐ | `s15-context-kortti.png` | Context-kortti ja prosenttiluku | kumpi tahansa | 2.7 |

### Ensimmäinen projekti (aihealue 3)

| Tehty | Tiedostonimi | Mitä kuvaan | Kone | Aihe |
|---|---|---|---|---|
| ☐ | `r01-plan.png` | Plan-tila valittuna ja Clauden suunnitelma keskustelussa | kumpi tahansa | 3.2 |
| ☐ | `r02-valmis-sivu.png` | valmis esimerkkisivu Browser-paneelissa | kumpi tahansa | 3.3 |
| ☐ | `r03-kapea-ikkuna.png` | sama sivu kavennetussa selainikkunassa | kumpi tahansa | 3.4 |
| ☐ | `r04-istunnot.png` | sivupalkki, jossa on useampi istunto | kumpi tahansa | 3.4 |
| ☐ | `g01-new-repository.png` | GitHubin plusvalikko → New repository | kumpi tahansa | 3.6 |
| ☐ | `g02-repolomake.png` | uuden repon lomake: nimi, Public, README | kumpi tahansa | 3.6 |
| ☐ | `g03-upload-files.png` | Add file → Upload files | kumpi tahansa | 3.6 |
| ☐ | `g04-lataus.png` | lataussivu: tiedostot raahattuina, kuvaus ja main-haara | kumpi tahansa | 3.6 |
| ☐ | `g05-pages-asetukset.png` | Settings → Pages: Deploy from a branch, main, / (root) | kumpi tahansa | 3.6 |
| ☐ | `g06-pages-osoite.png` | Pages-sivu, jossa julkaistun sivun osoite näkyy | kumpi tahansa | 3.6 |

### Kuvakkeet

Pienet, tiukasti rajatut kuvat yksittäisistä kuvakkeista. Niitä voi käyttää tekstin seassa (”napsauta [kuvake]”).

| Tehty | Tiedostonimi | Kuvake | Aihe |
|---|---|---|---|
| ☐ | `i01-code.png` | Code-välilehden kuvake | 1.3 |
| ☐ | `i02-new.png` | **+ New** | 2.1 |
| ☐ | `i03-pysaytys.png` | pysäytyspainike | 2.1, 2.3 |
| ☐ | `i04-tila.png` | tilan valinta (valintarivillä) | 2.2 |
| ☐ | `i05-browser.png` | Browser-paneelin kuvake tai painike | 2.4 |
| ☐ | `i06-paivitys.png` | selaimen päivityspainike (kaareva nuoli) | 2.4, 3.3 |
