import { useId } from 'react'
import { Link } from 'react-router'
import { troubleshooting, verifySteps } from '../content'
import { useProgress } from '../features/progress'
import { resolveOsText } from '../lib/os'
import type { Os, OsText } from '../schemas/content'
import { ChoiceList } from './ChoiceList'
import { Command } from './Command'
import { Icon } from './Icon'

interface VerifyStepProps {
  id: string
}

/** Ilman käyttöjärjestelmävalintaa eroavat vaihtoehdot näytetään kahtena rivinä. */
function optionLabel(label: OsText, os: Os | null) {
  if (typeof label === 'string' || os !== null) return resolveOsText(label, os)
  return (
    <span className="choices__split">
      <span>
        <strong>Windows:</strong> {label.windows}
      </span>
      <span>
        <strong>Mac:</strong> {label.mac}
      </span>
    </span>
  )
}

/** Asennuksen varmistus: aja tarkistuskomento ja kerro, miltä tulos näytti. Väärä valinta ohjaa vianmääritykseen. */
export function VerifyStep({ id }: VerifyStepProps) {
  const { progress, dispatch } = useProgress()
  const headingId = useId()
  const step = verifySteps[id]
  if (!step) return <p className="notice notice--error">Varmistusta ”{id}” ei löytynyt.</p>

  return (
    <section className="card verify" aria-labelledby={headingId}>
      <div className="verify__header">
        <span className="verify__icon" aria-hidden="true">
          <Icon name="shield" />
        </span>
        <h3 id={headingId} className="verify__title">
          Varmistus: {step.title}
        </h3>
      </div>
      <p>{step.question}</p>
      <Command id={step.command} />
      <ChoiceList
        labelledBy={headingId}
        selectedId={progress.verify[id]}
        onSelect={(optionId) => dispatch({ type: 'answerVerify', stepId: id, optionId })}
        options={step.options.map((o) => {
          const entryId = o.troubleshooting === undefined ? undefined : resolveOsText(o.troubleshooting, progress.os ?? 'windows')
          const entry = entryId ? troubleshooting[entryId] : undefined
          return {
            id: o.id,
            label: optionLabel(o.label, progress.os),
            correct: o.correct,
            explanation: o.explanation,
            extra: entry && (
              <p>
                <Link to={`/vianmaaritys/${entryId}`}>Vianmääritys: {entry.title}</Link>
              </p>
            ),
          }
        })}
      />
    </section>
  )
}
