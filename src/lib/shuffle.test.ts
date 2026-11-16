import { describe, expect, it } from 'vitest'
import { getContent, paths } from '../content'
import { quizOptionOrder, stableShuffle } from './shuffle'

describe('stableShuffle', () => {
  it('antaa samalla siemenellä aina saman järjestyksen', () => {
    const items = ['a', 'b', 'c', 'd', 'e']
    expect(stableShuffle(items, 'siemen')).toEqual(stableShuffle(items, 'siemen'))
  })

  it('säilyttää kaikki alkiot eikä muuta alkuperäistä listaa', () => {
    const items = ['a', 'b', 'c', 'd', 'e']
    const shuffled = stableShuffle(items, 'siemen')
    expect([...shuffled].sort()).toEqual(items)
    expect(items).toEqual(['a', 'b', 'c', 'd', 'e'])
  })

  it('eri siemenet tuottavat eri järjestyksiä', () => {
    const items = ['a', 'b', 'c', 'd', 'e']
    const orders = new Set(Array.from({ length: 20 }, (_, i) => stableShuffle(items, `s${i}`).join('')))
    expect(orders.size).toBeGreaterThan(1)
  })

  it('käsittelee tyhjän ja yhden alkion listan', () => {
    expect(stableShuffle([], 'x')).toEqual([])
    expect(stableShuffle(['a'], 'x')).toEqual(['a'])
  })
})

describe('visan vaihtoehtojen järjestys', () => {
  const correctPositions = (pathId: string) =>
    paths
      .find((p) => p.id === pathId)!
      .modules.flatMap((m) => m.quiz?.questions.map((q) => quizOptionOrder(m.key, q).findIndex((o) => o.correct)) ?? [])

  it('oikea vastaus ei ole jokaisella polulla aina samassa kohdassa', () => {
    for (const path of paths) {
      const positions = correctPositions(path.id)
      if (positions.length < 2) continue
      expect(new Set(positions).size, path.id).toBeGreaterThan(1)
      // Oikea vastaus ei saa olla valtaosassa kysymyksistä ensimmäisenä.
      expect(positions.filter((p) => p === 0).length / positions.length, path.id).toBeLessThan(0.6)
    }
  })

  it('järjestys on kaikilla kielillä sama', () => {
    const order = (language: 'fi' | 'en') =>
      getContent(language).paths.flatMap((p) => p.modules.flatMap((m) => m.quiz?.questions.map((q) => quizOptionOrder(m.key, q).map((o) => o.id).join()) ?? []))
    expect(order('en')).toEqual(order('fi'))
  })
})
