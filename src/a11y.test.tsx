import { render, screen } from '@testing-library/react'
import axe from 'axe-core'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AppShell } from './AppShell'
import { paths } from './content'
import { STORAGE_KEY, createDefaultProgress } from './features/progress'

/**
 * Automaattinen saavutettavuustarkistus (axe-core) jokaiselle sivulle ja
 * tietopaketille. Värikontrastit tarkistetaan erikseen (styles/tokens.test.ts),
 * koska jsdom ei laske tyylejä.
 */

async function checkPage(route: string, os: 'windows' | 'mac' | null) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...createDefaultProgress(), os }))
  const { container, unmount } = render(
    <MemoryRouter initialEntries={[route]}>
      <AppShell />
    </MemoryRouter>,
  )
  await screen.findByRole('heading', { level: 1 })
  // Odotetaan, että laiskasti ladattu tietopaketti on näkyvissä.
  if (route.split('/').length === 4) await screen.findByRole('button', { name: /Olen lukenut tämän/ })
  await new Promise((r) => setTimeout(r, 0))
  const result = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false } },
  })
  unmount()
  return result.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`)
}

const staticRoutes = ['/', '/polku/claude-code', '/sanasto', '/vianmaaritys', '/merkit', '/asetukset', '/palaute', '/palaute?moduuli=claude-code/terminaali', '/palaute?aihealue=claude-code/perusteet','/ei-ole']
const moduleRoutes = paths.flatMap((p) => p.modules.map((m) => `/polku/${p.id}/${m.id}`))

describe('saavutettavuus (axe)', () => {
  it.each(staticRoutes)('%s', async (route) => {
    expect(await checkPage(route, null)).toEqual([])
  })

  it.each(moduleRoutes)('%s (Windows)', async (route) => {
    expect(await checkPage(route, 'windows')).toEqual([])
  })

  it.each(moduleRoutes)('%s (Mac)', async (route) => {
    expect(await checkPage(route, 'mac')).toEqual([])
  })
})
