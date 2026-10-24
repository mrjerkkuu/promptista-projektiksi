import { describe, expect, it } from 'vitest'
import type { Quiz } from '../../schemas/content'
import { countProgress, getModuleStatus, getNextModule, isQuizPassed, type ModuleLike } from './model'
import { progressReducer } from './reducer'
import { createDefaultProgress } from './schema'

const quiz: Quiz = {
  questions: ['q1', 'q2'].map((id) => ({
    id,
    question: 'K',
    options: [
      { id: 'a', text: 'A', correct: true, explanation: 'E' },
      { id: 'b', text: 'B', correct: false, explanation: 'E' },
      { id: 'c', text: 'C', correct: false, explanation: 'E' },
    ],
  })),
}

const plain: ModuleLike = { key: 'p/plain' }
const withQuiz: ModuleLike = { key: 'p/quiz', quiz }
const bonus: ModuleLike = { key: 'p/bonus', optional: true }
const modules = [plain, withQuiz, bonus]

describe('moduulin tila', () => {
  it('ei aloitettu → kesken → valmis', () => {
    let p = createDefaultProgress()
    expect(getModuleStatus(p, plain)).toBe('not-started')
    p = progressReducer(p, { type: 'visitModule', key: plain.key })
    expect(getModuleStatus(p, plain)).toBe('in-progress')
    p = progressReducer(p, { type: 'markRead', key: plain.key, read: true })
    expect(getModuleStatus(p, plain)).toBe('complete')
  })

  it('visallinen moduuli on valmis vasta, kun visa on läpäisty', () => {
    let p = progressReducer(createDefaultProgress(), { type: 'markRead', key: withQuiz.key, read: true })
    expect(getModuleStatus(p, withQuiz)).toBe('in-progress')
    p = progressReducer(p, { type: 'answerQuiz', key: withQuiz.key, questionId: 'q1', optionId: 'a' })
    p = progressReducer(p, { type: 'answerQuiz', key: withQuiz.key, questionId: 'q2', optionId: 'b' })
    expect(isQuizPassed(p, withQuiz)).toBe(false)
    p = progressReducer(p, { type: 'answerQuiz', key: withQuiz.key, questionId: 'q2', optionId: 'a' })
    expect(isQuizPassed(p, withQuiz)).toBe(true)
    expect(getModuleStatus(p, withQuiz)).toBe('complete')
  })

  it('pelkkä visavastaus tekee moduulista keskeneräisen', () => {
    const p = progressReducer(createDefaultProgress(), { type: 'answerQuiz', key: withQuiz.key, questionId: 'q1', optionId: 'a' })
    expect(getModuleStatus(p, withQuiz)).toBe('in-progress')
  })
})

describe('edistyminen ja seuraava moduuli', () => {
  it('bonusmoduuli ei vaikuta prosenttiin', () => {
    let p = createDefaultProgress()
    expect(countProgress(p, modules)).toEqual({ complete: 0, total: 2, percent: 0 })
    p = progressReducer(p, { type: 'markRead', key: plain.key, read: true })
    expect(countProgress(p, modules)).toEqual({ complete: 1, total: 2, percent: 50 })
    p = progressReducer(p, { type: 'markRead', key: bonus.key, read: true })
    expect(countProgress(p, modules).percent).toBe(50)
  })

  it('jatka-painike vie ensimmäiseen keskeneräiseen, lopuksi bonukseen', () => {
    let p = createDefaultProgress()
    expect(getNextModule(p, modules)).toBe(plain)
    p = progressReducer(p, { type: 'markRead', key: plain.key, read: true })
    expect(getNextModule(p, modules)).toBe(withQuiz)
    p = progressReducer(p, { type: 'markRead', key: withQuiz.key, read: true })
    p = progressReducer(p, { type: 'answerQuiz', key: withQuiz.key, questionId: 'q1', optionId: 'a' })
    p = progressReducer(p, { type: 'answerQuiz', key: withQuiz.key, questionId: 'q2', optionId: 'a' })
    expect(getNextModule(p, modules)).toBe(bonus)
    p = progressReducer(p, { type: 'markRead', key: bonus.key, read: true })
    expect(getNextModule(p, modules)).toBeUndefined()
  })
})

describe('reducer', () => {
  it('ei anna samaa merkkiä kahdesti eikä muuta aikaleimaa', () => {
    let p = progressReducer(createDefaultProgress(), { type: 'awardBadges', badgeIds: ['x'], at: 't1' })
    const same = progressReducer(p, { type: 'awardBadges', badgeIds: ['x'], at: 't2' })
    expect(same).toBe(p)
    p = progressReducer(p, { type: 'awardBadges', badgeIds: ['x', 'y'], at: 't3' })
    expect(p.badges).toEqual({ x: 't1', y: 't3' })
  })

  it('laskee ajetut komennot ja tallentaa mission vain kerran', () => {
    let p = progressReducer(createDefaultProgress(), { type: 'commandRun' })
    p = progressReducer(p, { type: 'commandRun' })
    expect(p.stats.commandsRun).toBe(2)
    p = progressReducer(p, { type: 'completeMission', missionId: 'm', at: 't1' })
    p = progressReducer(p, { type: 'completeMission', missionId: 'm', at: 't2' })
    expect(p.missions).toEqual({ m: 't1' })
  })

  it('nollaus säilyttää teeman', () => {
    let p = progressReducer(createDefaultProgress(), { type: 'setTheme', theme: 'dark' })
    p = progressReducer(p, { type: 'setOs', os: 'windows' })
    p = progressReducer(p, { type: 'reset' })
    expect(p).toEqual({ ...createDefaultProgress(), theme: 'dark' })
  })
})
