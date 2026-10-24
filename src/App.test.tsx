import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AppShell } from './AppShell'
import { STORAGE_KEY, createDefaultProgress } from './features/progress'

function renderAt(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AppShell />
    </MemoryRouter>,
  )
}

describe('sivut', () => {
  it('etusivu kysyy käyttöjärjestelmää ja tarjoaa aloituspainikkeen', async () => {
    const user = userEvent.setup()
    renderAt('/')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Promptista projektiksi')
    expect(screen.getByText('Kumpaa tietokonetta käytät?')).toBeInTheDocument()
    const macButtons = screen.getAllByRole('button', { name: 'Mac' })
    await user.click(macButtons[macButtons.length - 1])
    expect(screen.queryByText('Kumpaa tietokonetta käytät?')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Aloita alusta: 0.1/ })).toBeInTheDocument()
  })

  it('jatka-painike vie seuraavaan keskeneräiseen moduuliin', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...createDefaultProgress(), os: 'windows', modules: { 'claude-code/mita-on-vibekoodaus': { visited: true, read: true } },
        quizAnswers: { 'claude-code/mita-on-vibekoodaus': { 'kuka-kirjoittaa': 'tekoaly', tarkistus: 'tarkista', rooli: 'kertominen' } },
      }),
    )
    renderAt('/')
    expect(screen.getByRole('link', { name: /Jatka siitä mihin jäit: 0.2/ })).toHaveAttribute('href', '/polku/claude-code/terminaali')
  })

  it('polkusivu listaa aihealueet ja moduulit', () => {
    renderAt('/polku/claude-code')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Claude Code alusta alkaen')
    expect(screen.getByRole('heading', { name: '1. Asennukset' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /3.5 Bonus: julkaise/ })).toBeInTheDocument()
  })

  it('moduulisivu lataa tietopaketin ja merkitsee sen luetuksi', async () => {
    const user = userEvent.setup()
    renderAt('/polku/claude-code/kansiot-ja-polut')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('0.3 Kansiot ja polut')
    expect(screen.getByText('Kesken', { exact: false })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Olen lukenut tämän' }))
    expect(screen.getByText('Tämä aihe on valmis!')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).modules['claude-code/kansiot-ja-polut']).toEqual({ visited: true, read: true })
    expect(screen.getByRole('link', { name: /Seuraava/ })).toHaveAttribute('href', '/polku/claude-code/git-ja-github')
  })

  it('simulaattorissa ajettu komento antaa merkin ja ilmoituksen', async () => {
    const user = userEvent.setup()
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...createDefaultProgress(), os: 'mac' }))
    renderAt('/polku/claude-code/terminaali')
    const input = await screen.findByRole('textbox', { name: /Komento/ })
    await user.type(input, 'help{Enter}')
    expect(await screen.findByText('Uusi merkki: Ensimmäinen komento!')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).badges['ensimmainen-komento']).toBeDefined()
    await user.click(screen.getByRole('button', { name: /Sulje/ }))
    expect(screen.queryByText('Uusi merkki: Ensimmäinen komento!')).not.toBeInTheDocument()
  })

  it('tietopaketin ulkoiset linkit avautuvat uuteen välilehteen ja sisäiset reitittimellä', async () => {
    renderAt('/polku/claude-code/claude-tilaus')
    const external = await screen.findByRole('link', { name: /claude.com\/pricing/ })
    expect(external).toHaveAttribute('target', '_blank')
    renderAt('/polku/claude-code/julkaise')
    expect(await screen.findByRole('link', { name: 'vianmääritys' })).toHaveAttribute('href', '/vianmaaritys/pages-ei-nay')
  })

  it('tuntematon osoite näyttää 404-sivun', () => {
    renderAt('/polku/claude-code/ei-ole')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Sivua ei löytynyt')
  })

  it('sanasto, vianmääritys, merkit ja asetukset avautuvat', () => {
    for (const [route, title] of [
      ['/sanasto', 'Sanasto'],
      ['/vianmaaritys', 'Vianmääritys'],
      ['/merkit', 'Merkit'],
      ['/asetukset', 'Asetukset'],
    ]) {
      const { unmount } = renderAt(route)
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(title)
      unmount()
    }
  })
})

describe('asetukset', () => {
  it('vienti ja tuonti siirtokoodilla', async () => {
    const user = userEvent.setup()
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...createDefaultProgress(), os: 'mac', stats: { commandsRun: 3 } }))
    renderAt('/asetukset')
    await user.click(screen.getByRole('button', { name: 'Näytä siirtokoodi' }))
    const code = (screen.getByLabelText(/Siirtokoodi/) as HTMLTextAreaElement).value
    localStorage.clear()

    await user.type(screen.getByLabelText('Liitä siirtokoodi:'), 'roskaa')
    await user.click(screen.getByRole('button', { name: 'Tuo koodista' }))
    expect(screen.getByText(/Koodia ei voitu lukea/)).toBeInTheDocument()

    await user.clear(screen.getByLabelText('Liitä siirtokoodi:'))
    await user.click(screen.getByLabelText('Liitä siirtokoodi:'))
    await user.paste(code)
    await user.click(screen.getByRole('button', { name: 'Tuo koodista' }))
    expect(screen.getByText(/Edistyminen tuotu/)).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).stats.commandsRun).toBe(3)
  })

  it('nollaus kysyy vahvistuksen', async () => {
    const user = userEvent.setup()
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...createDefaultProgress(), os: 'mac', theme: 'dark', stats: { commandsRun: 3 } }))
    renderAt('/asetukset')
    await user.click(screen.getByRole('button', { name: 'Aloita alusta…' }))
    await user.click(screen.getByRole('button', { name: 'Peruuta' }))
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).stats.commandsRun).toBe(3)
    await user.click(screen.getByRole('button', { name: 'Aloita alusta…' }))
    await user.click(screen.getByRole('button', { name: 'Kyllä, aloita alusta' }))
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({ ...createDefaultProgress(), theme: 'dark' })
  })
})
