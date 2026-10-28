import { getContent, type Content } from '../content'
import { useProgress } from '../features/progress'
import { detectLanguage, type Language } from './languages'
import { en } from './ui/en'
import { fi, type UiStrings } from './ui/fi'

export * from './languages'
export type { Linker, UiStrings } from './ui/fi'

/** Käyttöliittymän sanakirjat kielittäin. */
export const UI: Record<Language, UiStrings> = { fi, en }

/** Sivuston kieli: kävijän valinta tai, jos hän ei ole valinnut, selaimen kielestä päätelty. */
export function useLanguage(): Language {
  const { progress } = useProgress()
  return progress.language ?? detectLanguage()
}

/** Käyttöliittymän tekstit sivuston kielellä. */
export function useT(): UiStrings {
  return UI[useLanguage()]
}

/** Sisältö (polut, sanasto, komennot …) sivuston kielellä. */
export function useContent(): Content {
  return getContent(useLanguage())
}
