import type { ModuleStatus } from '../features/progress'
import { useT } from '../i18n'
import './StatusLabel.css'

const SYMBOL: Record<ModuleStatus, string> = {
  'not-started': '○',
  'in-progress': '◐',
  complete: '✓',
}

/** Moduulin tila: ei aloitettu / kesken / valmis. Tila kerrotaan tekstinä, ei pelkkänä värinä. */
export function StatusLabel({ status }: { status: ModuleStatus }) {
  const t = useT()
  return (
    <span className={`status status--${status}`}>
      <span aria-hidden="true">{SYMBOL[status]}</span> {t.status[status]}
    </span>
  )
}
