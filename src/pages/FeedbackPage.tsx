import { useId, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Nuppu } from '../components/Nuppu'
import { getModuleByKey, getPath } from '../content'
import { useProgress } from '../features/progress'
import { FEEDBACK_EMAIL, FEEDBACK_MAX_LENGTH, FEEDBACK_TYPES, issueUrl, mailtoUrl, type FeedbackType } from '../lib/feedback'
import { OS_LABEL } from '../lib/os'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import './pages.css'

const HINTS: Record<FeedbackType, string> = {
  idea: 'Mitä sivulla voisi olla tai mitä voisi tehdä toisin? Kerro myös, miten idea auttaisi sinua.',
  virhe: 'Mikä kohta oli väärin tai jäi epäselväksi? Kopioi mukaan lause, jota tarkoitat.',
  komento: 'Mikä komento ei toiminut, ja mitä tapahtui? Liitä mukaan virheilmoitus.',
}

/** Sivuston sisäisen reitin koko osoite (HashRouter: reitti on #-osassa). */
function absoluteUrl(route: string) {
  return new URL(`#${route}`, window.location.href).href
}

interface FeedbackContext {
  /** ”Palaute koskee <kind> <name>.” */
  kind: string
  name: string
  /** Palautteeseen liitettävä sivu. */
  page: string
  defaultType: FeedbackType
}

/**
 * Mitä palaute koskee: ?moduuli=<polku>/<moduuli> (tietopaketin loppu),
 * ?aihealue=<polku>/<aihealue> tai ?polku=<polku> (valmistumisen jälkeen).
 * Tuntematon arvo ohitetaan, jolloin palaute on yleistä.
 */
function getContext(params: URLSearchParams): FeedbackContext | undefined {
  const module = getModuleByKey(params.get('moduuli') ?? '')
  if (module) {
    const name = `${module.number} ${module.title}`
    return { kind: 'aihetta', name, page: `${name} – ${absoluteUrl(`/polku/${module.pathId}/${module.id}`)}`, defaultType: 'virhe' }
  }
  const [topicPathId, topicId] = (params.get('aihealue') ?? '').split('/')
  const topic = getPath(topicPathId)?.topics.find((t) => t.id === topicId)
  if (topic) {
    const name = `${topic.number}. ${topic.title}`
    return { kind: 'aihealuetta', name, page: `Aihealue ${name} – ${absoluteUrl(`/polku/${topicPathId}`)}`, defaultType: 'idea' }
  }
  const path = getPath(params.get('polku') ?? '')
  if (path) {
    return { kind: 'polkua', name: path.title, page: `Polku ${path.title} – ${absoluteUrl(`/polku/${path.id}`)}`, defaultType: 'idea' }
  }
  return undefined
}

export function FeedbackPage() {
  useDocumentTitle('Palaute')
  const [searchParams] = useSearchParams()
  const context = getContext(searchParams)
  const { progress } = useProgress()
  const [type, setType] = useState<FeedbackType>(context?.defaultType ?? 'idea')
  const [text, setText] = useState('')
  const typeId = useId()
  const textId = useId()
  const hintId = useId()

  const feedback = {
    type,
    text,
    page: context?.page ?? '',
    os: progress.os ? OS_LABEL[progress.os] : '',
  }

  return (
    <div className="reading">
      <header className="page-header">
        <div className="page-header__text">
          <h1>Palaute</h1>
          <p>Keksitkö, miten sivua voisi parantaa, tai löysitkö virheen? Kerro siitä! Jokainen palaute luetaan.</p>
        </div>
        <Nuppu pose="vilkuttaa" size={110} />
      </header>

      <section aria-labelledby="palaute-otsikko" className="card feedback">
        <h2 id="palaute-otsikko">Kirjoita palautteesi</h2>
        {context && (
          <p className="notice notice--plain">
            Palaute koskee {context.kind} <strong>{context.name}</strong>. <Link to="/palaute">Haluatko antaa yleistä palautetta?</Link>
          </p>
        )}
        <div className="feedback__field">
          <label htmlFor={typeId}>Mitä palaute koskee?</label>
          <span className="select">
            <select id={typeId} value={type} onChange={(e) => setType(e.target.value as FeedbackType)}>
              {Object.entries(FEEDBACK_TYPES).map(([id, t]) => (
                <option key={id} value={id}>
                  {t.label}
                </option>
              ))}
            </select>
          </span>
        </div>
        <div className="feedback__field">
          <label htmlFor={textId}>Palautteesi</label>
          <p id={hintId} className="feedback__hint muted">
            {HINTS[type]} Enintään {FEEDBACK_MAX_LENGTH.toLocaleString('fi')} merkkiä.
          </p>
          <textarea id={textId} rows={7} maxLength={FEEDBACK_MAX_LENGTH} aria-describedby={hintId} value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <p className="notice notice--warning">
          Älä kirjoita palautteeseen salasanoja, API-avaimia tai muita henkilötietoja. Jos liität mukaan virheilmoituksen, tarkista, ettei siinä näy
          esimerkiksi omaa nimeäsi.
        </p>
      </section>

      <section aria-labelledby="lahetys-otsikko" className="card feedback">
        <h2 id="lahetys-otsikko">Lähetä palaute</h2>
        <p className="muted">
          Palaute ei lähde suoraan tältä sivulta. Valitse alta, kumpi tapa sopii sinulle: sivu avaa sen valmiiksi täytettynä, ja lähetät palautteen
          siellä.
        </p>
        <div className="feedback__options">
          <div className="feedback__option">
            <h3>GitHub</h3>
            <p>Tarvitset GitHub-tilin. Palaute näkyy kaikille, ja näet, miten se etenee.</p>
            <a className="button" href={issueUrl(feedback)} target="_blank" rel="noreferrer">
              Jatka GitHubiin
              <span className="visually-hidden"> (avautuu uuteen välilehteen)</span>
            </a>
          </div>
          <div className="feedback__option">
            <h3>Sähköposti</h3>
            <p>Et tarvitse tiliä. Palaute näkyy vain sivuston tekijälle.</p>
            <a className="button button--secondary" href={mailtoUrl(feedback)}>
              Jatka sähköpostiin
            </a>
            <p className="feedback__hint muted">
              Jos sähköpostiohjelmasi ei aukea, lähetä viesti osoitteeseen <strong>{FEEDBACK_EMAIL}</strong>.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
