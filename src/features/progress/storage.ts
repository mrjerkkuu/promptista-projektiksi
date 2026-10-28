import { CURRENT_VERSION, STORAGE_KEY, createDefaultProgress, progressSchema, type Progress } from './schema'

/**
 * Edistymisen tallennus localStorageen, migraatiot sekä vienti ja tuonti.
 * Kaikki luku- ja kirjoitusoperaatiot ovat try/catch-lohkoissa: sivu toimii
 * myös ilman localStoragea (esim. yksityinen selausikkuna).
 */

export type Migration = (data: Record<string, unknown>) => Record<string, unknown>

/** Onko tallennuksen kentässä (esim. modules) avaimia, jotka kuuluvat polulle? */
function hasKeysOnPath(field: unknown, pathId: string): boolean {
  if (typeof field !== 'object' || field === null) return false
  // Vinoviiva mukaan: "claude-code-desktop/…" ei kuulu polulle "claude-code".
  return Object.keys(field).some((key) => key.startsWith(`${pathId}/`))
}

/**
 * Migraatiot: avain on versio, JOSTA migroidaan. Esim. kun skeema muuttuu
 * versioon 3, lisää tänne `2: (v2) => ({ ...v2, version: 3, uusiKenttä: … })`.
 * Migraatio ei saa poistaa vanhoja tietoja, ja jokaisella on testi (storage.test.ts).
 */
export const migrations: Record<number, Migration> = {
  /**
   * v1 → v2: valittu polku (activePath). Versiossa 1 oli vain polku claude-code, joten jos sillä on
   * edistymistä, kävijä on kulkenut sitä. Muuten polkua ei ole valittu.
   */
  1: (v1) => ({
    ...v1,
    version: 2,
    activePath: hasKeysOnPath(v1.modules, 'claude-code') || hasKeysOnPath(v1.quizAnswers, 'claude-code') ? 'claude-code' : null,
  }),
  /**
   * v2 → v3: sivuston kieli (language). Ennen versiota 3 sivu oli vain suomeksi, joten vanha kävijä on
   * käyttänyt sitä suomeksi: kieli pysyy suomena, vaikka selaimen kieli olisi muu.
   */
  2: (v2) => ({ ...v2, version: 3, language: 'fi' }),
}

export class ProgressFormatError extends Error {}

/** Vie raakadatan vaihe vaiheelta nykyiseen versioon. Heittää ProgressFormatErrorin, jos se ei onnistu. */
export function migrate(raw: unknown, steps: Record<number, Migration> = migrations, target = CURRENT_VERSION): unknown {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) throw new ProgressFormatError('Tallennus ei ole objekti')
  let data = raw as Record<string, unknown>
  if (typeof data.version !== 'number' || !Number.isInteger(data.version)) throw new ProgressFormatError('Tallennuksesta puuttuu versio')
  let version: number = data.version
  if (version > target) throw new ProgressFormatError(`Tallennus on uudemmasta versiosta (${version}) kuin tämä sivu tukee (${target})`)
  while (version < target) {
    const step = steps[version]
    if (!step) throw new ProgressFormatError(`Migraatio versiosta ${version} puuttuu`)
    data = step(data)
    if (data.version !== version + 1) throw new ProgressFormatError(`Migraatio versiosta ${version} ei nostanut versiota`)
    version = data.version as number
  }
  return data
}

/** Migroi ja validoi. Heittää ProgressFormatErrorin, jos data ei kelpaa. */
export function parseProgress(raw: unknown): Progress {
  const result = progressSchema.safeParse(migrate(raw))
  if (!result.success) throw new ProgressFormatError('Tallennuksen rakenne ei kelpaa')
  return result.data
}

export interface LoadResult {
  progress: Progress
  /** false, jos localStoragea ei voi käyttää. */
  available: boolean
  /** true, jos tallennus löytyi mutta sitä ei voitu lukea (aloitetaan alusta). */
  corrupted: boolean
}

function getStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

/** Kokeilee, voiko tallennustilaan kirjoittaa. */
export function isStorageAvailable(storage: Storage | null = getStorage()): boolean {
  if (!storage) return false
  try {
    const probe = `${STORAGE_KEY}-probe`
    storage.setItem(probe, '1')
    storage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

export function loadProgress(storage: Storage | null = getStorage()): LoadResult {
  const available = isStorageAvailable(storage)
  if (!available || !storage) return { progress: createDefaultProgress(), available: false, corrupted: false }
  let raw: string | null
  try {
    raw = storage.getItem(STORAGE_KEY)
  } catch {
    return { progress: createDefaultProgress(), available: false, corrupted: false }
  }
  if (raw === null) return { progress: createDefaultProgress(), available, corrupted: false }
  try {
    return { progress: parseProgress(JSON.parse(raw)), available, corrupted: false }
  } catch {
    return { progress: createDefaultProgress(), available, corrupted: true }
  }
}

/** Palauttaa true, jos tallennus onnistui. */
export function saveProgress(progress: Progress, storage: Storage | null = getStorage()): boolean {
  if (!storage) return false
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(progress))
    return true
  } catch {
    return false
  }
}

// ---------------------------------------------------------------- vienti ja tuonti

function utf8ToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}

function base64ToUtf8(base64: string): string {
  const binary = atob(base64)
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
}

/** Kopioitava siirtokoodi: base64-koodattu JSON. */
export function exportCode(progress: Progress): string {
  return utf8ToBase64(JSON.stringify(progress))
}

/** Ladattava tiedosto: luettava JSON. */
export function exportFileContent(progress: Progress): string {
  return `${JSON.stringify(progress, null, 2)}\n`
}

/**
 * Tuo edistymisen siirtokoodista tai tiedoston sisällöstä (JSON).
 * Validoidaan zodilla. Heittää ProgressFormatErrorin, jos tieto ei kelpaa.
 */
export function importProgress(input: string): Progress {
  const text = input.trim()
  if (text === '') throw new ProgressFormatError('Tyhjä koodi')
  let raw: unknown
  try {
    raw = JSON.parse(text.startsWith('{') ? text : base64ToUtf8(text.replace(/\s+/g, '')))
  } catch {
    throw new ProgressFormatError('Koodia ei voitu lukea')
  }
  return parseProgress(raw)
}

/** "Aloita alusta": nollaa edistymisen, mutta säilyttää teema- ja kielivalinnan. */
export function resetProgress(previous: Progress): Progress {
  return { ...createDefaultProgress(), theme: previous.theme, language: previous.language }
}
