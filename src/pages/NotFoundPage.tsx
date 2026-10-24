import { Link } from 'react-router'
import { useDocumentTitle } from '../lib/useDocumentTitle'

export function NotFoundPage() {
  useDocumentTitle('Sivua ei löytynyt')
  return (
    <>
      <h1>Sivua ei löytynyt</h1>
      <p>Etsimääsi sivua ei ole olemassa. Ehkä linkki on vanhentunut.</p>
      <p>
        <Link to="/">Palaa etusivulle</Link>
      </p>
    </>
  )
}
