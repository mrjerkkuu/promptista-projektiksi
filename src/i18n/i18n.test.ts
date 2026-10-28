import { describe, expect, it } from 'vitest'
import { buildPaths, getContent, translationsFor, type ContentFiles } from '../content'
import type { LearningPathMeta } from '../schemas/content'
import { LANGUAGES, SOURCE_LANGUAGE, detectLanguage } from './languages'
import { UI } from '.'

describe('kielen päättely', () => {
  it('suomi, jos selaimen kielissä on suomi missä tahansa kohdassa', () => {
    expect(detectLanguage(['fi-FI'])).toBe('fi')
    expect(detectLanguage(['en-US', 'fi'])).toBe('fi')
  })

  it('muuten englanti, ja ilman tietoa lähdekieli', () => {
    expect(detectLanguage(['en-GB', 'sv'])).toBe('en')
    expect(detectLanguage([])).toBe(SOURCE_LANGUAGE)
    expect(detectLanguage(undefined)).toBe(SOURCE_LANGUAGE)
  })
})

describe('käyttöliittymän sanakirjat', () => {
  /** Sanakirjan avaimet polkuina (funktiot ja JSX lasketaan arvoiksi). */
  function keys(value: unknown, prefix = ''): string[] {
    if (typeof value !== 'object' || value === null || Array.isArray(value) || '$$typeof' in value) return [prefix]
    return Object.entries(value).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k))
  }

  it.each(LANGUAGES)('%s: samat avaimet kuin suomessa', (language) => {
    expect(keys(UI[language])).toEqual(keys(UI.fi))
  })
})

describe('sisältö englanniksi', () => {
  const fi = getContent('fi')
  const en = getContent('en')

  it('tekstit ovat käännettyjä, rakenne ja tunnisteet samat kuin suomessa', () => {
    expect(en.getPath('claude-code')?.title).toBe('Claude Code in the terminal')
    expect(en.paths.map((p) => p.modules.map((m) => m.key))).toEqual(fi.paths.map((p) => p.modules.map((m) => m.key)))
    for (const field of ['commands', 'glossary', 'badges', 'missions', 'troubleshooting', 'verifySteps'] as const) {
      expect(Object.keys(en[field])).toEqual(Object.keys(fi[field]))
    }
    expect(en.badges.kansiomestari.condition).toEqual(fi.badges.kansiomestari.condition)
  })

  it('visan oikeat vastaukset ovat samat kuin suomessa, joten edistyminen ei riipu kielestä', () => {
    const correct = (c: typeof fi) => c.paths.flatMap((p) => p.modules.flatMap((m) => m.quiz?.questions.map((q) => q.options.find((o) => o.correct)?.id) ?? []))
    expect(correct(en)).toEqual(correct(fi))
  })

  it('jokainen tietopaketti on käännetty', () => {
    const untranslated = en.paths.flatMap((p) => p.modules.filter((m) => m.contentLanguage !== 'en').map((m) => m.key))
    expect(untranslated).toEqual([])
  })

  it('harjoituskansiot ovat englanninkielisiä, jotta tavoite ja ehto täsmäävät', () => {
    expect(en.missions['projektikansio-harjoitus'].conditions).toContainEqual({ type: 'cwdIs', path: '~/projects/my-site' })
    expect(fi.missions['projektikansio-harjoitus'].conditions).toContainEqual({ type: 'cwdIs', path: '~/projektit/oma-sivu' })
  })
})

describe('kääntämätön tietopaketti', () => {
  const metas: LearningPathMeta[] = [
    {
      id: 'a',
      title: 'A',
      description: 'D',
      order: 1,
      audience: 'X',
      topics: [{ id: 'aihe', title: 'T', description: 'D', modules: [{ id: 'eka', title: 'Eka', summary: 'S' }, { id: 'toka', title: 'Toka', summary: 'S' }] }],
    },
  ]
  const mdx = async () => ({ default: () => null })
  const translated = async () => ({ default: () => null })
  const files: ContentFiles = {
    mdx: { './paths/a/aihe/eka/index.mdx': mdx, './paths/a/aihe/toka/index.mdx': mdx },
    quiz: {},
    translation: { language: 'en', quiz: {}, mdx: { './paths/a/aihe/eka/index.mdx': translated } },
  }

  it('näytetään lähdekielellä, ja kieli kerrotaan', () => {
    const [path] = buildPaths(metas, files)
    expect(path.modules.map((m) => [m.id, m.contentLanguage])).toEqual([
      ['eka', 'en'],
      ['toka', 'fi'],
    ])
    expect(path.modules[0].load).toBe(translated)
    expect(path.modules[1].load).toBe(mdx)
  })

  it('käännöstiedostot löytyvät lähdetiedoston nimellä', () => {
    expect(translationsFor({ './glossary.en.json': 1, './glossary.json': 2, './paths/a/b/c/index.en.mdx': 3 }, 'en')).toEqual({
      './glossary.json': 1,
      './paths/a/b/c/index.mdx': 3,
    })
  })
})
