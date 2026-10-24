import type { ProgressCount } from '../features/progress'
import './ProgressBar.css'

interface ProgressBarProps {
  label: string
  count: ProgressCount
  /** Aihealueen numero: täyttö aiheen värillä (polkusivun aiheosiot). */
  topic?: number
}

/** Edistymispalkki. Luku kerrotaan myös tekstinä, ei pelkkänä palkkina. */
export function ProgressBar({ label, count, topic }: ProgressBarProps) {
  return (
    <div className={topic === undefined ? 'progress' : `progress progress--topic progress--topic-${topic % 4}`}>
      <div
        className="progress__track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={count.total}
        aria-valuenow={count.complete}
        aria-valuetext={`${count.complete}/${count.total} valmiina`}
      >
        <div className="progress__fill" style={{ width: `${count.percent}%` }} />
      </div>
      <p className="progress__text">
        <span className="mono">
          {count.complete}/{count.total}
        </span>{' '}
        valmiina (<span className="mono">{count.percent} %</span>)
      </p>
    </div>
  )
}
