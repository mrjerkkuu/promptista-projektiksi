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

  it('arvoton attribuutti saa arvon true', () => {
    expect(findTags('<Screenshot id="i03" alt="musta neliö" inline />')).toEqual([
      { name: 'Screenshot', attrs: { id: 'i03', alt: 'musta neliö', inline: 'true' } },
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
  write('glossary.json', { git: { term: 'Git', category: 'git', definition: 'Versionhallinta.' } })
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
    order: 1,
    audience: 'A',
    topics: [{ id: 'aihe', title: 'A', description: 'D', modules: [{ id: 'moduuli', title: 'M', summary: 'S' }] }],
  })
  write(
    'paths/polku/aihe/moduuli/index.mdx',
    '## M\n\n<Term id="git">Git</Term> <Command id="check-git" /> <Terminal mission="m-1" /> <VerifyStep id="git" />\n<Os only="mac">x</Os>\n<NuppuSays pose="koodaa">Moi!</NuppuSays>\n<Quiz />\n',
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

  it('Path-komponentin tuntematon tai puuttuva polku', () => {
    const d = fixture()
    replaceIn(mdx(d), '<Quiz />', '<Path only="polku">x</Path>\n<Path only="vieras">y</Path>\n<Path>z</Path>\n<Quiz />')
    const errors = validateContent(d).errors.join('\n')
    expect(errors).toMatch(/tuntematon polku "vieras"/)
    expect(errors).toMatch(/<Path> puuttuu only/)
    expect(errors).not.toMatch(/"polku"/)
  })

  it('Nupun tuntematon tai puuttuva asento', () => {
    const d = fixture()
    replaceIn(mdx(d), 'pose="koodaa"', 'pose="lentaa"')
    replaceIn(mdx(d), '<Quiz />', '<NuppuSays>Hei</NuppuSays>\n<Quiz />')
    const errors = validateContent(d).errors.join('\n')
    expect(errors).toMatch(/tuntematon Nupun asento "lentaa"/)
    expect(errors).toMatch(/<NuppuSays> puuttuu pose/)
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

  it('merkin tai vianmäärityksen tuntematon polku', () => {
    const d = fixture()
    replaceIn(path.join(d, 'badges.json'), '"icon":"*"', '"icon":"*","path":"olematon"')
    replaceIn(path.join(d, 'troubleshooting.json'), '"steps":["A"]', '"steps":["A"],"path":"toinen"')
    const errors = validateContent(d).errors.join('\n')
    expect(errors).toMatch(/badges.json: "b" tuntematon polku "olematon"/)
    expect(errors).toMatch(/troubleshooting.json: "ei-loydy" tuntematon polku "toinen"/)
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

  it('kahdella polulla sama järjestysnumero', () => {
    const d = fixture()
    const meta = JSON.parse(fs.readFileSync(path.join(d, 'paths/polku/path.json'), 'utf8'))
    const copy = { ...meta, id: 'toinen' }
    fs.mkdirSync(path.join(d, 'paths/toinen/aihe/moduuli'), { recursive: true })
    fs.writeFileSync(path.join(d, 'paths/toinen/path.json'), JSON.stringify(copy))
    fs.writeFileSync(path.join(d, 'paths/toinen/aihe/moduuli/index.mdx'), '## M\n')
    expect(validateContent(d).errors.join()).toMatch(/order 1 on jo polulla "polku"/)
  })

  describe('yhteiset aiheet', () => {
    /** Lisää polun "toinen", jolla on oma aihe "oma" ja annetut viittaukset. */
    const addSharingPath = (d: string, refs: string[]) => {
      const meta = {
        id: 'toinen',
        title: 'T',
        description: 'D',
        order: 2,
        audience: 'A',
        topics: [{ id: 'aihe', title: 'A', description: 'D', modules: [{ id: 'oma', title: 'O', summary: 'S' }, ...refs.map((ref) => ({ ref }))] }],
      }
      fs.mkdirSync(path.join(d, 'paths/toinen/aihe/oma'), { recursive: true })
      fs.writeFileSync(path.join(d, 'paths/toinen/path.json'), JSON.stringify(meta))
      fs.writeFileSync(path.join(d, 'paths/toinen/aihe/oma/index.mdx'), '## O\n')
    }

    it('kelvollinen viittaus menee läpi ilman omaa kansiota', () => {
      const d = fixture()
      addSharingPath(d, ['polku/moduuli'])
      expect(validateContent(d).errors).toEqual([])
    })

    it('tuntematon polku tai aihe', () => {
      const d = fixture()
      addSharingPath(d, ['olematon/moduuli', 'polku/puuttuu'])
      const errors = validateContent(d).errors.join('\n')
      expect(errors).toMatch(/viittaus "olematon\/moduuli": tuntematon polku "olematon"/)
      expect(errors).toMatch(/polulla "polku" ei ole aihetta "puuttuu"/)
    })

    it('viittaus viittaukseen (ketju) on kielletty', () => {
      const d = fixture()
      addSharingPath(d, ['polku/moduuli'])
      const file = path.join(d, 'paths/polku/path.json')
      const meta = JSON.parse(fs.readFileSync(file, 'utf8'))
      meta.topics[0].modules.push({ ref: 'toinen/oma' })
      fs.writeFileSync(file, JSON.stringify(meta))
      const third = { ...meta, id: 'kolmas', order: 3, topics: [{ id: 'aihe', title: 'A', description: 'D', modules: [{ ref: 'toinen/moduuli' }] }] }
      fs.mkdirSync(path.join(d, 'paths/kolmas'))
      fs.writeFileSync(path.join(d, 'paths/kolmas/path.json'), JSON.stringify(third))
      expect(validateContent(d).errors.join()).toMatch(/kohde on itsekin viittaus \("polku\/moduuli"\)/)
    })

    it('viittaus omaan polkuun on kielletty', () => {
      const d = fixture()
      const file = path.join(d, 'paths/polku/path.json')
      const meta = JSON.parse(fs.readFileSync(file, 'utf8'))
      meta.topics[0].modules.push({ ref: 'polku/moduuli' })
      fs.writeFileSync(file, JSON.stringify(meta))
      const errors = validateContent(d).errors.join()
      expect(errors).toMatch(/osoittaa omalle polulle/)
      expect(errors).toMatch(/"moduuli" esiintyy polulla kahdesti/)
    })

    it('yhteisessä aiheessa ei saa olla linkkiä tietyn polun aiheeseen', () => {
      const d = fixture()
      addSharingPath(d, ['polku/moduuli'])
      fs.appendFileSync(mdx(d), '\nKatso [tämä](#/polku/polku/moduuli).\n')
      expect(validateContent(d).errors.join()).toMatch(/aihe on yhteinen \(myös polulla "toinen"\)/)
    })

    it('sama linkki on sallittu aiheessa, jota mikään polku ei jaa', () => {
      const d = fixture()
      fs.appendFileSync(mdx(d), '\nKatso [tämä](#/polku/polku/moduuli).\n')
      expect(validateContent(d).errors).toEqual([])
    })

    it('merkki viittaa yhteiseen aiheeseen alkuperäisellä avaimella', () => {
      const d = fixture()
      addSharingPath(d, ['polku/moduuli'])
      replaceIn(path.join(d, 'badges.json'), 'polku/moduuli', 'toinen/moduuli')
      expect(validateContent(d).errors.join()).toMatch(/moduuli "toinen\/moduuli" on viittaus: käytä alkuperäistä avainta "polku\/moduuli"/)
    })
  })

  describe('kuvakaappaukset', () => {
    /** Kuvakansio, jossa on kuva "kuva" (kuvan sisällöllä ei ole väliä, vain olemassaololla). */
    const addScreenshots = (d: string) => {
      const shots = path.join(d, 'kuvat')
      fs.mkdirSync(shots)
      fs.writeFileSync(path.join(shots, 'kuvat.json'), JSON.stringify({ kuva: { width: 300, height: 200 } }))
      fs.writeFileSync(path.join(shots, 'kuva.webp'), '')
      return shots
    }

    it('kelvollinen kuva menee läpi', () => {
      const d = fixture()
      const shots = addScreenshots(d)
      replaceIn(mdx(d), '<Quiz />', '<Screenshot id="kuva" alt="Valikko auki" title="valikko" />\nNapsauta <Screenshot id="kuva" alt="kuvake" inline />.\n<Quiz />')
      const result = validateContent(d, shots)
      expect(result.errors).toEqual([])
      expect(result.warnings).toEqual([])
    })

    it('tuntematon kuva, puuttuva id, puuttuva tai tyhjä vaihtoehtoinen teksti ja puuttuva title', () => {
      const d = fixture()
      const shots = addScreenshots(d)
      replaceIn(
        mdx(d),
        '<Quiz />',
        '<Screenshot id="olematon" alt="A" title="a" />\n<Screenshot alt="B" title="b" />\n<Screenshot id="kuva" title="c" />\n<Screenshot id="kuva" alt=" " title="d" />\n<Screenshot id="kuva" alt="E" />\n<Quiz />',
      )
      const errors = validateContent(d, shots).errors.join('\n')
      expect(errors).toMatch(/tuntematon kuva "olematon"/)
      expect(errors).toMatch(/<Screenshot> puuttuu id/)
      expect(errors.match(/puuttuu vaihtoehtoinen teksti/g)).toHaveLength(2)
      expect(errors.match(/puuttuu title/g)).toHaveLength(1)
    })

    it('kuva ilman kokoa tai koko ilman kuvaa', () => {
      const d = fixture()
      const shots = addScreenshots(d)
      fs.rmSync(path.join(shots, 'kuva.webp'))
      fs.writeFileSync(path.join(shots, 'ylimaarainen.webp'), '')
      const errors = validateContent(d, shots).errors.join('\n')
      expect(errors).toMatch(/kuvaa "kuva.webp" ei löydy/)
      expect(errors).toMatch(/kuvalta "ylimaarainen.webp" puuttuu koko/)
    })

    it('käyttämättömästä kuvasta tulee varoitus', () => {
      const d = fixture()
      const result = validateContent(d, addScreenshots(d))
      expect(result.errors).toEqual([])
      expect(result.warnings.join()).toMatch(/kuvaa "kuva" ei käytetä/)
    })
  })

  it('rikkinäinen JSON', () => {
    const d = fixture()
    fs.writeFileSync(path.join(d, 'glossary.json'), '{ rikki')
    expect(validateContent(d).errors.join()).toMatch(/glossary.json: JSON-tiedostoa ei voitu lukea/)
  })
})
