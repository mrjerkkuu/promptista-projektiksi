import { Link } from 'react-router'
import { useT } from '../i18n'
import { Nuppu } from './Nuppu'
import './UnreviewedNotice.css'

interface UnreviewedNoticeProps {
  pathId: string
  /** Lyhyt versio polkukorttiin, pidempi polun sivulle ja ensimmäiseen aiheeseen. */
  compact?: boolean
}

/**
 * Nuppu kertoo, ettei sivuston tekijä ole vielä tarkastanut polkua (path.json: "reviewed": false).
 * Ilmoitus poistuu, kun kenttä poistetaan.
 */
export function UnreviewedNotice({ pathId, compact = false }: UnreviewedNoticeProps) {
  const { unreviewed: t } = useT()
  return (
    <aside className={`unreviewed${compact ? ' unreviewed--compact' : ''}`} aria-label={t.label}>
      <Nuppu pose="varoittaa" size={compact ? 56 : 80} />
      <div className="unreviewed__bubble">
        <p className="unreviewed__label">{t.label}</p>
        {compact ? <p>{t.compact}</p> : <p>{t.full((label) => <Link to={`/palaute?polku=${pathId}`}>{label}</Link>)}</p>}
      </div>
    </aside>
  )
}
