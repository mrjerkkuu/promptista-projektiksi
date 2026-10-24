import type { ReactNode } from 'react'

interface TipProps {
  title?: string
  type?: 'info' | 'warning'
  children: ReactNode
}

/** Huomio- tai vinkkilaatikko tietopaketin sisällä. */
export function Tip({ title, type = 'info', children }: TipProps) {
  return (
    <aside className={`notice${type === 'warning' ? ' notice--warning' : ''}`} aria-label={title ?? (type === 'warning' ? 'Huomio' : 'Vinkki')}>
      {title && <p><strong>{title}</strong></p>}
      {children}
    </aside>
  )
}
