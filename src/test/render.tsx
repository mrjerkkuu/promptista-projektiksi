import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router'
import { ModuleContext, type ModulePlace } from '../components/moduleContext'
import { ProgressProvider, STORAGE_KEY, createDefaultProgress, type Progress } from '../features/progress'

interface Options {
  progress?: Partial<Progress>
  moduleKey?: string
  route?: string
}

/** Renderöi komponentin samoilla tarjoajilla kuin sovellus (reititys, edistyminen, moduuli). */
export function renderWithProviders(ui: ReactElement, { progress, moduleKey, route = '/' }: Options = {}) {
  if (progress) localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...createDefaultProgress(), ...progress }))
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ProgressProvider>
        <ModuleContext.Provider value={moduleKey ? placeFromKey(moduleKey) : null}>{ui}</ModuleContext.Provider>
      </ProgressProvider>
    </MemoryRouter>,
  )
}

/** Testeissä aihe on omalla polullaan: polku ja aihe saadaan avaimesta. */
export function placeFromKey(key: string): ModulePlace {
  const [pathId, moduleId] = key.split('/')
  return { key, pathId, moduleId }
}

export function storedProgress(): Progress {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Progress
}
