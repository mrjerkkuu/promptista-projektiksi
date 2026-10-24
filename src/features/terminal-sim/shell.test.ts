import { describe, expect, it } from 'vitest'
import { createShell, displayPath, execute, isMissionComplete, prompt, resolvePath, tokenize, type ShellState } from './shell'

function run(state: ShellState, ...commands: string[]) {
  let s = state
  let last = execute(s, '')
  for (const c of commands) {
    last = execute(s, c)
    s = last.state
  }
  return { state: s, last }
}

const text = (r: ReturnType<typeof execute>) => r.output.map((l) => l.text).join('\n')

describe('kehote ja polut', () => {
  it('näyttää käyttöjärjestelmän mukaisen kehotteen', () => {
    expect(prompt(createShell('mac'))).toBe('oppija@MacBook ~ % ')
    expect(prompt(createShell('windows'))).toBe('PS C:\\Users\\oppija> ')
    expect(prompt(run(createShell('mac'), 'cd Documents').state)).toBe('oppija@MacBook Documents % ')
  })

  it('pilkkoo komennon ja ymmärtää lainausmerkit', () => {
    expect(tokenize('mkdir "Oma kansio"  toinen')).toEqual(['mkdir', 'Oma kansio', 'toinen'])
  })

  it('ratkaisee suhteelliset ja absoluuttiset polut', () => {
    const mac = createShell('mac')
    expect(resolvePath(mac, 'Documents/../Desktop')).toEqual(['Users', 'oppija', 'Desktop'])
    expect(resolvePath(mac, '~')).toEqual(['Users', 'oppija'])
    expect(resolvePath(mac, '/Users')).toEqual(['Users'])
    const win = createShell('windows')
    expect(resolvePath(win, 'C:\\Users')).toEqual(['Users'])
    expect(resolvePath(win, '..\\oppija\\Desktop')).toEqual(['Users', 'oppija', 'Desktop'])
    expect(displayPath('windows', ['Users', 'oppija'])).toBe('C:\\Users\\oppija')
  })
})

describe('komennot (Mac)', () => {
  it('pwd ja ls', () => {
    const s = createShell('mac')
    expect(text(execute(s, 'pwd'))).toBe('/Users/oppija')
    expect(text(execute(s, 'ls'))).toBe('Desktop  Documents  Downloads')
    expect(text(execute(s, 'ls Documents'))).toBe('muistiinpanot.txt')
  })

  it('cd, cd .. ja cd ilman kansiota', () => {
    const { state } = run(createShell('mac'), 'cd Documents')
    expect(displayPath('mac', state.cwd)).toBe('/Users/oppija/Documents')
    expect(run(state, 'cd ..').state.cwd).toEqual(['Users', 'oppija'])
    expect(run(state, 'cd').state.cwd).toEqual(['Users', 'oppija'])
  })

  it('cd ei välitä kirjainkoosta, mutta näyttää oikean nimen', () => {
    const { state } = run(createShell('mac'), 'cd documents')
    expect(prompt(state)).toBe('oppija@MacBook Documents % ')
  })

  it('cd tuntemattomaan kansioon antaa virheen ja vihjeen', () => {
    const r = execute(createShell('mac'), 'cd olematon')
    expect(r.output[0]).toEqual({ kind: 'error', text: 'cd: no such file or directory: olematon' })
    expect(r.output[1].kind).toBe('hint')
  })

  it('cd tiedostoon', () => {
    const r = execute(run(createShell('mac'), 'cd Documents').state, 'cd muistiinpanot.txt')
    expect(r.output[0].text).toBe('cd: not a directory: muistiinpanot.txt')
  })

  it('mkdir luo kansion ja kertoo, jos se on jo olemassa', () => {
    const { state, last } = run(createShell('mac'), 'mkdir projekti')
    expect(last.output).toEqual([])
    expect(text(execute(state, 'ls'))).toContain('projekti')
    expect(text(execute(state, 'mkdir projekti'))).toContain('mkdir: projekti: File exists')
    expect(text(execute(state, 'mkdir'))).toContain('usage: mkdir')
  })

  it('mkdir ilman -p ei luo puuttuvia yläkansioita', () => {
    const s = createShell('mac')
    expect(text(execute(s, 'mkdir a/b'))).toContain('No such file or directory')
    expect(execute(s, 'mkdir -p a/b').state.dirs.some((d) => d.join('/') === 'Users/oppija/a/b')).toBe(true)
  })

  it('Windows-komennot eivät toimi Macissa, mutta saat vihjeen', () => {
    const s = createShell('mac')
    expect(text(execute(s, 'dir'))).toMatch(/zsh: command not found: dir[\s\S]*ls/)
    expect(text(execute(s, 'cls'))).toMatch(/clear/)
    expect(text(execute(s, 'cd..'))).toMatch(/Muista välilyönti/)
  })

  it('tuntematon komento', () => {
    const r = execute(createShell('mac'), 'kissa')
    expect(r.output[0]).toEqual({ kind: 'error', text: 'zsh: command not found: kissa' })
    expect(r.output[1].text).toMatch(/help/)
  })

  it('clear tyhjentää näytön', () => {
    expect(execute(createShell('mac'), 'clear').clear).toBe(true)
  })

  it('versiotarkistukset', () => {
    const s = createShell('mac')
    expect(text(execute(s, 'git --version'))).toBe('git version 2.56.0')
    expect(text(execute(s, 'claude --version'))).toMatch(/\(Claude Code\)$/)
    expect(execute(s, 'git status').output[0].kind).toBe('hint')
  })

  it('help listaa komennot', () => {
    expect(text(execute(createShell('mac'), 'help'))).toMatch(/mkdir/)
  })

  it('tyhjä rivi ei tee mitään', () => {
    const s = createShell('mac')
    expect(execute(s, '   ')).toEqual({ state: s, output: [], clear: false })
  })
})

describe('komennot (Windows)', () => {
  it('pwd tulostaa PowerShell-tyylisen taulukon', () => {
    expect(text(execute(createShell('windows'), 'pwd'))).toContain('Path\n----\nC:\\Users\\oppija')
  })

  it('ls ja dir listaavat kansion PowerShell-tyylisesti', () => {
    const s = createShell('windows')
    const listing = text(execute(s, 'dir'))
    expect(listing).toContain('Directory: C:\\Users\\oppija')
    expect(listing).toContain('d----   Desktop')
    expect(text(execute(s, 'ls'))).toBe(listing)
  })

  it('cd.. toimii PowerShellissä', () => {
    const { state } = run(createShell('windows'), 'cd Documents', 'cd..')
    expect(state.cwd).toEqual(['Users', 'oppija'])
  })

  it('tuntematon komento ja virheellinen polku', () => {
    const s = createShell('windows')
    expect(text(execute(s, 'kissa'))).toMatch(/The term 'kissa' is not recognized/)
    expect(text(execute(s, 'cd olematon'))).toMatch(/Cannot find path 'C:\\Users\\oppija\\olematon'/)
  })

  it('mkdir luo myös puuttuvat yläkansiot ja tulostaa taulukon', () => {
    const r = execute(createShell('windows'), 'mkdir projektit\\oma-sivu')
    expect(text(r)).toContain('d----   oma-sivu')
    expect(r.state.dirs.some((d) => d.join('/') === 'Users/oppija/projektit')).toBe(true)
    expect(text(execute(r.state, 'mkdir projektit'))).toMatch(/already exists/)
  })

  it('cls tyhjentää näytön ja git-versio on Windows-muotoinen', () => {
    const s = createShell('windows')
    expect(execute(s, 'cls').clear).toBe(true)
    expect(text(execute(s, 'git --version'))).toBe('git version 2.56.0.windows.1')
  })
})

describe('missiot', () => {
  it('"luo kansio ja siirry sinne" tunnistetaan tilasta', () => {
    const mission = {
      conditions: [
        { type: 'dirExists' as const, path: '~/projekti' },
        { type: 'cwdIs' as const, path: '~/projekti' },
      ],
    }
    let s = createShell('windows')
    expect(isMissionComplete(s, mission)).toBe(false)
    s = run(s, 'mkdir projekti').state
    expect(isMissionComplete(s, mission)).toBe(false)
    s = run(s, 'cd Projekti').state
    expect(isMissionComplete(s, mission)).toBe(true)
  })

  it('käydyt kansiot ja käytetyt komennot (dir lasketaan ls:ksi)', () => {
    const mission = {
      conditions: [
        { type: 'visited' as const, path: '~/Documents' },
        { type: 'commandUsed' as const, command: 'ls' },
        { type: 'cwdIs' as const, path: '~' },
      ],
    }
    const { state } = run(createShell('windows'), 'cd Documents', 'dir', 'cd ..')
    expect(isMissionComplete(state, mission)).toBe(true)
  })

  it('aloituskansiot ja -sijainti tulevat missiosta', () => {
    const s = createShell('mac', { startDirs: ['~/koulu/kurssi'], startCwd: '~/koulu' })
    expect(prompt(s)).toBe('oppija@MacBook koulu % ')
    expect(text(execute(s, 'ls'))).toBe('kurssi')
  })
})
