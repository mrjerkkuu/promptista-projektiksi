import { Badge } from '../components/Badge'
import { Nuppu } from '../components/Nuppu'
import { badges, pathsActiveFirst } from '../content'
import { useProgress } from '../features/progress'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import type { Badge as BadgeData } from '../schemas/content'

export function BadgesPage() {
  useDocumentTitle('Merkit')
  const { progress } = useProgress()
  const list = Object.entries(badges)
  // Ryhmät: jokaisen polun merkit (valittu polku ensin), yhteiset merkit ja lopuksi bonusmerkit.
  const groups: { key: string; title: string; items: [string, BadgeData][] }[] = [
    ...pathsActiveFirst(progress.activePath).map((p) => ({
      key: p.id,
      title: p.title,
      items: list.filter(([, b]) => !b.bonus && b.path === p.id),
    })),
    { key: 'yhteiset', title: 'Yhteiset merkit', items: list.filter(([, b]) => !b.bonus && b.path === undefined) },
    { key: 'bonus', title: 'Bonusmerkit', items: list.filter(([, b]) => b.bonus) },
  ].filter((g) => g.items.length > 0)
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
      {groups.map((g) => (
        <section key={g.key} aria-labelledby={`merkit-${g.key}`}>
          <h2 id={`merkit-${g.key}`}>{g.title}</h2>
          <div className="badge-grid">
            {g.items.map(([id, b]) => (
              <Badge key={id} id={id} badge={b} earnedAt={progress.badges[id]} />
            ))}
          </div>
        </section>
      ))}
    </>
  )
}
