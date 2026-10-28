import type { ReactNode } from 'react'
import { useT } from '../i18n'
import './ReadMore.css'

interface ReadMoreProps {
  title?: string
  children: ReactNode
}

/** Avattava syventävä osio. */
export function ReadMore({ title, children }: ReadMoreProps) {
  const t = useT()
  return (
    <details className="read-more">
      <summary className="read-more__summary">{title ?? t.mdx.readMore}</summary>
      <div className="read-more__body">{children}</div>
    </details>
  )
}
