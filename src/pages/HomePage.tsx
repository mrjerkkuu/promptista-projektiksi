import { Link } from 'react-router'
import { Icon } from '../components/Icon'
import { Nuppu } from '../components/Nuppu'
import { OsPicker } from '../components/OsPicker'
import { getNextModule, hasAnyProgress, useProgress } from '../features/progress'
import { useContent, useT } from '../i18n'
import { OS_LABEL } from '../lib/os'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { PathCard } from './PathCard'
import './pages.css'

export function HomePage() {
  useDocumentTitle()
  const { progress } = useProgress()
  const t = useT()
  const { getPath, paths } = useContent()
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
          <h1 className="hero__title">{t.siteName}</h1>
          <p className="hero__lead">{t.home.lead}</p>
          {!activePath && (
            <p className="hero__cta-row">
              <Link className="button hero__cta" to="/polut">
                <span className="hero__cta-label">
                  {t.home.startHere}
                  <span className="visually-hidden">:</span>
                </span>{' '}
                <span className="hero__cta-module">
                  {t.home.choosePath}
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
                  {started ? t.home.continue : t.home.startHere}
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
              <p className="notice notice--success">{t.home.allPathsDone}</p>
            ) : (
              <p className="notice notice--success">{t.home.pathDone(activePath.title, (label) => <Link to="/polut">{label}</Link>)}</p>
            ))}
        </div>
        <div className="hero__aside">
          <Nuppu pose={pose} size={150} wave />
          {/* Nupun SVG on koriste, joten esittely on tavallista tekstiä ruudunlukijalle. */}
          <p className="hero__nuppu-intro">
            {allDone ? (
              <>
                <strong>{t.home.nuppuDoneTitle}</strong> {everyPathDone ? t.home.nuppuDoneAll : t.home.nuppuDonePath} {t.home.nuppuProud}
              </>
            ) : (
              <>
                <strong>{t.home.nuppuHello}</strong> {t.home.nuppuIntro}
              </>
            )}
          </p>
          {progress.os === null ? (
            <div className="hero__os-picker">
              <OsPicker />
              <p className="muted">{t.home.osPickerNote}</p>
            </div>
          ) : (
            <p className="hero__os">{t.home.osChosen(OS_LABEL[progress.os])}</p>
          )}
        </div>
      </section>

      <section aria-labelledby="polut-otsikko" className="home-section">
        {activePath ? (
          <>
            <h2 id="polut-otsikko">{t.home.yourPath}</h2>
            <PathCard path={activePath} headingLevel={3} />
            <p>
              <Link to="/polut">{t.home.allPaths}</Link>
            </p>
          </>
        ) : (
          <>
            <h2 id="polut-otsikko">{t.home.paths}</h2>
            <p>{t.home.choosePrompt((label) => <Link to="/polut">{label}</Link>)}</p>
          </>
        )}
      </section>

      <section aria-labelledby="miten-otsikko" className="home-section">
        <h2 id="miten-otsikko">{t.home.howHeading}</h2>
        <ul className="how-list">
          {[
            ...t.home.how,
            t.home.howHelp(
              (label) => <Link to="/vianmaaritys">{label}</Link>,
              (label) => <Link to="/sanasto">{label}</Link>,
            ),
          ].map((item, i) => (
            <li key={i} className="how-list__item">
              <span className={`how-list__number how-list__number--${i % 4}`} aria-hidden="true">
                {i + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
