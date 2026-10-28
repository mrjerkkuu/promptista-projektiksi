import { useId, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Nuppu } from '../components/Nuppu'
import type { Content } from '../content'
import { useProgress } from '../features/progress'
import { useContent, useLanguage, useT, type UiStrings } from '../i18n'
import { FEEDBACK_EMAIL, FEEDBACK_MAX_LENGTH, FEEDBACK_MESSAGES, FEEDBACK_TYPES, issueUrl, mailtoUrl, type FeedbackType } from '../lib/feedback'
import { OS_LABEL } from '../lib/os'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import './pages.css'

/** Sivuston sisäisen reitin koko osoite (HashRouter: reitti on #-osassa). */
function absoluteUrl(route: string) {
  return new URL(`#${route}`, window.location.href).href
}

interface FeedbackContext {
  /** ”Palaute koskee <kind> <name>.” */
  kind: 'module' | 'topic' | 'path'
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
function getContext(params: URLSearchParams, { getModuleByKey, getPath }: Content, t: UiStrings['feedback']): FeedbackContext | undefined {
  const module = getModuleByKey(params.get('moduuli') ?? '')
  if (module) {
    const name = `${module.number} ${module.title}`
    return { kind: 'module', name, page: `${name} – ${absoluteUrl(`/polku/${module.pathId}/${module.id}`)}`, defaultType: 'virhe' }
  }
  const [topicPathId, topicId] = (params.get('aihealue') ?? '').split('/')
  const topic = getPath(topicPathId)?.topics.find((x) => x.id === topicId)
  if (topic) {
    const name = `${topic.number}. ${topic.title}`
    return { kind: 'topic', name, page: `${t.topicPage(name)} – ${absoluteUrl(`/polku/${topicPathId}`)}`, defaultType: 'idea' }
  }
  const path = getPath(params.get('polku') ?? '')
  if (path) {
    return { kind: 'path', name: path.title, page: `${t.pathPage(path.title)} – ${absoluteUrl(`/polku/${path.id}`)}`, defaultType: 'idea' }
  }
  return undefined
}

export function FeedbackPage() {
  const { feedback: t, newTab } = useT()
  const language = useLanguage()
  useDocumentTitle(t.title)
  const [searchParams] = useSearchParams()
  const context = getContext(searchParams, useContent(), t)
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
    language,
  }

  return (
    <div className="reading">
      <header className="page-header">
        <div className="page-header__text">
          <h1>{t.title}</h1>
          <p>{t.intro}</p>
        </div>
        <Nuppu pose="vilkuttaa" size={110} />
      </header>

      <section aria-labelledby="palaute-otsikko" className="card feedback">
        <h2 id="palaute-otsikko">{t.writeHeading}</h2>
        {context && <p className="notice notice--plain">{t.about(context.kind, context.name, (label) => <Link to="/palaute">{label}</Link>)}</p>}
        <div className="feedback__field">
          <label htmlFor={typeId}>{t.typeLabel}</label>
          <span className="select">
            <select id={typeId} value={type} onChange={(e) => setType(e.target.value as FeedbackType)}>
              {Object.keys(FEEDBACK_TYPES).map((id) => (
                <option key={id} value={id}>
                  {FEEDBACK_MESSAGES[language].types[id as FeedbackType].label}
                </option>
              ))}
            </select>
          </span>
        </div>
        <div className="feedback__field">
          <label htmlFor={textId}>{t.textLabel}</label>
          <p id={hintId} className="feedback__hint muted">
            {t.hints[type]} {t.maxLength(FEEDBACK_MAX_LENGTH.toLocaleString(language))}
          </p>
          <textarea id={textId} rows={7} maxLength={FEEDBACK_MAX_LENGTH} aria-describedby={hintId} value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <p className="notice notice--warning">{t.privacy}</p>
      </section>

      <section aria-labelledby="lahetys-otsikko" className="card feedback">
        <h2 id="lahetys-otsikko">{t.sendHeading}</h2>
        <p className="muted">{t.sendIntro}</p>
        <div className="feedback__options">
          <div className="feedback__option">
            <h3>GitHub</h3>
            <p>{t.githubText}</p>
            <a className="button" href={issueUrl(feedback)} target="_blank" rel="noreferrer">
              {t.githubButton}
              <span className="visually-hidden">{newTab}</span>
            </a>
          </div>
          <div className="feedback__option">
            <h3>{t.emailHeading}</h3>
            <p>{t.emailText}</p>
            <a className="button button--secondary" href={mailtoUrl(feedback)}>
              {t.emailButton}
            </a>
            <p className="feedback__hint muted">{t.emailFallback(FEEDBACK_EMAIL)}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
