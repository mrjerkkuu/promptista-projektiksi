import { createContext, useContext } from 'react'

/** Kertoo MDX-komponenteille (esim. Quiz), minkä moduulin sisällä ne ovat. */
export const ModuleContext = createContext<string | null>(null)

export function useModuleKey(): string | null {
  return useContext(ModuleContext)
}
