# Päätökset

Valvomattoman toteutuksen aikana tehdyt tulkinnat ja valinnat. Jokaisessa päätös + perustelu.

## Yleiset

1. **SUUNNITELMA.md litteroitiin PDF:stä.** Kansiossa oli vain `SUUNNITELMA.pdf`. Tein siitä sisällöltään identtisen `SUUNNITELMA.md`:n, koska suunnitelma itse sanoo olevansa repon "totuuden lähde" ja `CLAUDE.md` viittaa siihen. PDF jätettiin paikalleen.
   - *Perustelu:* Markdownia on helppo muokata ja diffata, PDF:ää ei.
2. **Projekti rakennetaan suoraan nykyiseen kansioon** (`vibekoodaus/`) eikä alikansioon `promptista-projektiksi/`.
   - *Perustelu:* Kansio on tyhjä ja tarkoitettu tälle projektille; suunnitelman juurikansion nimi kuvaa repoa. Viten `base` on oletuksena `/promptista-projektiksi/` (ks. päätös vaiheessa 10).
3. **TypeScript 6.0.x eikä 7.x, ESLint 9.x eikä 10.x.**
   - *Perustelu:* `typescript-eslint` 8.72 tukee vain TypeScriptiä < 6.1, ja `eslint-plugin-jsx-a11y` tukee vain ESLintiä ≤ 9. Saavutettavuuslinttaus on suunnitelman luvun 10 kannalta arvokkaampi kuin uusin pääversio.

## Vaihe 2: sisältö ja validointi

4. **Moduulien nimet ja järjestys ovat `path.json`:ssa**, eivät MDX-tiedostojen frontmatterissa.
   - *Perustelu:* Kaikki rakenteellinen tieto on näin JSONissa ja zod-validoitu. MDX sisältää vain tekstin, eikä frontmatter-liitännäisiä tarvita.
5. **Lisäsisältötiedostot:** `missions.json` (simulaattorin missiot), `verify.json` (asennusten varmistuskysymykset) ja `troubleshooting.json` (vianmääritys). Kaikki ovat `src/content/`-kansiossa.
   - *Perustelu:* Suunnitelma mainitsee vain commands-, glossary- ja badges-tiedostot, mutta missiot, varmistukset ja vianmääritys ovat suomenkielistä sisältöä. Sisällön pitää olla käännettävissä ja muokattavissa ilman koodimuutoksia.
6. **Merkkien ehdot ovat deklaratiivisia** (`commandsRun`, `missionsComplete`, `modulesComplete`, `topicComplete`, `verifyPassed`, `pathComplete`), ja build tarkistaa niiden viittaukset.
7. **Build-validointi on Vite-plugin** (`scripts/validate-content.ts`), joka ajetaan `buildStart`-vaiheessa ja testeissä. MDX:stä etsitään komponenttiviittaukset säännöllisillä lausekkeilla, ja koodilohkot ohitetaan.
   - *Perustelu:* Tämä on nopea eikä vaadi MDX:n kääntämistä. Itse MDX:n syntaksivirheet kaatavat buildin muutenkin.
   - Lisäksi tarkistetaan: tuntemattomat isolla alkavat komponentit, `<Quiz />` ilman `quiz.json`:ia ja päinvastoin, moduulikansiot, joita `path.json` ei listaa, sekä visojen rakenne (2–4 kysymystä, 3–4 vaihtoehtoa, tasan yksi oikea).
   - Varmistuksen jokaisen väärän vaihtoehdon on ohjattava vianmääritykseen (luku 5).
8. **`commands.json`:n `source` voi olla eri Windowsille ja Macille** (`{ "windows": "…", "mac": "…" }`), koska esim. Gitin virallinen ohje on eri sivulla. `verifiedAt: "TODO"` on sallittu, mutta se tuottaa build-varoituksen.
9. **Lisäkomponentti `<Tip>`** (vinkkilaatikko) on sallittu MDX:ssä.
   - *Perustelu:* Aloittelijalle tarkoitetuissa ohjeissa tarvitaan usein huomiolaatikkoa ("Käynnistä terminaali uudelleen").
10. **Bonusmoduuli 3.5 on merkitty `optional: true`.** Se ei vaikuta polun edistymisprosenttiin eikä "Jatka"-painikkeeseen.

## Vaihe 3: tallennus

11. **Moduulin tilaa ei tallenneta erikseen.** Tallennetaan teot (`visited`, `read`, visavastaukset), ja tila (ei aloitettu / kesken / valmis) lasketaan niistä.
    - *Perustelu:* Jos visan sisältö muuttuu, tila päivittyy oikein, eikä tallennettu tila voi olla ristiriidassa sisällön kanssa.
12. **Tietopaketti merkitään luetuksi painikkeella** ("Olen lukenut tämän") tietopaketin lopussa, ei automaattisesti vierityksen perusteella.
    - *Perustelu:* Tämä on ennustettava, saavutettava ja helppo testata. Käyttäjä voi myös perua merkinnän.
13. **Visa on läpäisty, kun jokaisen kysymyksen viimeisin vastaus on oikein.** Uudelleenyritys on sallittu, eikä yrityksiä lasketa.
14. **Tallennettu objekti sisältää myös teemavalinnan.** "Aloita alusta" nollaa kaiken muun, myös käyttöjärjestelmävalinnan, mutta säilyttää teeman.
    - *Perustelu:* Teema on näyttöasetus eikä edistymistä.
15. **Avain pysyy `pp-progress-v1`:nä, ja skeeman versio on objektin `version`-kentässä.** Migraatiot ovat ketju `migrations[n]: vn → vn+1`. Tuonti hyväksyy sekä base64-koodin että ladatun JSON-tiedoston sisällön, ja molemmat validoidaan zodilla (`strict`).
16. **Rikkinäistä tallennusta ei ylikirjoiteta heti latauksessa**, vaan vasta käyttäjän ensimmäisestä toiminnosta. Käyttäjälle näytetään huomautus.

## Vaihe 4–5: komponentit ja sivut

17. **Visan ja varmistuksen vaihtoehdot ovat painikkeita (`aria-pressed`) eivätkä radiopainikkeita.**
    - *Perustelu:* Välitön palaute vaatii, että valinta kirjataan heti. Radiopainikkeissa nuolinäppäimillä liikkuminen valitsisi (ja kirjaisi) jokaisen vaihtoehdon matkalla.
    - Valitun vaihtoehdon selitys näytetään heti. Kun oikea vastaus on löytynyt, näytetään kaikkien vaihtoehtojen selitykset.
18. **Kun käyttöjärjestelmää ei ole valittu,** `<Os>` ja `<Command>` näyttävät molemmat versiot otsikoituina, ja moduulisivulla näytetään valintapainikkeet.
    - *Perustelu:* Sisältöä ei piiloteta keneltäkään.
19. **"Aloita alusta" -vahvistus on sivun sisäinen kysymys** (`role="alertdialog"`) eikä selaimen `confirm()`-ikkuna.
    - *Perustelu:* Sen voi muotoilla, se on saavutettava, ja sen voi testata.
20. **Lisäsivu `/merkit`** listaa kaikki merkit. Valikossa on linkki "Oppimispolku", kun polkuja on yksi; kun polkuja on useampi, ne listataan etusivulla. Koodiin ei ole kovakoodattu yhtään polkua.
21. **Sivun vaihtuessa fokus siirtyy uuden sivun `h1`-otsikkoon** (ruudunlukijat). "Siirry sisältöön" -linkki käsitellään JavaScriptillä, koska HashRouter varaa `#`-osan reiteille.
22. **Tietopaketeissa ei käytetä `#`-pääotsikkoa**, koska sivu tuo otsikon (numero + nimi) `path.json`:sta. Tietopakettien väliotsikot alkavat tasolta `##`.

## Vaihe 6: terminaalisimulaattori

23. **Simulaattorin ydin on puhtaita funktioita** (`src/features/terminal-sim/shell.ts`). Komponentti `src/components/Terminal.tsx` hoitaa vain näkymän, historian ja missioiden kirjauksen.
24. **Polkujen kirjainkoolla ei ole väliä** kummallakaan käyttöjärjestelmällä, mutta näytössä käytetään kansion oikeaa nimeä.
    - *Perustelu:* Windows ja macOS (APFS:n oletus) eivät erottele kirjainkokoa, joten tämä vastaa todellisuutta ja on aloittelijalle armollisempi.
25. **Lisäkomennot `dir` (Windows), `cls`/`md` (Windows) ja `cd..` (Windows).** Macissa nämä antavat aidon zsh-virheen ja suomenkielisen vihjeen oikeasta komennosta. `cd` ilman kansiota vie kotikansioon. Windowsin `mkdir` luo puuttuvat yläkansiot (kuten `New-Item`), Macin vain `-p`-valitsimella.
26. **PowerShellin `ls`/`dir`-tuloste on yksinkertaistettu** (Mode + Name, ei päivämääriä eikä kokoja), jotta se mahtuu kapeallekin näytölle.
27. **Versiotarkistusten tulosteet ovat esimerkkejä:** Git 2.56.0 (git-scm.com:n uusin versio 24.10.2026). Claude Coden "2.1.0 (Claude Code)" on keksitty esimerkkiversio, ja help kertoo, että versiot ovat esimerkkejä.
28. **Missioehtoihin lisättiin `visited`** (käyttäjä on käynyt kansiossa), jotta "käy kansiossa ja palaa takaisin" -tehtävän voi tunnistaa tilasta.
29. **Jos käyttöjärjestelmää ei ole valittu, simulaattori on Windows-tyylinen** ja kertoo siitä. Käyttöjärjestelmän vaihtaminen aloittaa harjoituksen alusta oikealla kehotteella.
30. **Missiot:** `ensimmaiset-komennot` (0.2), `kansioissa-liikkuminen` ja `luo-projektikansio` (0.3) sekä `projektikansio-harjoitus` (3.1).

## Vaihe 7: merkit ja edistymispalkit

31. **Merkit myönnetään saman toiminnon yhteydessä, jossa ehto täyttyy.** `ProgressProvider` saa `derive`-funktion (`deriveBadges`), ja juuri ansaituista merkeistä ilmoitetaan. Erillistä effectiä ei tarvita, joten tilaa ei renderöidä kahdesti.
    - Tuodusta tai nollatusta edistymisestä ei ilmoiteta uusina merkkeinä.
32. **Merkki-ilmoitus** (`BadgeToaster`) näkyy 7 sekuntia, ja siinä on Sulje-painike ja `role="status"`. Animaatio on pois päältä, kun `prefers-reduced-motion` on käytössä.
33. **Merkit:** Ensimmäinen komento, Kansiomestari, Perusteet hallussa, Asennukset kunnossa, Promptiseppä, Turvallinen ohjaaja, Ensimmäinen commit, Vibekoodaaja (koko polku) ja bonuksena Julkaistu!
    - "Asennukset kunnossa" vaatii Gitin, VS Coden, gh:n ja Clauden varmistukset oikein. PowerShell ei kuulu ehtoon, koska sitä ei ole Macilla.
    - "Ensimmäinen commit" myönnetään, kun moduuli 3.4 (GitHubiin) on valmis, koska ensimmäinen commit tehdään siinä (suunnitelman luku 5).
34. **Merkkien kuvakkeet ovat placeholder-emojeja** (`aria-hidden`). Design korvaa ne myöhemmin.
35. **Varmistuksen väärä vaihtoehto voi ohjata eri vianmäärityskohtaan Windowsilla ja Macilla** (`troubleshooting: { windows, mac }`), koska esim. ”brew puuttuu” koskee vain Macia.

## Vaihe 8: sisältö

36. **Komennot tarkistettiin taustalla ajetulla tarkistuksella kahdessa erässä** (tulokset: `docs/komentojen-tarkistus.md`). Kaikilla `commands.json`:n komennoilla on `source` ja `verifiedAt: "2026-10-24"`, paitsi Macin `open index.html` (`open-file-mac`): Applen virallinen sivu näyttää vain muodon `open -a`, joten komento on merkitty TODO:ksi. Rinnalla neuvotaan avaamaan tiedosto Finderista.
37. **Perusnavigointikomennot (`cd`, `mkdir`, `pwd`) ovat tietopaketeissa tavallisina koodilohkoina**, ei `<Command>`-komponentteina. Ne eivät ole asennuskomentoja (luku 12 koskee asennuskomentoja), ja ne opetetaan ensin simulaattorissa. Macin zsh-/BSD-komennoille ei myöskään löytynyt Applen virallista lähdettä.
38. **Gitin asennus Macilla: `xcode-select --install`** (git-scm.com:n listaama tapa, ei vaadi Homebrew’ta). Homebrew mainitaan vaihtoehtona. **GitHub CLI Macilla: `brew install gh`** (virallinen ensisijainen tapa). Homebrew’n asennus on samalla sivulla, ja .pkg-paketti mainitaan "Lue lisää" -osiossa (virallisen ohjeen mukaan allekirjoittamaton).
39. **VS Code asennetaan lataamalla** (virallisella Windows-sivulla ei ole winget-komentoa). Siksi `<Command>`-komentoa ei ole, vaan on linkki viralliseen ohjeeseen.
40. **`git add -A` eikä `git add .`**, koska `-A` on dokumentoitu valitsin (git-scm.com/docs/git-add). `gh repo create oma-sivu --public --source=. --remote=origin --push` on koottu manuaalin dokumentoiduista valitsimista. Sama yhdistelmä ei ole sivulla sellaisenaan (merkitty tarkistuslistaan).
41. **Projektikansio on `~/projektit/oma-sivu`**, ei Tiedostot-kansio, koska Windowsin Documents on usein OneDrive-synkronoinnin piirissä.
42. **Visat on 12 moduulissa** (0.1, 0.2, 0.4, 0.5, 1.2, 1.6, 2.1, 2.2, 2.3, 2.5, 2.6, 2.7). Moduuleissa 0.3 ja 3.1 on simulaattoriharjoitus, ja asennusmoduuleissa on varmistukset.
43. **Tietopakettien ulkoiset linkit avautuvat uuteen välilehteen** (`MdxLink`), ja sisäiset linkit kirjoitetaan muodossa `#/vianmaaritys/...`, jolloin ne kulkevat reitittimen kautta.
44. **Sanaston "Lue lisää" -linkit** osoittavat virallisiin ohjeisiin (Anthropic, GitHub, Microsoft, Apple, MDN) tai Wikipediaan. Linkkejä ei ole tarkistettu yksitellen (ks. tarkistuslista).
45. **Uusi build-sääntö:** tietopaketeissa ei saa käyttää `#`-pääotsikkoa.

## Vaihe 9: saavutettavuus, mobiili ja Lighthouse

46. **Saavutettavuus tarkistetaan automaattisesti kolmella tavalla:**
    - `src/a11y.test.tsx`: axe-core jokaiselle sivulle ja jokaiselle tietopaketille sekä Windows- että Mac-näkymässä (57 testiä).
    - `src/styles/tokens.test.ts`: värikontrastit lasketaan suoraan tokens.css:stä molemmille teemoille (WCAG AA: teksti 4,5:1, käyttöliittymän osat 3:1). Testi tarkistaa myös, että tumman teeman kaksi kopiota ovat samat. Kun design vaihtaa värit, testi kertoo heti, jos kontrasti ei riitä.
    - ESLintin jsx-a11y-säännöt.
47. **Mobiilitarkistus** `npm run check:mobile`: puppeteer-core ja koneen oma Chrome avaavat kaikki 31 sivua 360 px leveänä kummallakin käyttöjärjestelmävalinnalla ja varmistavat, ettei sivu vieri vaakasuunnassa. Kuvakaappaukset tallentuvat `.lighthouse/mobile/`-kansioon (ei versionhallinnassa).
48. **Lighthouse** `npm run lighthouse`: viisi edustavaa sivua mobiili- ja desktop-asetuksilla, neljä vakiokategoriaa (performance, accessibility, best-practices, seo). Tulos 24.10.2026: mobiilissa 99/100/100/100 ja desktopissa 100/100/100/100. Lighthouse 13:n uusi kokeellinen "agentic-browsing"-kategoria jätettiin pois, koska suunnitelma tarkoittaa vakiokategorioita.
49. **Korjaukset tarkistusten perusteella:**
    - Tyhjät taulukko-otsikot täytettiin.
    - Otsikkotasot korjattiin (merkkisivu, tarkistuslista).
    - Varmistuksille lisättiin `title`, jotta samalla sivulla olevilla osioilla on eri nimet.
    - Tietopaketin laiska lataus aiheutti asettelun siirtymää (CLS 0,15). Nyt koko moduulin loppuosa odottaa latausta, ja latauksen ajan varataan näytön korkeuden verran tilaa.
    - Komennot rivittyvät kapealla näytöllä, ja fonttien ligatuurit on poistettu käytöstä koodissa, jotta `--` ei näytä ajatusviivalta.
50. **axe-core, lighthouse ja puppeteer-core ovat projektin kehitysriippuvuuksia**, eivät globaaleja asennuksia. Chromea ei ladata, vaan käytetään koneen omaa Chromea (`CHROME_PATH`).

## Vaihe 10: julkaisu ja dokumentaatio

51. **Workflow käyttää actioneiden pääversiotageja** (checkout@v7, setup-node@v7, configure-pages@v6, upload-pages-artifact@v5, deploy-pages@v5). Versiot tarkistettiin 24.10.2026 Viten virallisesta ohjeesta ja actioneiden julkaisuista. Viten oma esimerkki lukitsee actionit commit-tunnisteisiin (SHA). Se olisi tietoturvan kannalta vielä tiukempi vaihtoehto (ks. tarkistuslista).
52. **Workflow ajaa ennen julkaisua lintin, testit ja buildin.** Rikkinäinen sisältö tai kaatuva testi estää siis julkaisun.
53. **Viten `base` tulee workflowssa repon nimestä** (`BASE_PATH: /${{ github.event.repository.name }}/`), joten repon voi nimetä miten haluaa. Paikallinen oletus on `/promptista-projektiksi/`.
54. **Node-versio:** `engines.node >= 22.22.0` (react-router 8:n vaatimus). CI:ssä käytetään uusinta LTS-versiota (`lts/*`).
55. **LICENSE:** tekijänoikeuden haltijaksi merkittiin gitin asetuksissa oleva nimi (Jeremia Vepsäläinen).
56. **Tarkistettiin, että uuden polun lisääminen toimii ilman koodimuutoksia:** väliaikainen `paths/lovable/`-kansio löytyi automaattisesti ja meni buildista läpi, minkä jälkeen se poistettiin.

## Design v2 (design-handoff/, 24.10.2026)

57. **Uusi ulkoasu toteutettiin `design-handoff/CLAUDE-CODE-OHJE.md`:n luvun 4 mukaan.** Toiminnallisuus, reitit, tallennus (`pp-progress-v1`, skeema ja ID:t) ja merkkien ehdot ovat ennallaan. Tallennukseen ei tehty muutoksia.
58. **`tokens.css` on design-paketin versio**, ja loppuun on lisätty sovelluksen omat mittatokenit (fonttikoot 14/16/18/22 px, h2-asteikko, painikkeen korkeus, kuvakekoot, polkusivun leveys, Nupun kelluntakesto). Värejä ei lisätty. Kontrastitesti kattaa nyt myös `KONTRASTIT.md`:n parit ja sovelluksen omat käytöt (esim. aihechipin numero valkoisella).
59. **Fontit (Fraunces, Figtree, DM Mono) tulevat npm-paketeista** (`@fontsource…`) ja buildataan sivuston omiksi tiedostoiksi. Ei CDN-pyyntöjä.
60. **Ilmoitusten kuvake on `::before` + `mask-image`**, joten ilmoitusten markup ei muuttunut. Kuvake on absoluuttisesti sijoitettu eikä flex-elementti, koska osa ilmoituksista on `<p>`-elementtejä, joissa on tekstiä ja linkkejä samalla rivillä.
61. **Nuppu ja merkkien kuvakkeet ovat SVG-tiedostoja `src/assets/`-kansiossa** ja upotetaan sellaisenaan (`?raw`), jotta värit tulevat CSS-muuttujista. Merkin kuvake valitaan tiedostonimestä (= merkin ID). Uusi merkki ilman SVG:tä näyttää `badges.json`:n emojin, joten uuden merkin lisääminen ei vaadi koodimuutosta. Merkkien aihevärit ovat `Badge.tsx`:n taulukossa (oletus aihe 1).
62. **Teksti säilyi ruudunlukijalle samana:** etusivun CTA:n kaksoispiste ja vianmäärityksen sulut ja pilkut ovat `visually-hidden`-tekstinä, polkusivun aiheen numero on h2:ssa piilotettuna. Testit tarkistavat samat nimet kuin ennen.
63. **Moduulisivun tilarivi näkyy otsikon yläpuolella (`order: -1`), mutta DOM:ssa se on h1:n jälkeen**, koska fokus siirtyy sivun vaihtuessa h1:een ja ruudunlukija lukee tilan sen jälkeen.
64. **Merkki-ilmoituksen näkymisaika luetaan tokenista `--duration-toast`** (7 s). Jos tokenia ei voi lukea (testit ilman CSS:ää), käytetään 7 000 ms.
65. **Vähennetty liike:** tokenien kestot menevät nollaan kuten ennenkin, ja `base.css` estää lisäksi kaikki animaatiot ja siirtymät (myös Nupun toistuvan kellunnan).
66. **Nuppu kelluu vain etusivulla ja merkkisivulla** (ei nukkuessa). Muualla, myös yläpalkissa, se on paikallaan. Designin 4,5 s:n kellunta nyki, koska 4 px:n liike oli niin hidas, että selain pyöristi sijainnin kokonaisiin pikseleihin. Nyt Nuppu tekee nopean pompahduksen (noin 0,5 s) 2,4 s:n välein ja seisoo välillä paikallaan. Kelluvalla Nupulla on oma piirtokerros (`will-change: transform`).
67. **GitHub-tili (nyt 1.2) on siirretty Gitin (1.3) ja VS Coden (1.4) edelle**, koska Gitille annetaan sama sähköpostiosoite kuin GitHubiin. Moduulien ID:t eivät muuttuneet, joten tallennettu edistyminen säilyy; vain näytettävä numero ja suositeltu järjestys muuttuivat. Tietopaketeissa ei viitata oppitunteihin numerolla, jotta järjestystä voi muuttaa.
68. **VS Code on suositeltu mutta ei pakollinen.** Tietopaketti kertoo, että sen voi ohittaa ja tiedostot näkee myös tiedostonhallinnassa. Moduuli on edelleen pakollisten joukossa (edistymisen laskenta ja Asennukset kunnossa -merkin ehto ennallaan).
69. **Linkkikortin nousu hoverissa tehdään `top`-siirtymällä, ei `transform`illa.** Transform-animaatio sumensi etusivun polkukortin tekstin animaation ajaksi.
70. **Nuppu on vaalea myös tummassa teemassa.** `Nuppu.css` ohjaa SVG:n käyttämät värimuuttujat Nupun omiin tokeneihin (`--color-nuppu-*`), joita tumma teema ei korvaa. Tummassa teemassa Nupulla on lisäksi ohut vaalea ääriviiva (tarra, `drop-shadow`-ketju), jotta tummat kädet, jalat ja varsi erottuvat tummasta taustasta.
71. **Alatunnisteessa on tekijänoikeusrivi** ”© 2026 Jeremia Vepsäläinen” (sama kuin LICENSE-tiedostossa).

## Jälkikorjaukset

72. **Macin `open index.html` (`open-file-mac`) on tarkistettu** (24.10.2026). Omistaja vahvisti komennon oikeaksi, ja `verifiedAt` on nyt päivämäärä, joten build ei enää varoita siitä. Lähdelinkki on ennallaan. Kohdan 36 TODO on näin hoidettu.
73. **Polkusivun aiheet ovat avattavia ja aluksi kiinni.** Avatut aiheet muistetaan istunnon ajan sessionStoragessa (avain `pp-open-topics`, arvona `polku/aihe`-tunnisteet). Tämä on käyttömukavuutta eikä edistymistä: `pp-progress-v1` ja sen skeema ovat ennallaan. Jos sessionStorage ei toimi, aiheet ovat vain kiinni.
74. **Linkkikortin nousu tehdään taas `transform`illa, ja kortilla on `will-change: transform`** (korvaa kohdan 69). `top`-siirtymässä selain pyöristi tekstin kokonaisiin pikseleihin, mutta kortin tausta liikkui pikselin osina, joten teksti hyppi eri tahtiin kuin kortti. Kohdan 69 sumeus johtui siitä, että kerros syntyi vasta animaation alussa. Nyt kerros on olemassa koko ajan.

## Palaute (24.10.2026)

75. **Palaute kerätään GitHub Issuesiin ja sähköpostiin ilman omaa palvelinta.** Palautesivu (`/palaute`) kokoaa linkin, joka avaa GitHubin issue-lomakkeen tai sähköpostiohjelman valmiiksi täytettynä. Sivulta ei lähde pyyntöjä, joten sääntö ”ei kolmansien osapuolten pyyntöjä” pysyy voimassa. Lomakepalvelut (Formspree, Google Forms, Tally) hylättiin samasta syystä. Oma taustapalvelu hylättiin ylläpidon, roskapostin ja tietosuojan takia.
76. **Sähköposti on GitHubin rinnalla, koska GitHub-tili luodaan vasta aiheessa 1.2.** Palaute ohjataan osoitteeseen jeremia.projektit@gmail.com. Osoite näkyy myös tekstinä siltä varalta, ettei sähköpostiohjelma aukea. Samaan osoitteeseen tulee palautetta muistakin projekteista, joten otsikko alkaa aina tunnisteella `[Promptista projektiksi]` (suodatinta varten) ja viestin ensimmäinen rivi kertoo projektin ja repon osoitteen.
77. **Lomakkeen kentät täytetään osoitteen parametreilla kentän `id`:n mukaan** (GitHubin ohje ”Syntax for GitHub's form schema”, tarkistettu 24.10.2026). Täytettävät kentät ovat `kuvaus`, `sivu` ja `kayttojarjestelma`. Ohjeen mukaan esitäyttö toimii tekstikentille, joten käyttöjärjestelmä on tekstikenttä eikä pudotusvalikko. Otsikoksi tulee palautteen ensimmäinen rivi (enintään 60 merkkiä) tyypin etuliitteen perään.
78. **Palautteen pituus on rajattu 1 500 merkkiin**, koska koko teksti kulkee osoitteessa: GitHub vastaa liian pitkään osoitteeseen virheellä 414, ja osa sähköpostiohjelmista katkaisee pitkät mailto-linkit.
79. **Moduulin lopun linkki vie palautesivulle eikä suoraan GitHubiin** (`/palaute?moduuli=<polku>/<moduuli>`), jotta sähköposti on aina vaihtoehtona. Silloin palautteen tyyppi on oletuksena ”Virhe tai epäselvä kohta”, ja yleisessä palautteessa ”Kehitysidea”. Palautesivu ei ole päävalikossa (valikko vierii jo kapealla näytöllä, joten kohta jäisi piiloon), vaan yläpalkin työkaluissa (kohta 83) ja alatunnisteessa.
80. **Lomakepohjat käyttävät GitHubin oletustunnisteita** `enhancement` ja `bug`, jotka uudessa repossa on valmiina. Tyhjä issue on pois päältä (`blank_issues_enabled: false`), ja valintasivulla on linkki palautesivulle niille, joilla ei ole GitHub-tiliä. Tallennukseen ei tehty muutoksia.
81. **GitHub-linkissä on lomakkeen kenttien lisäksi varateksti (`body`)**, jossa ovat palautteen tyyppi, sivu, käyttöjärjestelmä ja teksti. Jos lomakepohjaa ei ole GitHubissa (ennen pushia tai jos pohja nimetään uudelleen), GitHub avaa tavallisen issuen ja ohittaa lomakkeen kentät, jolloin aiemmin täyttyi vain otsikko. Kun lomakepohja on olemassa, kentät täyttyvät `id`:n mukaan.
82. **Painikkeilla (`.button`) on `will-change: transform`** samasta syystä kuin linkkikorteilla (kohta 74). Palautesivun painikkeet ovat pikselin osan kohdalla (esim. y = 1227,625), ja hoverin nousun aikana teksti sumeni.
83. **”Anna palautetta” on yläpalkissa Ohjeet- ja Teema-valintojen vieressä**, koska alatunnisteen linkki näkyy vain sivun lopussa. Mobiilissa se on omalla rivillään valintojen alla. Kelluva palautepainike ja ajastettu ponnahdusikkuna hylättiin: painike peittäisi tekstiä ja merkki-ilmoituksen, ja ponnahdus keskeyttäisi oppimisen.
84. **Palautetta pyydetään valmistumisen hetkellä.** Kun aihe viimeistelee aihealueen, Valmista?-kortissa Nuppu kysyy ”Miltä se tuntui?” ja linkittää palautesivulle (`?aihealue=<polku>/<aihealue>`). Jos koko polku valmistuu, kysytään polusta (`?polku=<polku>`), ja sama pyyntö näkyy polkusivulla edistymispalkin alla. Pyyntö lasketaan edistymisestä eikä sitä tallenneta, joten tallennusmuoto ei muuttunut. Se näkyy aina, kun valmiin aihealueen aiheen avaa uudelleen; se on yksi rivi, joten erillistä ”älä näytä enää” -tallennusta ei tehty. Aihealueen ja polun palautteen oletustyyppi on kehitysidea.

## Sanasto (25.10.2026)

85. **Sanaston termit on ryhmitelty aiheittain, ja sivulla on haku.** Jokaisella termillä on pakollinen `category`-kenttä, jonka sallitut arvot ja otsikot ovat `GLOSSARY_CATEGORIES`-listassa (`src/schemas/content.ts`). Aiheet näytetään listan järjestyksessä, joka seuraa oppimispolkua, ja aiheen sisällä termit ovat aakkosjärjestyksessä. Uusi aihe lisätään listaan; tuntematon aihe kaataa buildin. Haku etsii termeistä ja selityksistä ja ohittaa tarkkeet, joten ”paate” löytää Päätteen. Aiheet, joissa ei ole osumia, piilotetaan, ja osumien määrä luetaan ruudunlukijalle (`aria-live`). Termien ID:t ja `/sanasto/<termi>`-linkit ovat ennallaan. Tallennukseen ei tehty muutoksia.

## Palauteautomaatio (25.10.2026)

86. **Palaute kulkee kolmessa vaiheessa, ja jokaisen toteutuksen hyväksyy omistaja:** sähköposti → issue (automaattinen), issue → PR (vain kun omistaja lisää tunnisteen `toteuta`) ja PR → tuotanto (vain kun omistaja yhdistää PR:n, jolloin `deploy.yml` julkaisee). Issue ei muuta sivustoa, joten sen luominen saa olla automaattista. Automaatio ei koskaan yhdistä PR:ää, pushaa mainiin eikä ota automaattista yhdistämistä käyttöön.
87. **Sähköposti → issue on Claude Coden ajastettu tehtävä**, ei GitHub Actions -työnkulku, koska Gmailin lukeminen Actionsista vaatisi Google-tunnukset repon salaisuuksiin. Tehtävä ajetaan arkisin klo 7.47 ja 16.47 Suomen aikaa (minuutti ei ole tasan, koska tasatunnit ruuhkautuvat). Se hakee viestit `subject:"[Promptista projektiksi]" -label:issue-luotu` ja merkitsee käsitellyt Gmail-tunnisteella `issue-luotu` vasta onnistuneen GitHub-toimenpiteen jälkeen, joten epäonnistunut viesti yritetään uudelleen seuraavalla kerralla. Tehtävä etsii ensin samaa asiaa koskevan issuen (myös suljetut) ja kommentoi siihen uuden luomisen sijaan.
88. **Sähköpostin sisältö on vierasta dataa.** Issueen ei kopioida lähettäjän nimeä, osoitetta, allekirjoitusta eikä muita henkilötietoja, koska issuet ovat julkisia. Viestin ohjeita ei noudateta, ja ohjausyritys mainitaan issuessa. Viestin linkit kirjoitetaan koodimuotoon, jotta ne eivät ole klikattavia. Tehtävä ei vastaa lähettäjälle eikä lähetä sähköpostia.
89. **Issue → PR on `.github/workflows/claude.yml`** (anthropics/claude-code-action, dokumentaatio tarkistettu 25.10.2026).
    - Käynnistyy vain tapahtumasta `issues: labeled`, kun tunniste on `toteuta`, issue on auki ja tunnisteen lisääjä (`github.event.sender.login`) on `mrjerkkuu`. Action tarkistaa lisäksi itse, että käynnistäjällä on kirjoitusoikeus ja että hän on ihminen.
    - `prompt`-syöte ajaa actionin agenttitilassa (docs/custom-automations.md). Issuen otsikkoa ja runkoa ei upoteta promptiin, vaan Claude lukee ne komennolla `gh issue view`, ja ohje kertoo, että ne ovat dataa eivätkä ohjeita.
    - Oletuksena action ei avaa PR:ää, vaan antaa linkin (docs/security.md). Tässä PR avataan komennolla `gh pr create`, koska omistaja on jo hyväksynyt toteutuksen tunnisteella, ja PR on silti vasta ehdotus: yhdistäminen on aina omistajan käsissä.
    - Sallitut komennot on rajattu `--allowedTools`-listalla (tiedostojen muokkaus, `npm run check` ja sen osat, git omaan `claude/issue-<n>`-haaraan, `gh issue view/comment`, `gh pr create/view`). `gh pr merge`, `gh pr review`, `gh api`, push mainiin, force push ja verkkohaku on kielletty `--disallowedTools`-listalla. `--max-turns 60` ja `timeout-minutes: 30` rajaavat kustannuksia.
90. **Työ käyttää workflow'n omaa `GITHUB_TOKEN`ia Claude GitHub Appin sijaan.** Oikeudet ovat täsmälleen `contents: write`, `pull-requests: write` ja `issues: write` (työnkulun tasolla `permissions: {}`). `GITHUB_TOKEN` ei voi muuttaa `.github/workflows`-tiedostoja ja vanhenee työn päättyessä, kun taas Appin token saa Appin kaikki oikeudet (myös workflows-kirjoitusoikeuden). Haittoja: PR:n tekijäksi tulee `github-actions[bot]`, ja repon asetuksista pitää sallia ”Allow GitHub Actions to create and approve pull requests”. `GITHUB_TOKEN`illa avattu PR ei käynnistä muita työnkulkuja, mutta repossa ei ole PR:n CI:tä (Claude ajaa `npm run check`in itse ja julkaisu käynnistyy vasta mainissa).
91. **Tunnistautuminen: suositus on `CLAUDE_CODE_OAUTH_TOKEN`** (Pro- tai Max-tilauksen token, luodaan omalla koneella komennolla `claude setup-token`), koska käyttö kuuluu tilaukseen eikä laskuteta erikseen. Vaihtoehto on `ANTHROPIC_API_KEY` (Claude Console, maksu käytön mukaan); se on työnkulussa kommenttina. Käytetään vain toista.
92. **claude-code-action on lukittu commit-tunnisteeseen** (`925afb5…`, tagi v1.0.262), koska työllä on kirjoitusoikeus ja pääsy salaisuuteen. Muut actionit (checkout@v7, setup-node@v7) ovat samoja pääversiotageja kuin `deploy.yml`:ssä (kohta 51).
93. **Repoon luotiin tunnisteet** `palaute-sahkoposti` (automaation luomat issuet) ja `toteuta` (omistajan hyväksyntä), ja Gmailiin tunniste `issue-luotu`. Tallennukseen ei tehty muutoksia.
94. **Issue → PR jaettiin kahteen työhön** (korvaa kohdan 89 kolmannen ja neljännen alakohdan sekä kohdan 90 oikeudet). Ensimmäisessä testissä Claude ei saanut tehtyä haaraa, committia eikä PR:ää: 7 komentoa estettiin, koska `:*`-säännöt eivät täsmänneet esim. komentoon `git checkout -b claude/issue-3`. Sääntöjen löysentämisen sijaan rakenne muutettiin:
    - **`toteuta`** (oikeudet `contents: read`, `issues: read`): Claude muokkaa vain tiedostoja ja ajaa tarkistukset. Se kirjoittaa PR:n kuvauksen tiedostoon `.claude-tulos/pr-kuvaus.md` tai, jos ei toteuta, perustelun tiedostoon `.claude-tulos/issue-kommentti.md`. Työnkulku kokoaa muutoksen patch-tiedostoksi ja ajaa `npm run check`in.
    - **`avaa-pr`** (`contents`, `pull-requests` ja `issues: write`): työnkulku, ei tekoäly, tekee haaran `claude/issue-<n>-<ajo>`, commitin ja PR:n tai kommentoi issueen. Tässä työssä ei ajeta repon koodia (ei npm:ää), joten Clauden muokkaamat skriptit eivät koskaan pääse kirjoitusoikeuksiin.
    - Kun Claude ei voi tehdä committeja tai PR:iä, `git`- ja `gh pr` -komennot ovat sille kokonaan kiellettyjä. Estetyt komennot näkyvät ajon yhteenvedossa (työkalun nimi ja komento, enintään 200 merkkiä), jotta vianetsintä ei vaadi koko tulosteen näyttämistä.
    - Issuen otsikko kulkee skriptiin ympäristömuuttujana, ei suoraan `${{ }}`-lausekkeena, jotta sitä ei voi käyttää komentojen injektointiin.
95. **Työnkulku hakee issuen Claudelle tiedostoksi** (`.claude-issue/issue.md`), eikä Claude enää käytä `gh`-komentoa (kaikki `gh`-komennot ovat sille kiellettyjä). Toisessa testissä `gh issue view` palautti Claudelle tyhjän tuloksen, vaikka komentoa ei estetty, joten Claude perusteli kommentissa, ettei voinut toteuttaa. Haku tehdään REST-rajapinnasta (`gh api`, testattu issuella #3). Kommenteista mukaan otetaan vain omistajan (`mrjerkkuu`) kommentit, koska julkiseen issueen voi kommentoida kuka tahansa ja kommentti voisi yrittää ohjata Claudea. Tiedosto poistetaan ennen kuin muutos kootaan, joten se ei päädy PR:ään.
96. **Toteutuksen malli on Sonnet ja effort `high`** (`--model sonnet --effort high` työnkulun `claude_args`-syötteessä, Claude Code 2.1.310:n `claude --help`, tarkistettu 25.10.2026). Palautteet ovat yleensä pieniä teksti- ja käyttöliittymämuutoksia, joihin Sonnet riittää ja joissa se kuluttaa tilauksen käyttörajoja maltillisemmin kuin Opus. `high` saa Clauden tarkistamaan työnsä huolellisemmin ennen PR:ää. Alias `sonnet` seuraa uusinta Sonnet-mallia. Ilman asetuksia malli ja effort tulisivat Claude Coden oletuksista ja voisivat vaihtua.

## Nupun esittely (25.10.2026)

97. **Nuppu esittelee itsensä etusivun herossa puhekuplalla Nupun alla** (”Moi, olen Nuppu! Kuljen mukanasi koko polun alusta loppuun.”). Teksti on tavallista tekstiä (`<p>`), koska Nupun SVG on koriste (`aria-hidden`). Kupla näkyy aina, myös käyttöjärjestelmän valinnan jälkeen, eikä sillä ole tallennettavaa tilaa (ei ”älä näytä enää” -valintaa). Teksti ei lupaa muuta kuin sen, mitä Nuppu jo tekee (kulkee mukana sivustolla). Kuplan värit, välit ja pyöristys tulevat `tokens.css`:stä. Tallennukseen ei tehty muutoksia.

## Nupun asento sanastossa (25.10.2026)

98. **Sanaston otsikon Nuppu vilkuttaa (`vilkuttaa`) osoittamisen sijaan** (palaute: issue #7). Muutos on vain asennon vaihto `GlossaryPage.tsx`:ssä; kuvan koko (110 px) ja muu ulkoasu ovat ennallaan. Kuva on koriste, joten saavutettavuus ei muutu. `design-handoff/`-kansion ohjetta (kohta ”Käyttökohteet”) ei muutettu, koska se on suunnittelun luovutusaineisto. Tallennukseen ei tehty muutoksia.

## Maskotti alatunnisteessa (26.10.2026)

99. **Alatunnisteessa on vilkuttava Nuppu** (palaute: issue #9). Palautteessa toivottiin kissamaskottia, mutta sivuston maskotti on Nuppu, ja omistaja päätti käyttää sitä (`vilkuttaa`-asento). Uutta hahmoa ei piirretty. Nuppu (72 px) on alatunnisteen tekstien yläpuolella keskellä, ja se on paikallaan (ei kellu, kohta 66). Kuva on koriste (`aria-hidden`), joten saavutettavuus ei muutu. Väli tulee `tokens.css`:n tokenista. Tallennukseen ei tehty muutoksia.

## Useampi oppimispolku ja työpöytäpolku (26.10.2026)

Suunnitelma: `SUUNNITELMA.md`, luku 15. Päätökset tehtiin omistajan kanssa.

100. **Uusi polku "Claude Code työpöytäsovelluksessa" (`claude-code-desktop`).** Clauden työpöytäsovelluksen Code-välilehti sisältää Claude Coden, joten Node.js:ää, komentorivityökalua tai terminaalia ei tarvita (Anthropicin dokumentaatio `code.claude.com/docs/en/desktop-quickstart`, luettu 26.10.2026). Polku on tarkoitettu täydelle aloittelijalle ja on itsenäinen: terminaalipolkua ei tarvitse käydä ensin. Vaihtoehto "lyhyt jatkokurssi, joka kertoo vain erot" hylättiin, koska työpöytäsovellus on aloittelijalle helpompi reitti kuin terminaali.
101. **Kävijä valitsee polun sivulla `/polut`.** Päävalikon linkki "Oppimispolut" vie aina sinne. Nykyinen linkki katoaa, kun polkuja on useampi (`Layout.tsx`), joten muutos on välttämätön. `path.json` saa kentät `order` (järjestys) ja `audience` ("Sopii sinulle, jos…"), jotta uusi polku saadaan valintasivulle pelkällä sisältötiedostolla.
102. **Yhteiset aiheet ovat viittauksia** (`{ "ref": "<polku>/<aihe>" }`). Vaihtoehdot olivat kopio (korjaukset kahteen paikkaan, edistyminen erikseen) ja erillinen Perusteet-polku (aiheiden ID:t vaihtuisivat, ja tarvittaisiin migraatio). Viittaus valittiin, koska mikään olemassa oleva ID ei muutu. Edistyminen tallennetaan alkuperäisellä avaimella, joten kerran tehty aihe on valmis kaikilla poluilla, joilla se on. Osoite on viittaavan polun oma, jotta "Seuraava aihe" pysyy samalla polulla. Ketjut (viittaus viittaukseen) on kielletty, jotta validointi pysyy yksinkertaisena.
103. **Yhteiseksi kelpaa vain aihe, jossa ei ole terminaalikohtaista sisältöä.** Plan mode, Luvat ja turvallisuus, Git tallennuspisteinä, Kansiot ja polut sekä Claude-tilaus saavat työpöytäpolulle oman version. Sisällön ehtoja (esim. `<Polku only="…">`) ei tehty, koska kaksi lyhyttä erillistä tietopakettia on helpompi lukea ja ylläpitää kuin yksi ehdoilla täytetty.
104. **Valittu polku muistetaan** (`activePath`). Tallennusmuoto muuttuu: `CURRENT_VERSION` 1 → 2, ja migraatio asettaa polun `claude-code`, jos sillä on edistymistä. Muuten arvo on `null`. Vanhat tiedot säilyvät, ja avain `pp-progress-v1` pysyy. Vaihtoehto "arvataan polku edistymisestä kuten ennen" hylättiin, koska yhteinen aihe näkyy usealla polulla, eikä edistymisestä siksi voi päätellä, kumpaa polkua kävijä kulkee.
105. **Etusivun pääpainike vie polun valintaan**, jos polkua ei ole valittu. Kumpaakaan polkua ei aseteta oletukseksi, jotta valinta on kävijän oma.
106. **Työpöytäpolulla Git ja GitHub ovat bonusta.** Ydinpolku toimii ilman Gitiä, koska työpöytäsovellus ei vaadi sitä alkuun pääsemiseen (Git tarvitaan esimerkiksi worktree-eristykseen). GitHubiin vienti ja julkaisu ovat valinnainen lopputehtävä.
107. **Työpöytäsovelluksen ohjeet perustuvat Anthropicin dokumentaatioon, ja käyttöliittymän nimet tarkistetaan toteutushetkellä**, kuten komennot (SUUNNITELMA.md, luku 12). Kuvakaappauksia ei aluksi tehdä, koska käyttöliittymä muuttuu usein. Asia on avoin.
108. **Polun ID on `claude-code-desktop`.** Muoto `<tuote>-<käyttötapa>` jatkuu luontevasti, jos Claude Codelle tehdään myöhemmin muita polkuja (esim. `claude-code-web`). `claude-desktop` hylättiin, koska Claude Desktop tarkoittaa koko sovellusta, myös chattia. `claude-tyopoyta` hylättiin, koska polkujen ID:t ovat tuotenimiä. Uusi ID alkaa samoilla merkeillä kuin `claude-code`, joten polun aiheita tunnistettaessa verrataan aina etuliitettä vinoviivan kanssa (`claude-code/`), ei pelkkää `claude-code`.
109. **Otsikot kertovat käyttötavan:** "Claude Code työpöytäsovelluksessa" ja "Claude Code terminaalissa" (ennen "Claude Code alusta alkaen"). "Claude Desktop" hylättiin, koska se ei kerro, että polku opettaa Claude Codea. Otsikon vaihto ei vaikuta tallennukseen.
110. **Yhteisessä aiheessa polku päätellään osoitteesta, ei edistymisen avaimesta.** Muuten "Seuraava" tai simulaattorin vihje voisi viedä kävijän toiselle polulle. Nykyisistä kohdista simulaattorin vihje (`getNextModule(key)`) hakee polun avaimesta, joten se muutetaan. Yhteisen aiheen tietopaketissa ei saa olla linkkejä tietyn polun aiheisiin, ja build tarkistaa sen.
