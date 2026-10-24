import type { Badge as BadgeData } from '../schemas/content'
import './Badge.css'

interface BadgeProps {
  badge: BadgeData
  earnedAt?: string
}

function formatEarned(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`
}

/** Yksi merkki: ansaittu tai vielä lukittu. */
export function Badge({ badge, earnedAt }: BadgeProps) {
  const earned = earnedAt !== undefined
  return (
    <article className={`badge ${earned ? 'badge--earned' : 'badge--locked'}`}>
      <span className="badge__icon" aria-hidden="true">
        {earned ? badge.icon : '🔒'}
      </span>
      <div>
        <h3 className="badge__title">
          {badge.title}
          {badge.bonus && <span className="badge__bonus"> (bonus)</span>}
        </h3>
        <p className="badge__description">{badge.description}</p>
        <p className="badge__state">{earned ? `Ansaittu ${formatEarned(earnedAt)}` : 'Ei vielä ansaittu'}</p>
      </div>
    </article>
  )
}
