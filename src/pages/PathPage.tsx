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
    <>
      <h1>{path.title}</h1>
      <p>{path.description}</p>
      <ProgressBar label="Koko polun edistyminen" count={count} />
      <p className="muted">Suositeltu järjestys on alla, mutta voit aloittaa mistä tahansa. Valinnainen bonustehtävä ei vaikuta edistymiseen.</p>
      {path.topics.map((topic) => (
        <TopicSection key={topic.id} topic={topic} />
      ))}
    </>
  )
}

function TopicSection({ topic }: { topic: TopicEntry }) {
  const { progress } = useProgress()
  const count = countProgress(progress, topic.modules)
  const headingId = `aihe-${topic.id}`
  return (
    <section className="topic" aria-labelledby={headingId}>
      <h2 id={headingId}>
        {topic.number}. {topic.title}
      </h2>
      <p>{topic.description}</p>
      <ProgressBar label={`Edistyminen: ${topic.title}`} count={count} />
      <ol className="module-list">
        {topic.modules.map((m) => (
          <li key={m.id} className="module-list__item">
            <div className="module-list__main">
              <Link to={`/polku/${m.pathId}/${m.id}`} className="module-list__link">
                {m.optional && <span aria-hidden="true">★ </span>}
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
