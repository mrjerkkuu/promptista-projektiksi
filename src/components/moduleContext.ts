import { createContext, useContext } from 'react'

/**
 * Missä kävijä on: aiheen edistymisen avain sekä polku ja aihe osoitteesta.
 * Yhteisellä aiheella avain on alkuperäisen polun, mutta pathId on se polku, jolla kävijä kulkee.
 */
export interface ModulePlace {
  key: string
  pathId: string
  moduleId: string
}

/** Kertoo MDX-komponenteille (esim. Quiz), minkä moduulin sisällä ne ovat. */
export const ModuleContext = createContext<ModulePlace | null>(null)

/** Edistymisen avain (visavastaukset ym.). */
export function useModuleKey(): string | null {
  return useContext(ModuleContext)?.key ?? null
}

/** Polku ja aihe osoitteesta (esim. "Seuraava aihe"). */
export function useModulePlace(): ModulePlace | null {
  return useContext(ModuleContext)
}
