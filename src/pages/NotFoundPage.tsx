import { Link } from 'react-router'
import { Nuppu } from '../components/Nuppu'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import './pages.css'

export function NotFoundPage() {
  useDocumentTitle('Sivua ei löytynyt')
  return (
    <section className="not-found">
      <Nuppu pose="miettii" size={160} />
      <span className="not-found__code mono" aria-hidden="true">
        404
      </span>
      <h1>Sivua ei löytynyt</h1>
      <p>Etsimääsi sivua ei ole olemassa. Ehkä linkki on vanhentunut.</p>
      <p>
        <Link to="/" className="button">
          Palaa etusivulle
        </Link>
      </p>
    </section>
  )
}
