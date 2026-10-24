import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ProgressBar } from '../components/ProgressBar'
import { StatusLabel } from '../components/StatusLabel'
import { getPath, type TopicEntry } from '../content'
import { countProgress, getModuleStatus, useProgress } from '../features/progress'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { NotFoundPage } from './NotFoundPage'
import './pages.css'

export function PathPage() {
  const { pathId = '' } = useParams()
  const path = getPath(pathId)
  useDocumentTitle(path?.title)
  const { progress } = useProgress()
  if (!path) return <NotFoundPage />
  const count = countProgress(progress, path.modules)

  return (
    <div className="path-page">
      <h1>{path.title}</h1>
      <p className="lead">{path.description}</p>
      <div className="card card--small path-page__progress">
        <ProgressBar label="Koko polun edistyminen" count={count} />
      </div>
      <p className="muted">Suositeltu järjestys on alla, mutta voit aloittaa mistä tahansa. Valinnainen bonustehtävä ei vaikuta edistymiseen.</p>
      {path.topics.map((topic) => (
        <TopicSection key={topic.id} pathId={path.id} topic={topic} />
      ))}
    </div>
  )
}

/* Avatut aiheet muistetaan istunnon ajan (sessionStorage). Tämä on vain
   käyttömukavuutta, ei edistymistä: jos tallennus ei toimi, aiheet ovat kiinni. */
const OPEN_TOPICS_KEY = 'pp-open-topics'

function readOpenTopics(): string[] {
  try {
    const parsed: unknown = JSON.parse(sessionStorage.getItem(OPEN_TOPICS_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((k): k is string => typeof k === 'string') : []
  } catch {
    return []
  }
}

function saveTopicOpen(key: string, open: boolean) {
  try {
    const others = readOpenTopics().filter((k) => k !== key)
    sessionStorage.setItem(OPEN_TOPICS_KEY, JSON.stringify(open ? [...others, key] : others))
  } catch {
    // Tallennus estetty (esim. yksityinen ikkuna): aihe pysyy auki vain tällä sivulla.
  }
}

/** Aihe on aluksi suljettu; otsikon painike avaa ja sulkee moduulilistan. */
function TopicSection({ pathId, topic }: { pathId: string; topic: TopicEntry }) {
  const { progress } = useProgress()
  const openKey = `${pathId}/${topic.id}`
  const [open, setOpen] = useState(() => readOpenTopics().includes(openKey))
  const toggle = () => {
    saveTopicOpen(openKey, !open)
    setOpen(!open)
  }
  const count = countProgress(progress, topic.modules)
  const headingId = `aihe-${topic.id}`
  const panelId = `aihe-${topic.id}-moduulit`
  const tone = topic.number % 4
  return (
    <section className={`topic topic--${tone}`} aria-labelledby={headingId}>
      <div className="topic__head">
        <span className="topic__number mono" aria-hidden="true">
          {topic.number}
        </span>
        <div className="topic__intro">
          <h2 id={headingId}>
            <button
              type="button"
              className="topic__toggle"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={toggle}
            >
              <span>
                <span className="visually-hidden">{topic.number}.</span> {topic.title}
              </span>
              <span className="topic__chevron" aria-hidden="true" />
            </button>
          </h2>
          <p>{topic.description}</p>
        </div>
      </div>
      <ProgressBar label={`Edistyminen: ${topic.title}`} count={count} topic={topic.number} />
      <div id={panelId} className={open ? 'topic__panel topic__panel--open' : 'topic__panel'}>
        <div className="topic__panel-inner">
          <ol className="module-list">
            {topic.modules.map((m) => (
              <li key={m.id} className="module-list__item">
                <div className="module-list__main">
                  <Link to={`/polku/${m.pathId}/${m.id}`} className="module-list__link">
                    {m.optional && (
                      <span aria-hidden="true" className="module-list__star">
                        ★{' '}
                      </span>
                    )}
                    {m.number} {m.title}
                  </Link>
                  <p className="module-list__summary">
                    {m.optional && <strong>Valinnainen. </strong>}
                    {m.summary}
                  </p>
                </div>
                <StatusLabel status={getModuleStatus(progress, m)} />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
