import { describe, expect, it } from 'vitest'
import { applyTranslation } from './translate'

describe('käännöksen yhdistäminen', () => {
  const source = {
    git: { term: 'Git', category: 'git', definition: 'Versionhallinta.', readMore: 'https://git-scm.com/' },
    komento: { term: 'komento', category: 'terminaali', definition: 'Käsky.' },
  }

  it('korvaa tekstit ja pitää rakenteen lähteestä', () => {
    const { value, errors, missing } = applyTranslation(source, { git: { term: 'Git', definition: 'Version control.' } })
    expect(errors).toEqual([])
    expect(value).toEqual({
      git: { term: 'Git', category: 'git', definition: 'Version control.', readMore: 'https://git-scm.com/' },
      komento: source.komento,
    })
    // Rakennekenttiä (category, readMore) ei tarvitse kääntää.
    expect(missing).toEqual(['komento.term', 'komento.definition'])
  })

  it('rakennekentän voi silti vaihtaa, esim. kieleen sopivaan linkkiin', () => {
    const { value } = applyTranslation(source, { git: { readMore: 'https://example.com/' } })
    expect(value).toMatchObject({ git: { readMore: 'https://example.com/' } })
  })

  it('tuntematon tunniste tai kenttä ja väärä tyyppi ovat virheitä', () => {
    const { errors } = applyTranslation(source, { olematon: { term: 'X' }, git: { termi: 'X', definition: 1 } })
    expect(errors).toEqual(['olematon: tuntematon tunniste', 'git.termi: tuntematon kenttä', 'git.definition: käännöksen pitää olla tekstiä'])
  })

  it('yhdistää id:lliset taulukot id:n mukaan ja pitää lähteen järjestyksen', () => {
    const quiz = {
      questions: [
        { id: 'q1', question: 'K1', options: [{ id: 'a', text: 'A', correct: true, explanation: 'E' }] },
        { id: 'q2', question: 'K2', options: [{ id: 'b', text: 'B', correct: false, explanation: 'E' }] },
      ],
    }
    const { value, errors, missing } = applyTranslation(quiz, { questions: [{ id: 'q2', question: 'Q2' }, { id: 'q1', question: 'Q1' }] })
    expect(errors).toEqual([])
    expect(value).toEqual({
      questions: [
        { ...quiz.questions[0], question: 'Q1' },
        { ...quiz.questions[1], question: 'Q2' },
      ],
    })
    expect(missing).toEqual(['questions.q1.options.a.text', 'questions.q1.options.a.explanation', 'questions.q2.options.b.text', 'questions.q2.options.b.explanation'])
    expect(applyTranslation(quiz, { questions: [{ id: 'q3', question: 'Q3' }] }).errors).toEqual(['questions: tuntematon tunniste "q3"'])
  })

  it('totuusarvoja ja numeroita ei voi kääntää', () => {
    const quiz = { questions: [{ id: 'q1', options: [{ id: 'a', correct: true }] }] }
    expect(applyTranslation(quiz, { questions: [{ id: 'q1', options: [{ id: 'a', correct: false }] }] }).errors).toEqual([
      'questions.q1.options.a.correct: vain tekstejä voi kääntää',
    ])
  })

  it('tekstitaulukko korvataan kokonaan, objektitaulukko yhdistetään järjestyksessä', () => {
    const entry = { steps: ['Yksi', 'Kaksi'], conditions: [{ type: 'cwdIs', path: '~/projekti' }] }
    const { value, errors } = applyTranslation(entry, { steps: ['One', 'Two', 'Three'], conditions: [{ path: '~/project' }] })
    expect(errors).toEqual([])
    expect(value).toEqual({ steps: ['One', 'Two', 'Three'], conditions: [{ type: 'cwdIs', path: '~/project' }] })
    expect(applyTranslation(entry, { conditions: [] }).errors).toEqual(['conditions: taulukossa pitää olla yhtä monta alkiota kuin lähteessä (1)'])
  })

  it('tiedostokohtaiset rakennekentät eivät näy kääntämättöminä', () => {
    const commands = { 'git-init': { description: 'Aloittaa.', windows: 'git init', mac: 'git init' } }
    expect(applyTranslation(commands, { 'git-init': { description: 'Starts.' } }, { structuralKeys: ['windows', 'mac'] }).missing).toEqual([])
  })
})
