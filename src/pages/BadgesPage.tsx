import { Badge } from '../components/Badge'
import { Nuppu } from '../components/Nuppu'
import { useProgress } from '../features/progress'
import { useContent, useT } from '../i18n'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import type { Badge as BadgeData } from '../schemas/content'

export function BadgesPage() {
  const t = useT()
  const { badges, pathsActiveFirst } = useContent()
  useDocumentTitle(t.badges.title)
  const { progress } = useProgress()
  const list = Object.entries(badges)
  // Ryhmät: jokaisen polun merkit (valittu polku ensin), yhteiset merkit ja lopuksi bonusmerkit.
  const groups: { key: string; title: string; items: [string, BadgeData][] }[] = [
    ...pathsActiveFirst(progress.activePath).map((p) => ({
      key: p.id,
      title: p.title,
      items: list.filter(([, b]) => !b.bonus && b.path === p.id),
    })),
    { key: 'yhteiset', title: t.badges.shared, items: list.filter(([, b]) => !b.bonus && b.path === undefined) },
    { key: 'bonus', title: t.badges.bonusGroup, items: list.filter(([, b]) => b.bonus) },
  ].filter((g) => g.items.length > 0)
  const earned = list.filter(([id]) => progress.badges[id]).length
  const pose = earned === 0 ? 'lepaa' : earned === list.length ? 'iloitsee' : 'mitali'
  return (
    <>
      <header className="page-header">
        {/* Nukkuva Nuppu ei kellu. */}
        <Nuppu pose={pose} size={120} float={pose !== 'lepaa'} />
        <div className="page-header__text">
          <h1>{t.badges.title}</h1>
          <p>
            {t.badges.intro(
              <strong className="mono">
                {earned}/{list.length}
              </strong>,
            )}
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
