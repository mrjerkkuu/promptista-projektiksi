import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import type { MDXProps } from 'mdx/types'
import {
  badgesFileSchema,
  commandsFileSchema,
  glossaryFileSchema,
  missionsFileSchema,
  pathSchema,
  quizSchema,
  troubleshootingFileSchema,
  verifyFileSchema,
  isModuleRef,
  parseModuleRef,
  TRANSLATION_OPTIONS,
  type Badge,
  type Command,
  type GlossaryEntry,
  type LearningPathMeta,
  type Mission,
  type ModuleMeta,
  type Quiz,
  type Topic,
  type TroubleshootingEntry,
  type VerifyStep,
} from '../schemas/content'
import { SOURCE_LANGUAGE, type Language } from '../i18n/languages'
import { applyTranslation, type TranslationOptions } from '../i18n/translate'
import commandsJson from './commands.json'
import glossaryJson from './glossary.json'
import badgesJson from './badges.json'
import missionsJson from './missions.json'
import troubleshootingJson from './troubleshooting.json'
import verifyJson from './verify.json'

/**
 * Sisällön lataus. Polut löydetään automaattisesti import.meta.globilla:
 * uusi kansio src/content/paths/<polku>/ riittää uuden polun lisäämiseen.
 * Build-vaiheessa sama sisältö on jo validoitu (scripts/validate-content.ts).
 *
 * Käännökset ovat lähdetiedostojen rinnalla: glossary.en.json, path.en.json,
 * quiz.en.json ja index.en.mdx. Puuttuvan käännöksen tilalla näytetään suomenkielinen teksti.
 */

export type MdxModule = { default: ComponentType<MDXProps> }

const pathFiles = import.meta.glob<unknown>('./paths/*/path.json', { eager: true, import: 'default' })
const quizFiles = import.meta.glob<unknown>('./paths/*/*/*/quiz.json', { eager: true, import: 'default' })
const mdxFiles = import.meta.glob<MdxModule>('./paths/*/*/*/index.mdx')
const sharedTranslationFiles = import.meta.glob<unknown>('./*.*.json', { eager: true, import: 'default' })
const pathTranslationFiles = import.meta.glob<unknown>('./paths/*/path.*.json', { eager: true, import: 'default' })
const quizTranslationFiles = import.meta.glob<unknown>('./paths/*/*/*/quiz.*.json', { eager: true, import: 'default' })
const mdxTranslationFiles = import.meta.glob<MdxModule>('./paths/*/*/*/index.*.mdx')

/**
 * Yhden kielen käännöstiedostot lähdetiedoston nimellä: "./glossary.en.json" → "./glossary.json".
 * Näin käännös löytyy samalla avaimella kuin lähdetiedosto.
 */
export function translationsFor<T>(files: Record<string, T>, language: Language): Record<string, T> {
  const result: Record<string, T> = {}
  const suffix = new RegExp(`\\.${language}(\\.(?:json|mdx))$`)
  for (const [file, value] of Object.entries(files)) if (suffix.test(file)) result[file.replace(suffix, '$1')] = value
  return result
}

/** Lähdesisältö käännettynä. Validointi on jo tarkistanut käännöksen, joten virheet ohitetaan tässä. */
function localize(raw: unknown, translation: unknown, options?: TranslationOptions): unknown {
  return translation === undefined ? raw : applyTranslation(raw, translation, options).value
}

export interface ModuleEntry extends ModuleMeta {
  /**
   * Edistymisen avain: "<polku>/<moduuli>". Yhteisellä aiheella avain on alkuperäisen polun,
   * joten aihe on valmis kaikilla poluilla, joilla se on.
   */
  key: string
  /** Polku, jolla aihe tässä näkyy. Osoite ja "Seuraava" tulevat tästä, ei avaimesta (SUUNNITELMA.md 15.3). */
  pathId: string
  topicId: string
  /** Näytettävä numero, esim. "0.1". */
  number: string
  /** Yhteisellä aiheella alkuperäinen polku, jonka kansiossa tietopaketti on. */
  sharedFrom?: string
  quiz?: Quiz
  /** Tietopaketin kieli: lähdekieli, jos tietopakettia ei ole vielä käännetty. */
  contentLanguage: Language
  load: () => Promise<MdxModule>
  /** Tietopaketti React-komponenttina. Ladataan vasta, kun se näytetään (oma tiedostonsa buildissa). */
  Content: LazyExoticComponent<ComponentType<MDXProps>>
}

export interface TopicEntry extends Omit<Topic, 'modules'> {
  number: number
  modules: ModuleEntry[]
}

export interface LearningPath extends Omit<LearningPathMeta, 'topics'> {
  topics: TopicEntry[]
  /** Kaikki moduulit suositellussa järjestyksessä. */
  modules: ModuleEntry[]
}

/** Sisältötiedostot polun tiedostopolun mukaan, kuten import.meta.glob ne antaa ("./paths/…"). */
export interface ContentFiles {
  quiz: Record<string, unknown>
  mdx: Record<string, () => Promise<MdxModule>>
  /** Yhden kielen käännökset lähdetiedostojen nimillä (ks. translationsFor). */
  translation?: {
    language: Language
    quiz: Record<string, unknown>
    mdx: Record<string, () => Promise<MdxModule>>
  }
}

/** Aiheen alkuperä: polku ja aihealue, joiden kansiossa tietopaketti on. */
interface ModuleSource {
  meta: ModuleMeta
  pathId: string
  topicId: string
}

/**
 * Kokoaa polut sisältötiedostoista. Viittaukset ({ "ref": "<polku>/<aihe>" }) korvataan
 * alkuperäisellä aiheella. Build on jo tarkistanut viittaukset (scripts/validate-content.ts),
 * joten virhe tässä tarkoittaa, että validointi on ohitettu.
 */
export function buildPaths(metas: LearningPathMeta[], files: ContentFiles): LearningPath[] {
  const sources = new Map<string, ModuleSource>()
  for (const meta of metas) {
    for (const topic of meta.topics) {
      for (const mod of topic.modules) {
        if (!isModuleRef(mod)) sources.set(`${meta.id}/${mod.id}`, { meta: mod, pathId: meta.id, topicId: topic.id })
      }
    }
  }

  // Sama tietopaketti näkyy usealla polulla: yksi lazy-komponentti ja yksi jäsennetty visa per tiedosto.
  const loaded = new Map<string, Pick<ModuleEntry, 'quiz' | 'contentLanguage' | 'load' | 'Content'>>()
  const { translation } = files
  const loadSource = (source: ModuleSource) => {
    const base = `./paths/${source.pathId}/${source.topicId}/${source.meta.id}`
    let entry = loaded.get(base)
    if (!entry) {
      const sourceLoad = files.mdx[`${base}/index.mdx`]
      if (!sourceLoad) throw new Error(`Tietopaketti puuttuu: ${base}/index.mdx`)
      const translatedLoad = translation?.mdx[`${base}/index.mdx`]
      const load = translatedLoad ?? sourceLoad
      const quizRaw = files.quiz[`${base}/quiz.json`]
      entry = {
        quiz: quizRaw === undefined ? undefined : quizSchema.parse(localize(quizRaw, translation?.quiz[`${base}/quiz.json`])),
        contentLanguage: translatedLoad && translation ? translation.language : SOURCE_LANGUAGE,
        load,
        Content: lazy(load),
      }
      loaded.set(base, entry)
    }
    return entry
  }

  return metas.map((meta) => {
    const modules: ModuleEntry[] = []
    const topics = meta.topics.map((topic, topicIndex): TopicEntry => {
      const topicModules = topic.modules.map((mod, modIndex): ModuleEntry => {
        const key = isModuleRef(mod) ? mod.ref : `${meta.id}/${mod.id}`
        const source = sources.get(key)
        if (!source) throw new Error(`Polun ${meta.id} viittaus "${key}" osoittaa aiheeseen, jota ei ole`)
        return {
          ...source.meta,
          ...loadSource(source),
          key,
          pathId: meta.id,
          topicId: topic.id,
          number: `${topicIndex}.${modIndex + 1}`,
          sharedFrom: isModuleRef(mod) ? parseModuleRef(mod.ref).pathId : undefined,
          // Viittaava polku voi tehdä aiheesta bonuksen. Edistyminen tallentuu silti samalle avaimelle.
          optional: isModuleRef(mod) && mod.optional !== undefined ? mod.optional : source.meta.optional,
        }
      })
      modules.push(...topicModules)
      return { ...topic, number: topicIndex, modules: topicModules }
    })
    return { ...meta, topics, modules }
  })
}

/** Kaikki sisältö yhdellä kielellä. */
export interface Content {
  language: Language
  commands: Record<string, Command>
  glossary: Record<string, GlossaryEntry>
  badges: Record<string, Badge>
  missions: Record<string, Mission>
  troubleshooting: Record<string, TroubleshootingEntry>
  verifySteps: Record<string, VerifyStep>
  paths: LearningPath[]
  getPath(pathId: string): LearningPath | undefined
  getModule(pathId: string, moduleId: string): ModuleEntry | undefined
  getModuleByKey(key: string): ModuleEntry | undefined
  /**
   * Polun seuraava moduuli suositellussa järjestyksessä, tai undefined, jos moduuli on polun viimeinen.
   * Polku annetaan erikseen (osoitteesta), koska yhteinen aihe on usealla polulla.
   */
  getNextModule(pathId: string, moduleId: string): ModuleEntry | undefined
  /** Polut niin, että kävijän valitsema polku on ensimmäisenä (merkki- ja vianmäärityssivujen ryhmittely). */
  pathsActiveFirst(activePath: string | null): LearningPath[]
}

function createContent(language: Language): Content {
  const shared = translationsFor(sharedTranslationFiles, language)
  const read = (file: string, raw: unknown) => localize(raw, shared[`./${file}`], TRANSLATION_OPTIONS[file])
  const pathTranslations = translationsFor(pathTranslationFiles, language)
  const translation =
    language === SOURCE_LANGUAGE
      ? undefined
      : { language, quiz: translationsFor(quizTranslationFiles, language), mdx: translationsFor(mdxTranslationFiles, language) }
  const paths = buildPaths(
    Object.entries(pathFiles).map(([file, raw]) => pathSchema.parse(localize(raw, pathTranslations[file]))),
    { quiz: quizFiles, mdx: mdxFiles, translation },
  ).sort((a, b) => a.order - b.order)

  const getPath = (pathId: string) => paths.find((p) => p.id === pathId)
  const getModule = (pathId: string, moduleId: string) => getPath(pathId)?.modules.find((m) => m.id === moduleId)
  return {
    language,
    commands: commandsFileSchema.parse(read('commands.json', commandsJson)),
    glossary: glossaryFileSchema.parse(read('glossary.json', glossaryJson)),
    badges: badgesFileSchema.parse(read('badges.json', badgesJson)),
    missions: missionsFileSchema.parse(read('missions.json', missionsJson)),
    troubleshooting: troubleshootingFileSchema.parse(read('troubleshooting.json', troubleshootingJson)),
    verifySteps: verifyFileSchema.parse(read('verify.json', verifyJson)),
    paths,
    getPath,
    getModule,
    getModuleByKey(key) {
      const [pathId, moduleId] = key.split('/')
      return getModule(pathId, moduleId)
    },
    getNextModule(pathId, moduleId) {
      const modules = getPath(pathId)?.modules ?? []
      const index = modules.findIndex((m) => m.id === moduleId)
      return index === -1 ? undefined : modules[index + 1]
    },
    pathsActiveFirst(activePath) {
      const active = getPath(activePath ?? '')
      return active ? [active, ...paths.filter((p) => p !== active)] : paths
    },
  }
}

const contents = new Map<Language, Content>()

/** Sisältö annetulla kielellä. Kieli kootaan, kun sitä tarvitaan ensimmäisen kerran, ja se pysyy muistissa. */
export function getContent(language: Language): Content {
  let content = contents.get(language)
  if (!content) {
    content = createContent(language)
    contents.set(language, content)
  }
  return content
}

/**
 * Lähdekielinen sisältö. Rakenne (tunnisteet, ehdot, järjestys) on kaikilla kielillä sama,
 * joten esim. merkkien ehdot lasketaan tästä. Näytettävät tekstit haetaan useContentilla (src/i18n).
 */
const source = getContent(SOURCE_LANGUAGE)
export const { commands, glossary, badges, missions, troubleshooting, verifySteps, paths } = source
export const { getPath, getModule, getModuleByKey, getNextModule, pathsActiveFirst } = source
