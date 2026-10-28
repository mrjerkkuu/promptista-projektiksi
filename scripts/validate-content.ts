import fs from 'node:fs'
import path from 'node:path'
import type { z } from 'zod'
import {
  MDX_COMPONENTS,
  NUPPU_POSES,
  badgesFileSchema,
  commandsFileSchema,
  glossaryFileSchema,
  isModuleRef,
  missionsFileSchema,
  moduleEntryId,
  osSchema,
  parseModuleRef,
  pathSchema,
  quizSchema,
  troubleshootingFileSchema,
  verifyFileSchema,
  TRANSLATION_OPTIONS,
  type LearningPathMeta,
} from '../src/schemas/content.ts'
import { LANGUAGES, SOURCE_LANGUAGE, TRANSLATION_LANGUAGES } from '../src/i18n/languages.ts'
import { applyTranslation } from '../src/i18n/translate.ts'

/**
 * Sisällön validointi buildin aikana (ja testeissä).
 *
 * Tarkistaa kaikki JSON-tiedostot zod-skeemoilla ja kaikki viittaukset
 * tiedostojen välillä: MDX-komponenttien id:t, visat, merkkien ehdot,
 * vianmääritys, polkujen kansiorakenne ja polkujen väliset viittaukset.
 * Käännökset (esim. glossary.en.json, index.en.mdx) tarkistetaan samoin. Puuttuva
 * käännös on varoitus, ei virhe: sivu näyttää silloin lähdekielisen tekstin.
 * Palauttaa listan virheistä.
 */

export interface ValidationResult {
  errors: string[]
  warnings: string[]
  /** Sanastotermit, joihin jokin tietopaketti viittaa <Term>-komponentilla. */
  usedTerms: string[]
}

function readJson(file: string, errors: string[]): unknown {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (e) {
    errors.push(`${file}: JSON-tiedostoa ei voitu lukea (${(e as Error).message})`)
    return undefined
  }
}

function parseFile<S extends z.ZodType>(schema: S, file: string, errors: string[]): z.infer<S> | undefined {
  if (!fs.existsSync(file)) {
    errors.push(`${file}: tiedosto puuttuu`)
    return undefined
  }
  const raw = readJson(file, errors)
  if (raw === undefined) return undefined
  const result = schema.safeParse(raw)
  if (!result.success) {
    for (const issue of result.error.issues) {
      errors.push(`${file}: ${issue.path.join('.') || '(juuri)'}: ${issue.message}`)
    }
    return undefined
  }
  return result.data
}

/** Käännöksen tiedostonimi: "glossary.json" → "glossary.en.json", "index.mdx" → "index.en.mdx". */
export function translationFile(file: string, language: string): string {
  return file.replace(/\.(json|mdx)$/, `.${language}.$1`)
}

/** Kääntämättömät tekstit yhtenä varoituksena: muutama esimerkki ja lukumäärä. */
function missingWarning(file: string, missing: string[]): string {
  const shown = missing.slice(0, 5).join(', ')
  return `${file}: ${missing.length} kääntämätöntä tekstiä (${shown}${missing.length > 5 ? ', …' : ''}). Tilalla näytetään suomenkielinen teksti.`
}

/** Käännöstiedostot, joiden kieli on tuntematon tai joilla ei ole lähdetiedostoa. */
function checkStrayTranslations(dir: string, rel: (f: string) => string, errors: string[]) {
  if (!fs.existsSync(dir)) return
  for (const name of fs.readdirSync(dir)) {
    const match = /^(.+)\.([a-z]{2})\.(json|mdx)$/.exec(name)
    if (!match) continue
    const [, base, language, ext] = match
    const where = rel(path.join(dir, name))
    if (!(LANGUAGES as readonly string[]).includes(language) || language === SOURCE_LANGUAGE) {
      errors.push(`${where}: tuntematon käännöskieli "${language}" (käännöskielet: ${TRANSLATION_LANGUAGES.join(', ')})`)
    } else if (!fs.existsSync(path.join(dir, `${base}.${ext}`))) {
      errors.push(`${where}: käännöksellä ei ole lähdetiedostoa ${base}.${ext}`)
    }
  }
}

function listDirs(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
}

/** Poistaa koodilohkot ja koodinpätkät, jotta niissä esimerkkeinä olevat tagit eivät sotke tarkistusta. */
function stripCode(source: string): string {
  return source.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '')
}

interface TagUse {
  name: string
  attrs: Record<string, string>
}

export function findTags(mdxSource: string): TagUse[] {
  const tags: TagUse[] = []
  const tagRe = /<([A-Z][A-Za-z0-9]*)\b([^>]*)>/g
  for (const match of stripCode(mdxSource).matchAll(tagRe)) {
    const attrs: Record<string, string> = {}
    for (const a of match[2].matchAll(/([a-zA-Z]+)="([^"]*)"/g)) attrs[a[1]] = a[2]
    tags.push({ name: match[1], attrs })
  }
  return tags
}

export function validateContent(contentDir: string): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const rel = (f: string) => path.relative(contentDir, f).replaceAll('\\', '/')
  const file = (name: string) => path.join(contentDir, name)

  const commands = parseFile(commandsFileSchema, file('commands.json'), errors) ?? {}
  const glossary = parseFile(glossaryFileSchema, file('glossary.json'), errors) ?? {}
  const missions = parseFile(missionsFileSchema, file('missions.json'), errors) ?? {}
  const troubleshooting = parseFile(troubleshootingFileSchema, file('troubleshooting.json'), errors) ?? {}
  const verify = parseFile(verifyFileSchema, file('verify.json'), errors) ?? {}
  const badges = parseFile(badgesFileSchema, file('badges.json'), errors) ?? {}

  /**
   * Tarkistaa lähdetiedoston käännökset: käännös yhdistetään lähteeseen (src/i18n/translate.ts)
   * ja tulos validoidaan samalla skeemalla kuin lähde.
   */
  function checkTranslations(sourceFile: string, schema: z.ZodType, options = TRANSLATION_OPTIONS[path.basename(sourceFile)]) {
    if (!fs.existsSync(sourceFile)) return
    const source = readJson(sourceFile, [])
    if (source === undefined) return
    for (const language of TRANSLATION_LANGUAGES) {
      const translated = translationFile(sourceFile, language)
      if (!fs.existsSync(translated)) {
        warnings.push(`${rel(translated)}: käännös puuttuu. Tilalla näytetään suomenkielinen sisältö.`)
        continue
      }
      const raw = readJson(translated, errors)
      if (raw === undefined) continue
      const result = applyTranslation(source, raw, options)
      for (const e of result.errors) errors.push(`${rel(translated)}: ${e}`)
      const parsed = schema.safeParse(result.value)
      if (!parsed.success) {
        for (const issue of parsed.error.issues) errors.push(`${rel(translated)}: ${issue.path.join('.') || '(juuri)'}: ${issue.message}`)
      }
      if (result.missing.length > 0) warnings.push(missingWarning(rel(translated), result.missing))
    }
  }

  checkStrayTranslations(contentDir, rel, errors)
  checkTranslations(file('commands.json'), commandsFileSchema)
  checkTranslations(file('glossary.json'), glossaryFileSchema)
  checkTranslations(file('missions.json'), missionsFileSchema)
  checkTranslations(file('troubleshooting.json'), troubleshootingFileSchema)
  checkTranslations(file('verify.json'), verifyFileSchema)
  checkTranslations(file('badges.json'), badgesFileSchema)

  for (const [id, cmd] of Object.entries(commands)) {
    if (cmd.verifiedAt === 'TODO') warnings.push(`commands.json: komentoa "${id}" ei ole tarkistettu virallisesta lähteestä (verifiedAt: TODO)`)
  }

  // Vianmäärityksen komentoviittaukset
  for (const [id, entry] of Object.entries(troubleshooting)) {
    for (const c of entry.commands ?? []) {
      if (!commands[c]) errors.push(`troubleshooting.json: "${id}" viittaa tuntemattomaan komentoon "${c}"`)
    }
  }

  // Varmistusten viittaukset
  for (const [id, step] of Object.entries(verify)) {
    if (step.command && !commands[step.command]) errors.push(`verify.json: "${id}" viittaa tuntemattomaan komentoon "${step.command}"`)
    for (const o of step.options) {
      const refs = o.troubleshooting === undefined ? [] : typeof o.troubleshooting === 'string' ? [o.troubleshooting] : Object.values(o.troubleshooting)
      for (const ref of refs) {
        if (!troubleshooting[ref]) errors.push(`verify.json: "${id}" / "${o.id}" viittaa tuntemattomaan vianmäärityskohtaan "${ref}"`)
      }
    }
  }

  // Polut
  const pathsDir = file('paths')
  const paths = new Map<string, LearningPathMeta>()
  /** Aiheiden avaimet ("<polku>/<aihe>") ja tietopaketit. Viittaukset eivät ole aiheita, joten ne eivät ole tässä. */
  const moduleSources = new Map<string, { mdxFile: string; source: string }>()
  const moduleRefs = new Set<string>()
  /** Polkujen viittaukset toisten polkujen aiheisiin. Tarkistetaan, kun kaikki polut on luettu. */
  const sharedRefs: { pathId: string; ref: string }[] = []
  /** <Path only="…">-arvot. Tarkistetaan, kun kaikki polut on luettu. */
  const pathTags: { where: string; only: string | undefined }[] = []
  const usedTerms = new Set<string>()
  /** Käännetyt tietopaketit aiheittain. Samat tarkistukset kuin lähdekielisillä. */
  const translatedSources = new Map<string, { mdxFile: string; source: string }[]>()

  /** Tietopaketin komponentit ja niiden viittaukset. Sama tarkistus lähdekielelle ja käännöksille. */
  function checkMdx(mdxFile: string, source: string, hasQuiz: boolean) {
    if (/^# /m.test(stripCode(source))) errors.push(rel(mdxFile) + ': älä käytä #-pääotsikkoa (sivu näyttää otsikon path.jsonista), aloita väliotsikot ##-tasolta')
    const tags = findTags(source)
    let quizTags = 0
    for (const tag of tags) {
      const where = `${rel(mdxFile)}: <${tag.name}>`
      if (!(MDX_COMPONENTS as readonly string[]).includes(tag.name)) {
        errors.push(`${where} ei ole sallittu komponentti (sallitut: ${MDX_COMPONENTS.join(', ')})`)
        continue
      }
      switch (tag.name) {
        case 'Command':
          if (!tag.attrs.id) errors.push(`${where} puuttuu id`)
          else if (!commands[tag.attrs.id]) errors.push(`${where} tuntematon komento "${tag.attrs.id}"`)
          break
        case 'Term':
          if (!tag.attrs.id) errors.push(`${where} puuttuu id`)
          else if (!glossary[tag.attrs.id]) errors.push(`${where} tuntematon sanastotermi "${tag.attrs.id}"`)
          else usedTerms.add(tag.attrs.id)
          break
        case 'Terminal':
          if (!tag.attrs.mission) errors.push(`${where} puuttuu mission`)
          else if (!missions[tag.attrs.mission]) errors.push(`${where} tuntematon missio "${tag.attrs.mission}"`)
          break
        case 'VerifyStep':
          if (!tag.attrs.id) errors.push(`${where} puuttuu id`)
          else if (!verify[tag.attrs.id]) errors.push(`${where} tuntematon varmistus "${tag.attrs.id}"`)
          break
        case 'Os':
          if (!osSchema.safeParse(tag.attrs.only).success) errors.push(`${where} only-arvon pitää olla "windows" tai "mac"`)
          break
        case 'Path':
          pathTags.push({ where, only: tag.attrs.only })
          break
        case 'Quiz':
          quizTags++
          break
        case 'NuppuSays':
          if (!tag.attrs.pose) errors.push(`${where} puuttuu pose`)
          else if (!(NUPPU_POSES as readonly string[]).includes(tag.attrs.pose)) errors.push(`${where} tuntematon Nupun asento "${tag.attrs.pose}"`)
          break
      }
    }
    const quizFile = path.join(path.dirname(mdxFile), 'quiz.json')
    if (quizTags > 0 && !hasQuiz) errors.push(`${rel(mdxFile)}: <Quiz /> on käytössä, mutta quiz.json puuttuu`)
    if (hasQuiz && quizTags === 0) errors.push(`${rel(mdxFile)}: visa on olemassa (${rel(quizFile)}), mutta tietopaketissa ei ole <Quiz />-komponenttia`)
    if (quizTags > 1) errors.push(`${rel(mdxFile)}: <Quiz /> saa esiintyä vain kerran`)
  }

  for (const pathDirName of listDirs(pathsDir)) {
    const pathDir = path.join(pathsDir, pathDirName)
    const meta = parseFile(pathSchema, path.join(pathDir, 'path.json'), errors)
    if (!meta) continue
    if (meta.id !== pathDirName) errors.push(`${rel(path.join(pathDir, 'path.json'))}: id "${meta.id}" ei vastaa kansion nimeä "${pathDirName}"`)
    paths.set(meta.id, meta)
    checkStrayTranslations(pathDir, rel, errors)
    checkTranslations(path.join(pathDir, 'path.json'), pathSchema)

    const listed = new Set<string>()
    for (const topic of meta.topics) {
      for (const mod of topic.modules) {
        // Viittauksella ei ole omaa kansiota: tietopaketti on alkuperäisen polun kansiossa.
        if (isModuleRef(mod)) {
          sharedRefs.push({ pathId: meta.id, ref: mod.ref })
          continue
        }
        listed.add(`${topic.id}/${mod.id}`)
        moduleRefs.add(`${meta.id}/${mod.id}`)
        const modDir = path.join(pathDir, topic.id, mod.id)
        const mdxFile = path.join(modDir, 'index.mdx')
        const quizFile = path.join(modDir, 'quiz.json')
        if (!fs.existsSync(mdxFile)) {
          errors.push(`${rel(mdxFile)}: tietopaketti puuttuu (moduuli on listattu path.json:ssa)`)
          continue
        }
        const hasQuiz = fs.existsSync(quizFile)
        if (hasQuiz) parseFile(quizSchema, quizFile, errors)
        checkStrayTranslations(modDir, rel, errors)
        if (hasQuiz) checkTranslations(quizFile, quizSchema)

        const source = fs.readFileSync(mdxFile, 'utf8')
        moduleSources.set(`${meta.id}/${mod.id}`, { mdxFile, source })
        checkMdx(mdxFile, source, hasQuiz)
        for (const language of TRANSLATION_LANGUAGES) {
          const translated = translationFile(mdxFile, language)
          if (!fs.existsSync(translated)) {
            warnings.push(`${rel(translated)}: tietopaketin käännös puuttuu. Tilalla näytetään suomenkielinen tietopaketti.`)
            continue
          }
          const translatedSource = fs.readFileSync(translated, 'utf8')
          translatedSources.set(`${meta.id}/${mod.id}`, [...(translatedSources.get(`${meta.id}/${mod.id}`) ?? []), { mdxFile: translated, source: translatedSource }])
          checkMdx(translated, translatedSource, hasQuiz)
        }
      }
    }

    // Kansiot, joita path.json ei listaa
    for (const topicDir of listDirs(pathDir)) {
      for (const modDir of listDirs(path.join(pathDir, topicDir))) {
        if (!listed.has(`${topicDir}/${modDir}`)) {
          errors.push(`paths/${pathDirName}/${topicDir}/${modDir}: kansio ei ole listattu path.json:ssa`)
        }
      }
    }
  }
  if (paths.size === 0) errors.push('paths/: yhtään oppimispolkua ei löytynyt')
  // Sama järjestysnumero kahdella polulla tekisi valintasivun järjestyksestä sattumanvaraisen.
  const pathsByOrder = new Map<number, string>()
  for (const p of paths.values()) {
    const other = pathsByOrder.get(p.order)
    if (other) errors.push(`paths/${p.id}/path.json: order ${p.order} on jo polulla "${other}"`)
    else pathsByOrder.set(p.order, p.id)
  }

  for (const { where, only } of pathTags) {
    if (!only) errors.push(`${where} puuttuu only`)
    else if (!paths.has(only)) errors.push(`${where} tuntematon polku "${only}"`)
  }

  // Yhteiset aiheet (SUUNNITELMA.md 15.3)
  for (const { pathId, ref } of sharedRefs) {
    const where = `paths/${pathId}/path.json: viittaus "${ref}"`
    const target = parseModuleRef(ref)
    const targetPath = paths.get(target.pathId)
    if (!targetPath) {
      errors.push(`${where}: tuntematon polku "${target.pathId}"`)
      continue
    }
    const targetEntry = targetPath.topics.flatMap((t) => t.modules).find((m) => moduleEntryId(m) === target.moduleId)
    if (!targetEntry) {
      errors.push(`${where}: polulla "${target.pathId}" ei ole aihetta "${target.moduleId}"`)
      continue
    }
    if (isModuleRef(targetEntry)) {
      errors.push(`${where}: kohde on itsekin viittaus ("${targetEntry.ref}"). Viittaa suoraan alkuperäiseen aiheeseen.`)
      continue
    }
    // Linkki tietyn polun aiheeseen veisi toisen polun kävijän väärälle polulle.
    const shared = moduleSources.get(ref)
    for (const s of shared ? [shared, ...(translatedSources.get(ref) ?? [])] : []) {
      if (/#\/polku\//.test(stripCode(s.source))) {
        errors.push(`${rel(s.mdxFile)}: aihe on yhteinen (myös polulla "${pathId}"), joten siinä ei saa olla linkkejä tietyn polun aiheisiin (#/polku/…)`)
      }
    }
  }

  // Merkkien ja vianmäärityksen polut
  for (const [id, badge] of Object.entries(badges)) {
    if (badge.path && !paths.has(badge.path)) errors.push(`badges.json: "${id}" tuntematon polku "${badge.path}"`)
  }
  for (const [id, entry] of Object.entries(troubleshooting)) {
    if (entry.path && !paths.has(entry.path)) errors.push(`troubleshooting.json: "${id}" tuntematon polku "${entry.path}"`)
  }

  // Merkkien ehdot
  for (const [id, badge] of Object.entries(badges)) {
    const c = badge.condition
    const where = `badges.json: "${id}"`
    switch (c.type) {
      case 'missionsComplete':
        for (const m of c.missions) if (!missions[m]) errors.push(`${where} tuntematon missio "${m}"`)
        break
      case 'modulesComplete':
        for (const m of c.modules) {
          if (moduleRefs.has(m)) continue
          // Edistyminen tallentuu alkuperäisellä avaimella, joten merkki viittaa siihen eikä viittaavan polun avaimeen.
          const shared = sharedRefs.find((r) => `${r.pathId}/${parseModuleRef(r.ref).moduleId}` === m)
          errors.push(shared ? `${where} moduuli "${m}" on viittaus: käytä alkuperäistä avainta "${shared.ref}"` : `${where} tuntematon moduuli "${m}"`)
        }
        break
      case 'topicComplete': {
        const p = paths.get(c.path)
        if (!p) errors.push(`${where} tuntematon polku "${c.path}"`)
        else if (!p.topics.some((t) => t.id === c.topic)) errors.push(`${where} tuntematon aihealue "${c.topic}"`)
        break
      }
      case 'verifyPassed':
        for (const s of c.steps) if (!verify[s]) errors.push(`${where} tuntematon varmistus "${s}"`)
        break
      case 'pathComplete':
        if (!paths.has(c.path)) errors.push(`${where} tuntematon polku "${c.path}"`)
        break
      case 'commandsRun':
        break
    }
  }

  return { errors, warnings, usedTerms: [...usedTerms] }
}
