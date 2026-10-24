import type { ReactNode } from 'react'
import { useProgress } from '../features/progress'
import { OS_LABEL } from '../lib/os'
import type { Os as OsName } from '../schemas/content'
import { Icon } from './Icon'
import './Os.css'

interface OsProps {
  only: OsName
  children: ReactNode
}

/** Näyttää sisällön vain valitulle käyttöjärjestelmälle. Jos valintaa ei ole tehty, näytetään kaikki otsikoituna. */
export function Os({ only, children }: OsProps) {
  const { progress } = useProgress()
  if (progress.os === only) return <>{children}</>
  if (progress.os !== null) return null
  return (
    <div className="os-block">
      <p className="os-block__label">
        <span className="chip">
          <Icon name={only} />
          Vain {OS_LABEL[only]}:
        </span>
      </p>
      {children}
    </div>
  )
}
