import { z } from 'zod'
import { osSchema } from '../../schemas/content'

/** localStorage-avain (SUUNNITELMA.md luku 9). */
export const STORAGE_KEY = 'pp-progress-v1'

/** Tallennusskeeman nykyinen versio. Nosta, kun skeema muuttuu, ja lisää migraatio storage.ts:ään. */
export const CURRENT_VERSION = 1

export const themeSchema = z.enum(['system', 'light', 'dark'])
export type Theme = z.infer<typeof themeSchema>

const isoTimestamp = z.string().min(1)

export const moduleProgressSchema = z
  .object({
    visited: z.boolean(),
    read: z.boolean(),
  })
  .strict()
export type ModuleProgress = z.infer<typeof moduleProgressSchema>

export const progressSchema = z
  .object({
    version: z.literal(CURRENT_VERSION),
    os: osSchema.nullable(),
    theme: themeSchema,
    /** Avain: "<polku>/<moduuli>". */
    modules: z.record(z.string(), moduleProgressSchema),
    /** Avain: moduulin avain → kysymyksen id → valitun vaihtoehdon id. */
    quizAnswers: z.record(z.string(), z.record(z.string(), z.string())),
    /** Asennusten varmistukset: varmistuksen id → valitun vaihtoehdon id. */
    verify: z.record(z.string(), z.string()),
    /** Suoritetut simulaattorimissiot: mission id → suoritusaika. */
    missions: z.record(z.string(), isoTimestamp),
    /** Ansaitut merkit: merkin id → ansaintahetki. */
    badges: z.record(z.string(), isoTimestamp),
    stats: z
      .object({
        commandsRun: z.number().int().nonnegative(),
      })
      .strict(),
  })
  .strict()
export type Progress = z.infer<typeof progressSchema>

export function createDefaultProgress(): Progress {
  return {
    version: CURRENT_VERSION,
    os: null,
    theme: 'system',
    modules: {},
    quizAnswers: {},
    verify: {},
    missions: {},
    badges: {},
    stats: { commandsRun: 0 },
  }
}
