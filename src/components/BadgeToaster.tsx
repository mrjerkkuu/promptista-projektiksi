import { useEffect } from 'react'
import { Link } from 'react-router'
import { badges } from '../content'
import { useProgress } from '../features/progress'
import './Badge.css'

const VISIBLE_MS = 7000

/** Ilmoittaa juuri ansaitusta merkistä. Animaatio kunnioittaa prefers-reduced-motion-asetusta (Badge.css). */
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
    const timer = window.setTimeout(onClose, VISIBLE_MS)
    return () => window.clearTimeout(timer)
  }, [onClose])
  if (!badge) return null
  return (
    <div className="badge-toast">
      <span className="badge__icon" aria-hidden="true">
        {badge.icon}
      </span>
      <div>
        <p>
          <strong>Uusi merkki: {badge.title}!</strong>
        </p>
        <p>
          {badge.description} <Link to="/merkit">Katso merkit</Link>
        </p>
      </div>
      <button type="button" className="button button--secondary button--small" onClick={onClose}>
        Sulje<span className="visually-hidden"> ilmoitus</span>
      </button>
    </div>
  )
}
