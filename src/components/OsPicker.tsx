import { useId } from 'react'
import { useProgress } from '../features/progress'
import { useT } from '../i18n'
import { OS_LABEL, OS_LIST } from '../lib/os'
import { Icon } from './Icon'
import './OsPicker.css'

interface OsPickerProps {
  /** Pieni versio yläpalkkiin. */
  compact?: boolean
}

/** Käyttöjärjestelmän valinta. Valinnan voi vaihtaa milloin tahansa. */
export function OsPicker({ compact = false }: OsPickerProps) {
  const { progress, dispatch } = useProgress()
  const labelId = useId()
  const t = useT()
  return (
    <div className={`os-picker${compact ? ' os-picker--compact' : ''}`} role="group" aria-labelledby={labelId}>
      <span id={labelId} className={compact ? 'os-picker__label' : 'os-picker__question'}>
        {compact ? t.os.compactLabel : t.os.question}
      </span>
      <div className="os-picker__options">
        {OS_LIST.map((os) => {
          const selected = progress.os === os
          return (
            <button
              key={os}
              type="button"
              className={compact ? 'os-picker__segment' : `button os-picker__option${selected ? '' : ' button--secondary'}`}
              aria-pressed={selected}
              onClick={() => dispatch({ type: 'setOs', os })}
            >
              {!compact && <Icon name={os} />}
              {OS_LABEL[os]}
              {!compact && selected && <Icon name="check" className="os-picker__check" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
