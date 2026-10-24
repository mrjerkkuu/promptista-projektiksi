import { Link } from 'react-router'
import { OsPicker } from '../components/OsPicker'
import { ProgressBar } from '../components/ProgressBar'
import { paths, type LearningPath } from '../content'
import { countProgress, getNextModule, hasAnyProgress, useProgress } from '../features/progress'
import { OS_LABEL } from '../lib/os'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import './pages.css'

export function HomePage() {
  useDocumentTitle()
  const { progress } = useProgress()
  const started = hasAnyProgress(progress)

  // Jatketaan polulta, jolla on jo edistymistä; muuten ensimmäiseltä polulta.
  const activePath = paths.find((p) => p.modules.some((m) => progress.modules[m.key])) ?? paths[0]
  const next = activePath ? getNextModule(progress, activePath.modules) : undefined

  return (
    <>
      <section className="hero">
        <h1>Promptista projektiksi</h1>
        <p className="hero__lead">
          Opettele tekemään omia verkkosivuja ja sovelluksia tekoälyn kanssa. Et tarvitse aiempaa kokemusta: aloitetaan siitä, mikä terminaali
          on, ja päädytään siihen, että sinulla on oma projekti netissä.
        </p>
        {progress.os === null ? (
          <div className="card">
            <OsPicker />
            <p className="muted">Näytämme ohjeet vain valitsemallesi käyttöjärjestelmälle. Voit vaihtaa valintaa myöhemmin yläpalkista.</p>
          </div>
        ) : (
          <p className="muted">
            Näet ohjeet {OS_LABEL[progress.os]}-koneelle. Voit vaihtaa valintaa yläpalkista.
          </p>
        )}
        {next && (
          <p>
            <Link className="button hero__cta" to={`/polku/${next.pathId}/${next.id}`}>
              {started ? 'Jatka siitä mihin jäit' : 'Aloita tästä'}
              <span className="hero__cta-detail">
                : {next.number} {next.title}
              </span>
            </Link>
          </p>
        )}
        {activePath && !next && <p className="notice notice--success">Olet käynyt koko polun läpi. Mahtavaa työtä!</p>}
      </section>

      <section aria-labelledby="polut-otsikko">
        <h2 id="polut-otsikko">Oppimispolut</h2>
        {paths.map((p) => (
          <PathCard key={p.id} path={p} />
        ))}
      </section>

      <section aria-labelledby="miten-otsikko">
        <h2 id="miten-otsikko">Näin tämä toimii</h2>
        <ul>
          <li>Jokainen aihe on lyhyt tietopaketti ja jotain tekemistä: komento, harjoitus tai visa.</li>
          <li>Suositeltu järjestys on valmiina, mutta voit hypätä mihin tahansa aiheeseen.</li>
          <li>Edistymisesi tallentuu vain tähän selaimeen. Kirjautumista ei tarvita.</li>
          <li>
            Jos jokin menee pieleen, katso <Link to="/vianmaaritys">vianmääritys</Link>. Outo sana? <Link to="/sanasto">Sanasto</Link> auttaa.
          </li>
        </ul>
      </section>
    </>
  )
}

function PathCard({ path }: { path: LearningPath }) {
  const { progress } = useProgress()
  const count = countProgress(progress, path.modules)
  return (
    <article className="card">
      <h3 className="card__title">
        <Link to={`/polku/${path.id}`}>{path.title}</Link>
      </h3>
      <p>{path.description}</p>
      <ProgressBar label={`Edistyminen: ${path.title}`} count={count} />
    </article>
  )
}
