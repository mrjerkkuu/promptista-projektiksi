import { Link } from 'react-router'
import { Icon } from '../components/Icon'
import { Nuppu } from '../components/Nuppu'
import { OsPicker } from '../components/OsPicker'
import { paths } from '../content'
import { getNextModule, hasAnyProgress, useProgress } from '../features/progress'
import { OS_LABEL } from '../lib/os'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { PathCard } from './PathCard'
import './pages.css'

export function HomePage() {
  useDocumentTitle()
  const { progress } = useProgress()
  const started = hasAnyProgress(progress)

  // Jatketaan polulta, jolla on jo edistymistä; muuten ensimmäiseltä polulta.
  const activePath = paths.find((p) => p.modules.some((m) => progress.modules[m.key])) ?? paths[0]
  const next = activePath ? getNextModule(progress, activePath.modules) : undefined
  const allDone = activePath && !next
  const pose = allDone ? 'iloitsee' : progress.os === null ? 'vilkuttaa' : 'osoittaa'

  return (
    <>
      <section className="hero">
        <div className="hero__main">
          <h1 className="hero__title">Promptista projektiksi</h1>
          <p className="hero__lead">
            Opettele tekemään omia verkkosivuja ja sovelluksia tekoälyn kanssa. Et tarvitse aiempaa kokemusta: aloitetaan siitä, mikä terminaali
            on, ja päädytään siihen, että sinulla on oma projekti netissä.
          </p>
          {next && (
            <p className="hero__cta-row">
              {/* Kaksirivinen painike. Kaksoispiste on vain ruudunlukijalle, jotta nimi kuuluu yhtenä lauseena. */}
              <Link className="button hero__cta" to={`/polku/${next.pathId}/${next.id}`}>
                <span className="hero__cta-label">
                  {started ? 'Jatka siitä mihin jäit' : 'Aloita tästä'}
                  <span className="visually-hidden">:</span>
                </span>{' '}
                <span className="hero__cta-module">
                  {next.number} {next.title}
                  <Icon name="arrowRight" />
                </span>
              </Link>
            </p>
          )}
          {allDone && <p className="notice notice--success">Olet käynyt koko polun läpi. Mahtavaa työtä!</p>}
        </div>
        <div className="hero__aside">
          <Nuppu pose={pose} size={150} float />
          {/* Nupun SVG on koriste, joten esittely on tavallista tekstiä ruudunlukijalle. */}
          <p className="hero__nuppu-intro">
            <strong>Moi, olen Nuppu!</strong> Kuljen mukanasi koko polun alusta loppuun.
          </p>
          {progress.os === null ? (
            <div className="hero__os-picker">
              <OsPicker />
              <p className="muted">Näytämme ohjeet vain valitsemallesi käyttöjärjestelmälle. Voit vaihtaa valintaa myöhemmin yläpalkista.</p>
            </div>
          ) : (
            <p className="hero__os">
              Näet ohjeet <strong>{OS_LABEL[progress.os]}-koneelle</strong>. Voit vaihtaa valintaa yläpalkista.
            </p>
          )}
        </div>
      </section>

      <section aria-labelledby="polut-otsikko" className="home-section">
        <h2 id="polut-otsikko">Oppimispolut</h2>
        {paths.map((p) => (
          <PathCard key={p.id} path={p} headingLevel={3} />
        ))}
      </section>

      <section aria-labelledby="miten-otsikko" className="home-section">
        <h2 id="miten-otsikko">Näin tämä toimii</h2>
        <ul className="how-list">
          <li className="how-list__item">
            <span className="how-list__number how-list__number--0" aria-hidden="true">
              1
            </span>
            <span>Jokainen aihe on lyhyt tietopaketti ja jotain tekemistä: komento, harjoitus tai visa.</span>
          </li>
          <li className="how-list__item">
            <span className="how-list__number how-list__number--1" aria-hidden="true">
              2
            </span>
            <span>Suositeltu järjestys on valmiina, mutta voit hypätä mihin tahansa aiheeseen.</span>
          </li>
          <li className="how-list__item">
            <span className="how-list__number how-list__number--2" aria-hidden="true">
              3
            </span>
            <span>Edistymisesi tallentuu vain tähän selaimeen. Kirjautumista ei tarvita.</span>
          </li>
          <li className="how-list__item">
            <span className="how-list__number how-list__number--3" aria-hidden="true">
              4
            </span>
            <span>
              Jos jokin menee pieleen, katso <Link to="/vianmaaritys">vianmääritys</Link>. Outo sana? <Link to="/sanasto">Sanasto</Link> auttaa.
            </span>
          </li>
        </ul>
      </section>
    </>
  )
}
