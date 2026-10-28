/**
 * Käännöstiedoston yhdistäminen lähdekieliseen sisältöön.
 *
 * Käännöstiedostossa (esim. glossary.en.json) on sama rakenne kuin lähdetiedostossa,
 * mutta vain käännettävät tekstit. Rakenne (tunnisteet, ehdot, linkit, järjestys)
 * tulee aina lähdetiedostosta, joten sitä ei tarvitse ylläpitää kahdessa paikassa.
 *
 * - Objekti: käännöksen kentät korvaavat lähteen kentät. Tuntematon kenttä on virhe.
 * - Taulukko, jonka alkioilla on id: alkiot yhdistetään id:n mukaan. Järjestys tulee lähteestä.
 * - Muu objektitaulukko: alkiot yhdistetään järjestyksessä, ja pituuden pitää olla sama.
 * - Tekstitaulukko (esim. vianmäärityksen vaiheet): käännös korvaa koko taulukon.
 * - Teksti korvataan tekstillä. Numeroita ja totuusarvoja ei käännetä.
 *
 * Puuttuva käännös ei ole virhe: tilalla näytetään lähdekielinen teksti, ja validointi varoittaa.
 */

export interface TranslationResult {
  value: unknown
  /** Rikkinäinen käännös: tuntematon tunniste tai kenttä, väärä tyyppi. */
  errors: string[]
  /** Kääntämättömät tekstit (polkuina, esim. "kansiomestari.description"). */
  missing: string[]
}

/** Kentät, jotka ovat rakennetta eivätkä tekstiä: niiden puuttumisesta käännöksestä ei varoiteta. */
export const STRUCTURAL_KEYS = new Set([
  'id',
  'ref',
  'category',
  'type',
  'path',
  'os',
  'commands',
  'command',
  'troubleshooting',
  'source',
  'verifiedAt',
  'readMore',
  'icon',
  'startDirs',
  'startCwd',
  'conditions',
  'condition',
])

export interface TranslationOptions {
  /** Lisää rakennekenttiä tälle tiedostolle (esim. commands.json: windows ja mac ovat komentoja). */
  structuralKeys?: readonly string[]
}

type Json = Record<string, unknown>

const isObject = (v: unknown): v is Json => typeof v === 'object' && v !== null && !Array.isArray(v)
const hasId = (v: unknown): v is Json & { id: string } => isObject(v) && typeof v.id === 'string'
const join = (where: string, key: string | number) => (where === '' ? String(key) : typeof key === 'number' ? `${where}[${key}]` : `${where}.${key}`)

/** Lähteen tekstit, joita ei ole käännetty. */
function collectMissing(base: unknown, where: string, structural: ReadonlySet<string>, out: string[]) {
  if (typeof base === 'string') out.push(where)
  else if (Array.isArray(base)) {
    if (base.length > 0 && base.every((b) => typeof b === 'string')) out.push(where)
    else base.forEach((b, i) => collectMissing(b, hasId(b) ? join(where, b.id) : join(where, i), structural, out))
  } else if (isObject(base)) {
    for (const [k, v] of Object.entries(base)) if (!structural.has(k)) collectMissing(v, join(where, k), structural, out)
  }
}

export function applyTranslation(base: unknown, translation: unknown, options: TranslationOptions = {}): TranslationResult {
  const structural = new Set([...STRUCTURAL_KEYS, ...(options.structuralKeys ?? [])])
  const errors: string[] = []
  const missing: string[] = []

  function merge(b: unknown, t: unknown, where: string): unknown {
    if (t === undefined) {
      collectMissing(b, where, structural, missing)
      return b
    }
    const at = where || '(juuri)'
    if (typeof b === 'string') {
      if (typeof t !== 'string') errors.push(`${at}: käännöksen pitää olla tekstiä`)
      return typeof t === 'string' ? t : b
    }
    if (Array.isArray(b)) {
      if (!Array.isArray(t)) {
        errors.push(`${at}: käännöksen pitää olla taulukko`)
        return b
      }
      if (b.every((x) => typeof x === 'string')) {
        if (!t.every((x) => typeof x === 'string')) errors.push(`${at}: käännöksen alkioiden pitää olla tekstiä`)
        return t.length > 0 ? t : b
      }
      if (t.length > 0 && t.every(hasId)) {
        const byId = new Map(t.map((x) => [x.id, x]))
        if (byId.size !== t.length) errors.push(`${at}: sama tunniste on käännöksessä kahdesti`)
        for (const id of byId.keys()) {
          if (!b.some((x) => hasId(x) && x.id === id)) errors.push(`${at}: tuntematon tunniste "${id}"`)
        }
        return b.map((x, i) => (hasId(x) ? merge(x, byId.get(x.id), join(where, x.id)) : merge(x, undefined, join(where, i))))
      }
      if (t.length !== b.length) {
        errors.push(`${at}: taulukossa pitää olla yhtä monta alkiota kuin lähteessä (${b.length})`)
        return b
      }
      return b.map((x, i) => merge(x, t[i], join(where, i)))
    }
    if (isObject(b)) {
      if (!isObject(t)) {
        errors.push(`${at}: käännöksen pitää olla objekti`)
        return b
      }
      const result: Json = {}
      for (const k of Object.keys(t)) if (!(k in b)) errors.push(`${join(where, k)}: tuntematon ${where === '' ? 'tunniste' : 'kenttä'}`)
      for (const [k, v] of Object.entries(b)) {
        if (k === 'id' && t.id !== undefined && t.id !== v) errors.push(`${join(where, k)}: tunnistetta ei saa vaihtaa`)
        result[k] = structural.has(k) && t[k] === undefined ? v : merge(v, t[k], join(where, k))
      }
      return result
    }
    // Numero tai totuusarvo: rakennetta, jota ei käännetä.
    if (t !== b) errors.push(`${at}: vain tekstejä voi kääntää`)
    return b
  }

  const value = merge(base, translation, '')
  return { value, errors, missing }
}
