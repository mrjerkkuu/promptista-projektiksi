import { MODULE_STATUS_LABEL, type ModuleStatus } from '../features/progress'
import './StatusLabel.css'

const SYMBOL: Record<ModuleStatus, string> = {
  'not-started': '○',
  'in-progress': '◐',
  complete: '✓',
}

/** Moduulin tila: ei aloitettu / kesken / valmis. Tila kerrotaan tekstinä, ei pelkkänä värinä. */
export function StatusLabel({ status }: { status: ModuleStatus }) {
  return (
    <span className={`status status--${status}`}>
      <span aria-hidden="true">{SYMBOL[status]}</span> {MODULE_STATUS_LABEL[status]}
    </span>
  )
}
