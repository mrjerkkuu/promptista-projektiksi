import type { ReactNode } from 'react'
import { useModulePlace } from './moduleContext'

interface PathProps {
  only: string
  children: ReactNode
}

/**
 * Näyttää sisällön vain valitulla polulla. Tarkoitettu yhteisiin aiheisiin, joissa
 * jokin kappale pätee vain toisella polulla. Polku on se, jolla kävijä kulkee (pathId).
 */
export function Path({ only, children }: PathProps) {
  const place = useModulePlace()
  if (place?.pathId !== only) return null
  return <>{children}</>
}
