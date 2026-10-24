import { Badge } from '../components/Badge'
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
  return (
    <>
      <h1>Merkit</h1>
      <p>
        Merkkejä saat, kun etenet polulla, teet harjoituksia ja saat asennukset kuntoon. Olet ansainnut {earned}/{list.length} merkkiä.
      </p>
      <h2>Polun merkit</h2>
      <div className="badge-grid">
        {main.map(([id, b]) => (
          <Badge key={id} badge={b} earnedAt={progress.badges[id]} />
        ))}
      </div>
      {bonus.length > 0 && (
        <>
          <h2>Bonusmerkit</h2>
          <div className="badge-grid">
            {bonus.map(([id, b]) => (
              <Badge key={id} badge={b} earnedAt={progress.badges[id]} />
            ))}
          </div>
        </>
      )}
    </>
  )
}
