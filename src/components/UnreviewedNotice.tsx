import { Link } from 'react-router'
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
  return (
    <aside className={`unreviewed${compact ? ' unreviewed--compact' : ''}`} aria-label="Ei vielä tarkastettu">
      <Nuppu pose="miettii" size={compact ? 56 : 80} />
      <div className="unreviewed__bubble">
        <p className="unreviewed__label">Ei vielä tarkastettu</p>
        {compact ? (
          <p>Tämä polku on uusi, eikä sivuston tekijä ole vielä käynyt sitä läpi. Ohjeissa voi olla virheitä.</p>
        ) : (
          <p>
            Moi, Nuppu tässä! Tämä polku on aivan uusi, eikä sivuston tekijä ole vielä käynyt sitä läpi. Ohjeissa voi olla virheitä tai
            kohtia, jotka eivät vastaa sovellusta. Jos huomaat jotain outoa, <Link to={`/palaute?polku=${pathId}`}>kerro siitä</Link>, niin
            autat korjaamaan polun.
          </p>
        )}
      </div>
    </aside>
  )
}
