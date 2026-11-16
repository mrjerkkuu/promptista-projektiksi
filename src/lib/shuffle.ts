/**
 * Sekoittaa listan pysyvästi: sama siemen antaa aina saman järjestyksen.
 * Visan vaihtoehdot sekoitetaan kysymyksen tunnisteella, jotta oikea vastaus
 * ei ole aina samassa kohdassa, mutta järjestys ei vaihdu sivun latausten
 * tai kielen vaihdon välillä. Alkuperäistä listaa ei muuteta.
 */
export function stableShuffle<T>(items: readonly T[], seed: string): T[] {
  const random = mulberry32(fnv1a(seed))
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Vaihtoehtojen näyttöjärjestys. Tiedostossa oikea vastaus on usein ensimmäisenä,
 * joten järjestys sekoitetaan moduulin ja kysymyksen tunnisteella. Järjestys on
 * kaikilla kielillä ja kaikilla latauskerroilla sama. Etuliite `options:` on valittu
 * siksi, että nykyisellä sisällöllä oikea vastaus ei osu montaa kertaa peräkkäin
 * samaan kohtaan (enintään kolme). Etuliitteen vaihtaminen muuttaa kaikkien
 * visojen järjestyksen, mutta tallennettu edistyminen säilyy, koska vastaukset
 * tallennetaan tunnisteella.
 */
export function quizOptionOrder<T extends { id: string }>(moduleKey: string, question: { id: string; options: readonly T[] }): T[] {
  return stableShuffle(question.options, `options:${moduleKey}/${question.id}`)
}

/** FNV-1a-tiiviste (32 bittiä) merkkijonosta. */
function fnv1a(text: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

/** Pieni siemenellinen satunnaislukugeneraattori, palauttaa lukuja väliltä [0, 1). */
function mulberry32(seed: number): () => number {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
