import { describe, expect, it } from 'vitest'
import { STORAGE_KEY, createDefaultProgress, type Progress } from './schema'
import {
  ProgressFormatError,
  exportCode,
  exportFileContent,
  importProgress,
  isStorageAvailable,
  loadProgress,
  migrate,
  parseProgress,
  resetProgress,
  saveProgress,
} from './storage'

function memoryStorage(): Storage {
  const data = new Map<string, string>()
  return {
    get length() {
      return data.size
    },
    clear: () => data.clear(),
    getItem: (k) => data.get(k) ?? null,
    key: (i) => [...data.keys()][i] ?? null,
    removeItem: (k) => void data.delete(k),
    setItem: (k, v) => void data.set(k, String(v)),
  }
}

function throwingStorage(): Storage {
  const fail = () => {
    throw new DOMException('Estetty', 'SecurityError')
  }
  return { length: 0, clear: fail, getItem: fail, key: fail, removeItem: fail, setItem: fail }
}

function sampleProgress(): Progress {
  return {
    ...createDefaultProgress(),
    os: 'mac',
    theme: 'dark',
    modules: { 'claude-code/terminaali': { visited: true, read: true } },
    quizAnswers: { 'claude-code/terminaali': { q1: 'a' } },
    verify: { git: 'versio' },
    missions: { 'luo-projektikansio': '2026-10-24T10:00:00.000Z' },
    badges: { 'ensimmainen-komento': '2026-10-24T10:00:00.000Z' },
    stats: { commandsRun: 7 },
  }
}

describe('tallennus', () => {
  it('käyttää avainta pp-progress-v1', () => {
    expect(STORAGE_KEY).toBe('pp-progress-v1')
  })

  it('tallentaa ja lataa edistymisen', () => {
    const storage = memoryStorage()
    const progress = sampleProgress()
    expect(saveProgress(progress, storage)).toBe(true)
    expect(loadProgress(storage)).toEqual({ progress, available: true, corrupted: false })
  })

  it('palauttaa oletukset, kun tallennusta ei ole', () => {
    expect(loadProgress(memoryStorage())).toEqual({ progress: createDefaultProgress(), available: true, corrupted: false })
  })

  it('toimii ilman localStoragea (esim. yksityinen ikkuna)', () => {
    const storage = throwingStorage()
    expect(isStorageAvailable(storage)).toBe(false)
    expect(loadProgress(storage)).toEqual({ progress: createDefaultProgress(), available: false, corrupted: false })
    expect(saveProgress(sampleProgress(), storage)).toBe(false)
    expect(loadProgress(null).available).toBe(false)
  })

  it('merkitsee rikkinäisen tallennuksen ja aloittaa alusta', () => {
    const storage = memoryStorage()
    storage.setItem(STORAGE_KEY, '{ei jsonia')
    expect(loadProgress(storage)).toMatchObject({ corrupted: true, progress: createDefaultProgress() })
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, os: 'linux' }))
    expect(loadProgress(storage).corrupted).toBe(true)
  })
})

describe('migraatiot', () => {
  it('nykyinen versio menee sellaisenaan läpi', () => {
    const p = sampleProgress()
    expect(migrate(p)).toEqual(p)
  })

  it('ajaa migraatiot ketjuna', () => {
    const steps = {
      1: (d: Record<string, unknown>) => ({ ...d, version: 2, a: 1 }),
      2: (d: Record<string, unknown>) => ({ ...d, version: 3, b: 2 }),
    }
    expect(migrate({ version: 1 }, steps, 3)).toEqual({ version: 3, a: 1, b: 2 })
  })

  describe('v1 → v2: valittu polku', () => {
    /** Tallennus sellaisena kuin versio 1 sen kirjoitti (ennen activePath-kenttää). */
    function v1Save(overrides: Record<string, unknown> = {}) {
      return {
        version: 1,
        os: 'windows',
        theme: 'dark',
        modules: { 'claude-code/terminaali': { visited: true, read: true } },
        quizAnswers: { 'claude-code/terminaali': { q1: 'a' } },
        verify: { git: 'ok' },
        missions: { 'luo-projektikansio': '2026-10-24T10:00:00.000Z' },
        badges: { 'ensimmainen-komento': '2026-10-24T10:00:00.000Z' },
        stats: { commandsRun: 7 },
        ...overrides,
      }
    }

    it('säilyttää kaikki vanhat tiedot ja valitsee polun, jolla on edistymistä', () => {
      const v1 = v1Save()
      const { version, ...rest } = v1
      expect(version).toBe(1)
      expect(parseProgress(v1)).toEqual({ ...rest, version: 2, activePath: 'claude-code' })
    })

    it('ilman edistymistä polkua ei valita', () => {
      expect(parseProgress(v1Save({ modules: {}, quizAnswers: {} })).activePath).toBeNull()
    })

    it('pelkät visavastaukset riittävät', () => {
      expect(parseProgress(v1Save({ modules: {} })).activePath).toBe('claude-code')
    })

    it('vertaa polkua vinoviivan kanssa: claude-code-desktop ei ole claude-code', () => {
      const v1 = v1Save({ modules: { 'claude-code-desktop/x': { visited: true, read: false } }, quizAnswers: {} })
      expect(parseProgress(v1).activePath).toBeNull()
    })

    it('toimii sekä selaimen tallennuksesta että vanhasta siirtokoodista', () => {
      const storage = memoryStorage()
      storage.setItem(STORAGE_KEY, JSON.stringify(v1Save()))
      expect(loadProgress(storage)).toMatchObject({ corrupted: false, progress: { version: 2, activePath: 'claude-code' } })
      const oldCode = btoa(JSON.stringify(v1Save()))
      expect(importProgress(oldCode).activePath).toBe('claude-code')
    })
  })

  it('hylkää puuttuvan version, uudemman version ja puuttuvan migraation', () => {
    expect(() => migrate({})).toThrow(ProgressFormatError)
    expect(() => migrate(null)).toThrow(ProgressFormatError)
    expect(() => migrate({ version: 99 })).toThrow(/uudemmasta/)
    expect(() => migrate({ version: 1 }, {}, 2)).toThrow(/puuttuu/)
  })
})

describe('vienti ja tuonti', () => {
  it('siirtokoodi kulkee edestakaisin (myös ääkköset)', () => {
    const progress = sampleProgress()
    progress.quizAnswers['ääkkös/moduuli'] = { 'kysymys-ä': 'ö' }
    const code = exportCode(progress)
    expect(code).toMatch(/^[A-Za-z0-9+/=]+$/)
    expect(importProgress(code)).toEqual(progress)
  })

  it('sietää välilyönnit ja rivinvaihdot koodissa', () => {
    const code = exportCode(sampleProgress())
    const messy = `  ${code.slice(0, 10)}\n${code.slice(10)}  `
    expect(importProgress(messy)).toEqual(sampleProgress())
  })

  it('tuo ladatun tiedoston sisällön (JSON)', () => {
    expect(importProgress(exportFileContent(sampleProgress()))).toEqual(sampleProgress())
  })

  it('hylkää virheellisen koodin zod-validoinnilla', () => {
    expect(() => importProgress('')).toThrow(ProgressFormatError)
    expect(() => importProgress('tämä ei ole koodi')).toThrow(ProgressFormatError)
    expect(() => importProgress(btoa('{"version":1}'))).toThrow(ProgressFormatError)
    expect(() => importProgress(JSON.stringify({ ...sampleProgress(), os: 'linux' }))).toThrow(ProgressFormatError)
    expect(() => importProgress(JSON.stringify({ ...sampleProgress(), extra: true }))).toThrow(ProgressFormatError)
  })
})

describe('nollaus', () => {
  it('tyhjentää edistymisen mutta säilyttää teeman', () => {
    const reset = resetProgress(sampleProgress())
    expect(reset).toEqual({ ...createDefaultProgress(), theme: 'dark' })
  })
})
