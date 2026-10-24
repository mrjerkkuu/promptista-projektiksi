import type { ProgressCount } from '../features/progress'
import './ProgressBar.css'

interface ProgressBarProps {
  label: string
  count: ProgressCount
}

/** Edistymispalkki. Luku kerrotaan myös tekstinä, ei pelkkänä palkkina. */
export function ProgressBar({ label, count }: ProgressBarProps) {
  return (
    <div className="progress">
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
        {count.complete}/{count.total} valmiina ({count.percent} %)
      </p>
    </div>
  )
}
