import type { ReactNode } from 'react'
import { Icon } from './Icon'
import './ChoiceList.css'

export interface Choice {
  id: string
  label: ReactNode
  correct: boolean
  explanation: string
  /** Lisäsisältö palautteeseen, esim. linkki vianmääritykseen. */
  extra?: ReactNode
}

interface ChoiceListProps {
  labelledBy: string
  options: Choice[]
  selectedId: string | undefined
  onSelect: (id: string) => void
  /** Kun oikea vastaus on valittu, näytetään kaikkien vaihtoehtojen selitykset. */
  revealAllWhenCorrect?: boolean
}

/**
 * Monivalinta välittömällä palautteella (visa ja asennuksen varmistus).
 * Vaihtoehdot ovat painikkeita: valinta kirjataan vasta, kun käyttäjä painaa,
 * eikä esimerkiksi nuolinäppäimillä liikkuessa.
 */
export function ChoiceList({ labelledBy, options, selectedId, onSelect, revealAllWhenCorrect }: ChoiceListProps) {
  const selected = options.find((o) => o.id === selectedId)
  const revealAll = revealAllWhenCorrect && selected?.correct

  return (
    <div className="choices">
      <ul className="choices__list" aria-labelledby={labelledBy}>
        {options.map((o) => {
          const isSelected = o.id === selectedId
          const state = isSelected ? (o.correct ? 'correct' : 'wrong') : 'idle'
          return (
            <li key={o.id} className="choices__item">
              <button
                type="button"
                className={`choices__option choices__option--${state}`}
                aria-pressed={isSelected}
                onClick={() => onSelect(o.id)}
              >
                <span className="choices__marker" aria-hidden="true">
                  {state === 'correct' && <Icon name="check" />}
                  {state === 'wrong' && <Icon name="cross" />}
                </span>
                <span className="choices__label">{o.label}</span>
                {isSelected && <span className="visually-hidden">{o.correct ? ' (oikein)' : ' (väärin)'}</span>}
              </button>
              {revealAll && !isSelected && <p className="choices__explanation choices__explanation--muted">{o.explanation}</p>}
            </li>
          )
        })}
      </ul>
      <div className="choices__feedback" aria-live="polite">
        {selected && (
          <div key={selected.id} className={`notice notice--rise ${selected.correct ? 'notice--success' : 'notice--error'}`}>
            <p>
              <strong>{selected.correct ? 'Oikein!' : 'Ei aivan.'}</strong> {selected.explanation}
            </p>
            {selected.extra}
          </div>
        )}
      </div>
    </div>
  )
}
