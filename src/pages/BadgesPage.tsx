import { badges } from '../content'
import { useProgress } from '../features/progress'
import { useDocumentTitle } from '../lib/useDocumentTitle'

export function BadgesPage() {
  useDocumentTitle('Merkit')
  const { progress } = useProgress()
  const list = Object.entries(badges)
  const earned = list.filter(([id]) => progress.badges[id]).length
  return (
    <>
      <h1>Merkit</h1>
      <p>
        Olet ansainnut {earned}/{list.length} merkkiä.
      </p>
      <ul>
        {list.map(([id, b]) => (
          <li key={id}>
            <strong>{b.title}</strong>: {b.description} {progress.badges[id] ? '(ansaittu)' : '(ei vielä)'}
          </li>
        ))}
      </ul>
    </>
  )
}
