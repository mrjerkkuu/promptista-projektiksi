/** "2026-10-24" → "24.10.2026" */
export function formatDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate)
  if (!match) return isoDate
  return `${Number(match[3])}.${Number(match[2])}.${match[1]}`
}

/** Lähdelinkin näkyvä nimi: verkkotunnus ilman www-alkua. */
export function sourceLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
