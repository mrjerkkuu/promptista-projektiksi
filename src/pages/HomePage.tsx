import { Link } from 'react-router'
import { Icon } from '../components/Icon'
import { Nuppu } from '../components/Nuppu'
import { OsPicker } from '../components/OsPicker'
import { getPath, paths } from '../content'
import { getNextModule, hasAnyProgress, useProgress } from '../features/progress'
import { OS_LABEL } from '../lib/os'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { PathCard } from './PathCard'
import './pages.css'

export function HomePage() {
  useDocumentTitle()
  const { progress } = useProgress()
  const started = hasAnyProgress(progress)

  // Jatketaan valitulta polulta. Jos polkua ei ole valittu (tai sitä ei enää ole), ohjataan valintaan.
  const activePath = progress.activePath === null ? undefined : getPath(progress.activePath)
  const next = activePath ? getNextModule(progress, activePath.modules) : undefined
  const allDone = activePath !== undefined && !next
  // Polkuja on useita, joten valitun polun valmistuminen ei tarkoita, että kaikki olisi tehty.
  // Lasketaan joka kerta sisällöstä: kun uusi polku lisätään, se on vielä kesken, eikä tallennusta tarvitse muuttaa.
  const everyPathDone = allDone && paths.every((p) => !getNextModule(progress, p.modules))
  // Nuppu vilkuttaa etusivulla aina; polun valmistuttua se iloitsee.
  const pose = allDone ? 'iloitsee' : 'vilkuttaa'

  return (
    <>
      <section className="hero">
        <div className="hero__main">
          <h1 className="hero__title">Promptista projektiksi</h1>
          <p className="hero__lead">
            Opettele tekemään omia verkkosivuja ja sovelluksia tekoälyn kanssa. Et tarvitse aiempaa kokemusta: aloitetaan perusteista, ja
            päädytään siihen, että sinulla on oma projekti netissä.
          </p>
          {!activePath && (
            <p className="hero__cta-row">
              <Link className="button hero__cta" to="/polut">
                <span className="hero__cta-label">
                  Aloita tästä
                  <span className="visually-hidden">:</span>
                </span>{' '}
                <span className="hero__cta-module">
                  Valitse oppimispolku
                  <Icon name="arrowRight" />
                </span>
              </Link>
            </p>
          )}
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
          {allDone &&
            (everyPathDone ? (
              <p className="notice notice--success">Olet käynyt kaikki oppimispolut läpi. Mahtavaa työtä!</p>
            ) : (
              <p className="notice notice--success">
                Kävit polun ”{activePath.title}” läpi. Mahtavaa työtä! <Link to="/polut">Katso muut oppimispolut</Link>
              </p>
            ))}
        </div>
        <div className="hero__aside">
          <Nuppu pose={pose} size={150} wave />
          {/* Nupun SVG on koriste, joten esittely on tavallista tekstiä ruudunlukijalle. */}
          <p className="hero__nuppu-intro">
            {allDone ? (
              <>
                <strong>Jee, teit sen!</strong>{' '}
                {everyPathDone ? 'Kuljit kaikki polut loppuun asti.' : 'Kuljit polun loppuun asti.'} Olen tosi ylpeä sinusta.
              </>
            ) : (
              <>
                <strong>Moi, olen Nuppu!</strong> Kuljen mukanasi koko polun alusta loppuun.
              </>
            )}
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
        {activePath ? (
          <>
            <h2 id="polut-otsikko">Oppimispolkusi</h2>
            <PathCard path={activePath} headingLevel={3} />
            <p>
              <Link to="/polut">Kaikki oppimispolut</Link>
            </p>
          </>
        ) : (
          <>
            <h2 id="polut-otsikko">Oppimispolut</h2>
            <p>
              Valitse, mitä haluat oppia. <Link to="/polut">Katso oppimispolut</Link>
            </p>
          </>
        )}
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
