import type { Mission, MissionCondition, Os } from '../../schemas/content'

/**
 * Terminaalisimulaattorin ydin: muistissa toimiva kansiorakenne ja komennot.
 * Kaikki funktiot ovat puhtaita: ne saavat tilan ja palauttavat uuden tilan.
 * Mitään oikeaa tiedostojärjestelmää ei käytetä.
 */

export type LineKind = 'input' | 'output' | 'error' | 'hint'

export interface Line {
  kind: LineKind
  text: string
}

export interface ShellState {
  os: Os
  /** Kaikki kansiot polkuina juuresta (esim. ["Users", "oppija", "Desktop"]). */
  dirs: string[][]
  /** Tiedostot polkuina juuresta. */
  files: string[][]
  cwd: string[]
  /** Kansiot, joissa on käyty (avaimina, pienillä kirjaimilla). */
  visited: string[]
  /** Onnistuneesti ajetut komennot (normalisoitu nimi, esim. "ls"). */
  usedCommands: string[]
}

export interface ExecResult {
  state: ShellState
  output: Line[]
  /** true = tyhjennä näyttö (clear / cls). */
  clear: boolean
}

export const USER_NAME = 'oppija'
const HOME: string[] = ['Users', USER_NAME]
const DEFAULT_DIRS = ['Desktop', 'Documents', 'Downloads']
const DEFAULT_FILES = [['Documents', 'muistiinpanot.txt']]

/** Esimerkkiversiot "feikeille" versiotarkistuksille. */
export const FAKE_VERSIONS = {
  git: { windows: 'git version 2.56.0.windows.1', mac: 'git version 2.56.0' },
  claude: '2.1.0 (Claude Code)',
}

const key = (path: string[]) => path.join('/').toLowerCase()

function samePath(a: string[], b: string[]) {
  return key(a) === key(b)
}

function findDir(state: ShellState, path: string[]): string[] | undefined {
  return state.dirs.find((d) => samePath(d, path))
}

function findFile(state: ShellState, path: string[]): string[] | undefined {
  return state.files.find((f) => samePath(f, path))
}

/** Muuttaa missioiden polun ("~/a/b") polkutaulukoksi. */
export function virtualPath(path: string): string[] {
  return [...HOME, ...path.split('/').slice(1)]
}

function withAncestors(path: string[]): string[][] {
  return path.map((_, i) => path.slice(0, i + 1))
}

function addDir(dirs: string[][], path: string[]): string[][] {
  const result = [...dirs]
  for (const p of withAncestors(path)) if (!result.some((d) => samePath(d, p))) result.push(p)
  return result
}

export function createShell(os: Os, mission?: Pick<Mission, 'startDirs' | 'startCwd'>): ShellState {
  let dirs: string[][] = []
  dirs = addDir(dirs, HOME)
  for (const d of DEFAULT_DIRS) dirs = addDir(dirs, [...HOME, d])
  for (const d of mission?.startDirs ?? []) dirs = addDir(dirs, virtualPath(d))
  const cwd = mission?.startCwd ? virtualPath(mission.startCwd) : HOME
  dirs = addDir(dirs, cwd)
  return {
    os,
    dirs,
    files: DEFAULT_FILES.map((f) => [...HOME, ...f]),
    cwd,
    visited: [key(cwd)],
    usedCommands: [],
  }
}

/** Näytettävä polku: Mac "/Users/oppija/x", Windows "C:\Users\oppija\x". */
export function displayPath(os: Os, path: string[]): string {
  return os === 'windows' ? `C:\\${path.join('\\')}` : `/${path.join('/')}`
}

/** Kehote: Mac (zsh) "oppija@MacBook ~ % ", Windows (PowerShell) "PS C:\Users\oppija> ". */
export function prompt(state: ShellState): string {
  if (state.os === 'windows') return `PS ${displayPath('windows', state.cwd)}> `
  const here = samePath(state.cwd, HOME) ? '~' : state.cwd.length === 0 ? '/' : state.cwd[state.cwd.length - 1]
  return `${USER_NAME}@MacBook ${here} % `
}

/** Pilkkoo komentorivin sanoiksi. Lainausmerkit ("Oma kansio") pitävät sanat yhdessä. */
export function tokenize(input: string): string[] {
  const tokens: string[] = []
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g
  for (const m of input.matchAll(re)) tokens.push(m[1] ?? m[2] ?? m[3])
  return tokens
}

/** Muuttaa käyttäjän kirjoittaman polun absoluuttiseksi. Palauttaa undefined, jos polku menee juuren yli. */
export function resolvePath(state: ShellState, input: string): string[] {
  let text = input
  let base = state.cwd
  if (state.os === 'windows') {
    text = text.replaceAll('\\', '/')
    const drive = /^[a-zA-Z]:\/?/.exec(text)
    if (drive) {
      base = []
      text = text.slice(drive[0].length)
    }
  }
  if (text === '~' || text.startsWith('~/')) {
    base = HOME
    text = text.slice(1)
  } else if (text.startsWith('/')) {
    base = []
  }
  const result = [...base]
  for (const part of text.split('/')) {
    if (part === '' || part === '.') continue
    if (part === '..') result.pop()
    else result.push(part)
  }
  return result
}

function children(state: ShellState, dir: string[]) {
  const isChild = (p: string[]) => p.length === dir.length + 1 && samePath(p.slice(0, dir.length), dir)
  const sort = (a: string[], b: string[]) => a[a.length - 1].localeCompare(b[b.length - 1])
  return {
    dirs: state.dirs.filter(isChild).sort(sort),
    files: state.files.filter(isChild).sort(sort),
  }
}

// ---------------------------------------------------------------- virheilmoitukset

function notRecognized(os: Os, name: string): Line[] {
  if (os === 'windows') {
    return [
      {
        kind: 'error',
        text: `${name}: The term '${name}' is not recognized as a name of a cmdlet, function, script file, or executable program.\nCheck the spelling of the name, or if a path was included, verify that the path is correct and try again.`,
      },
    ]
  }
  return [{ kind: 'error', text: `zsh: command not found: ${name}` }]
}

const hint = (text: string): Line => ({ kind: 'hint', text: `Vihje: ${text}` })
const out = (text: string): Line => ({ kind: 'output', text })

function windowsListing(state: ShellState, dir: string[], entries: { dirs: string[][]; files: string[][] }): Line[] {
  if (entries.dirs.length === 0 && entries.files.length === 0) return []
  const rows = [
    ...entries.dirs.map((d) => `d----   ${d[d.length - 1]}`),
    ...entries.files.map((f) => `-a---   ${f[f.length - 1]}`),
  ]
  return [out(`\n    Directory: ${displayPath(state.os, dir)}\n\nMode    Name\n----    ----\n${rows.join('\n')}\n`)]
}

const HELP_TEXT: Record<Os, string> = {
  windows: [
    'Tässä harjoitusterminaalissa toimivat nämä komennot:',
    '  help            näyttää tämän ohjeen',
    '  pwd             kertoo, missä kansiossa olet',
    '  ls  tai  dir    listaa kansion sisällön',
    '  cd kansio       siirtyy kansioon',
    '  cd ..           siirtyy yhden kansion ylöspäin',
    '  mkdir nimi      luo uuden kansion',
    '  clear  tai  cls tyhjentää näytön',
    '  git --version   näyttää Gitin version (esimerkki)',
    '  claude --version  näyttää Claude Coden version (esimerkki)',
  ].join('\n'),
  mac: [
    'Tässä harjoitusterminaalissa toimivat nämä komennot:',
    '  help            näyttää tämän ohjeen',
    '  pwd             kertoo, missä kansiossa olet',
    '  ls              listaa kansion sisällön',
    '  cd kansio       siirtyy kansioon',
    '  cd ..           siirtyy yhden kansion ylöspäin',
    '  mkdir nimi      luo uuden kansion',
    '  clear           tyhjentää näytön',
    '  git --version   näyttää Gitin version (esimerkki)',
    '  claude --version  näyttää Claude Coden version (esimerkki)',
  ].join('\n'),
}

// ---------------------------------------------------------------- komennot

function used(state: ShellState, name: string): ShellState {
  return state.usedCommands.includes(name) ? state : { ...state, usedCommands: [...state.usedCommands, name] }
}

/** Suorittaa yhden komentorivin. */
export function execute(state: ShellState, input: string): ExecResult {
  const tokens = tokenize(input.trim())
  const result = (s: ShellState, output: Line[] = [], clear = false): ExecResult => ({ state: s, output, clear })
  if (tokens.length === 0) return result(state)

  const [rawName, ...args] = tokens
  const name = rawName.toLowerCase()
  const { os } = state
  const flags = args.filter((a) => a.startsWith('-'))
  const operands = args.filter((a) => !a.startsWith('-'))

  switch (name) {
    case 'help':
      return result(used(state, 'help'), [out(HELP_TEXT[os])])

    case 'pwd': {
      const path = displayPath(os, state.cwd)
      return result(used(state, 'pwd'), [out(os === 'windows' ? `\nPath\n----\n${path}\n` : path)])
    }

    case 'dir':
    case 'ls': {
      if (name === 'dir' && os === 'mac') {
        return result(state, [...notRecognized(os, rawName), hint('Macissa kansion sisältö listataan komennolla ls.')])
      }
      const target = operands[0] ? resolvePath(state, operands[0]) : state.cwd
      const dir = findDir(state, target)
      if (!dir) {
        const shown = operands[0]
        return result(state, [
          os === 'windows'
            ? { kind: 'error', text: `Get-ChildItem: Cannot find path '${displayPath(os, target)}' because it does not exist.` }
            : { kind: 'error', text: `ls: ${shown}: No such file or directory` },
          hint('Tarkista kansion nimi. Komento ls ilman lisäyksiä listaa nykyisen kansion.'),
        ])
      }
      const entries = children(state, dir)
      const output =
        os === 'windows'
          ? windowsListing(state, dir, entries)
          : entries.dirs.length + entries.files.length === 0
            ? []
            : [out([...entries.dirs, ...entries.files].map((p) => p[p.length - 1]).join('  '))]
      return result(used(state, 'ls'), output)
    }

    case 'cd..':
      if (os === 'windows') return execute(state, 'cd ..')
      return result(state, [...notRecognized(os, rawName), hint('Muista välilyönti: cd ..')])

    case 'cd': {
      const target = operands[0] === undefined ? [...HOME] : resolvePath(state, operands[0])
      const dir = findDir(state, target)
      if (!dir) {
        const shown = operands[0] ?? '~'
        if (findFile(state, target)) {
          return result(state, [
            os === 'windows'
              ? { kind: 'error', text: `Set-Location: Cannot find path '${displayPath(os, target)}' because it does not exist.` }
              : { kind: 'error', text: `cd: not a directory: ${shown}` },
            hint(`${target[target.length - 1]} on tiedosto eikä kansio. Kansioon voi siirtyä, tiedostoon ei.`),
          ])
        }
        return result(state, [
          os === 'windows'
            ? { kind: 'error', text: `Set-Location: Cannot find path '${displayPath(os, target)}' because it does not exist.` }
            : { kind: 'error', text: `cd: no such file or directory: ${shown}` },
          hint('Kansiota ei löytynyt. Katso komennolla ls, mitä kansioita tässä on, ja tarkista kirjoitusasu.'),
        ])
      }
      const visited = state.visited.includes(key(dir)) ? state.visited : [...state.visited, key(dir)]
      return result(used({ ...state, cwd: dir, visited }, 'cd'))
    }

    case 'mkdir':
    case 'md': {
      if (name === 'md' && os === 'mac') return result(state, [...notRecognized(os, rawName), hint('Macissa kansio luodaan komennolla mkdir.')])
      if (operands.length === 0) {
        return result(state, [
          os === 'windows'
            ? { kind: 'error', text: 'mkdir: Missing an argument for parameter \'Path\'.' }
            : { kind: 'error', text: 'usage: mkdir [-pv] [-m mode] directory_name ...' },
          hint('Kerro kansion nimi, esimerkiksi: mkdir projekti'),
        ])
      }
      let next = state
      const output: Line[] = []
      const createParents = os === 'windows' || flags.includes('-p')
      for (const operand of operands) {
        const target = resolvePath(next, operand)
        if (findDir(next, target) || findFile(next, target)) {
          output.push(
            os === 'windows'
              ? { kind: 'error', text: `New-Item: An item with the specified name ${displayPath(os, target)} already exists.` }
              : { kind: 'error', text: `mkdir: ${operand}: File exists` },
            hint('Samanniminen kansio on jo olemassa. Voit siirtyä siihen komennolla cd.'),
          )
          continue
        }
        if (!createParents && !findDir(next, target.slice(0, -1))) {
          output.push({ kind: 'error', text: `mkdir: ${operand}: No such file or directory` }, hint('Yläkansiota ei ole. Luo kansiot yksi kerrallaan.'))
          continue
        }
        next = { ...next, dirs: addDir(next.dirs, target) }
        if (os === 'windows') output.push(...windowsListing(next, target.slice(0, -1), { dirs: [target], files: [] }))
      }
      return result(output.some((l) => l.kind === 'error') && next === state ? state : used(next, 'mkdir'), output)
    }

    case 'clear':
    case 'cls':
      if (name === 'cls' && os === 'mac') return result(state, [...notRecognized(os, rawName), hint('Macissa näyttö tyhjennetään komennolla clear.')])
      return result(used(state, 'clear'), [], true)

    case 'git':
    case 'claude': {
      if (args.length === 1 && (args[0] === '--version' || args[0] === '-v')) {
        const text = name === 'git' ? FAKE_VERSIONS.git[os] : FAKE_VERSIONS.claude
        return result(used(state, name), [out(text)])
      }
      return result(state, [hint(`Tässä harjoitusterminaalissa ${name}-komennosta toimii vain ${name} --version. Oikeassa terminaalissa voit tehdä enemmän.`)])
    }

    default:
      return result(state, [...notRecognized(os, rawName), hint('Kirjoita help, niin näet komennot, joita tässä harjoituksessa voi käyttää.')])
  }
}

// ---------------------------------------------------------------- missiot

export function isConditionMet(state: ShellState, condition: MissionCondition): boolean {
  switch (condition.type) {
    case 'cwdIs':
      return samePath(state.cwd, virtualPath(condition.path))
    case 'dirExists':
      return findDir(state, virtualPath(condition.path)) !== undefined
    case 'visited':
      return state.visited.includes(key(virtualPath(condition.path)))
    case 'commandUsed':
      return state.usedCommands.includes(condition.command.toLowerCase())
  }
}

export function isMissionComplete(state: ShellState, mission: Pick<Mission, 'conditions'>): boolean {
  return mission.conditions.every((c) => isConditionMet(state, c))
}
