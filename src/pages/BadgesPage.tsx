import { Badge } from '../components/Badge'
import { Nuppu } from '../components/Nuppu'
import { badges } from '../content'
import { useProgress } from '../features/progress'
import { useDocumentTitle } from '../lib/useDocumentTitle'

export function BadgesPage() {
  useDocumentTitle('Merkit')
  const { progress } = useProgress()
  const list = Object.entries(badges)
  const main = list.filter(([, b]) => !b.bonus)
  const bonus = list.filter(([, b]) => b.bonus)
  const earned = list.filter(([id]) => progress.badges[id]).length
  const pose = earned === 0 ? 'lepaa' : earned === list.length ? 'iloitsee' : 'mitali'
  return (
    <>
      <header className="page-header">
        {/* Nukkuva Nuppu ei kellu. */}
        <Nuppu pose={pose} size={120} float={pose !== 'lepaa'} />
        <div className="page-header__text">
          <h1>Merkit</h1>
          <p>
            Merkkejä saat, kun etenet polulla, teet harjoituksia ja saat asennukset kuntoon. Olet ansainnut{' '}
            <strong className="mono">
              {earned}/{list.length}
            </strong>{' '}
            merkkiä.
          </p>
        </div>
      </header>
      <h2>Polun merkit</h2>
      <div className="badge-grid">
        {main.map(([id, b]) => (
          <Badge key={id} id={id} badge={b} earnedAt={progress.badges[id]} />
        ))}
      </div>
      {bonus.length > 0 && (
        <>
          <h2>Bonusmerkit</h2>
          <div className="badge-grid">
            {bonus.map(([id, b]) => (
              <Badge key={id} id={id} badge={b} earnedAt={progress.badges[id]} />
            ))}
          </div>
        </>
      )}
    </>
  )
}
