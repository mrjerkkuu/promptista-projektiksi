/**
 * Palautteen lähetys ilman omaa palvelinta: sivu kokoaa linkin, joka avaa
 * GitHubin issue-lomakkeen (.github/ISSUE_TEMPLATE/) tai sähköpostiohjelman
 * valmiiksi täytettynä. Sivulta itseltään ei lähde pyyntöjä.
 */

export const FEEDBACK_EMAIL = 'jeremia.projektit@gmail.com'
export const REPO_URL = 'https://github.com/mrjerkkuu/promptista-projektiksi'

/** Pitkä teksti kasvattaa osoitetta; GitHub vastaa liian pitkään osoitteeseen virheellä 414. */
export const FEEDBACK_MAX_LENGTH = 1500

export type FeedbackType = 'idea' | 'virhe' | 'komento'

export const FEEDBACK_TYPES: Record<FeedbackType, { label: string; template: string; titlePrefix: string }> = {
  idea: { label: 'Kehitysidea', template: '1-kehitysidea.yml', titlePrefix: 'Idea: ' },
  virhe: { label: 'Virhe tai epäselvä kohta', template: '2-virhe.yml', titlePrefix: 'Virhe: ' },
  komento: { label: 'Komento ei toimi', template: '3-komento.yml', titlePrefix: 'Komento ei toimi: ' },
}

export interface Feedback {
  type: FeedbackType
  text: string
  /** Sivu, jota palaute koskee (esim. ”0.2 Terminaali – https://…”). Tyhjä = yleinen palaute. */
  page: string
  /** Valittu käyttöjärjestelmä tai tyhjä. */
  os: string
}

/** Otsikoksi palautteen ensimmäinen rivi lyhennettynä. */
export function feedbackTitle({ type, text }: Pick<Feedback, 'type' | 'text'>, maxLength = 60): string {
  const firstLine = text.trim().split('\n')[0].trim()
  const summary = firstLine.length > maxLength ? `${firstLine.slice(0, maxLength - 1).trimEnd()}…` : firstLine
  return `${FEEDBACK_TYPES[type].titlePrefix}${summary}`
}

/** Palautteen tiedot ja teksti yhtenä viestinä (sähköposti ja GitHubin varateksti). */
export function feedbackBody(feedback: Feedback): string {
  return [
    `Palautteen tyyppi: ${FEEDBACK_TYPES[feedback.type].label}`,
    ...(feedback.page ? [`Sivu: ${feedback.page}`] : []),
    `Käyttöjärjestelmä: ${feedback.os || 'ei valittu'}`,
    '',
    feedback.text.trim(),
  ].join('\n')
}

/**
 * GitHubin uusi issue valitulla lomakepohjalla. Kenttien tunnisteet ovat samat kuin lomakepohjissa.
 * body on varalla: jos lomakepohjaa ei ole GitHubissa (esim. ennen pushia), GitHub avaa tavallisen
 * issuen ja ohittaa lomakkeen kentät, mutta täyttää otsikon ja tekstin.
 */
export function issueUrl(feedback: Feedback): string {
  const params = new URLSearchParams({ template: FEEDBACK_TYPES[feedback.type].template })
  if (feedback.text.trim()) {
    params.set('title', feedbackTitle(feedback))
    params.set('kuvaus', feedback.text.trim())
  }
  if (feedback.page) params.set('sivu', feedback.page)
  if (feedback.os && feedback.type !== 'idea') params.set('kayttojarjestelma', feedback.os)
  if (feedback.text.trim() || feedback.page) params.set('body', feedbackBody(feedback))
  return `${REPO_URL}/issues/new?${params.toString()}`
}

/** Sähköpostin otsikon alku. Samaan osoitteeseen tulee palautetta muistakin projekteista, joten tällä viestit voi suodattaa. */
export const EMAIL_SUBJECT_TAG = '[Promptista projektiksi]'

/** mailto-linkki. encodeURIComponent, koska sähköpostiohjelmat eivät tulkitse +-merkkiä välilyönniksi. */
export function mailtoUrl(feedback: Feedback): string {
  const subject = `${EMAIL_SUBJECT_TAG} ${feedback.text.trim() ? feedbackTitle(feedback) : FEEDBACK_TYPES[feedback.type].label}`
  const body = `Projekti: Promptista projektiksi (${REPO_URL})\n${feedbackBody(feedback)}`
  return `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
