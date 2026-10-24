import { badges, paths, verifySteps } from '../../content'
import type { Progress } from '../progress/schema'
import { awardBadges, type BadgeContext } from './evaluate'

export * from './evaluate'

export const badgeContext: BadgeContext = { badges, paths, verifySteps }

/** ProgressProviderin derive-funktio: myöntää merkit heti, kun ehto täyttyy. */
export function deriveBadges(next: Progress): Progress {
  return awardBadges(next, badgeContext, new Date().toISOString())
}
