import { useEffect, useRef, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router'
import { Icon } from '../components/Icon'
import { LanguageToggle } from '../components/LanguageSelect'
import { Nuppu } from '../components/Nuppu'
import { OsPicker } from '../components/OsPicker'
import { ThemeSelect } from '../components/ThemeSelect'
import { useProgress } from '../features/progress'
import { useT, type UiStrings } from '../i18n'
import { REPO_URL } from '../lib/feedback'
import './Layout.css'

const NAV_LINKS: { to: string; label: keyof UiStrings['layout']['nav']; end: boolean }[] = [
  { to: '/', label: 'home', end: true },
  { to: '/polut', label: 'paths', end: false },
  { to: '/sanasto', label: 'glossary', end: false },
  { to: '/vianmaaritys', label: 'troubleshooting', end: false },
  { to: '/merkit', label: 'badges', end: false },
  { to: '/asetukset', label: 'settings', end: false },
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
  const t = useT()
  const settingsLink = (label: ReactNode) => <NavLink to="/asetukset">{label}</NavLink>
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
        {t.layout.skipLink}
      </a>
      <header className="site-header">
        <div className="site-header__inner">
          <NavLink to="/" className="site-header__brand">
            <Nuppu pose="kurkistaa" size={40} />
            <span className="site-header__name">{t.siteName}</span>
          </NavLink>
          <nav aria-label={t.layout.mainNav} className="site-header__nav">
            <ul className="site-nav">
              {NAV_LINKS.map((l) => (
                <li key={l.to}>
                  <NavLink to={l.to} end={l.end} className={() => navLinkClass(l.to, location.pathname)}>
                    {t.layout.nav[l.label]}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="site-header__tools">
            <LanguageToggle />
            <OsPicker compact />
            <ThemeSelect />
            <NavLink to="/palaute" className="button button--secondary button--small site-header__feedback">
              <Icon name="message" />
              {t.layout.feedback}
            </NavLink>
          </div>
        </div>
      </header>
      <main id="sisalto" ref={main} tabIndex={-1} className="site-main">
        {!storageAvailable && (
          <p className="notice notice--warning" role="status">
            {t.layout.storageUnavailable(settingsLink)}
          </p>
        )}
        {storageCorrupted && (
          <p className="notice notice--warning" role="status">
            {t.layout.storageCorrupted(settingsLink)}
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
              <span className="visually-hidden">{t.newTab}</span>
            </a>
          </p>
          <p className="site-footer__text">{t.layout.footerLicense}</p>
          <p className="site-footer__text">{t.layout.footerFeedback((label) => <NavLink to="/palaute">{label}</NavLink>)}</p>
        </div>
      </footer>
    </div>
  )
}
