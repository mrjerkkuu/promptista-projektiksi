import type { Language } from '../i18n/languages'

/** Päivämäärä kielen mukaan: "2026-10-24" → "24.10.2026" (suomi) tai "24 Oct 2026" (englanti). */
export function formatDate(isoDate: string, language: Language = 'fi'): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate)
  if (!match) return isoDate
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])]
  if (language === 'fi') return `${day}.${month}.${year}`
  // UTC, jotta aikavyöhyke ei siirrä päivää.
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(Date.UTC(year, month - 1, day))
}

/** Hetken (ISO-aikaleima) päivämäärä kävijän aikavyöhykkeellä, esim. merkin ansaintapäivä. */
export function formatDay(isoTimestamp: string, language: Language = 'fi'): string {
  const d = new Date(isoTimestamp)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return formatDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, language)
}

/** Lähdelinkin näkyvä nimi: verkkotunnus ilman www-alkua. */
export function sourceLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
