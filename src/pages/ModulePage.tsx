import { Suspense, useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { mdxComponents } from '../components/mdxComponents'
import { ModuleContext } from '../components/moduleContext'
import { Nuppu } from '../components/Nuppu'
import { OsPicker } from '../components/OsPicker'
import { StatusLabel } from '../components/StatusLabel'
import { getPath } from '../content'
import { getModuleStatus, isQuizPassed, useProgress } from '../features/progress'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { NotFoundPage } from './NotFoundPage'
import './pages.css'

export function ModulePage() {
  const { pathId = '', moduleId = '' } = useParams()
  const path = getPath(pathId)
  const index = path?.modules.findIndex((m) => m.id === moduleId) ?? -1
  const module = path?.modules[index]
  useDocumentTitle(module ? `${module.number} ${module.title}` : undefined)
  const { progress, dispatch } = useProgress()

  useEffect(() => {
    if (module) dispatch({ type: 'visitModule', key: module.key })
  }, [module, dispatch])

  if (!path || !module) return <NotFoundPage />

  const topic = path.topics.find((t) => t.id === module.topicId)!
  const prev = path.modules[index - 1]
  const next = path.modules[index + 1]
  const status = getModuleStatus(progress, module)
  const read = progress.modules[module.key]?.read ?? false
  const quizPassed = isQuizPassed(progress, module)

  return (
    <article className="module reading">
      <nav aria-label="Murupolku" className="breadcrumb">
        <Link to={`/polku/${path.id}`}>{path.title}</Link>
        <span aria-hidden="true"> › </span>
        <span>
          {topic.number}. {topic.title}
        </span>
      </nav>
      {/* Otsikko ennen tilaa DOM:ssa (fokus siirtyy h1:een), mutta tilarivi näkyy otsikon yläpuolella. */}
      <div className="module__header">
        <h1>
          {module.optional && <span aria-hidden="true">★ </span>}
          {module.number} {module.title}
        </h1>
        <p className="module__meta">
          <span className={`topic-badge topic-badge--${topic.number % 4} mono`} aria-hidden="true">
            {topic.number}
          </span>
          <StatusLabel status={status} />
          {module.optional && <span className="muted"> Valinnainen bonustehtävä</span>}
        </p>
      </div>

      {progress.os === null && (
        <div className="notice notice--plain module__os">
          <OsPicker />
          <p>Kun valitset käyttöjärjestelmän, näet vain sinua koskevat ohjeet.</p>
        </div>
      )}

      {/* Koko loppuosa odottaa tietopaketin latausta, jotta sivu ei hypi (CLS). */}
      <Suspense
        fallback={
          <p role="status" className="module__loading">
            <Nuppu pose="miettii" size={96} />
            Ladataan tietopakettia…
          </p>
        }
      >
        <ModuleContext.Provider value={module.key}>
          <div className="module__content">
            <module.Content components={mdxComponents} />
          </div>
        </ModuleContext.Provider>

        <section className="card module__done" aria-labelledby="valmis-otsikko">
          <h2 id="valmis-otsikko" className="module__done-title">
            Valmista?
          </h2>
          <div aria-live="polite">
            {status === 'complete' && <p className="notice notice--success notice--rise">Tämä aihe on valmis!</p>}
            {read && !quizPassed && <p className="notice notice--rise">Merkitsit tämän luetuksi. Aihe on valmis, kun olet vastannut visan kaikkiin kysymyksiin oikein.</p>}
          </div>
          <button type="button" className={`button ${read ? 'button--secondary button--small' : ''}`} aria-pressed={read} onClick={() => dispatch({ type: 'markRead', key: module.key, read: !read })}>
            {read ? 'Luettu ✓ (peru merkintä)' : 'Olen lukenut tämän'}
          </button>
        </section>

        <nav aria-label="Edellinen ja seuraava aihe" className="pager">
          {prev ? (
            <Link to={`/polku/${path.id}/${prev.id}`} className="pager__link">
              <span className="pager__dir">
                <span aria-hidden="true">← </span>Edellinen
              </span>
              <span className="pager__title">
                {prev.number} {prev.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link to={`/polku/${path.id}/${next.id}`} className="pager__link pager__link--next">
              <span className="pager__dir">
                Seuraava<span aria-hidden="true"> →</span>
              </span>
              <span className="pager__title">
                {next.number} {next.title}
              </span>
            </Link>
          ) : (
            <Link to={`/polku/${path.id}`} className="pager__link pager__link--next">
              <span className="pager__dir">Polun loppu</span>
              <span className="pager__title">Takaisin polun etusivulle</span>
            </Link>
          )}
        </nav>
      </Suspense>
    </article>
  )
}
