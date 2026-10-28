import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders, storedProgress } from '../test/render'
import { Command } from './Command'
import { NuppuSays } from './NuppuSays'
import { Os } from './Os'
import { Path } from './Path'
import { Quiz } from './Quiz'
import { ReadMore } from './ReadMore'
import { Term } from './Term'
import { VerifyStep } from './VerifyStep'

vi.mock('../content', () => {
  const quiz = {
    questions: [
      {
        id: 'q1',
        question: 'Mikä on terminaali?',
        options: [
          { id: 'a', text: 'Tekstikäyttöliittymä', correct: true, explanation: 'Juuri niin.' },
          { id: 'b', text: 'Lentokenttä', correct: false, explanation: 'Ei tässä yhteydessä.' },
          { id: 'c', text: 'Selain', correct: false, explanation: 'Selain on eri ohjelma.' },
        ],
      },
      {
        id: 'q2',
        question: 'Toinen kysymys?',
        options: [
          { id: 'a', text: 'Oikea', correct: true, explanation: 'Hyvä.' },
          { id: 'b', text: 'Väärä', correct: false, explanation: 'Huono.' },
          { id: 'c', text: 'Väärä 2', correct: false, explanation: 'Huono 2.' },
        ],
      },
    ],
  }
  const module = { key: 'p/m', id: 'm', quiz }
  const content = {
    commands: {
      'install-git': {
        description: 'Asentaa Gitin.',
        windows: 'winget install git',
        mac: 'xcode-select --install',
        source: { windows: 'https://git-scm.com/install/windows', mac: 'https://git-scm.com/install/mac' },
        verifiedAt: '2026-10-24',
      },
      'win-only': { description: 'Vain Windows.', windows: 'Set-Thing', source: 'https://learn.microsoft.com/x', verifiedAt: 'TODO' },
      'check-git': { description: 'Versio.', windows: 'git --version', mac: 'git --version', source: 'https://git-scm.com/docs/git', verifiedAt: '2026-10-24' },
    },
    glossary: { git: { term: 'Git', definition: 'Versionhallintatyökalu.' } },
    troubleshooting: { 'ei-loydy': { title: 'Komentoa ei tunnisteta', os: ['windows', 'mac'], symptom: 's', steps: ['a'] } },
    verifySteps: {
      git: {
        title: 'Git',
        command: 'check-git',
        question: 'Miltä tulos näytti?',
        options: [
          { id: 'ok', label: 'git version 2.x', correct: true, explanation: 'Asennus onnistui.' },
          {
            id: 'virhe',
            label: { windows: 'not recognized', mac: 'command not found' },
            correct: false,
            explanation: 'Komentoa ei löytynyt.',
            troubleshooting: 'ei-loydy',
          },
          { id: 'muu', label: 'Jotain muuta', correct: false, explanation: 'Katso vianmääritys.', troubleshooting: 'ei-loydy' },
        ],
      },
      sovellus: {
        title: 'Sovellus',
        question: 'Mitä näet sovelluksessa?',
        options: [
          { id: 'ok', label: 'Kirjoituskentän', correct: true, explanation: 'Hyvä.' },
          { id: 'virhe', label: 'Virheen', correct: false, explanation: 'Ei hätää.', troubleshooting: 'ei-loydy' },
          { id: 'muu', label: 'Jotain muuta', correct: false, explanation: 'Katso vianmääritys.', troubleshooting: 'ei-loydy' },
        ],
      },
    },
    getModuleByKey: (key: string) => (key === 'p/m' ? module : undefined),
  }
  // Komponentit hakevat sisällön kävijän kielellä (useContent → getContent).
  return { ...content, getContent: () => content }
})

describe('<Os>', () => {
  it('näyttää sisällön vain valitulle käyttöjärjestelmälle', () => {
    renderWithProviders(
      <>
        <Os only="windows">Windows-ohje</Os>
        <Os only="mac">Mac-ohje</Os>
      </>,
      { progress: { os: 'mac' } },
    )
    expect(screen.queryByText('Windows-ohje')).not.toBeInTheDocument()
    expect(screen.getByText('Mac-ohje')).toBeInTheDocument()
  })

  it('näyttää molemmat otsikoituina, jos valintaa ei ole tehty', () => {
    renderWithProviders(
      <>
        <Os only="windows">Windows-ohje</Os>
        <Os only="mac">Mac-ohje</Os>
      </>,
    )
    expect(screen.getByText('Vain Windows:')).toBeInTheDocument()
    expect(screen.getByText('Mac-ohje')).toBeInTheDocument()
  })
})

describe('<Path>', () => {
  it('näyttää sisällön vain polulla, jolla kävijä kulkee', () => {
    renderWithProviders(
      <>
        <Path only="claude-code">Terminaalipolun teksti</Path>
        <Path only="claude-code-desktop">Työpöytäpolun teksti</Path>
      </>,
      { moduleKey: 'claude-code-desktop/chat-vai-agentti' },
    )
    expect(screen.queryByText('Terminaalipolun teksti')).not.toBeInTheDocument()
    expect(screen.getByText('Työpöytäpolun teksti')).toBeInTheDocument()
  })
})

describe('<Command>', () => {
  it('näyttää valitun käyttöjärjestelmän komennon, lähteen ja tarkistuspäivän', () => {
    renderWithProviders(<Command id="install-git" />, { progress: { os: 'windows' } })
    expect(screen.getByText('winget install git')).toBeInTheDocument()
    expect(screen.queryByText('xcode-select --install')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'git-scm.com' })).toHaveAttribute('href', 'https://git-scm.com/install/windows')
    expect(screen.getByText(/tarkistettu 24.10.2026/)).toBeInTheDocument()
  })

  it('kopioi komennon ja ilmoittaa siitä', async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue()
    renderWithProviders(<Command id="install-git" />, { progress: { os: 'mac' } })
    await user.click(screen.getByRole('button', { name: /Kopioi/ }))
    expect(writeText).toHaveBeenCalledWith('xcode-select --install')
    expect(await screen.findByText('Kopioitu!')).toBeInTheDocument()
    expect(screen.getByText('Komento kopioitu leikepöydälle.')).toBeInTheDocument()
  })

  it('kertoo, jos komentoa ei tarvita valitulla käyttöjärjestelmällä', () => {
    renderWithProviders(<Command id="win-only" />, { progress: { os: 'mac' } })
    expect(screen.getByText(/vain Windows-koneilla/)).toBeInTheDocument()
  })

  it('näyttää tarkistamattoman komennon', () => {
    renderWithProviders(<Command id="win-only" />, { progress: { os: 'windows' } })
    expect(screen.getByText(/tarkistamatta/)).toBeInTheDocument()
  })
})

describe('<Term>', () => {
  it('avautuu napautuksella ja sulkeutuu Escillä', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <p>
        Käytä <Term id="git">Gitiä</Term> nyt.
      </p>,
    )
    const button = screen.getByRole('button', { name: 'Gitiä' })
    expect(button).toHaveAttribute('aria-expanded', 'false')
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Versionhallintatyökalu.')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Katso sanastosta' })).toHaveAttribute('href', '/sanasto/git')
    await user.keyboard('{Escape}')
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('siirtää selityksen näkymän sisään, vaikka mobiilin innerWidth on venynyt', async () => {
    // Mobiiliselaimessa reunan yli menevä selitys venyttää window.innerWidthin,
    // mutta näkymän todellinen leveys (clientWidth) pysyy samana.
    const restore = [
      vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(360),
      vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(560),
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(DOMRect.fromRect({ x: 200, width: 320 })),
    ]
    const user = userEvent.setup()
    renderWithProviders(<Term id="git">Gitiä</Term>)
    await user.click(screen.getByRole('button', { name: 'Gitiä' }))
    // Oikea reuna 520 px → 360 − 8 = 352 px, joten siirto on −168 px, ja nuoli siirtyy takaisin sanan kohdalle.
    const note = screen.getByRole('note')
    expect(note).toHaveStyle({ left: '-168px' })
    expect(note.style.getPropertyValue('--term-arrow-offset')).toBe('168px')
    restore.forEach((spy) => spy.mockRestore())
  })

  it('tuntematon termi näytetään tavallisena tekstinä', () => {
    renderWithProviders(<Term id="tuntematon">sana</Term>)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByText('sana')).toBeInTheDocument()
  })
})

describe('<NuppuSays>', () => {
  it('kertoo ruudunlukijalle, kuka puhuu, ja piilottaa koristekuvan', () => {
    const { container } = renderWithProviders(<NuppuSays pose="koodaa">Kokeile rohkeasti!</NuppuSays>)
    const note = screen.getByRole('note')
    expect(note).toHaveTextContent('Nuppu sanoo: Kokeile rohkeasti!')
    expect(container.querySelector('.nuppu--koodaa')).toHaveAttribute('aria-hidden', 'true')
  })
})

describe('<ReadMore>', () => {
  it('on avattava osio', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ReadMore title="Syvemmälle">Lisätietoa</ReadMore>)
    expect(screen.getByText('Lisätietoa')).not.toBeVisible()
    await user.click(screen.getByText('Syvemmälle'))
    expect(screen.getByText('Lisätietoa')).toBeVisible()
  })
})

describe('<Quiz>', () => {
  it('antaa välittömän palautteen ja sallii uudelleenyrityksen', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Quiz />, { moduleKey: 'p/m' })
    await user.click(screen.getByRole('button', { name: /Lentokenttä/ }))
    expect(screen.getByText('Ei aivan.')).toBeInTheDocument()
    expect(screen.getByText('Ei tässä yhteydessä.')).toBeInTheDocument()
    expect(storedProgress().quizAnswers['p/m']).toEqual({ q1: 'b' })

    await user.click(screen.getByRole('button', { name: /Tekstikäyttöliittymä/ }))
    expect(screen.getByText('Juuri niin.')).toBeInTheDocument()
    // Oikean vastauksen jälkeen näytetään kaikkien vaihtoehtojen selitykset.
    expect(screen.getByText('Selain on eri ohjelma.')).toBeInTheDocument()
    expect(screen.queryByText('Visa läpäisty!', { exact: false })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Oikea' }))
    expect(screen.getByText(/Visa läpäisty!/)).toBeInTheDocument()
  })

  it('näyttää virheen, jos moduulilla ei ole visaa', () => {
    renderWithProviders(<Quiz />, { moduleKey: 'p/muu' })
    expect(screen.getByText('Visaa ei löytynyt.')).toBeInTheDocument()
  })
})

describe('<VerifyStep>', () => {
  it('väärä valinta ohjaa vianmääritykseen', async () => {
    const user = userEvent.setup()
    renderWithProviders(<VerifyStep id="git" />, { progress: { os: 'mac' } })
    expect(screen.getByText('git --version')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /command not found/ }))
    const feedback = screen.getByText('Ei aivan.').closest('.notice') as HTMLElement
    expect(within(feedback).getByRole('link', { name: /Komentoa ei tunnisteta/ })).toHaveAttribute('href', '/vianmaaritys/ei-loydy')
    expect(storedProgress().verify).toEqual({ git: 'virhe' })
  })

  it('ilman komentoa varmistus kysyy pelkästään, mitä näet', () => {
    renderWithProviders(<VerifyStep id="sovellus" />, { progress: { os: 'mac' } })
    expect(screen.getByText('Mitä näet sovelluksessa?')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Kopioi/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Kirjoituskentän/ })).toBeInTheDocument()
  })

  it('oikea valinta kuitataan onnistuneeksi', async () => {
    const user = userEvent.setup()
    renderWithProviders(<VerifyStep id="git" />, { progress: { os: 'windows' } })
    await act(() => user.click(screen.getByRole('button', { name: /git version 2.x/ })))
    expect(screen.getByText('Oikein!')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Vianmääritys/ })).not.toBeInTheDocument()
  })
})
