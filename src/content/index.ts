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
  type LearningPathMeta,
  type ModuleMeta,
  type Quiz,
  type Topic,
} from '../schemas/content'
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
 */

export const commands = commandsFileSchema.parse(commandsJson)
export const glossary = glossaryFileSchema.parse(glossaryJson)
export const badges = badgesFileSchema.parse(badgesJson)
export const missions = missionsFileSchema.parse(missionsJson)
export const troubleshooting = troubleshootingFileSchema.parse(troubleshootingJson)
export const verifySteps = verifyFileSchema.parse(verifyJson)

export type MdxModule = { default: ComponentType<MDXProps> }

const pathFiles = import.meta.glob<unknown>('./paths/*/path.json', { eager: true, import: 'default' })
const quizFiles = import.meta.glob<unknown>('./paths/*/*/*/quiz.json', { eager: true, import: 'default' })
const mdxFiles = import.meta.glob<MdxModule>('./paths/*/*/*/index.mdx')

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
  const loaded = new Map<string, Pick<ModuleEntry, 'quiz' | 'load' | 'Content'>>()
  const loadSource = (source: ModuleSource) => {
    const base = `./paths/${source.pathId}/${source.topicId}/${source.meta.id}`
    let entry = loaded.get(base)
    if (!entry) {
      const load = files.mdx[`${base}/index.mdx`]
      if (!load) throw new Error(`Tietopaketti puuttuu: ${base}/index.mdx`)
      const quizRaw = files.quiz[`${base}/quiz.json`]
      entry = { quiz: quizRaw === undefined ? undefined : quizSchema.parse(quizRaw), load, Content: lazy(load) }
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

export const paths: LearningPath[] = buildPaths(
  Object.values(pathFiles).map((raw) => pathSchema.parse(raw)),
  { quiz: quizFiles, mdx: mdxFiles },
).sort((a, b) => a.order - b.order)

/** Polut niin, että kävijän valitsema polku on ensimmäisenä (merkki- ja vianmäärityssivujen ryhmittely). */
export function pathsActiveFirst(activePath: string | null): LearningPath[] {
  const active = paths.find((p) => p.id === activePath)
  return active ? [active, ...paths.filter((p) => p !== active)] : paths
}

export function getPath(pathId: string): LearningPath | undefined {
  return paths.find((p) => p.id === pathId)
}

export function getModule(pathId: string, moduleId: string): ModuleEntry | undefined {
  return getPath(pathId)?.modules.find((m) => m.id === moduleId)
}

export function getModuleByKey(key: string): ModuleEntry | undefined {
  const [pathId, moduleId] = key.split('/')
  return getModule(pathId, moduleId)
}

/**
 * Polun seuraava moduuli suositellussa järjestyksessä, tai undefined, jos moduuli on polun viimeinen.
 * Polku annetaan erikseen (osoitteesta), koska yhteinen aihe on usealla polulla.
 */
export function getNextModule(pathId: string, moduleId: string): ModuleEntry | undefined {
  const modules = getPath(pathId)?.modules ?? []
  const index = modules.findIndex((m) => m.id === moduleId)
  return index === -1 ? undefined : modules[index + 1]
}
