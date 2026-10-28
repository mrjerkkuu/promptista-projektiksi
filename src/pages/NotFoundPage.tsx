import { Link } from 'react-router'
import { Nuppu } from '../components/Nuppu'
import { useT } from '../i18n'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import './pages.css'

export function NotFoundPage() {
  const t = useT()
  useDocumentTitle(t.notFound.title)
  return (
    <section className="not-found">
      <Nuppu pose="miettii" size={160} />
      <span className="not-found__code mono" aria-hidden="true">
        404
      </span>
      <h1>{t.notFound.title}</h1>
      <p>{t.notFound.text}</p>
      <p>
        <Link to="/" className="button">
          {t.notFound.back}
        </Link>
      </p>
    </section>
  )
}
