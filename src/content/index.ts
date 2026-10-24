import type { ComponentType } from 'react'
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

type MdxModule = { default: ComponentType<MDXProps> }

const pathFiles = import.meta.glob<unknown>('./paths/*/path.json', { eager: true, import: 'default' })
const quizFiles = import.meta.glob<unknown>('./paths/*/*/*/quiz.json', { eager: true, import: 'default' })
const mdxFiles = import.meta.glob<MdxModule>('./paths/*/*/*/index.mdx')

export interface ModuleEntry extends ModuleMeta {
  /** Yksilöllinen avain koko sivustolla: "<polku>/<moduuli>". */
  key: string
  pathId: string
  topicId: string
  /** Näytettävä numero, esim. "0.1". */
  number: string
  quiz?: Quiz
  load: () => Promise<MdxModule>
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

function buildPath(meta: LearningPathMeta): LearningPath {
  const modules: ModuleEntry[] = []
  const topics = meta.topics.map((topic, topicIndex): TopicEntry => {
    const topicModules = topic.modules.map((mod, modIndex): ModuleEntry => {
      const base = `./paths/${meta.id}/${topic.id}/${mod.id}`
      const quizRaw = quizFiles[`${base}/quiz.json`]
      const load = mdxFiles[`${base}/index.mdx`]
      if (!load) throw new Error(`Tietopaketti puuttuu: ${base}/index.mdx`)
      return {
        ...mod,
        key: `${meta.id}/${mod.id}`,
        pathId: meta.id,
        topicId: topic.id,
        number: `${topicIndex}.${modIndex + 1}`,
        quiz: quizRaw === undefined ? undefined : quizSchema.parse(quizRaw),
        load,
      }
    })
    modules.push(...topicModules)
    return { ...topic, number: topicIndex, modules: topicModules }
  })
  return { ...meta, topics, modules }
}

export const paths: LearningPath[] = Object.values(pathFiles)
  .map((raw) => buildPath(pathSchema.parse(raw)))
  .sort((a, b) => a.id.localeCompare(b.id))

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
