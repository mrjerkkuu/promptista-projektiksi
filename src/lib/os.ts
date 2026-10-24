import type { Os, OsText } from '../schemas/content'

export const OS_LABEL: Record<Os, string> = {
  windows: 'Windows',
  mac: 'Mac',
}

export const OS_LIST: Os[] = ['windows', 'mac']

/** Palauttaa käyttöjärjestelmän mukaisen tekstin. Jos käyttöjärjestelmää ei ole valittu, näytetään molemmat. */
export function resolveOsText(text: OsText, os: Os | null): string {
  if (typeof text === 'string') return text
  if (os) return text[os]
  return `Windows: ${text.windows} / Mac: ${text.mac}`
}
