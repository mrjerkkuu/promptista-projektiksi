import { z } from 'zod'

/**
 * Sivuston kielet. Suomi on lähdekieli: sisältö kirjoitetaan ensin suomeksi
 * (index.mdx, glossary.json …), ja käännökset ovat sen rinnalla
 * (index.en.mdx, glossary.en.json …). Uusi kieli = uusi tunniste tähän,
 * käyttöliittymän sanakirja (src/i18n/ui/) ja käännöstiedostot.
 */
export const languageSchema = z.enum(['fi', 'en'])
export type Language = z.infer<typeof languageSchema>

export const LANGUAGES = languageSchema.options
export const SOURCE_LANGUAGE: Language = 'fi'
/** Käännöskielet: kaikki paitsi lähdekieli. */
export const TRANSLATION_LANGUAGES = LANGUAGES.filter((l) => l !== SOURCE_LANGUAGE)

/** Kielen nimi omalla kielellään (kielivalitsin). */
export const LANGUAGE_NAME: Record<Language, string> = {
  fi: 'Suomi',
  en: 'English',
}

/**
 * Kieli, kun kävijä ei ole valinnut sitä: suomi, jos selaimen kielissä on suomi, muuten englanti.
 * Suomi saa olla missä kohdassa listaa tahansa, koska suomalaisenkin selaimen ensisijainen kieli on usein englanti.
 */
export function detectLanguage(languages: readonly string[] | undefined = globalThis.navigator?.languages): Language {
  if (!languages || languages.length === 0) return SOURCE_LANGUAGE
  return languages.some((l) => l.toLowerCase().startsWith('fi')) ? 'fi' : 'en'
}
