import { useEffect, useRef, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router'
import { Icon } from '../components/Icon'
import { Nuppu } from '../components/Nuppu'
import { OsPicker } from '../components/OsPicker'
import { ThemeSelect } from '../components/ThemeSelect'
import { useProgress } from '../features/progress'
import { REPO_URL } from '../lib/feedback'
import './Layout.css'

const NAV_LINKS = [
  { to: '/', label: 'Etusivu', end: true },
  { to: '/polut', label: 'Oppimispolut', end: false },
  { to: '/sanasto', label: 'Sanasto', end: false },
  { to: '/vianmaaritys', label: 'Vianmääritys', end: false },
  { to: '/merkit', label: 'Merkit', end: false },
  { to: '/asetukset', label: 'Asetukset', end: false },
]

/**
 * Oppimispolut-linkki korostetaan myös yksittäisen polun ja aiheen sivuilla (/polku/…), koska ne ovat
 * sen alla. aria-current="page" jää vain itse valintasivulle, jotta ruudunlukija ei väitä väärää sivua.
 */
function navLinkClass(to: string, pathname: string): string {
  const inSection = to === '/polut' && pathname.startsWith('/polku/')
  return inSection ? 'site-nav__link site-nav__link--section' : 'site-nav__link'
}

export function Layout({ children }: { children: ReactNode }) {
  const { storageAvailable, storageCorrupted } = useProgress()
  const main = useRef<HTMLElement>(null)
  const location = useLocation()
  const firstRender = useRef(true)

  // Sivun vaihtuessa siirretään fokus uuden sivun otsikkoon ja vieritetään ylös
  // (ruudunlukijan käyttäjä kuulee, että sivu vaihtui).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    window.scrollTo?.(0, 0)
    const heading = main.current?.querySelector('h1')
    if (heading) {
      heading.setAttribute('tabindex', '-1')
      heading.focus({ preventScroll: true })
    }
  }, [location.pathname])

  return (
    <div className="layout">
      <a
        className="skip-link"
        href="#sisalto"
        onClick={(e) => {
          // HashRouter käyttää #-osaa reitteihin, joten hyppy tehdään itse.
          e.preventDefault()
          main.current?.focus()
        }}
      >
        Siirry sisältöön
      </a>
      <header className="site-header">
        <div className="site-header__inner">
          <NavLink to="/" className="site-header__brand">
            <Nuppu pose="kurkistaa" size={40} />
            <span className="site-header__name">Promptista projektiksi</span>
          </NavLink>
          <nav aria-label="Päävalikko" className="site-header__nav">
            <ul className="site-nav">
              {NAV_LINKS.map((l) => (
                <li key={l.to}>
                  <NavLink to={l.to} end={l.end} className={() => navLinkClass(l.to, location.pathname)}>
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="site-header__tools">
            <OsPicker compact />
            <ThemeSelect />
            <NavLink to="/palaute" className="button button--secondary button--small site-header__feedback">
              <Icon name="message" />
              Anna palautetta
            </NavLink>
          </div>
        </div>
      </header>
      <main id="sisalto" ref={main} tabIndex={-1} className="site-main">
        {!storageAvailable && (
          <p className="notice notice--warning" role="status">
            Selaimesi ei salli tallennusta (esimerkiksi yksityinen selausikkuna). Sivu toimii, mutta edistymisesi ei säily, kun suljet välilehden.
            Voit siirtää edistymisen talteen <NavLink to="/asetukset">asetuksista</NavLink>.
          </p>
        )}
        {storageCorrupted && (
          <p className="notice notice--warning" role="status">
            Aiemmin tallennettua edistymistä ei voitu lukea, joten aloitetaan alusta. Jos sinulla on siirtokoodi, voit tuoda sen{' '}
            <NavLink to="/asetukset">asetuksista</NavLink>.
          </p>
        )}
        {children}
      </main>
      <footer className="site-footer">
        <Nuppu pose="istuu" size={64} />
        <div className="site-footer__texts">
          <p className="site-footer__text">
            © 2026 Jeremia Vepsäläinen <span aria-hidden="true">·</span>{' '}
            <a href={REPO_URL} target="_blank" rel="noreferrer">
              GitHub
              <span className="visually-hidden"> (avautuu uuteen välilehteen)</span>
            </a>
          </p>
          <p className="site-footer__text">
            Avoin lähdekoodi (MIT). Ei evästeitä, ei seurantaa: edistymisesi tallentuu vain omaan selaimeesi.
          </p>
          <p className="site-footer__text">
            Löysitkö virheen tai keksitkö parannuksen? <NavLink to="/palaute">Anna palautetta</NavLink>
          </p>
        </div>
      </footer>
    </div>
  )
}
