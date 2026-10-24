import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Nuppu } from './Nuppu'
import './FeedbackPrompt.css'

interface FeedbackPromptProps {
  /** Palautesivun osoite, jossa kerrotaan, mitä palaute koskee (esim. /palaute?polku=claude-code). */
  to: string
  children: ReactNode
}

/** Palautepyyntö valmistumisen hetkellä: aihealue tai koko polku on käyty läpi. */
export function FeedbackPrompt({ to, children }: FeedbackPromptProps) {
  return (
    <div className="notice notice--mascot notice--rise feedback-prompt">
      <Nuppu pose="iloitsee" size={56} />
      <p className="feedback-prompt__text">
        {children} <Link to={to}>Kerro palautteessa</Link>, mitä parantaisit.
      </p>
    </div>
  )
}
