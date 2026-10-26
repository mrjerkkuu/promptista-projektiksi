import { paths } from '../content'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { PathCard } from './PathCard'
import './pages.css'

/**
 * Oppimispolkujen valinta (SUUNNITELMA.md luku 15.2). Polut tulevat sisällöstä
 * order-kentän mukaisessa järjestyksessä, joten uusi polku ilmestyy tänne ilman koodimuutoksia.
 */
export function PathsPage() {
  useDocumentTitle('Oppimispolut')
  return (
    <div className="paths-page">
      <h1>Oppimispolut</h1>
      <p className="lead">
        Valitse, mitä haluat oppia. Jokainen polku alkaa alusta, joten aiempaa kokemusta ei tarvita. Voit vaihtaa polkua milloin tahansa, eikä
        edistymisesi katoa.
      </p>
      {paths.map((p) => (
        <PathCard key={p.id} path={p} headingLevel={2} showAudience />
      ))}
    </div>
  )
}
