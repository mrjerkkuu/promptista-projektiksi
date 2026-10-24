import type { ReactNode } from 'react'
import './ReadMore.css'

interface ReadMoreProps {
  title?: string
  children: ReactNode
}

/** Avattava syventävä osio. */
export function ReadMore({ title = 'Lue lisää', children }: ReadMoreProps) {
  return (
    <details className="read-more">
      <summary className="read-more__summary">{title}</summary>
      <div className="read-more__body">{children}</div>
    </details>
  )
}
