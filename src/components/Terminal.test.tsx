import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { placeFromKey, renderWithProviders, storedProgress } from '../test/render'
import { ModuleContext } from './moduleContext'
import { Terminal } from './Terminal'

describe('<Terminal>', () => {
  it('suorittaa komennot ja tunnistaa onnistuneen mission', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Terminal mission="luo-projektikansio" />, { progress: { os: 'mac' } })
    const input = screen.getByRole('textbox', { name: /Komento/ })
    expect(screen.getByText('oppija@MacBook ~ %')).toBeInTheDocument()

    await user.type(input, 'mkdir projekti{Enter}')
    await user.type(input, 'cd projekti{Enter}')
    expect(screen.getByText(/Loit kansion ja siirryit sinne/)).toBeInTheDocument()
    expect(storedProgress().missions['luo-projektikansio']).toBeDefined()
    expect(storedProgress().stats.commandsRun).toBe(2)
  })

  it('näyttää ystävällisen virheen tuntemattomalle komennolle', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Terminal mission="luo-projektikansio" />, { progress: { os: 'windows' } })
    await user.type(screen.getByRole('textbox', { name: /Komento/ }), 'kissa{Enter}')
    expect(screen.getByText(/The term 'kissa' is not recognized/)).toBeInTheDocument()
    expect(screen.getByText(/Vihje: Kirjoita help/)).toBeInTheDocument()
  })

  it('komentohistoria nuolinäppäimillä', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Terminal mission="luo-projektikansio" />, { progress: { os: 'mac' } })
    const input = screen.getByRole('textbox', { name: /Komento/ })
    await user.type(input, 'pwd{Enter}')
    await user.type(input, 'ls{Enter}')
    await user.keyboard('{ArrowUp}')
    expect(input).toHaveValue('ls')
    await user.keyboard('{ArrowUp}')
    expect(input).toHaveValue('pwd')
    await user.keyboard('{ArrowDown}{ArrowDown}')
    expect(input).toHaveValue('')
  })

  it('clear tyhjentää näytön ja Suorita-painike toimii (mobiili)', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Terminal mission="luo-projektikansio" />, { progress: { os: 'mac' } })
    const input = screen.getByRole('textbox', { name: /Komento/ })
    await user.type(input, 'pwd')
    await user.click(screen.getByRole('button', { name: 'Suorita' }))
    expect(screen.getByText('/Users/oppija')).toBeInTheDocument()
    await user.type(input, 'clear{Enter}')
    expect(screen.queryByText('/Users/oppija')).not.toBeInTheDocument()
  })

  it('kertoo, jos harjoitus on jo tehty', () => {
    renderWithProviders(<Terminal mission="luo-projektikansio" />, {
      progress: { os: 'mac', missions: { 'luo-projektikansio': '2026-10-24T10:00:00.000Z' } },
    })
    expect(screen.getByText(/Olet jo suorittanut tämän harjoituksen/)).toBeInTheDocument()
  })

  it.each([
    ['claude-code/terminaali', /painikkeella seuraavaan aiheeseen/],
    ['claude-code/julkaise', /polun viimeinen aihe/],
  ])('ohjaa onnistumisen jälkeen sivun lopun painikkeeseen (%s)', (moduleKey, expected) => {
    renderWithProviders(
      <ModuleContext.Provider value={placeFromKey(moduleKey)}>
        <Terminal mission="luo-projektikansio" />
      </ModuleContext.Provider>,
      { progress: { os: 'mac', missions: { 'luo-projektikansio': '2026-10-24T10:00:00.000Z' } } },
    )
    expect(screen.getByText(expected)).toBeInTheDocument()
  })

  it('yhteisessä aiheessa vihje katsoo polkua, jolla kävijä on, eikä edistymisen avainta', () => {
    // Avain on aiheen "terminaali", mutta kävijä on polun viimeisellä aiheella: seuraavaa aihetta ei ole.
    renderWithProviders(
      <ModuleContext.Provider value={{ key: 'claude-code/terminaali', pathId: 'claude-code', moduleId: 'julkaise' }}>
        <Terminal mission="luo-projektikansio" />
      </ModuleContext.Provider>,
      { progress: { os: 'mac', missions: { 'luo-projektikansio': '2026-10-24T10:00:00.000Z' } } },
    )
    expect(screen.getByText(/polun viimeinen aihe/)).toBeInTheDocument()
  })

  it('ei näytä siirtymisohjetta tietopaketin ulkopuolella', () => {
    renderWithProviders(<Terminal mission="luo-projektikansio" />, {
      progress: { os: 'mac', missions: { 'luo-projektikansio': '2026-10-24T10:00:00.000Z' } },
    })
    expect(screen.queryByText(/sivun lopusta pääset/)).not.toBeInTheDocument()
  })
})
