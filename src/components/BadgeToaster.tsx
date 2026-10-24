import { useEffect } from 'react'
import { Link } from 'react-router'
import { badges } from '../content'
import { useProgress } from '../features/progress'
import { BadgeIcon } from './Badge'
import './Badge.css'

/** Varakesto, jos tokenia ei voi lukea (esim. testit ilman CSS:ää). */
const FALLBACK_MS = 7000

/** Näkymisaika tokenista --duration-toast (tokens.css), esim. "7s" tai "7000ms". */
function visibleMs(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--duration-toast').trim()
  const value = Number.parseFloat(raw)
  if (Number.isNaN(value) || value <= 0) return FALLBACK_MS
  return raw.endsWith('ms') ? value : value * 1000
}

/** Ilmoittaa juuri ansaitusta merkistä. Animaatio kunnioittaa prefers-reduced-motion-asetusta (base.css). */
export function BadgeToaster() {
  const { announcements, dismissAnnouncement } = useProgress()
  return (
    <div className="badge-toasts" role="status" aria-live="polite">
      {announcements.map((id) => (
        <BadgeToast key={id} id={id} onClose={() => dismissAnnouncement(id)} />
      ))}
    </div>
  )
}

function BadgeToast({ id, onClose }: { id: string; onClose: () => void }) {
  const badge = badges[id]
  useEffect(() => {
    const timer = window.setTimeout(onClose, visibleMs())
    return () => window.clearTimeout(timer)
  }, [onClose])
  if (!badge) return null
  return (
    <div className="badge-toast">
      <BadgeIcon id={id} badge={badge} earned />
      <div className="badge-toast__body">
        <p className="badge-toast__title">
          <strong>Uusi merkki: {badge.title}!</strong>
        </p>
        <p className="badge-toast__description">{badge.description}</p>
        <div className="badge-toast__actions">
          <Link to="/merkit">Katso merkit</Link>
          <button type="button" className="button button--secondary button--small" onClick={onClose}>
            Sulje<span className="visually-hidden"> ilmoitus</span>
          </button>
        </div>
      </div>
    </div>
  )
}
