import type { ReactNode } from 'react'
import { useT } from '../i18n'

interface TipProps {
  title?: string
  type?: 'info' | 'warning'
  children: ReactNode
}

/** Huomio- tai vinkkilaatikko tietopaketin sisällä. */
export function Tip({ title, type = 'info', children }: TipProps) {
  const t = useT()
  return (
    <aside className={`notice${type === 'warning' ? ' notice--warning' : ''}`} aria-label={title ?? (type === 'warning' ? t.mdx.tipWarning : t.mdx.tipInfo)}>
      {title && (
        <p className="notice__title">
          <strong>{title}</strong>
        </p>
      )}
      {children}
    </aside>
  )
}
