import type { Quiz, VerifyStep } from '../../schemas/content'
import type { Progress } from './schema'

/**
 * Edistymisestä johdetut tiedot (puhtaita funktioita). Moduulin tilaa ei
 * tallenneta erikseen, vaan se lasketaan tallennetuista teoista.
 */

/** Moduulin tila. Tilojen nimet ovat käyttöliittymän sanakirjassa (src/i18n/ui/). */
export type ModuleStatus = 'not-started' | 'in-progress' | 'complete'

/** Moduulin tiedot, joita laskenta tarvitsee (ModuleEntry täyttää tämän). */
export interface ModuleLike {
  key: string
  optional?: boolean
  quiz?: Quiz
}

export function isQuizPassed(progress: Progress, module: ModuleLike): boolean {
  if (!module.quiz) return true
  const answers = progress.quizAnswers[module.key] ?? {}
  return module.quiz.questions.every((q) => {
    const correct = q.options.find((o) => o.correct)
    return correct !== undefined && answers[q.id] === correct.id
  })
}

export function getModuleStatus(progress: Progress, module: ModuleLike): ModuleStatus {
  const state = progress.modules[module.key]
  if (state?.read && isQuizPassed(progress, module)) return 'complete'
  const answered = Object.keys(progress.quizAnswers[module.key] ?? {}).length > 0
  if (state?.visited || state?.read || answered) return 'in-progress'
  return 'not-started'
}

export function isModuleComplete(progress: Progress, module: ModuleLike): boolean {
  return getModuleStatus(progress, module) === 'complete'
}

export interface ProgressCount {
  complete: number
  total: number
  /** 0–100, pyöristetty alaspäin. */
  percent: number
}

/** Laskee valmiit moduulit. Valinnaiset (bonus) moduulit eivät kuulu laskuun. */
export function countProgress(progress: Progress, modules: ModuleLike[]): ProgressCount {
  const required = modules.filter((m) => !m.optional)
  const complete = required.filter((m) => isModuleComplete(progress, m)).length
  const total = required.length
  return { complete, total, percent: total === 0 ? 0 : Math.floor((complete / total) * 100) }
}

/**
 * "Jatka siitä mihin jäit": ensimmäinen keskeneräinen pakollinen moduuli
 * suositellussa järjestyksessä. Kun kaikki on tehty, ehdotetaan
 * keskeneräistä bonusmoduulia. Palauttaa undefined, kun kaikki on valmista.
 */
export function getNextModule<M extends ModuleLike>(progress: Progress, modules: M[]): M | undefined {
  return (
    modules.find((m) => !m.optional && !isModuleComplete(progress, m)) ??
    modules.find((m) => m.optional && !isModuleComplete(progress, m))
  )
}

export function isVerifyPassed(progress: Progress, stepId: string, step: VerifyStep | undefined): boolean {
  const selected = progress.verify[stepId]
  return step !== undefined && step.options.some((o) => o.correct && o.id === selected)
}

export function hasAnyProgress(progress: Progress): boolean {
  return (
    Object.keys(progress.modules).length > 0 ||
    Object.keys(progress.missions).length > 0 ||
    Object.keys(progress.verify).length > 0 ||
    progress.stats.commandsRun > 0
  )
}
