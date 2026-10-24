import { useId } from 'react'
import { useProgress } from '../features/progress'
import { OS_LABEL, OS_LIST } from '../lib/os'
import './OsPicker.css'

interface OsPickerProps {
  /** Pieni versio yläpalkkiin. */
  compact?: boolean
}

/** Käyttöjärjestelmän valinta. Valinnan voi vaihtaa milloin tahansa. */
export function OsPicker({ compact = false }: OsPickerProps) {
  const { progress, dispatch } = useProgress()
  const labelId = useId()
  return (
    <div className={`os-picker${compact ? ' os-picker--compact' : ''}`} role="group" aria-labelledby={labelId}>
      <span id={labelId} className={compact ? 'os-picker__label' : 'os-picker__question'}>
        {compact ? 'Ohjeet:' : 'Kumpaa tietokonetta käytät?'}
      </span>
      <div className="os-picker__options">
        {OS_LIST.map((os) => (
          <button
            key={os}
            type="button"
            className={`button ${progress.os === os ? '' : 'button--secondary'} ${compact ? 'button--small' : ''}`}
            aria-pressed={progress.os === os}
            onClick={() => dispatch({ type: 'setOs', os })}
          >
            {OS_LABEL[os]}
          </button>
        ))}
      </div>
    </div>
  )
}
