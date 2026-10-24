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
