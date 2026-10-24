import { describe, expect, it } from 'vitest'
import { badges, paths, verifySteps } from '../../content'
import { createDefaultProgress, progressReducer, type Progress } from '../progress'
import { awardBadges, findNewBadges, isConditionMet, type BadgeContext } from './evaluate'

const ctx: BadgeContext = { badges, paths, verifySteps }
const path = paths.find((p) => p.id === 'claude-code')!

/** Merkitsee moduulin luetuksi ja vastaa visaan oikein. */
function complete(progress: Progress, moduleId: string): Progress {
  const m = path.modules.find((x) => x.id === moduleId)!
  let p = progressReducer(progress, { type: 'markRead', key: m.key, read: true })
  for (const q of m.quiz?.questions ?? []) {
    p = progressReducer(p, { type: 'answerQuiz', key: m.key, questionId: q.id, optionId: q.options.find((o) => o.correct)!.id })
  }
  return p
}

describe('merkkien ehdot', () => {
  it('Ensimmäinen komento', () => {
    const p = progressReducer(createDefaultProgress(), { type: 'commandRun' })
    expect(findNewBadges(createDefaultProgress(), ctx)).not.toContain('ensimmainen-komento')
    expect(findNewBadges(p, ctx)).toContain('ensimmainen-komento')
  })

  it('Kansiomestari vaatii molemmat kansiomissiot', () => {
    let p = progressReducer(createDefaultProgress(), { type: 'completeMission', missionId: 'luo-projektikansio', at: 't' })
    expect(findNewBadges(p, ctx)).not.toContain('kansiomestari')
    p = progressReducer(p, { type: 'completeMission', missionId: 'kansioissa-liikkuminen', at: 't' })
    expect(findNewBadges(p, ctx)).toContain('kansiomestari')
  })

  it('Asennukset kunnossa vaatii oikeat vastaukset varmistuksiin', () => {
    let p = createDefaultProgress()
    for (const step of ['git', 'vscode', 'gh']) {
      p = progressReducer(p, { type: 'answerVerify', stepId: step, optionId: verifySteps[step].options.find((o) => o.correct)!.id })
    }
    p = progressReducer(p, { type: 'answerVerify', stepId: 'claude', optionId: 'ei-tunnisteta' })
    expect(findNewBadges(p, ctx)).not.toContain('asennukset-kunnossa')
    p = progressReducer(p, { type: 'answerVerify', stepId: 'claude', optionId: 'versio' })
    expect(findNewBadges(p, ctx)).toContain('asennukset-kunnossa')
  })

  it('aihealueen ja koko polun merkit', () => {
    let p = createDefaultProgress()
    for (const m of path.topics[0].modules) p = complete(p, m.id)
    expect(findNewBadges(p, ctx)).toContain('perusteet-hallussa')
    expect(findNewBadges(p, ctx)).not.toContain('vibekoodaaja')
    for (const m of path.modules.filter((x) => !x.optional)) p = complete(p, m.id)
    expect(findNewBadges(p, ctx)).toContain('vibekoodaaja')
    // Bonusmerkki vaatii bonusmoduulin.
    expect(findNewBadges(p, ctx)).not.toContain('julkaistu')
    expect(findNewBadges(complete(p, 'julkaise'), ctx)).toContain('julkaistu')
  })

  it('moduulimerkki vaatii visan läpäisyn', () => {
    const m = path.modules.find((x) => x.id === 'hyva-prompti')!
    const readOnly = progressReducer(createDefaultProgress(), { type: 'markRead', key: m.key, read: true })
    expect(isConditionMet(badges.promptiseppa.condition, readOnly, ctx)).toBe(!m.quiz)
    expect(isConditionMet(badges.promptiseppa.condition, complete(createDefaultProgress(), 'hyva-prompti'), ctx)).toBe(true)
  })

  it('awardBadges lisää aikaleiman eikä muuta jo ansaittuja', () => {
    let p = progressReducer(createDefaultProgress(), { type: 'commandRun' })
    p = awardBadges(p, ctx, 't1')
    expect(p.badges['ensimmainen-komento']).toBe('t1')
    expect(awardBadges(p, ctx, 't2')).toBe(p)
  })
})
