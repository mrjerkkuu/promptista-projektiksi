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
  /** Juuri ansaitut merkit, joista ei vielä ole ilmoitettu. */
  announcements: string[]
  dismissAnnouncement: (badgeId: string) => void
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

interface ProviderProps {
  children: ReactNode
  /** Testeissä voi antaa oman tallennustilan (tai null = ei tallennusta). */
  storage?: Storage | null
  /**
   * Johdetut muutokset jokaisen toiminnon jälkeen, esim. merkkien myöntäminen.
   * Saa uuden tilan ja palauttaa sen (mahdollisesti täydennettynä).
   */
  derive?: (next: Progress) => Progress
}

export function ProgressProvider({ children, storage, derive }: ProviderProps) {
  const [initial] = useState(() => loadProgress(storage))
  const [progress, setProgress] = useState(initial.progress)
  const [storageAvailable, setStorageAvailable] = useState(initial.available)
  const [announcements, setAnnouncements] = useState<string[]>([])
  const current = useRef(initial.progress)
  const canSave = useRef(initial.available)

  // Tallennus tehdään heti muutoksen yhteydessä. Latauksen jälkeen ei kirjoiteta,
  // joten rikkinäinen tallennus säilyy, kunnes käyttäjä tekee jotain.
  const dispatch = useCallback(
    (action: ProgressAction) => {
      const prev = current.current
      const reduced = progressReducer(prev, action)
      const next = derive ? derive(reduced) : reduced
      if (next === prev) return
      current.current = next
      setProgress(next)
      // Tuodusta tai nollatusta tilasta ei ilmoiteta "uusina" merkkeinä.
      if (action.type !== 'replace' && action.type !== 'reset') {
        const fresh = Object.keys(next.badges).filter((id) => !prev.badges[id])
        if (fresh.length > 0) setAnnouncements((a) => [...a, ...fresh])
      }
      if (canSave.current && !saveProgress(next, storage)) {
        canSave.current = false
        setStorageAvailable(false)
      }
    },
    [storage, derive],
  )

  const dismissAnnouncement = useCallback((badgeId: string) => setAnnouncements((a) => a.filter((id) => id !== badgeId)), [])

  const value = useMemo(
    () => ({ progress, dispatch, storageAvailable, storageCorrupted: initial.corrupted, announcements, dismissAnnouncement }),
    [progress, dispatch, storageAvailable, initial.corrupted, announcements, dismissAnnouncement],
  )
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress vaatii ProgressProviderin')
  return ctx
}
