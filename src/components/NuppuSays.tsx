import type { ReactNode } from 'react'
import { useT } from '../i18n'
import { Nuppu, type NuppuPose } from './Nuppu'
import './NuppuSays.css'

interface NuppuSaysProps {
  /** Asento, joka sopii kommenttiin (esim. koodaa, tutkii, keksii). */
  pose: NuppuPose
  children: ReactNode
}

/**
 * Nupun kommentti tietopaketissa: Nuppu ja puhekupla. Kapealla näytöllä
 * kommentti on tekstin seassa, leveällä näytöllä tekstipalstan oikeassa
 * reunassa sen kappaleen kohdalla, jonka edelle se on kirjoitettu.
 *
 * Nuppu on koriste (aria-hidden), joten ruudunlukija kuulee, kuka puhuu,
 * piilotetusta tekstistä.
 */
export function NuppuSays({ pose, children }: NuppuSaysProps) {
  const t = useT()
  return (
    <div className="nuppu-says" role="note">
      <Nuppu pose={pose} size={88} />
      <div className="nuppu-says__bubble">
        <span className="visually-hidden">{t.mdx.nuppuSays}</span>
        {children}
      </div>
    </div>
  )
}
