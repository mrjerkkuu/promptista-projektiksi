# Päätökset

Valvomattoman toteutuksen aikana tehdyt tulkinnat ja valinnat. Jokaisessa päätös + perustelu.

## Yleiset

1. **SUUNNITELMA.md litteroitiin PDF:stä.** Kansiossa oli vain `SUUNNITELMA.pdf`. Tein siitä sisällöltään identtisen `SUUNNITELMA.md`:n, koska suunnitelma itse sanoo olevansa repon "totuuden lähde" ja `CLAUDE.md` viittaa siihen. PDF jätettiin paikalleen.
   - *Perustelu:* Markdownia on helppo muokata ja diffata, PDF:ää ei.
2. **Projekti rakennetaan suoraan nykyiseen kansioon** (`vibekoodaus/`) eikä alikansioon `promptista-projektiksi/`.
   - *Perustelu:* Kansio on tyhjä ja tarkoitettu tälle projektille; suunnitelman juurikansion nimi kuvaa repoa. Viten `base` on oletuksena `/promptista-projektiksi/` (ks. päätös vaiheessa 10).
3. **TypeScript 6.0.x eikä 7.x, ESLint 9.x eikä 10.x.**
   - *Perustelu:* `typescript-eslint` 8.72 tukee vain TypeScriptiä < 6.1, ja `eslint-plugin-jsx-a11y` tukee vain ESLintiä ≤ 9. Saavutettavuuslinttaus on suunnitelman luvun 10 kannalta arvokkaampi kuin uusin pääversio.
