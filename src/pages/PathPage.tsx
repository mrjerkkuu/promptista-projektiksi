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
        <TopicSection key={topic.id} topic={topic} />
      ))}
    </div>
  )
}

function TopicSection({ topic }: { topic: TopicEntry }) {
  const { progress } = useProgress()
  const count = countProgress(progress, topic.modules)
  const headingId = `aihe-${topic.id}`
  const tone = topic.number % 4
  return (
    <section className={`topic topic--${tone}`} aria-labelledby={headingId}>
      <div className="topic__head">
        <span className="topic__number mono" aria-hidden="true">
          {topic.number}
        </span>
        <div className="topic__intro">
          <h2 id={headingId}>
            <span className="visually-hidden">{topic.number}.</span> {topic.title}
          </h2>
          <p>{topic.description}</p>
        </div>
      </div>
      <ProgressBar label={`Edistyminen: ${topic.title}`} count={count} topic={topic.number} />
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
    </section>
  )
}
