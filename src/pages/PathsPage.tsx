import { useProgress } from '../features/progress'
import { useContent, useT } from '../i18n'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { PathCard } from './PathCard'
import './pages.css'

/**
 * Oppimispolkujen valinta (SUUNNITELMA.md luku 15.2). Polut tulevat sisällöstä
 * order-kentän mukaisessa järjestyksessä, joten uusi polku ilmestyy tänne ilman koodimuutoksia.
 */
export function PathsPage() {
  const t = useT()
  const { paths } = useContent()
  useDocumentTitle(t.paths.title)
  const { progress } = useProgress()
  return (
    <div className="paths-page">
      <h1>{t.paths.title}</h1>
      <p className="lead">{t.paths.lead}</p>
      {/* Lista: ruudunlukija kertoo polkujen määrän ("lista, 2 kohdetta"), mikä auttaa, kun polkuja on paljon. */}
      <ul className="path-grid">
        {paths.map((p) => (
          <li key={p.id} className="path-grid__item">
            <PathCard path={p} headingLevel={2} showAudience selected={p.id === progress.activePath} />
          </li>
        ))}
      </ul>
    </div>
  )
}
