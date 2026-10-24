import type { Badge as BadgeData } from '../schemas/content'
import './Badge.css'

/** Merkkien viivakuvakkeet: tiedoston nimi = merkin tunniste. */
const ICONS = import.meta.glob<string>('../assets/merkit/*.svg', { query: '?raw', import: 'default', eager: true })

/** Merkin aihealue (väri), ks. design-handoff/assets/merkit/MERKIT.md. */
const BADGE_TOPIC: Record<string, number> = {
  'ensimmainen-komento': 0,
  kansiomestari: 0,
  'perusteet-hallussa': 0,
  'asennukset-kunnossa': 1,
  promptiseppa: 2,
  'turvallinen-ohjaaja': 2,
  'ensimmainen-commit': 3,
  vibekoodaaja: 3,
  julkaistu: 3,
}

interface BadgeIconProps {
  id: string
  badge: BadgeData
  earned: boolean
}

/** Pyöreä merkin kuvake. Uudella merkillä ilman SVG:tä näytetään sisällön emoji. */
export function BadgeIcon({ id, badge, earned }: BadgeIconProps) {
  const svg = ICONS[`../assets/merkit/${id}.svg`]
  const topic = BADGE_TOPIC[id] ?? 1
  const className = `badge__icon ${earned ? `badge__icon--topic-${topic}` : 'badge__icon--locked'}`
  if (svg) return <span className={className} aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />
  return (
    <span className={className} aria-hidden="true">
      {earned ? badge.icon : '🔒'}
    </span>
  )
}

interface BadgeProps {
  id: string
  badge: BadgeData
  earnedAt?: string
}

function formatEarned(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`
}

/** Yksi merkki: ansaittu tai vielä lukittu. */
export function Badge({ id, badge, earnedAt }: BadgeProps) {
  const earned = earnedAt !== undefined
  return (
    <article className={`badge ${earned ? 'badge--earned' : 'badge--locked'}`}>
      <BadgeIcon id={id} badge={badge} earned={earned} />
      <div className="badge__body">
        <h3 className="badge__title">
          {badge.title}
          {badge.bonus && <span className="badge__bonus"> (bonus)</span>}
        </h3>
        <p className="badge__description">{badge.description}</p>
        <p className="badge__state">
          {earned ? (
            <>
              <span aria-hidden="true">✓ </span>Ansaittu {formatEarned(earnedAt)}
            </>
          ) : (
            'Ei vielä ansaittu'
          )}
        </p>
      </div>
    </article>
  )
}
