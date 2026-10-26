import { z } from 'zod'

/**
 * Sisällön zod-skeemat. Samoja skeemoja käytetään sekä selaimessa
 * (src/content/index.ts) että buildin validoinnissa (scripts/validate-content.ts).
 */

export const osSchema = z.enum(['windows', 'mac'])
export type Os = z.infer<typeof osSchema>

/** Tunniste: pienet kirjaimet, numerot ja väliviivat (esim. "install-git"). */
export const idSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Tunnisteessa saa olla vain a–z, 0–9 ja väliviivoja')

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Päivämäärä muodossa VVVV-KK-PP')
const urlSchema = z.url({ protocol: /^https$/ })
const text = z.string().trim().min(1)

/** Tekstiä, joka voi olla eri Windowsille ja Macille. */
export const osTextSchema = z.union([
  text,
  z.object({ windows: text, mac: text }).strict(),
])
export type OsText = z.infer<typeof osTextSchema>

// ---------------------------------------------------------------- commands.json

export const commandSchema = z
  .object({
    description: text,
    windows: text.optional(),
    mac: text.optional(),
    /** Virallinen lähde. Voi olla eri Windowsille ja Macille. */
    source: z.union([urlSchema, z.object({ windows: urlSchema, mac: urlSchema }).strict()]),
    /** Milloin komento on viimeksi tarkistettu virallisesta lähteestä. "TODO" = tarkistamatta. */
    verifiedAt: z.union([isoDateSchema, z.literal('TODO')]),
  })
  .strict()
  .refine((c) => c.windows !== undefined || c.mac !== undefined, {
    message: 'Komennolla pitää olla vähintään windows- tai mac-versio',
  })
export type Command = z.infer<typeof commandSchema>

export const commandsFileSchema = z.record(idSchema, commandSchema)

// ---------------------------------------------------------------- glossary.json

/** Sanaston aiheet siinä järjestyksessä, jossa ne näytetään sanastosivulla. */
export const GLOSSARY_CATEGORIES = {
  tekoaly: 'Tekoäly ja Claude Code',
  terminaali: 'Terminaali ja asennukset',
  tiedostot: 'Tiedostot ja kansiot',
  git: 'Git ja GitHub',
  tietoturva: 'Tietoturva',
  verkkosivut: 'Verkkosivut',
} as const
export type GlossaryCategory = keyof typeof GLOSSARY_CATEGORIES
export const glossaryCategorySchema = z.enum(Object.keys(GLOSSARY_CATEGORIES) as [GlossaryCategory, ...GlossaryCategory[]])

export const glossaryEntrySchema = z
  .object({
    term: text,
    category: glossaryCategorySchema,
    definition: text,
    readMore: urlSchema.optional(),
  })
  .strict()
export type GlossaryEntry = z.infer<typeof glossaryEntrySchema>

export const glossaryFileSchema = z.record(idSchema, glossaryEntrySchema)

// ---------------------------------------------------------------- missions.json

const virtualPathSchema = z
  .string()
  .regex(/^~(\/[^/\\]+)*$/, 'Polku muodossa ~/kansio/alikansio (kotikansiosta alkaen, /-erottimin)')

export const missionConditionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('cwdIs'), path: virtualPathSchema }).strict(),
  z.object({ type: z.literal('dirExists'), path: virtualPathSchema }).strict(),
  /** Käyttäjä on käynyt kansiossa jossain vaiheessa harjoitusta. */
  z.object({ type: z.literal('visited'), path: virtualPathSchema }).strict(),
  /** Komento (ensimmäinen sana, esim. "ls"; Windowsin "dir" lasketaan ls:ksi ja "cls" clear:ksi) on ajettu onnistuneesti. */
  z.object({ type: z.literal('commandUsed'), command: text }).strict(),
])
export type MissionCondition = z.infer<typeof missionConditionSchema>

export const missionSchema = z
  .object({
    title: text,
    goal: text,
    hint: text.optional(),
    success: text,
    /** Kansiot, jotka ovat olemassa jo alussa (kotikansion vakiokansioiden lisäksi). */
    startDirs: z.array(virtualPathSchema).optional(),
    startCwd: virtualPathSchema.optional(),
    conditions: z.array(missionConditionSchema).min(1),
  })
  .strict()
export type Mission = z.infer<typeof missionSchema>

export const missionsFileSchema = z.record(idSchema, missionSchema)

// ---------------------------------------------------------------- troubleshooting.json

export const troubleshootingEntrySchema = z
  .object({
    title: text,
    os: z.array(osSchema).min(1),
    symptom: text,
    steps: z.array(text).min(1),
    commands: z.array(idSchema).optional(),
  })
  .strict()
export type TroubleshootingEntry = z.infer<typeof troubleshootingEntrySchema>

export const troubleshootingFileSchema = z.record(idSchema, troubleshootingEntrySchema)

// ---------------------------------------------------------------- verify.json

export const verifyOptionSchema = z
  .object({
    id: idSchema,
    label: osTextSchema,
    correct: z.boolean(),
    explanation: text,
    /** Vianmäärityskohta. Voi olla eri Windowsille ja Macille. */
    troubleshooting: z.union([idSchema, z.object({ windows: idSchema, mac: idSchema }).strict()]).optional(),
  })
  .strict()

export const verifyStepSchema = z
  .object({
    /** Tarkistettava työkalu, esim. "Git". */
    title: text,
    /**
     * commands.json-tunniste komennolle, jolla asennus tarkistetaan. Puuttuu, kun tarkistetaan
     * sovelluksen näkymä eikä komennon tulosta (esim. työpöytäsovelluksen Code-välilehti).
     */
    command: idSchema.optional(),
    question: text,
    options: z.array(verifyOptionSchema).min(3).max(4),
  })
  .strict()
  .refine((v) => v.options.filter((o) => o.correct).length === 1, {
    message: 'Varmistuksessa pitää olla tasan yksi oikea vaihtoehto',
  })
  .refine((v) => v.options.filter((o) => !o.correct).every((o) => o.troubleshooting !== undefined), {
    message: 'Jokaisen väärän vaihtoehdon pitää ohjata vianmääritykseen (troubleshooting)',
  })
export type VerifyStep = z.infer<typeof verifyStepSchema>

export const verifyFileSchema = z.record(idSchema, verifyStepSchema)

// ---------------------------------------------------------------- badges.json

/** Aiheen edistymisen avain "<polku>/<aihe>". Käytetään merkkien ehdoissa ja polkujen viittauksissa. */
export const moduleKeySchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Moduuliviittaus muodossa polku/moduuli, esim. "claude-code/hyva-prompti"')

export const badgeConditionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('commandsRun'), min: z.number().int().positive() }).strict(),
  z.object({ type: z.literal('missionsComplete'), missions: z.array(idSchema).min(1) }).strict(),
  z.object({ type: z.literal('modulesComplete'), modules: z.array(moduleKeySchema).min(1) }).strict(),
  z.object({ type: z.literal('topicComplete'), path: idSchema, topic: idSchema }).strict(),
  z.object({ type: z.literal('verifyPassed'), steps: z.array(idSchema).min(1) }).strict(),
  z.object({ type: z.literal('pathComplete'), path: idSchema }).strict(),
])
export type BadgeCondition = z.infer<typeof badgeConditionSchema>

export const badgeSchema = z
  .object({
    title: text,
    description: text,
    /** Lyhyt symboli (esim. emoji). Placeholder, kunnes design tuo omat kuvakkeet. */
    icon: text,
    bonus: z.boolean().optional(),
    condition: badgeConditionSchema,
  })
  .strict()
export type Badge = z.infer<typeof badgeSchema>

export const badgesFileSchema = z.record(idSchema, badgeSchema)

// ---------------------------------------------------------------- path.json

export const moduleMetaSchema = z
  .object({
    id: idSchema,
    title: text,
    summary: text,
    /** Valinnainen bonusmoduuli: ei vaikuta polun edistymisprosenttiin. */
    optional: z.boolean().optional(),
  })
  .strict()
export type ModuleMeta = z.infer<typeof moduleMetaSchema>

/**
 * Viittaus toisen polun aiheeseen (SUUNNITELMA.md luku 15.3): "<polku>/<aihe>".
 * Sisältö, visa ja edistyminen ovat alkuperäisen aiheen, mutta aihe näkyy myös tällä polulla.
 */
export const moduleRefSchema = z
  .object({
    ref: moduleKeySchema,
    /** Valinnainen tällä polulla (bonus), vaikka alkuperäinen aihe ei olisi. Vaikuttaa vain edistymisprosenttiin. */
    optional: z.boolean().optional(),
  })
  .strict()
export type ModuleRef = z.infer<typeof moduleRefSchema>

export const moduleEntrySchema = z.union([moduleMetaSchema, moduleRefSchema])
export type ModuleEntryMeta = z.infer<typeof moduleEntrySchema>

export function isModuleRef(entry: ModuleEntryMeta): entry is ModuleRef {
  return 'ref' in entry
}

/** Viittauksen osat: polku, jolla aihe on, ja aiheen tunniste. */
export function parseModuleRef(ref: string): { pathId: string; moduleId: string } {
  const [pathId, moduleId] = ref.split('/')
  return { pathId, moduleId }
}

/** Aiheen tunniste polulla. Viittauksen tunniste on alkuperäisen aiheen tunniste. */
export function moduleEntryId(entry: ModuleEntryMeta): string {
  return isModuleRef(entry) ? parseModuleRef(entry.ref).moduleId : entry.id
}

export const topicSchema = z
  .object({
    id: idSchema,
    title: text,
    description: text,
    modules: z.array(moduleEntrySchema).min(1),
  })
  .strict()
export type Topic = z.infer<typeof topicSchema>

export const pathSchema = z
  .object({
    id: idSchema,
    title: text,
    description: text,
    /** Järjestys polkujen valintasivulla (pienin ensin). */
    order: z.number().int().nonnegative(),
    /** Kenelle polku sopii. Näytetään valintasivulla otsikon "Kenelle?" jälkeen. */
    audience: text,
    topics: z.array(topicSchema).min(1),
  })
  .strict()
  .superRefine((p, ctx) => {
    const seen = new Set<string>()
    for (const topic of p.topics) {
      for (const m of topic.modules) {
        const id = moduleEntryId(m)
        if (seen.has(id)) ctx.addIssue({ code: 'custom', message: `Moduulin tunniste "${id}" esiintyy polulla kahdesti` })
        seen.add(id)
        if (isModuleRef(m) && parseModuleRef(m.ref).pathId === p.id) {
          ctx.addIssue({ code: 'custom', message: `Viittaus "${m.ref}" osoittaa omalle polulle. Käytä aihetta suoraan.` })
        }
      }
    }
    const topicIds = p.topics.map((t) => t.id)
    if (new Set(topicIds).size !== topicIds.length) ctx.addIssue({ code: 'custom', message: 'Aihealueiden tunnisteet eivät ole yksilöllisiä' })
  })
export type LearningPathMeta = z.infer<typeof pathSchema>

// ---------------------------------------------------------------- quiz.json

export const quizOptionSchema = z
  .object({
    id: idSchema,
    text,
    correct: z.boolean(),
    explanation: text,
  })
  .strict()

export const quizQuestionSchema = z
  .object({
    id: idSchema,
    question: text,
    options: z.array(quizOptionSchema).min(3).max(4),
  })
  .strict()
  .refine((q) => q.options.filter((o) => o.correct).length === 1, {
    message: 'Kysymyksessä pitää olla tasan yksi oikea vaihtoehto',
  })
  .refine((q) => new Set(q.options.map((o) => o.id)).size === q.options.length, {
    message: 'Vaihtoehtojen tunnisteiden pitää olla yksilöllisiä',
  })
export type QuizQuestion = z.infer<typeof quizQuestionSchema>

export const quizSchema = z
  .object({
    questions: z.array(quizQuestionSchema).min(2).max(4),
  })
  .strict()
  .refine((q) => new Set(q.questions.map((x) => x.id)).size === q.questions.length, {
    message: 'Kysymysten tunnisteiden pitää olla yksilöllisiä',
  })
export type Quiz = z.infer<typeof quizSchema>

/** MDX:ssä sallitut komponentit. Muut isolla alkavat tagit kaatavat buildin. */
export const MDX_COMPONENTS = ['Os', 'Command', 'Term', 'Quiz', 'Terminal', 'ReadMore', 'VerifyStep', 'Tip'] as const
