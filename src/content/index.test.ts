import { describe, expect, it } from 'vitest'
import { countProgress, createDefaultProgress } from '../features/progress'
import type { LearningPathMeta } from '../schemas/content'
import { buildPaths, getModule, getModuleByKey, getNextModule, getPath, paths, type ContentFiles } from './index'

describe('sisällön lataus', () => {
  it('löytää Claude Code -polun automaattisesti', () => {
    expect(paths.map((p) => p.id)).toContain('claude-code')
  })

  it('numeroi moduulit aihealueittain nollasta alkaen', () => {
    const path = getPath('claude-code')!
    expect(path.topics[0].modules[0].number).toBe('0.1')
    expect(path.topics[1].modules[1].number).toBe('1.2')
  })

  it('jokaisella moduulilla on ladattava tietopaketti', () => {
    for (const m of getPath('claude-code')!.modules) expect(typeof m.load).toBe('function')
  })

  it('hakee moduulin avaimella', () => {
    const m = getModule('claude-code', 'terminaali')!
    expect(getModuleByKey('claude-code/terminaali')).toBe(m)
    expect(m.key).toBe('claude-code/terminaali')
    expect(getModuleByKey('claude-code/olematon')).toBeUndefined()
  })
})

describe('seuraava aihe', () => {
  it('haetaan polun ja aiheen perusteella', () => {
    expect(getNextModule('claude-code', 'terminaali')?.id).toBe('kansiot-ja-polut')
    expect(getNextModule('claude-code', 'julkaise')).toBeUndefined()
    expect(getNextModule('olematon', 'terminaali')).toBeUndefined()
  })
})

describe('yhteiset aiheet (viittaukset)', () => {
  // Polku "a" omistaa aiheen "yhteinen", polku "b" viittaa siihen kahden oman aiheensa välissä.
  const metas: LearningPathMeta[] = [
    {
      id: 'a',
      title: 'A',
      description: 'D',
      order: 1,
      audience: 'X',
      topics: [{ id: 'aihe', title: 'T', description: 'D', modules: [{ id: 'eka', title: 'Eka', summary: 'S' }, { id: 'yhteinen', title: 'Yhteinen', summary: 'S' }] }],
    },
    {
      id: 'b',
      title: 'B',
      description: 'D',
      order: 2,
      audience: 'X',
      topics: [
        { id: 'alku', title: 'T', description: 'D', modules: [{ id: 'oma', title: 'Oma', summary: 'S' }] },
        { id: 'jatko', title: 'T', description: 'D', modules: [{ ref: 'a/yhteinen' }, { id: 'viimeinen', title: 'Viimeinen', summary: 'S' }] },
      ],
    },
  ]
  const mdx = async () => ({ default: () => null })
  const quiz = {
    questions: [1, 2].map((n) => ({
      id: `q${n}`,
      question: 'Q',
      options: [
        { id: 'oikein', text: 'A', correct: true, explanation: 'E' },
        { id: 'b', text: 'B', correct: false, explanation: 'E' },
        { id: 'c', text: 'C', correct: false, explanation: 'E' },
      ],
    })),
  }
  const files: ContentFiles = {
    mdx: {
      './paths/a/aihe/eka/index.mdx': mdx,
      './paths/a/aihe/yhteinen/index.mdx': mdx,
      './paths/b/alku/oma/index.mdx': mdx,
      './paths/b/jatko/viimeinen/index.mdx': mdx,
    },
    quiz: { './paths/a/aihe/yhteinen/quiz.json': quiz },
  }
  const [a, b] = buildPaths(metas, files)
  const original = a.modules[1]
  const shared = b.modules[1]

  it('näkyy viittaavalla polulla omalla numerollaan ja polullaan', () => {
    expect(shared).toMatchObject({ id: 'yhteinen', title: 'Yhteinen', pathId: 'b', topicId: 'jatko', number: '1.1', sharedFrom: 'a' })
    expect(original.sharedFrom).toBeUndefined()
  })

  it('käyttää alkuperäisen tietopaketin, visan ja edistymisen avaimen', () => {
    expect(shared.key).toBe('a/yhteinen')
    expect(shared.Content).toBe(original.Content)
    expect(shared.quiz?.questions).toHaveLength(2)
  })

  it('"Seuraava" pysyy polulla, jolla kävijä on', () => {
    expect(a.modules[a.modules.indexOf(original) + 1]).toBeUndefined()
    expect(b.modules[b.modules.indexOf(shared) + 1].id).toBe('viimeinen')
  })

  it('kerran tehty aihe on valmis molemmilla poluilla', () => {
    const progress = {
      ...createDefaultProgress(),
      modules: { 'a/yhteinen': { visited: true, read: true } },
      quizAnswers: { 'a/yhteinen': { q1: 'oikein', q2: 'oikein' } },
    }
    expect(countProgress(progress, a.modules).complete).toBe(1)
    expect(countProgress(progress, b.modules).complete).toBe(1)
  })

  it('viittaus aiheeseen, jota ei ole, kaatuu', () => {
    const broken = structuredClone(metas)
    broken[1].topics[1].modules[0] = { ref: 'a/puuttuu' }
    expect(() => buildPaths(broken, files)).toThrow(/a\/puuttuu/)
  })
})

