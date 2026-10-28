import { Suspense, useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { FeedbackPrompt } from '../components/FeedbackPrompt'
import { mdxComponents } from '../components/mdxComponents'
import { ModuleContext } from '../components/moduleContext'
import { Nuppu } from '../components/Nuppu'
import { OsPicker } from '../components/OsPicker'
import { StatusLabel } from '../components/StatusLabel'
import { UnreviewedNotice } from '../components/UnreviewedNotice'
import { countProgress, getModuleStatus, isQuizPassed, useProgress } from '../features/progress'
import { useContent, useLanguage, useT } from '../i18n'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { NotFoundPage } from './NotFoundPage'
import './pages.css'

export function ModulePage() {
  const { pathId = '', moduleId = '' } = useParams()
  const t = useT()
  const language = useLanguage()
  const path = useContent().getPath(pathId)
  const index = path?.modules.findIndex((m) => m.id === moduleId) ?? -1
  const module = path?.modules[index]
  useDocumentTitle(module ? `${module.number} ${module.title}` : undefined)
  const { progress, dispatch } = useProgress()

  useEffect(() => {
    if (!path || !module) return
    dispatch({ type: 'visitModule', key: module.key })
    // Polku osoitteesta, ei avaimesta: yhteisen aiheen kautta kävijä jatkaa sillä polulla, jota hän kulkee.
    dispatch({ type: 'selectPath', pathId: path.id })
  }, [path, module, dispatch])

  if (!path || !module) return <NotFoundPage />
  const place = { key: module.key, pathId: path.id, moduleId: module.id }

  const topic = path.topics.find((t) => t.id === module.topicId)!
  const prev = path.modules[index - 1]
  const next = path.modules[index + 1]
  const status = getModuleStatus(progress, module)
  const read = progress.modules[module.key]?.read ?? false
  const quizPassed = isQuizPassed(progress, module)
  const isAllComplete = (modules: typeof path.modules) => {
    const count = countProgress(progress, modules)
    return count.total > 0 && count.complete === count.total
  }
  // Palautetta pyydetään, kun tämä aihe viimeisteli aihealueen tai koko polun.
  const pathComplete = status === 'complete' && isAllComplete(path.modules)
  const topicComplete = status === 'complete' && isAllComplete(topic.modules)

  return (
    <article className="module reading">
      <nav aria-label={t.module.breadcrumb} className="breadcrumb">
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
          {module.optional && <span className="muted"> {t.module.optionalBonus}</span>}
        </p>
      </div>

      {/* Tarkastamattoman polun ilmoitus polun ensimmäisen aiheen alussa. */}
      {path.reviewed === false && index === 0 && <UnreviewedNotice pathId={path.id} />}

      {progress.os === null && (
        <div className="notice notice--plain module__os">
          <OsPicker />
          <p>{t.module.osPrompt}</p>
        </div>
      )}

      {/* Koko loppuosa odottaa tietopaketin latausta, jotta sivu ei hypi (CLS). */}
      <Suspense
        fallback={
          <p role="status" className="module__loading">
            <Nuppu pose="miettii" size={96} />
            {t.module.loading}
          </p>
        }
      >
        {/* Kääntämätön tietopaketti näytetään lähdekielellä, ja lang-attribuutti kertoo sen ruudunlukijalle. */}
        {module.contentLanguage !== language && <p className="notice notice--plain">{t.module.untranslated}</p>}
        <ModuleContext.Provider value={place}>
          <div className="module__content" lang={module.contentLanguage === language ? undefined : module.contentLanguage}>
            <module.Content components={mdxComponents} />
          </div>
        </ModuleContext.Provider>

        <section className="card module__done" aria-labelledby="valmis-otsikko">
          <h2 id="valmis-otsikko" className="module__done-title">
            {t.module.doneHeading}
          </h2>
          <div aria-live="polite">
            {status === 'complete' && <p className="notice notice--success notice--rise">{t.module.complete}</p>}
            {read && !quizPassed && <p className="notice notice--rise">{t.module.readNotPassed}</p>}
            {pathComplete ? (
              <FeedbackPrompt to={`/palaute?polku=${path.id}`}>{t.paths.pathDoneFeedback}</FeedbackPrompt>
            ) : (
              topicComplete && <FeedbackPrompt to={`/palaute?aihealue=${path.id}/${topic.id}`}>{t.module.topicDoneFeedback(topic.title)}</FeedbackPrompt>
            )}
          </div>
          <button type="button" className={`button ${read ? 'button--secondary button--small' : ''}`} aria-pressed={read} onClick={() => dispatch({ type: 'markRead', key: module.key, read: !read })}>
            {read ? t.module.unmarkRead : t.module.markRead}
          </button>
        </section>

        <p className="module__feedback muted">
          {t.module.feedback((label) => <Link to={`/palaute?moduuli=${module.key}`}>{label}</Link>)}
        </p>

        <nav aria-label={t.module.pager} className="pager">
          {prev ? (
            <Link to={`/polku/${path.id}/${prev.id}`} className="pager__link">
              <span className="pager__dir">
                <span aria-hidden="true">← </span>
                {t.module.previous}
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
                {t.module.next}
                <span aria-hidden="true"> →</span>
              </span>
              <span className="pager__title">
                {next.number} {next.title}
              </span>
            </Link>
          ) : (
            <Link to={`/polku/${path.id}`} className="pager__link pager__link--next">
              <span className="pager__dir">{t.module.pathEnd}</span>
              <span className="pager__title">{t.module.backToPath}</span>
            </Link>
          )}
        </nav>
      </Suspense>
    </article>
  )
}
