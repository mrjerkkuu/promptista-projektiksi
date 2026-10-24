# Design vs. sovellus – vertailu (24.10.2026)

Tausta-aineisto. Toteutettavat asiat ovat tiedostossa CLAUDE-CODE-OHJE.md.

## Puuttui alkuperäisestä designista (nyt suunniteltu)

**Näkymät:** polkusivu (4 aihetta, 25 moduulia, bonus ★), vianmääritys omana sivunaan, 404, etusivun oikea rakenne (käyttöjärjestelmäkortti, ”Näet ohjeet…”, Oppimispolut, Näin tämä toimii), moduulisivun ”Valmista?”-kortti ja ”Polun loppu” -sivutus.

**Komponentit:** yläpalkki (6 valikkokohtaa, Ohjeet-valitsin, teemavalikko), ohituslinkki, ilmoitusten 4 tyyppiä + Tip, tilamerkintä (3 tilaa), edistymispalkki tekstillä, monivalinta selityksineen, taulukko, koodilohko, inline-koodi, ”Vain X” -lohko, lomake-elementit (select, textarea, valintaruutu, tiedostovalitsin), murupolku, moduulilistan rivi, Nuppu-komponentti.

**Tilat:** ensikäynti, käyttöjärjestelmä valittu ilman edistymistä, kesken, kaikki tehty, bonus jäljellä, merkit 0/9, 1/9 ja 9/9, tallennus ei käytössä, tallennus rikki, siirtokoodi (kopioitu ja epäonnistui), virheellinen tuonti, tuonti onnistui, nollauksen vahvistus, nollattu, merkki-ilmoitus ja pino, 404, lataus, sisältövirheet, kopiointi estetty, komento tarvitaan vain toisella käyttöjärjestelmällä, tarkistamatta, visa osittain ja läpäisty, terminaalin virhe, vihje, juuri suoritettu, aiemmin suoritettu ja ei käyttöjärjestelmää, korostettu sanastotermi ja suoraan linkitetty vianmäärityskohta.

## Ääripäissä hajonneet ja korjatut

- Painikkeiden `white-space: nowrap` → pitkä CTA vuoti yli 360 px:n leveydellä. Nyt rivittyy, ja CTA on kaksirivinen.
- Terminaalin kehote ei rivittynyt → pitkä polku vuoti. Nyt rivittyy.
- Kolmen vaihtoehdon teemasegmentti ei mahtunut 360 px:iin → select.
- Pitkät sanat ja URLit → `overflow-wrap: anywhere` komennoissa, vaihtoehdoissa ja otsikoissa.
- Kenttien reunakontrasti alle 3:1 → `--color-border` (3,8:1).

## Ehdotukset (ei toteuteta ilman päätöstä)

Ks. CLAUDE-CODE-OHJE.md, luku 7.
