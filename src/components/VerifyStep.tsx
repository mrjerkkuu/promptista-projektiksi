import { useId } from 'react'
import { Link } from 'react-router'
import { troubleshooting, verifySteps } from '../content'
import { useProgress } from '../features/progress'
import { resolveOsText } from '../lib/os'
import { ChoiceList } from './ChoiceList'
import { Command } from './Command'

interface VerifyStepProps {
  id: string
}

/** Asennuksen varmistus: aja tarkistuskomento ja kerro, miltä tulos näytti. Väärä valinta ohjaa vianmääritykseen. */
export function VerifyStep({ id }: VerifyStepProps) {
  const { progress, dispatch } = useProgress()
  const headingId = useId()
  const step = verifySteps[id]
  if (!step) return <p className="notice notice--error">Varmistusta ”{id}” ei löytynyt.</p>

  return (
    <section className="card verify" aria-labelledby={headingId}>
      <h3 id={headingId}>Varmistus: {step.title}</h3>
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
            label: resolveOsText(o.label, progress.os),
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
