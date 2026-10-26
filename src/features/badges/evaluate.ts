import type { LearningPath } from '../../content'
import type { Badge, BadgeCondition, VerifyStep } from '../../schemas/content'
import { countProgress, isModuleComplete, isVerifyPassed } from '../progress/model'
import type { Progress } from '../progress/schema'

/** Sisältö, jota merkkien ehdot tarvitsevat. Annetaan parametrina, jotta logiikkaa voi testata omalla datalla. */
export interface BadgeContext {
  badges: Record<string, Badge>
  paths: LearningPath[]
  verifySteps: Record<string, VerifyStep>
}

export function isConditionMet(condition: BadgeCondition, progress: Progress, ctx: BadgeContext): boolean {
  const findModule = (ref: string) => {
    const [pathId, moduleId] = ref.split('/')
    return ctx.paths.find((p) => p.id === pathId)?.modules.find((m) => m.id === moduleId)
  }
  switch (condition.type) {
    case 'commandsRun':
      return progress.stats.commandsRun >= condition.min
    case 'missionsComplete':
      return condition.missions.every((m) => progress.missions[m] !== undefined)
    case 'modulesComplete': {
      const done = (ref: string) => {
        const m = findModule(ref)
        return m !== undefined && isModuleComplete(progress, m)
      }
      return condition.match === 'any' ? condition.modules.some(done) : condition.modules.every(done)
    }
    case 'topicComplete': {
      const topic = ctx.paths.find((p) => p.id === condition.path)?.topics.find((t) => t.id === condition.topic)
      if (!topic) return false
      const count = countProgress(progress, topic.modules)
      return count.complete === count.total
    }
    case 'verifyPassed':
      return condition.steps.every((s) => isVerifyPassed(progress, s, ctx.verifySteps[s]))
    case 'pathComplete': {
      const path = ctx.paths.find((p) => p.id === condition.path)
      if (!path) return false
      const count = countProgress(progress, path.modules)
      return count.complete === count.total
    }
  }
}

/** Merkit, joiden ehto täyttyy mutta joita ei vielä ole annettu. */
export function findNewBadges(progress: Progress, ctx: BadgeContext): string[] {
  return Object.entries(ctx.badges)
    .filter(([id, badge]) => !progress.badges[id] && isConditionMet(badge.condition, progress, ctx))
    .map(([id]) => id)
}

/** Lisää edistymiseen kaikki ansaitut merkit. Palauttaa saman objektin, jos uusia ei ole. */
export function awardBadges(progress: Progress, ctx: BadgeContext, at: string): Progress {
  const fresh = findNewBadges(progress, ctx)
  if (fresh.length === 0) return progress
  const badges = { ...progress.badges }
  for (const id of fresh) badges[id] = at
  return { ...progress, badges }
}
