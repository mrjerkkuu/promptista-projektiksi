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
