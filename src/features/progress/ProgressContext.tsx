import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { progressReducer, type ProgressAction } from './reducer'
import type { Progress } from './schema'
import { loadProgress, saveProgress } from './storage'

interface ProgressContextValue {
  progress: Progress
  dispatch: (action: ProgressAction) => void
  /** false, jos edistymistä ei voi tallentaa (esim. yksityinen selausikkuna). */
  storageAvailable: boolean
  /** true, jos aiempaa tallennusta ei voitu lukea ja aloitettiin alusta. */
  storageCorrupted: boolean
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

interface ProviderProps {
  children: ReactNode
  /** Testeissä voi antaa oman tallennustilan (tai null = ei tallennusta). */
  storage?: Storage | null
}

export function ProgressProvider({ children, storage }: ProviderProps) {
  const [initial] = useState(() => loadProgress(storage))
  const [progress, setProgress] = useState(initial.progress)
  const [storageAvailable, setStorageAvailable] = useState(initial.available)
  const current = useRef(initial.progress)
  const canSave = useRef(initial.available)

  // Tallennus tehdään heti muutoksen yhteydessä. Latauksen jälkeen ei kirjoiteta,
  // joten rikkinäinen tallennus säilyy, kunnes käyttäjä tekee jotain.
  const dispatch = useCallback(
    (action: ProgressAction) => {
      const next = progressReducer(current.current, action)
      if (next === current.current) return
      current.current = next
      setProgress(next)
      if (canSave.current && !saveProgress(next, storage)) {
        canSave.current = false
        setStorageAvailable(false)
      }
    },
    [storage],
  )

  const value = useMemo(
    () => ({ progress, dispatch, storageAvailable, storageCorrupted: initial.corrupted }),
    [progress, dispatch, storageAvailable, initial.corrupted],
  )
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress vaatii ProgressProviderin')
  return ctx
}
