# Promptista projektiksi – uuden ulkoasun toteutus

Tämä paketti on Claude Codelle. Se vaihtaa sivuston ulkoasun uuteen designiin. **Toiminnallisuus pysyy täsmälleen samana.**

---

## 0. Liitä tämä Claude Codeen

> Lue `design-handoff/CLAUDE-CODE-OHJE.md` kokonaan ja toteuta siinä kuvattu uusi ulkoasu tähän projektiin yhtenä kokonaisuutena.
>
> Säännöt:
> - Älä lisää, poista tai muuta toiminnallisuutta. `DESIGN-INVENTAARIO.md` kuvaa sovelluksen nykyisen toiminnan, ja se pysyy ennallaan.
> - Toteuta vain luvussa 4 listatut muutokset. Luvun 7 asioita ei toteuteta.
> - Jos design ja nykyinen koodi ovat ristiriidassa toiminnan osalta, koodi voittaa. Kirjaa ristiriita listaksi loppuraporttiin.
> - Aja lopuksi `npm test`, `npm run build` ja `npm run check:mobile`. Korjaa, kunnes kaikki menevät läpi.
> - Lopuksi raportoi: muutetut tiedostot, tehdyt tekstimuutokset (luku 5) ja asiat, joita et voinut toteuttaa.

Pura paketti repon juureen kansioksi `design-handoff/` ennen kuin annat yllä olevan ohjeen.

---

## 1. Paketin sisältö

| Polku | Mitä | Miten käytetään |
| --- | --- | --- |
| `tokens/tokens.css` | Uudet tokenit **samoilla nimillä** kuin nykyisessä `src/styles/tokens.css`:ssä + uudet tokenit (merkitty `UUSI`) | Korvaa `src/styles/tokens.css` tällä tiedostolla. |
| `tokens/KONTRASTIT.md` | Kaikkien väriparien WCAG-kontrastit vaaleassa ja tummassa teemassa (kaikki läpäisevät) | Päivitä `src/styles/tokens.test.ts` testaamaan nämä parit. |
| `assets/nuppu/*.svg` | Maskotti Nuppu viidessä asennossa. Värit tulevat CSS-muuttujista. | Tee `Nuppu`-komponentti (luku 4.3). |
| `assets/merkit/*.svg` | Merkkien viivakuvakkeet, jotka korvaavat emojit, sekä `MERKIT.md` | Merkkikortti ja merkki-ilmoitus. |
| `design/App*.dc.html` | Näkymien design (etusivu, polku, moduuli, sanasto, vianmääritys, merkit, asetukset, 404, ääripäät) | **Visuaalinen spesifikaatio.** Inline-`style`-arvot ovat mitat ja värit. |
| `design/Components2.dc.html` | Kaikki sovelluksen komponentit ja tilat yhdellä arkilla | Ensisijainen komponenttispeksi |
| `design/CommandBlock, Quiz, VerifyStep, Terminal, Term, OsPicker, BadgeToast, Nav .dc.html` | Toimivat komponenttiversiot | Tilojen ja rakenteen speksi |
| `design/Main, Type .dc.html`, `design/design-tokens.css` | Design systemin perusta (värit, typografia, liike) | Tausta-aineisto. Token-arvot ovat jo `tokens/tokens.css`:ssä. |
| `design/Strip*.dc.html` | Tilat ja ääripäät rinnakkain (360 px) | Vertailukohta tarkistuksessa |
| `design/_aiempi-luonnos-ALA-TOTEUTA/` | Ensimmäinen luonnos, jossa on keksittyjä toimintoja | **Älä toteuta.** Pelkkä tausta. |
| `inventaario-vertailu.md` | Design vs. sovellus -vertailu ja ehdotukset | Tausta |

### Näin luet `.dc.html`-tiedostoja

Ne ovat design-työkalun formaattia. Ne eivät toimi selaimessa sellaisenaan, mutta ne ovat luettavaa HTML:ää:

- `style="…"`-arvot = tarkka visuaalinen speksi. `var(--t1)` jne. ovat design-tokeneita; vastaavat sovellustokenit ovat luvussa 3.
- `class="pp-…"` viittaa tiedostoon `design/design-tokens.css`. Sieltä löytyvät hover-, fokus- ja animaatiosäännöt.
- `{{arvo}}`, `<sc-if>`, `<sc-for>`, `<dc-import name="X">` ovat työkalun template-syntaksia. `dc-import name="X"` = komponentti tiedostosta `X.dc.html`.
- Designin `clamp(…, 4cqi, …)` ja `@container`-säännöt johtuivat design-kankaasta. **Sovelluksessa käytetään tavallisia `@media`-kyselyjä ja `vw`-yksiköitä**, taitepiste `max-width: 640px`.

---

## 2. Fontit (itse hostattu, ei CDN:ää)

```bash
npm install @fontsource-variable/fraunces @fontsource-variable/figtree @fontsource/dm-mono
```

Tuo sovelluksen sisääntulotiedostossa (esim. `src/main.tsx`):

```ts
import '@fontsource-variable/fraunces';
import '@fontsource-variable/figtree';
import '@fontsource/dm-mono/400.css';
import '@fontsource/dm-mono/500.css';
```

Tarkista paketin CSS:stä tarkka `font-family`-nimi (oletus `'Fraunces Variable'`, `'Figtree Variable'`, `'DM Mono'`) ja korjaa `--font-*`-tokenit tarvittaessa. Kaikki kolme tukevat ä-, ö- ja å-kirjaimia. Älä käytä Interiä.

| Rooli | Fontti | Paino |
| --- | --- | --- |
| Otsikot h1–h3, sivuston nimi, kortin otsikot | Fraunces (`--font-heading`) | 600, `letter-spacing: -0.01em` |
| Leipäteksti, käyttöliittymä | Figtree (`--font-body`) | 400 / 500 / 600 |
| Komennot, koodi, numerot ja tilastot (esim. `9/24`, `38 %`, moduulinumerot) | DM Mono (`--font-mono`) | 400 / 500 |

Typografia-asteikko on tiedostossa `design/Type.dc.html`. Tiivistettynä: etusivun h1 `--font-size-display`, muiden sivujen h1 `--font-size-3xl`, h2 28–30 px (mobiili 24 px), h3 22 px, leipäteksti 17/28, pieni teksti 14–15, versaaliotsake 12 px / 600 / `0.12em` / uppercase.

---

## 3. Design-tokenit → sovellustokenit

`tokens/tokens.css` sisältää jo kaiken. Tämä taulukko auttaa lukemaan designtiedostoja:

| Design (`.dc.html`) | Sovellus |
| --- | --- |
| `--bg`, `--surface`, `--surface-2` | `--color-bg`, `--color-surface`, `--color-surface-muted` |
| `--ink`, `--ink-2`, `--ink-3` | `--color-text`, `--color-text-muted`, `--color-badge-locked` |
| `--line` / `--line-strong` | `--color-border-subtle` / `--color-border` (**ks. huomio alla**) |
| `--accent`, `--accent-hover`, `--accent-ink`, `--accent-soft` | `--color-primary`, `--color-primary-hover`, `--color-on-primary`, `--color-primary-soft` |
| `--link`, `--focus` | `--color-link`, `--color-focus` |
| `--success(-soft/-line)`, `--error(-soft/-line)` | `--color-success(-bg/-border)`, `--color-error(-bg/-border)` |
| `--info-soft/-line/-ink`, `--warning-soft/-line/-ink` | `--color-info-bg/-border/-icon`, `--color-warning-bg/-border/-icon` |
| `--t0`…`--t3` (+ `-line`, `-ink`) | `--color-topic-N-bg`, `--color-topic-N-border`, `--color-topic-N-ink` |
| `--track` | `--color-progress-track` |
| `--r-sm 12 / --r-md 16 / --r-lg 28 / --r-pill` | `--radius-sm 8`, `--radius-md 16`, `--radius-lg 28`, `--radius-pill` (12 px:n kohdissa käytä `calc(var(--radius-sm) + 4px)`) |
| `--ease-spring`, `--ease-soft` | `--easing-spring`, `--easing-standard` |

**Korjaus designiin:** designissa kenttien ja vastausvaihtoehtojen reunat olivat liian vaaleat (`--line-strong`, alle 3:1). Käytä niissä tokenia `--color-border` (3,8:1). Korttien reunoissa ja erottimissa käytetään `--color-border-subtle`.

**Värisäännöt:**

1. Oranssi (`--color-primary`) vain toiminnoille: ensisijaiset painikkeet, linkit ja terminaalin kehote.
2. Vihreä vain onnistumiselle: oikein, valmis, ansaittu ja edistymispalkin täyttö.
3. Aihealueen väri seuraa aihetta (0 sininen, 1 voinkeltainen, 2 vaaleanpunainen, 3 persikka): polkusivun aiheosiot, moduulisivun aihenumero, merkkien kuvakkeet ja varmistuksen kuvake (aihe 1).
4. Väri ei ole koskaan ainoa tiedon kantaja: jokaisessa tilassa on ikoni tai symboli **ja** teksti.

---

## 4. Toteutettavat muutokset

### 4.1 Perusta

| Tiedosto | Muutos |
| --- | --- |
| `src/styles/tokens.css` | Korvaa paketin versiolla. |
| `src/styles/tokens.test.ts` | Lisää `tokens/KONTRASTIT.md`:n parit. Pidä olemassa olevat testit. |
| `src/styles/base.css` | `body`: `--font-body`, `--color-bg`. Otsikot `--font-heading` 600. Linkit: `text-underline-offset: 3px`, paksuus 1.5 px, **hover** `--color-primary-hover`. Fokus: 3 px `--color-focus`, offset `--focus-ring-offset`. |
| `base.css` `.button` | Pillerimuoto (`--radius-pill`), min-korkeus 48 px (`--small` 44 px), täyte `10px 22px`, `line-height: 1.25`, **`white-space: normal` + `overflow-wrap: anywhere`** (pitkät tekstit rivittyvät). Hover: ensisijainen tummuu ja nousee `translateY(-2px)`, toissijainen saa reunaksi `--color-text`. **Active (uusi):** `translateY(1px) scale(.98)`. **Vaarallinen hover (uusi):** tausta `--color-error-bg`, teksti `--color-error`. Disabled: läpinäkyvyys 0,45. Valittu (`aria-pressed=true`) käyttöjärjestelmävalitsimessa = ensisijainen + ✓-kuvake. |
| `base.css` `.card` | Tausta `--color-surface`, reuna 1 px `--color-border-subtle`, pyöristys `--radius-lg` isoissa osioissa (visa, valmista-kortti, asetusten osiot) ja `--radius-md` pienissä. **Ei varjoa**: varjo vain hoverissa (`--shadow-md`) linkkikorteilla. |
| `base.css` `.notice` | Lisää **ikoni + ohut reuna**: `display: flex; gap: 12px`, reuna 1 px `--color-*-border`, pyöristys `--radius-md`. Ikoni: info = i-ympyrä, warning = kolmio, error = x-ympyrä, success = check-ympyrä, väri `--color-*-icon` / `--color-success` / `--color-error`. Polut löytyvät `design/Components2.dc.html`:stä. Toteuta joko `::before` + `mask-image` (ei muutoksia markupiin) tai pienellä `NoticeIcon`-komponentilla. `<Tip>`: lihavoitu otsikko omalle rivilleen. |
| Lomake-elementit | `select`: `appearance: none`, pilleri, oma nuoli-SVG oikealla. `textarea`: tasalevyinen 13 px, `--radius-sm`, reuna `--color-border`. Valintaruutu: 24 px, pyöristys 7 px, valittuna `--color-text` + valkoinen ✓. Tiedostovalitsin: piilota natiivi input visuaalisesti (`.sr-only`) ja näytä sen `<label>` toissijaisena pikkupainikkeena **”Valitse tiedosto”** + vaimennettu teksti **”Ei valittua tiedostoa”** / tiedoston nimi. Toiminta pysyy samana. |
| `details`/`summary` (ReadMore + vianmääritys) | Kortti `--radius-md`, piilota natiivinuoli (`list-style: none`, `::-webkit-details-marker`), oma chevron oikealla, kääntyy 180° (`--easing-spring`). Avattu sisältö nousee esiin (`--easing-standard`). |
| Inline-`code`, `pre`, taulukot | `code`: `--color-surface-muted`, reuna `--color-border-subtle`, 6 px pyöristys. `pre`: **vaalea** `--color-code-bg`, `--radius-sm`, vierittyy vaakasuunnassa. Taulukko: kääre `--radius-md` + reuna, otsikkorivi `--color-surface-muted`, vierittyy kapealla. |

### 4.2 Kehys (`src/layout/`)

| Osa | Muutos |
| --- | --- |
| Yläpalkki | Vasemmalla Nuppu 40 px (`vilkuttaa`, koriste) + sivuston nimi Fraunces 20 px / 600. Päävalikko **pillerinavigaationa**: kääre `--color-surface-muted` + reuna + `--radius-pill`, linkit 44 px korkeita pillereitä, aktiivinen (`aria-current="page"`) = valkoinen pinta, teksti `--color-link`, 600, `--shadow-sm`. Työkalut oikealla rivitettynä: **”Ohjeet:”** + segmenttivalitsin (Windows / Mac) ja **Teema** + tyylitelty select. |
| Yläpalkki mobiilissa (< 640 px) | Nimi omalla rivillään. Valikkopillerit yhdellä rivillä, joka **vierii vaakasuunnassa** (`overflow-x: auto`). Työkalut kolmannella rivillä. Kaikki toiminnot pysyvät näkyvissä. |
| Ohituslinkki | Pilleri `--color-text`-taustalla ja `--color-bg`-tekstillä, ilmestyy fokuksessa kohtaan `top: 12px; left: 16px`, fokusrengas. |
| Ilmoitusalue | Tallennusvaroitukset `.notice--warning`-tyylillä (ikoni + reuna). Tekstit ennallaan. |
| Sisältö | Sivun leveys `--page-max-width`, sivureunat 16 px (mobiili) → 40 px (työpöytä). Lukusivut (moduuli, vianmääritys, asetukset) `--content-max-width` keskitettynä. |
| Alatunniste | Yläreuna `--color-border-subtle`, keskitetty 14 px `--color-text-muted`. Teksti ennallaan. |

### 4.3 Uusi komponentti: `Nuppu`

- `src/components/Nuppu.tsx`: `pose: 'vilkuttaa' | 'iloitsee' | 'miettii' | 'osoittaa' | 'lepaa'`, `size` (px). SVG:t tulevat kansiosta `assets/nuppu/` (inline-SVG:nä, jotta CSS-muuttujat toimivat teemoissa).
- Aina koriste: `aria-hidden="true"`.
- Liike: kevyt kellunta (`translateY` 0 → -4 px, 4,5 s, `ease-in-out`, toistuu). `iloitsee` heiluu ±7° kahdesti (`--duration-badge`, `--easing-spring`). Ei liikettä, kun `prefers-reduced-motion: reduce`.
- Käyttökohteet (vain nämä): yläpalkin logo 40 px; etusivun hero 150 px (ensikäynti `vilkuttaa`, muuten `osoittaa`, kaikki tehty `iloitsee`); sanaston otsake 110 px `osoittaa`; vianmäärityksen otsake 100 px `miettii`; merkkisivun otsake 120 px (0/9 `lepaa`, 9/9 `iloitsee`, muuten `vilkuttaa`); 404-sivu 160 px `miettii`; tietopaketin lataus 96 px `miettii`; visa läpäisty -ilmoitus 56 px `iloitsee`; nollauksen vahvistus 64 px `miettii`.

### 4.4 Komponentit

Speksi: `design/Components2.dc.html` + mainittu komponenttitiedosto.

| Komponentti / tiedosto | Muutos | Speksi |
| --- | --- | --- |
| `OsPicker.css` | **Iso**: otsikko ”Kumpaa tietokonetta käytät?” Fraunces 22 px, kaksi 48 px:n painiketta ikoneineen (ikkuna / kannettava), valittu ensisijainen + ✓, valitsematon toissijainen. **Kompakti**: ”Ohjeet:” + segmenttivalitsin (`--color-surface-muted`-kääre, valittu = valkoinen pilleri + `--shadow-sm`). Ei valintaa = kumpikaan ei valittuna. | `OsPicker.dc.html` |
| `StatusLabel.css` | Pilleri 26 px, 12 px / 600. Ei aloitettu `--color-surface-muted` + `--color-text-muted`, Kesken `--color-info-bg` + `--color-text`, Valmis `--color-success-bg` + `--color-success`. Symbolit ○ ◐ ✓ pysyvät. | `Components2` |
| `ProgressBar.css` | Korkeus `--progress-height`, pyöreä, raita `--color-progress-track`, täyttö `--color-progress-fill`. Aiheosioissa täyttö `--color-topic-N-ink`. Teksti 14 px vaimennettuna, numerot `--font-mono`. Täyttyminen animoituu (`--duration-slow`, `--easing-standard`, `scaleX` vasemmalta). | `AppPath` |
| `ChoiceList.css` | Vaihtoehto: kortti `--radius-md`, reuna 1.5 px `--color-border`, min-korkeus 52 px, merkkiympyrä 28 px (tyhjä / vihreä ✓ / punainen ✗ valkoisella ikonilla). Hover: tausta `--color-surface-muted`, `translateX(2px)`. Oikein: `--color-success-bg` + `--color-success`-reuna. Väärin: `--color-error-bg` + `--color-error`-reuna. Selitys muiden vaihtoehtojen alla: 14 px vaimennettu, sisennys 48 px. Palaute: `.notice` success / error. `overflow-wrap: anywhere`. | `Quiz.dc.html`, `VerifyStep.dc.html` |
| `Quiz` | Kortti `--radius-lg`, täyte 20–32 px. **h2 ”Visa” ilman ylämarginaalia** (korjaa inventaarion havainnon 2). Kysymysotsikko 17 px / 600. Läpäisty: success-ilmoitus + Nuppu 56 px. | `Quiz.dc.html` |
| `VerifyStep` | Kortti `--radius-lg`. Otsikkorivi: 44 px:n kuvakeruutu (kilpi + check, aiheen 1 värit) + h3 Fraunces 22 px. Ilman käyttöjärjestelmää yhdistelmävaihtoehdot **kahtena rivinä**: `**Windows:** …` ja `**Mac:** …` (sama sisältö, ei kauttaviivaa). Väärän vastauksen vianmäärityslinkki ilmoituksen sisällä omalla rivillään. | `VerifyStep.dc.html`, `AppExtremes` (kohta G) |
| `Command.css` | **Vaalea laatikko** (ei tumma): `--color-surface`, reuna `--color-border`, `--radius-md`. Kuvateksti yläpuolella 14 px vaimennettuna. Komento `--font-mono` 15/24, `white-space: pre-wrap`, `overflow-wrap: anywhere`. Kopioi-painike: pilleri 44 px, reuna `--color-border`, kopioitu-tila vihreä (`--color-success-bg`, ✓ ”Kopioitu!”, pieni pomppaus). Laatikko on `flex-wrap`, joten kapealla painike siirtyy komennon alle. Lähderivi 13 px: ”Lähde: [verkkotunnus ↗] · tarkistettu …”. Epäonnistui: punainen 600 + ikoni lähderivin alussa. Ei valintaa: kummankin version yläpuolella **chip** ikonilla ja tekstillä ”Windows” / ”Mac”. ”Tätä komentoa tarvitaan vain …”: vaimennettu + i-ikoni. | `CommandBlock.dc.html` |
| `Terminal.css` | **Vaalea ikkuna**: `--color-term-bg`, reuna `--color-border`, `--radius-md` + 4 px. Yläpalkki `--color-term-bar`, jossa terminaali-ikoni ja käyttöjärjestelmän mukainen nimi ”PowerShell” / ”Pääte (zsh)”. Lokissa `--font-mono` 14/22, kehote `--color-term-prompt`, virhe `--color-term-error`, vihjeet `--font-body` + `--color-term-hint`. Taulukkotulosteet (`help`, `dir`, `pwd` Windowsilla) `white-space: pre` → vierittyvät vaakasuunnassa, muut rivittyvät. Syöttörivi: `--color-bg`-tausta, **kehote saa rivittyä** (pitkät polut), kenttä `min-width: 8rem`, ”Suorita” pieni ensisijainen. ”Näytä vihje” = details-kortti. ”Aloita harjoitus alusta” = pieni toissijainen. | `Terminal.dc.html`, `StripOs` |
| `Term.css` | Sana: pisteviiva-alleviivaus 2 px `--color-primary`, offset 5 px. Hover / auki: tausta `--color-primary-soft`. Ponnahdus: kortti `--color-surface`, reuna `--color-border`, `--radius-md`, `--shadow-md`, pieni nuoli, max `min(20rem, …)`. Sisältö ennallaan: **termi:** selitys. Katso sanastosta. | `Term.dc.html` |
| `ReadMore.css` | Ks. details yllä. Otsikko 16 px / 600, min-korkeus 52 px. | `ReadMore.dc.html` |
| `Os.css` | **Ei valintaa**: vasemman pystyviivan tilalle katkoviivakehys (`--os-block-border-width` dashed `--color-border`, `--radius-md`) ja yläreunaan chip ”Vain Windows” / ”Vain Mac” ikonilla. Lopeta `--focus-ring-width`-tokenin käyttö reunana. Valittu ja sama: ei kehystä (ennallaan). | `Components2`, `StripModule` |
| `Badge.css` | Kortti `--radius-md` + 4 px, reuna `--color-border-subtle`. Kuvake: 56 px:n ympyrä. **Emoji korvataan `assets/merkit/`-SVG:llä**. Saatu = aiheen värit (`assets/merkit/MERKIT.md`), lukittu = katkoviivaympyrä. Tilarivi: saatu **”✓ Ansaittu pp.kk.vvvv”** `--color-success`, lukittu ”Ei vielä ansaittu” vaimennettuna. ”(bonus)” vaimennettuna otsikon perässä. Ruudukko `minmax(min(100%, 16rem), 1fr)` ennallaan. | `AppBadges.dc.html` |
| `BadgeToaster` | Kortti `--radius-md` + 6 px, reuna 1.5 px `--color-badge-border`, `--shadow-lg`, 56 px:n kuvakeympyrä (aiheen värit), otsikko Fraunces 18 px ”Uusi merkki: X!”, kuvaus, ”Katso merkit” -linkki ja **Sulje** pienenä toissijaisena painikkeena. Pino: `gap: 10px`. Leveys `min(24rem, 100vw - 2 × reunus)`. Sisääntulo: nousu 24 px + skaalaus 0,96 → 1 (`--easing-spring`), kuvake pomppaa (`--duration-badge`). **Käytä tokenia `--duration-toast`** kovakoodatun 7000:n sijaan (arvo on nyt sama 7 s). | `BadgeToast.dc.html` |
| Murupolku | 14 px vaimennettu, erottimena ›, rivittyy. | `AppModule` |
| Sivutus | Yläreuna `--color-border-subtle`. ”← Edellinen” / ”Seuraava →” 13 px vaimennettuna, moduulin nimi alla alleviivattuna. Viimeinen: ”Polun loppu” / ”Takaisin polun etusivulle”. Kummallakin max 48 %. | `Components2` |

### 4.5 Näkymät (`src/pages/`)

Jokaiselle on design-tiedosto. Työpöytä = `design/AppX.dc.html`, mobiili = `design/StripMobile.dc.html` ja `StripHome/StripModule/…`.

| Näkymä | Muutos |
| --- | --- |
| **Etusivu** (`AppHome`) | Hero = iso kehys (`--color-surface-muted`, `--radius-lg`, reuna) kahdessa sarakkeessa, mobiilissa allekkain. Vasen: h1 ”Promptista projektiksi” `--font-size-display`, johdanto 17–20 px vaimennettuna ja CTA. Oikea: valkoinen kortti, jossa Nuppu ja ensikäynnillä **iso käyttöjärjestelmävalitsin**, muuten ”Näet ohjeet **X-koneelle**. Voit vaihtaa valintaa yläpalkista.” **CTA kaksirivisenä** painikkeena: pieni rivi ”Aloita tästä” / ”Jatka siitä mihin jäit” ja alla isompana moduulin nimi + nuoli (sama teksti, ei kaksoispistettä; korjaa havainnon 1). Kaikki tehty: success-ilmoitus painikkeen tilalla. ”Oppimispolut”: polkukortti `--radius-lg`, otsikkolinkki Fraunces, kuvaus, rivi aiheiden värichippejä (numero + nimi, data on jo olemassa) ja edistymispalkki. ”Näin tämä toimii”: sama 4 kohdan lista **numeroituina kortteina** (iso mono-numero aiheiden väreissä), tekstit ennallaan. |
| **Polkusivu** (`AppPath`) | Otsikko, kuvaus, koko polun palkki valkoisessa kortissa, ohjeteksti. Jokainen aihe = **pastellikehys** (`--color-topic-N-bg`, reuna `-border`, `--radius-lg`): iso mono-numero `--color-topic-N-ink`, h2, kuvaus, aiheen palkki (täyttö `-ink`) ja moduulilista **valkoisessa kortissa**. Rivi: `flex-wrap`, otsikkolinkki 17 px / 600, tiivistelmä 14 px, tilamerkintä oikealla (kapealla alle). Bonus: ★ + **Valinnainen.** |
| **Moduulisivu** (`AppModule`) | Murupolku, aihenumero-ympyrä aiheen väreissä + tilamerkintä, h1 `--font-size-3xl`. Ei valintaa: info-ilmoitus, jonka sisällä iso valitsin. Tietopaketti 17/28, h2 Fraunces. ”Valmista?”-kortti `--radius-lg`: tilat ennallaan (painike → info → success). Sivutus. Lataus: Nuppu `miettii` + ”Ladataan tietopakettia…” keskitettynä. |
| **Sanasto** (`AppGlossary`) | Otsikkokehys + Nuppu. Määritelmälista **korttiruudukkona** `repeat(auto-fill, minmax(min(100%, 300px), 1fr))`, aakkosjärjestys ennallaan. Termi Fraunces 19 px. ”Lue lisää” ↗. Korostettu termi (`:termId`): tausta `--color-info-bg`, reuna 2 px `--color-info-icon`. |
| **Vianmääritys** (`AppTrouble`) | Otsikkokehys + Nuppu. Valintaruutu tyyliteltynä. Kohdat details-kortteina: otsikko 17 px / 600 + käyttöjärjestelmät **chippeinä** (sama tieto kuin nyt suluissa). Sisältö: **Oire:**, **Näin korjaat:** numeroituna ja komennot. Suoraan linkitetty kohta: reuna 2 px `--color-info-icon`. |
| **Merkit** (`AppBadges`) | Otsikkokehys + Nuppu ja teksti ennallaan (”Olet ansainnut X/9 merkkiä.”, X/9 monona). Osiot ”Polun merkit” ja ”Bonusmerkit”. |
| **Asetukset** (`AppSettings`) | Kolme osiota kortteina `--radius-lg`. Vie- ja Tuo-alaosiot `--color-bg`-paneeleina (`--radius-md` + 4 px), numerot ”1.” ja ”2.” monona. ”Huom! Tuonti korvaa…” varoitusikonilla. Tulosilmoitukset `.notice`. Nollauksen vahvistus: warning-ilmoitus (`role="alertdialog"` ennallaan) + Nuppu 64 px, **”Kyllä, aloita alusta”** täytettynä `--color-error`-painikkeena ja ”Peruuta” toissijaisena (fokus Peruuta-painikkeeseen ennallaan). ”Aloita alusta…”: vaarallisen painikkeen ääriviivaversio. |
| **404** (`AppNotFound`) | Keskitetty kehys: Nuppu `miettii` 160 px, mono ”404”, h1, selitys ja ”Palaa etusivulle” **ensisijaisena painikkeena** (linkki säilyy linkkinä, vain tyyli muuttuu). |

### 4.6 Liike

Kaikki pois päältä, kun `prefers-reduced-motion: reduce` (tokenit menevät nollaan; myös `@keyframes`-animaatiot on estettävä samassa kyselyssä).

| Kohde | Toteutus |
| --- | --- |
| Linkkikortin nousu hoverissa | `translateY(-4px)` + `--shadow-md`, `--duration-medium` `--easing-spring` |
| Edistymispalkki | `scaleX(0 → 1)`, `--duration-slow`, `--easing-standard` |
| Merkki ja ilmoitus | ks. BadgeToaster; kuvake `scale .4 → 1.12 → .96 → 1` |
| Nupun reaktio | kellunta ja heilunta, ks. 4.3 |
| Visa- ja varmistuspalaute | nousu 10 px + häivytys, `--duration-medium` |
| Kopioi-kuittaus | pieni pomppaus, 2,5 s (ennallaan) |
| Avattava osio | chevron 180°, sisältö nousee |

---

## 5. Sallitut teksti- ja markupmuutokset (vain nämä)

1. Etusivun CTA jaetaan kahdeksi riviksi samoilla sanoilla, ilman kaksoispistettä.
2. Varmistuksen yhdistelmävaihtoehdot ilman käyttöjärjestelmää: kahtena rivinä lihavoiduin ”Windows:” / ”Mac:”.
3. Vianmäärityksen käyttöjärjestelmät suluista chippeihin.
4. Tiedostovalitsin: ”Valitse tiedosto” / ”Ei valittua tiedostoa” (natiivi `input` säilyy, vain piilotetaan visuaalisesti).
5. Terminaalin yläpalkin nimi ”PowerShell” / ”Pääte (zsh)”.
6. Merkin tila: ”✓ Ansaittu pp.kk.vvvv”.
7. Merkkien emojit → SVG-kuvakkeet.
8. 404-linkki näytetään painikkeena.
9. Nuppu-maskotti luvun 4.3 kohtiin.

---

## 6. Hyväksymiskriteerit

- [ ] `npm test` läpi, myös laajennettu kontrastitesti.
- [ ] `npm run build` läpi.
- [ ] `npm run check:mobile` läpi: 360 px:n leveydellä ei vaakavieritystä millään sivulla. Poikkeukset: taulukot, `pre` ja terminaalin taulukkotulosteet, jotka vierittyvät **omassa laatikossaan**.
- [ ] Tarkista nämä ääripäät 360 px:n leveydellä (sama sisältö: `design/AppExtremes.dc.html`): etusivun painike ”Jatka siitä mihin jäit: 2.1 Ensimmäinen keskustelu”, Homebrew-komento (95 merkkiä), `Set-ExecutionPolicy…` (68), visan 133 merkin vaihtoehto, varmistus ilman käyttöjärjestelmää, PowerShellin ”not recognized” -virhe (≈ 220), vianmäärityksen 276 merkin vaihe, termi ”kaksivaiheinen tunnistautuminen” ja kaksi merkki-ilmoitusta pinossa.
- [ ] Windows-, Mac- ja ”ei valintaa” -tilat näyttävät samalta kuin `design/StripOs.dc.html`.
- [ ] Vaalea, tumma (`data-theme="dark"`) ja laitteen asetus toimivat. Tumma ei ole sinimustaa, vaan lämmintä ruskeanharmaata.
- [ ] Näppäimistö: ohituslinkki, fokusrengas kaikissa ohjaimissa, termi aukeaa Enterillä ja sulkeutuu Escillä (ennallaan).
- [ ] Toiminnallisuus ennallaan: samat reitit, tallennus, visa- ja varmistuslogiikka, siirtokoodi ja nollaus.
- [ ] Ota uudet kuvakaappaukset samoista tiloista kuin `DESIGN-INVENTAARIO.md`:n luvussa 7 (`puppeteer-core`, 1280 ja 360 px) kansioon `design-kuvat-uusi/` vertailua varten.

---

## 7. ÄLÄ toteuta (ehdotuksia, ei päätetty)

Nämä näkyvät aiemmassa luonnoksessa tai ovat käytettävyysehdotuksia. Ne vaativat erillisen päätöksen.

- Erillinen käyttöjärjestelmäsivu, etusivun `pwd`-kokeilu, tilastolaatikot, aika-arviot, aiheiden välilehdet tai oma aihesivu, moduulin vaihepalkki ja sisällysluettelo, tilat ”Seuraavaksi” ja ”Lukittu”, sanastohaku, merkkien suodatus, ”Vähennä liikettä” -kytkin, yläpalkin prosenttiluku, terminaalin pikakomentopainikkeet ja Tyhjennä-painike.
- ”Vain Windows” -lohkon sisällä komento näyttää ilman valintaa molemmat versiot. Ehdotus: näytä vain lohkon oma versio. **Toiminnallinen muutos, ei nyt.**
- Asetusten käyttöjärjestelmä- ja teemavalinta ovat samat kuin yläpalkissa. Pidetään molemmat.
