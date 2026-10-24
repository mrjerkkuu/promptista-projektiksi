import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { findTags, validateContent } from './validate-content.ts'

const realContent = path.resolve(import.meta.dirname, '../src/content')

describe('validateContent – oikea sisältö', () => {
  it('ei löydä virheitä projektin sisällöstä', () => {
    const { errors } = validateContent(realContent)
    expect(errors).toEqual([])
  })
})

describe('findTags', () => {
  it('löytää komponentit ja attribuutit, mutta ei koodilohkojen sisältä', () => {
    const tags = findTags('Teksti <Command id="install-git" />\n`<Command id="x" />`\n```\n<Term id="y">\n```\n<Term id="git">Git</Term>')
    expect(tags).toEqual([
      { name: 'Command', attrs: { id: 'install-git' } },
      { name: 'Term', attrs: { id: 'git' } },
    ])
  })
})

/** Rakentaa väliaikaisen, toimivan sisältökansion, jota testit rikkovat. */
function makeFixture(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pp-content-'))
  const write = (rel: string, data: unknown) => {
    const file = path.join(dir, rel)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, typeof data === 'string' ? data : JSON.stringify(data))
  }
  write('commands.json', {
    'check-git': { description: 'Versio', windows: 'git --version', mac: 'git --version', source: 'https://git-scm.com/', verifiedAt: '2026-10-24' },
  })
  write('glossary.json', { git: { term: 'Git', definition: 'Versionhallinta.' } })
  write('missions.json', {
    'm-1': { title: 'T', goal: 'G', success: 'S', conditions: [{ type: 'cwdIs', path: '~/projekti' }] },
  })
  write('troubleshooting.json', { 'ei-loydy': { title: 'T', os: ['windows'], symptom: 'S', steps: ['A'] } })
  write('verify.json', {
    git: {
      title: 'Git',
      command: 'check-git',
      question: 'Q',
      options: [
        { id: 'a', label: 'A', correct: true, explanation: 'E' },
        { id: 'b', label: { windows: 'W', mac: 'M' }, correct: false, explanation: 'E', troubleshooting: 'ei-loydy' },
        { id: 'c', label: 'C', correct: false, explanation: 'E', troubleshooting: 'ei-loydy' },
      ],
    },
  })
  write('badges.json', {
    b: { title: 'B', description: 'D', icon: '*', condition: { type: 'modulesComplete', modules: ['polku/moduuli'] } },
  })
  write('paths/polku/path.json', {
    id: 'polku',
    title: 'P',
    description: 'D',
    topics: [{ id: 'aihe', title: 'A', description: 'D', modules: [{ id: 'moduuli', title: 'M', summary: 'S' }] }],
  })
  write(
    'paths/polku/aihe/moduuli/index.mdx',
    '## M\n\n<Term id="git">Git</Term> <Command id="check-git" /> <Terminal mission="m-1" /> <VerifyStep id="git" />\n<Os only="mac">x</Os>\n<Quiz />\n',
  )
  write('paths/polku/aihe/moduuli/quiz.json', {
    questions: [1, 2].map((n) => ({
      id: `q${n}`,
      question: 'Q',
      options: [
        { id: 'a', text: 'A', correct: true, explanation: 'E' },
        { id: 'b', text: 'B', correct: false, explanation: 'E' },
        { id: 'c', text: 'C', correct: false, explanation: 'E' },
      ],
    })),
  })
  return dir
}

describe('validateContent – rikkinäinen sisältö kaatuu', () => {
  const dirs: string[] = []
  const fixture = () => {
    const d = makeFixture()
    dirs.push(d)
    return d
  }
  afterEach(() => {
    for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true })
  })

  const mdx = (dir: string) => path.join(dir, 'paths/polku/aihe/moduuli/index.mdx')
  const replaceIn = (file: string, from: string, to: string) => fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(from, to))

  it('kelvollinen fixture menee läpi', () => {
    expect(validateContent(fixture()).errors).toEqual([])
  })

  it('tuntematon komento', () => {
    const d = fixture()
    replaceIn(mdx(d), 'check-git', 'puuttuva')
    expect(validateContent(d).errors.join()).toMatch(/tuntematon komento "puuttuva"/)
  })

  it('tuntematon termi, missio ja varmistus', () => {
    const d = fixture()
    replaceIn(mdx(d), 'id="git">', 'id="xx">')
    replaceIn(mdx(d), 'mission="m-1"', 'mission="m-2"')
    replaceIn(mdx(d), 'VerifyStep id="git"', 'VerifyStep id="yy"')
    const errors = validateContent(d).errors.join('\n')
    expect(errors).toMatch(/tuntematon sanastotermi "xx"/)
    expect(errors).toMatch(/tuntematon missio "m-2"/)
    expect(errors).toMatch(/tuntematon varmistus "yy"/)
  })

  it('<Quiz /> ilman quiz.jsonia', () => {
    const d = fixture()
    fs.rmSync(path.join(d, 'paths/polku/aihe/moduuli/quiz.json'))
    expect(validateContent(d).errors.join()).toMatch(/quiz.json puuttuu/)
  })

  it('quiz.json ilman <Quiz />-komponenttia', () => {
    const d = fixture()
    replaceIn(mdx(d), '<Quiz />', '')
    expect(validateContent(d).errors.join()).toMatch(/ei ole <Quiz \/>-komponenttia/)
  })

  it('visassa kaksi oikeaa vastausta', () => {
    const d = fixture()
    const file = path.join(d, 'paths/polku/aihe/moduuli/quiz.json')
    replaceIn(file, '"correct":false', '"correct":true')
    expect(validateContent(d).errors.join()).toMatch(/tasan yksi oikea/)
  })

  it('tuntematon komponentti MDX:ssä', () => {
    const d = fixture()
    replaceIn(mdx(d), '<Quiz />', '<Quiz />\n<Vieras />')
    expect(validateContent(d).errors.join()).toMatch(/<Vieras> ei ole sallittu/)
  })

  it('väärä Os-arvo', () => {
    const d = fixture()
    replaceIn(mdx(d), 'only="mac"', 'only="linux"')
    expect(validateContent(d).errors.join()).toMatch(/only-arvon/)
  })

  it('moduulin tietopaketti puuttuu', () => {
    const d = fixture()
    fs.rmSync(mdx(d))
    expect(validateContent(d).errors.join()).toMatch(/tietopaketti puuttuu/)
  })

  it('listaamaton moduulikansio', () => {
    const d = fixture()
    fs.mkdirSync(path.join(d, 'paths/polku/aihe/ylimaarainen'))
    expect(validateContent(d).errors.join()).toMatch(/ei ole listattu path.json/)
  })

  it('merkki viittaa tuntemattomaan moduuliin', () => {
    const d = fixture()
    replaceIn(path.join(d, 'badges.json'), 'polku/moduuli', 'polku/olematon')
    expect(validateContent(d).errors.join()).toMatch(/tuntematon moduuli "polku\/olematon"/)
  })

  it('väärä vaihtoehto ilman vianmääritystä', () => {
    const d = fixture()
    replaceIn(path.join(d, 'verify.json'), ',"troubleshooting":"ei-loydy"', '')
    expect(validateContent(d).errors.join()).toMatch(/ohjata vianmääritykseen/)
  })

  it('verifiedAt: TODO tuottaa varoituksen', () => {
    const d = fixture()
    replaceIn(path.join(d, 'commands.json'), '2026-10-24', 'TODO')
    const result = validateContent(d)
    expect(result.errors).toEqual([])
    expect(result.warnings.join()).toMatch(/check-git/)
  })

  it('#-pääotsikko on kielletty', () => {
    const d = fixture()
    replaceIn(mdx(d), '## M', '# M')
    expect(validateContent(d).errors.join()).toMatch(/pääotsikkoa/)
  })

  it('rikkinäinen JSON', () => {
    const d = fixture()
    fs.writeFileSync(path.join(d, 'glossary.json'), '{ rikki')
    expect(validateContent(d).errors.join()).toMatch(/glossary.json: JSON-tiedostoa ei voitu lukea/)
  })
})
