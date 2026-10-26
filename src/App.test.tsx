import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AppShell } from './AppShell'
import { getPath, paths } from './content'
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
    expect(screen.getByRole('link', { name: /Aloita tästä: 0.1/ })).toBeInTheDocument()
  })

  it('Nuppu esittelee itsensä tekstinä sekä ensikäynnillä että käyttöjärjestelmän valinnan jälkeen', () => {
    const { unmount } = renderAt('/')
    expect(screen.getByText('Kumpaa tietokonetta käytät?')).toBeInTheDocument()
    expect(screen.getByText('Moi, olen Nuppu!').closest('p')).toHaveTextContent('Kuljen mukanasi koko polun alusta loppuun.')
    unmount()

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...createDefaultProgress(), os: 'mac' }))
    renderAt('/')
    expect(screen.queryByText('Kumpaa tietokonetta käytät?')).not.toBeInTheDocument()
    expect(screen.getByText('Moi, olen Nuppu!').closest('p')).toHaveTextContent('Kuljen mukanasi koko polun alusta loppuun.')
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

  it('oppimispolkujen sivu listaa polut järjestyksessä ja kertoo, kenelle ne sopivat', () => {
    renderAt('/polut')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Oppimispolut')
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    expect(headings).toEqual(paths.map((p) => p.title))
    expect(screen.getByRole('link', { name: 'Claude Code terminaalissa' })).toHaveAttribute('href', '/polku/claude-code')
    expect(screen.getAllByText('Kenelle?')).toHaveLength(paths.length)
  })

  it('päävalikon Oppimispolut-linkki vie valintasivulle ja korostuu myös polun sivuilla', () => {
    const { unmount } = renderAt('/polut')
    const nav = () => screen.getByRole('navigation', { name: 'Päävalikko' })
    const link = () => within(nav()).getByRole('link', { name: 'Oppimispolut' })
    expect(link()).toHaveAttribute('href', '/polut')
    expect(link()).toHaveAttribute('aria-current', 'page')
    unmount()
    renderAt('/polku/claude-code')
    expect(link()).toHaveClass('site-nav__link--section')
    expect(link()).not.toHaveAttribute('aria-current')
  })

  it('polkusivu listaa aihealueet ja moduulit', () => {
    renderAt('/polku/claude-code')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Claude Code terminaalissa')
    expect(screen.getByRole('heading', { name: '1. Asennukset' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /3.5 Bonus: julkaise/ })).toBeInTheDocument()
  })

  it('moduulisivu lataa tietopaketin ja merkitsee sen luetuksi', async () => {
    const user = userEvent.setup()
    renderAt('/polku/claude-code/kansiot-ja-polut')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('0.3 Kansiot ja polut')
    expect(screen.getByText('Kesken', { exact: false })).toBeInTheDocument()
    await user.click(await screen.findByRole('button', { name: 'Olen lukenut tämän' }))
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

  it('sanasto on jaettu aiheisiin ja haku suodattaa termit', async () => {
    const user = userEvent.setup()
    renderAt('/sanasto')
    expect(screen.getByRole('heading', { level: 2, name: 'Git ja GitHub' })).toBeInTheDocument()
    const search = screen.getByRole('searchbox', { name: 'Hae sanastosta' })
    await user.type(search, 'brew')
    expect(screen.getByText('Löytyi 1 termi.')).toBeInTheDocument()
    expect(screen.getByText('Homebrew')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2, name: 'Git ja GitHub' })).not.toBeInTheDocument()
    // Haku löytää myös ilman ä-kirjaimia, ja selityksistä: terminaalin selitys mainitsee Päätteen.
    await user.clear(search)
    await user.type(search, 'paate')
    expect(screen.getByText('Pääte')).toBeInTheDocument()
    expect(screen.getByText('terminaali')).toBeInTheDocument()
    await user.clear(screen.getByRole('searchbox'))
    await user.type(screen.getByRole('searchbox'), 'xyzzy')
    expect(screen.getByText(/Haulla ”xyzzy” ei löytynyt termejä/)).toBeInTheDocument()
  })

  it('sanasto, vianmääritys, merkit ja asetukset avautuvat', () => {
    for (const [route, title] of [
      ['/sanasto', 'Sanasto'],
      ['/vianmaaritys', 'Vianmääritys'],
      ['/merkit', 'Merkit'],
      ['/asetukset', 'Asetukset'],
      ['/palaute', 'Palaute'],
    ]) {
      const { unmount } = renderAt(route)
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(title)
      unmount()
    }
  })
})

/** Edistyminen, jossa annetut moduulit ovat valmiita (luettu ja visa oikein). */
function completed(keys: string[]) {
  const modules = getPath('claude-code')!.modules.filter((m) => keys.includes(m.key))
  return {
    ...createDefaultProgress(),
    os: 'mac' as const,
    modules: Object.fromEntries(modules.map((m) => [m.key, { visited: true, read: true }])),
    quizAnswers: Object.fromEntries(
      modules.filter((m) => m.quiz).map((m) => [m.key, Object.fromEntries(m.quiz!.questions.map((q) => [q.id, q.options.find((o) => o.correct)!.id]))]),
    ),
  }
}

describe('palaute', () => {
  it('yläpalkista ja alatunnisteesta pääsee palautesivulle', () => {
    renderAt('/')
    const links = screen.getAllByRole('link', { name: 'Anna palautetta' })
    expect(links).toHaveLength(2)
    for (const link of links) expect(link).toHaveAttribute('href', '/palaute')
  })

  it('aihealueen viimeinen aihe pyytää palautetta aihealueesta', async () => {
    const user = userEvent.setup()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completed(['claude-code/projektikansio', 'claude-code/suunnittele', 'claude-code/rakenna'])))
    renderAt('/polku/claude-code/githubiin')
    await user.click(await screen.findByRole('button', { name: 'Olen lukenut tämän' }))
    expect(screen.getByText(/Koko aihealue ”Ensimmäinen projekti” on valmis!/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Kerro palautteessa' })).toHaveAttribute('href', '/palaute?aihealue=claude-code/ensimmainen-projekti')
  })

  it('valmis polku pyytää palautetta polkusivulla', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completed(getPath('claude-code')!.modules.map((m) => m.key))))
    renderAt('/polku/claude-code')
    expect(screen.getByText(/Kävit koko polun läpi!/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Kerro palautteessa' })).toHaveAttribute('href', '/palaute?polku=claude-code')
  })

  it('kesken oleva polku ei pyydä palautetta', () => {
    renderAt('/polku/claude-code')
    expect(screen.queryByRole('link', { name: 'Kerro palautteessa' })).not.toBeInTheDocument()
  })

  it('palautesivu kertoo aihealueen ja polun', () => {
    const { unmount } = renderAt('/palaute?aihealue=claude-code/ensimmainen-projekti')
    expect(screen.getByText(/Palaute koskee aihealuetta/)).toHaveTextContent('3. Ensimmäinen projekti')
    expect(screen.getByLabelText('Mitä palaute koskee?')).toHaveValue('idea')
    unmount()
    renderAt('/palaute?polku=claude-code')
    expect(screen.getByText(/Palaute koskee polkua/)).toHaveTextContent('Claude Code terminaalissa')
  })

  it('moduulin palautelinkki kertoo palautesivulle, mitä aihetta palaute koskee', async () => {
    const user = userEvent.setup()
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...createDefaultProgress(), os: 'mac' }))
    renderAt('/polku/claude-code/kansiot-ja-polut')
    await user.click(await screen.findByRole('link', { name: 'Kerro siitä' }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Palaute')
    expect(screen.getByText(/Palaute koskee aihetta/)).toHaveTextContent('0.3 Kansiot ja polut')
    expect(screen.getByLabelText('Mitä palaute koskee?')).toHaveValue('virhe')

    await user.type(screen.getByLabelText('Palautteesi'), 'Polku jäi epäselväksi')
    const github = new URL(screen.getByRole('link', { name: /Jatka GitHubiin/ }).getAttribute('href')!)
    expect(github.searchParams.get('template')).toBe('2-virhe.yml')
    expect(github.searchParams.get('kuvaus')).toBe('Polku jäi epäselväksi')
    expect(github.searchParams.get('sivu')).toMatch(/^0\.3 Kansiot ja polut – .*#\/polku\/claude-code\/kansiot-ja-polut$/)
    expect(github.searchParams.get('kayttojarjestelma')).toBe('Mac')
    expect(screen.getByRole('link', { name: 'Jatka sähköpostiin' }).getAttribute('href')).toMatch(/^mailto:jeremia\.projektit@gmail\.com\?/)
  })

  it('yleinen palaute on oletuksena kehitysidea', () => {
    renderAt('/palaute?moduuli=ei/ole')
    expect(screen.queryByText(/Palaute koskee aihetta/)).not.toBeInTheDocument()
    expect(screen.getByLabelText('Mitä palaute koskee?')).toHaveValue('idea')
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
