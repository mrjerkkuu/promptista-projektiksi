import type { Language } from '../../i18n/languages'
import type { Mission, MissionCondition, Os } from '../../schemas/content'

/**
 * Terminaalisimulaattorin ydin: muistissa toimiva kansiorakenne ja komennot.
 * Kaikki funktiot ovat puhtaita: ne saavat tilan ja palauttavat uuden tilan.
 * Mitään oikeaa tiedostojärjestelmää ei käytetä.
 *
 * Oikean terminaalin virheilmoitukset ovat englanniksi kaikilla kielillä, kuten oikeassakin
 * terminaalissa. Vihjeet, ohje ja harjoituksen käyttäjä- ja tiedostonimet ovat sivuston kielellä.
 */

export type LineKind = 'input' | 'output' | 'error' | 'hint'

export interface Line {
  kind: LineKind
  text: string
}

export interface ShellState {
  os: Os
  /** Vihjeiden ja ohjeen kieli. */
  language: Language
  /** Kotikansio polkuna juuresta (esim. ["Users", "oppija"]). */
  home: string[]
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

/** Harjoituskoneen käyttäjä ja valmiina oleva tiedosto kielittäin. */
export const USER_NAME: Record<Language, string> = { fi: 'oppija', en: 'learner' }
const DEFAULT_DIRS = ['Desktop', 'Documents', 'Downloads']
const DEFAULT_FILES: Record<Language, string[][]> = {
  fi: [['Documents', 'muistiinpanot.txt']],
  en: [['Documents', 'notes.txt']],
}

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
export function virtualPath(path: string, home: string[] = ['Users', USER_NAME.fi]): string[] {
  return [...home, ...path.split('/').slice(1)]
}

function withAncestors(path: string[]): string[][] {
  return path.map((_, i) => path.slice(0, i + 1))
}

function addDir(dirs: string[][], path: string[]): string[][] {
  const result = [...dirs]
  for (const p of withAncestors(path)) if (!result.some((d) => samePath(d, p))) result.push(p)
  return result
}

export function createShell(os: Os, mission?: Pick<Mission, 'startDirs' | 'startCwd'>, language: Language = 'fi'): ShellState {
  const home = ['Users', USER_NAME[language]]
  let dirs: string[][] = []
  dirs = addDir(dirs, home)
  for (const d of DEFAULT_DIRS) dirs = addDir(dirs, [...home, d])
  for (const d of mission?.startDirs ?? []) dirs = addDir(dirs, virtualPath(d, home))
  const cwd = mission?.startCwd ? virtualPath(mission.startCwd, home) : home
  dirs = addDir(dirs, cwd)
  return {
    os,
    language,
    home,
    dirs,
    files: DEFAULT_FILES[language].map((f) => [...home, ...f]),
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
  const here = samePath(state.cwd, state.home) ? '~' : state.cwd.length === 0 ? '/' : state.cwd[state.cwd.length - 1]
  return `${state.home[state.home.length - 1]}@MacBook ${here} % `
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
    base = state.home
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

const out = (text: string): Line => ({ kind: 'output', text })

function windowsListing(state: ShellState, dir: string[], entries: { dirs: string[][]; files: string[][] }): Line[] {
  if (entries.dirs.length === 0 && entries.files.length === 0) return []
  const rows = [
    ...entries.dirs.map((d) => `d----   ${d[d.length - 1]}`),
    ...entries.files.map((f) => `-a---   ${f[f.length - 1]}`),
  ]
  return [out(`\n    Directory: ${displayPath(state.os, dir)}\n\nMode    Name\n----    ----\n${rows.join('\n')}\n`)]
}

/** Simulaattorin omat tekstit (vihjeet ja help-ohje) kielittäin. */
const MESSAGES = {
  fi: {
    hint: 'Vihje',
    help: (os: Os) =>
      [
        'Tässä harjoitusterminaalissa toimivat nämä komennot:',
        '  help            näyttää tämän ohjeen',
        '  pwd             kertoo, missä kansiossa olet',
        os === 'windows' ? '  ls  tai  dir    listaa kansion sisällön' : '  ls              listaa kansion sisällön',
        '  cd kansio       siirtyy kansioon',
        '  cd ..           siirtyy yhden kansion ylöspäin',
        '  mkdir nimi      luo uuden kansion',
        os === 'windows' ? '  clear  tai  cls tyhjentää näytön' : '  clear           tyhjentää näytön',
        '  git --version   näyttää Gitin version (esimerkki)',
        '  claude --version  näyttää Claude Coden version (esimerkki)',
      ].join('\n'),
    macDir: 'Macissa kansion sisältö listataan komennolla ls.',
    lsNotFound: 'Tarkista kansion nimi. Komento ls ilman lisäyksiä listaa nykyisen kansion.',
    cdSpace: 'Muista välilyönti: cd ..',
    cdFile: (name: string) => `${name} on tiedosto eikä kansio. Kansioon voi siirtyä, tiedostoon ei.`,
    cdNotFound: 'Kansiota ei löytynyt. Katso komennolla ls, mitä kansioita tässä on, ja tarkista kirjoitusasu.',
    macMd: 'Macissa kansio luodaan komennolla mkdir.',
    mkdirName: 'Kerro kansion nimi, esimerkiksi: mkdir projekti',
    mkdirExists: 'Samanniminen kansio on jo olemassa. Voit siirtyä siihen komennolla cd.',
    mkdirParent: 'Yläkansiota ei ole. Luo kansiot yksi kerrallaan.',
    macCls: 'Macissa näyttö tyhjennetään komennolla clear.',
    versionOnly: (name: string) => `Tässä harjoitusterminaalissa ${name}-komennosta toimii vain ${name} --version. Oikeassa terminaalissa voit tehdä enemmän.`,
    unknown: 'Kirjoita help, niin näet komennot, joita tässä harjoituksessa voi käyttää.',
  },
  en: {
    hint: 'Hint',
    help: (os: Os) =>
      [
        'These commands work in this practice terminal:',
        '  help            shows these instructions',
        '  pwd             tells you which folder you are in',
        os === 'windows' ? '  ls  or  dir     lists what is in the folder' : '  ls              lists what is in the folder',
        '  cd folder       moves into a folder',
        '  cd ..           moves one folder up',
        '  mkdir name      creates a new folder',
        os === 'windows' ? '  clear  or  cls  clears the screen' : '  clear           clears the screen',
        '  git --version   shows the Git version (example)',
        '  claude --version  shows the Claude Code version (example)',
      ].join('\n'),
    macDir: 'On a Mac, you list a folder’s contents with the command ls.',
    lsNotFound: 'Check the folder name. The command ls on its own lists the current folder.',
    cdSpace: 'Remember the space: cd ..',
    cdFile: (name: string) => `${name} is a file, not a folder. You can move into a folder, but not into a file.`,
    cdNotFound: 'Folder not found. Use the command ls to see which folders are here, and check the spelling.',
    macMd: 'On a Mac, you create a folder with the command mkdir.',
    mkdirName: 'Give the folder a name, for example: mkdir project',
    mkdirExists: 'A folder with that name already exists. You can move into it with the command cd.',
    mkdirParent: 'The parent folder doesn’t exist. Create the folders one at a time.',
    macCls: 'On a Mac, you clear the screen with the command clear.',
    versionOnly: (name: string) => `In this practice terminal, only ${name} --version works for the ${name} command. In a real terminal you can do much more.`,
    unknown: 'Type help to see the commands you can use in this exercise.',
  },
} satisfies Record<Language, unknown>

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
  const m = MESSAGES[state.language]
  const hint = (text: string): Line => ({ kind: 'hint', text: `${m.hint}: ${text}` })
  const flags = args.filter((a) => a.startsWith('-'))
  const operands = args.filter((a) => !a.startsWith('-'))

  switch (name) {
    case 'help':
      return result(used(state, 'help'), [out(m.help(os))])

    case 'pwd': {
      const path = displayPath(os, state.cwd)
      return result(used(state, 'pwd'), [out(os === 'windows' ? `\nPath\n----\n${path}\n` : path)])
    }

    case 'dir':
    case 'ls': {
      if (name === 'dir' && os === 'mac') {
        return result(state, [...notRecognized(os, rawName), hint(m.macDir)])
      }
      const target = operands[0] ? resolvePath(state, operands[0]) : state.cwd
      const dir = findDir(state, target)
      if (!dir) {
        const shown = operands[0]
        return result(state, [
          os === 'windows'
            ? { kind: 'error', text: `Get-ChildItem: Cannot find path '${displayPath(os, target)}' because it does not exist.` }
            : { kind: 'error', text: `ls: ${shown}: No such file or directory` },
          hint(m.lsNotFound),
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
      return result(state, [...notRecognized(os, rawName), hint(m.cdSpace)])

    case 'cd': {
      const target = operands[0] === undefined ? [...state.home] : resolvePath(state, operands[0])
      const dir = findDir(state, target)
      if (!dir) {
        const shown = operands[0] ?? '~'
        if (findFile(state, target)) {
          return result(state, [
            os === 'windows'
              ? { kind: 'error', text: `Set-Location: Cannot find path '${displayPath(os, target)}' because it does not exist.` }
              : { kind: 'error', text: `cd: not a directory: ${shown}` },
            hint(m.cdFile(target[target.length - 1])),
          ])
        }
        return result(state, [
          os === 'windows'
            ? { kind: 'error', text: `Set-Location: Cannot find path '${displayPath(os, target)}' because it does not exist.` }
            : { kind: 'error', text: `cd: no such file or directory: ${shown}` },
          hint(m.cdNotFound),
        ])
      }
      const visited = state.visited.includes(key(dir)) ? state.visited : [...state.visited, key(dir)]
      return result(used({ ...state, cwd: dir, visited }, 'cd'))
    }

    case 'mkdir':
    case 'md': {
      if (name === 'md' && os === 'mac') return result(state, [...notRecognized(os, rawName), hint(m.macMd)])
      if (operands.length === 0) {
        return result(state, [
          os === 'windows'
            ? { kind: 'error', text: 'mkdir: Missing an argument for parameter \'Path\'.' }
            : { kind: 'error', text: 'usage: mkdir [-pv] [-m mode] directory_name ...' },
          hint(m.mkdirName),
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
            hint(m.mkdirExists),
          )
          continue
        }
        if (!createParents && !findDir(next, target.slice(0, -1))) {
          output.push({ kind: 'error', text: `mkdir: ${operand}: No such file or directory` }, hint(m.mkdirParent))
          continue
        }
        next = { ...next, dirs: addDir(next.dirs, target) }
        if (os === 'windows') output.push(...windowsListing(next, target.slice(0, -1), { dirs: [target], files: [] }))
      }
      return result(output.some((l) => l.kind === 'error') && next === state ? state : used(next, 'mkdir'), output)
    }

    case 'clear':
    case 'cls':
      if (name === 'cls' && os === 'mac') return result(state, [...notRecognized(os, rawName), hint(m.macCls)])
      return result(used(state, 'clear'), [], true)

    case 'git':
    case 'claude': {
      if (args.length === 1 && (args[0] === '--version' || args[0] === '-v')) {
        const text = name === 'git' ? FAKE_VERSIONS.git[os] : FAKE_VERSIONS.claude
        return result(used(state, name), [out(text)])
      }
      return result(state, [hint(m.versionOnly(name))])
    }

    default:
      return result(state, [...notRecognized(os, rawName), hint(m.unknown)])
  }
}

// ---------------------------------------------------------------- missiot

export function isConditionMet(state: ShellState, condition: MissionCondition): boolean {
  switch (condition.type) {
    case 'cwdIs':
      return samePath(state.cwd, virtualPath(condition.path, state.home))
    case 'dirExists':
      return findDir(state, virtualPath(condition.path, state.home)) !== undefined
    case 'visited':
      return state.visited.includes(key(virtualPath(condition.path, state.home)))
    case 'commandUsed':
      return state.usedCommands.includes(condition.command.toLowerCase())
  }
}

export function isMissionComplete(state: ShellState, mission: Pick<Mission, 'conditions'>): boolean {
  return mission.conditions.every((c) => isConditionMet(state, c))
}
