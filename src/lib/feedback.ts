import type { Language } from '../i18n/languages'

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

/** Lomakepohjat. Tunnisteet ja pohjat ovat samat kaikilla kielillä. */
export const FEEDBACK_TYPES: Record<FeedbackType, { template: string }> = {
  idea: { template: '1-kehitysidea.yml' },
  virhe: { template: '2-virhe.yml' },
  komento: { template: '3-komento.yml' },
}

/** Palauteviestin tekstit sivuston kielellä: kävijä kirjoittaa palautteen samalla kielellä kuin lukee sivua. */
export const FEEDBACK_MESSAGES: Record<
  Language,
  { types: Record<FeedbackType, { label: string; titlePrefix: string }>; type: string; page: string; os: string; osNone: string; project: string }
> = {
  fi: {
    types: {
      idea: { label: 'Kehitysidea', titlePrefix: 'Idea: ' },
      virhe: { label: 'Virhe tai epäselvä kohta', titlePrefix: 'Virhe: ' },
      komento: { label: 'Komento ei toimi', titlePrefix: 'Komento ei toimi: ' },
    },
    type: 'Palautteen tyyppi',
    page: 'Sivu',
    os: 'Käyttöjärjestelmä',
    osNone: 'ei valittu',
    project: 'Projekti',
  },
  en: {
    types: {
      idea: { label: 'Idea for improvement', titlePrefix: 'Idea: ' },
      virhe: { label: 'Mistake or unclear part', titlePrefix: 'Mistake: ' },
      komento: { label: 'Command doesn’t work', titlePrefix: 'Command doesn’t work: ' },
    },
    type: 'Feedback type',
    page: 'Page',
    os: 'Operating system',
    osNone: 'not chosen',
    project: 'Project',
  },
}

export interface Feedback {
  type: FeedbackType
  text: string
  /** Sivu, jota palaute koskee (esim. ”0.2 Terminaali – https://…”). Tyhjä = yleinen palaute. */
  page: string
  /** Valittu käyttöjärjestelmä tai tyhjä. */
  os: string
  /** Sivuston kieli. Oletus suomi. */
  language?: Language
}

const messages = (feedback: Pick<Feedback, 'language'>) => FEEDBACK_MESSAGES[feedback.language ?? 'fi']

/** Otsikoksi palautteen ensimmäinen rivi lyhennettynä. */
export function feedbackTitle(feedback: Pick<Feedback, 'type' | 'text' | 'language'>, maxLength = 60): string {
  const firstLine = feedback.text.trim().split('\n')[0].trim()
  const summary = firstLine.length > maxLength ? `${firstLine.slice(0, maxLength - 1).trimEnd()}…` : firstLine
  return `${messages(feedback).types[feedback.type].titlePrefix}${summary}`
}

/** Palautteen tiedot ja teksti yhtenä viestinä (sähköposti ja GitHubin varateksti). */
export function feedbackBody(feedback: Feedback): string {
  const m = messages(feedback)
  return [
    `${m.type}: ${m.types[feedback.type].label}`,
    ...(feedback.page ? [`${m.page}: ${feedback.page}`] : []),
    `${m.os}: ${feedback.os || m.osNone}`,
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
  const m = messages(feedback)
  const subject = `${EMAIL_SUBJECT_TAG} ${feedback.text.trim() ? feedbackTitle(feedback) : m.types[feedback.type].label}`
  const body = `${m.project}: Promptista projektiksi (${REPO_URL})\n${feedbackBody(feedback)}`
  return `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
