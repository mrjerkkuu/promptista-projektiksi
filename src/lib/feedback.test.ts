import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { FEEDBACK_EMAIL, FEEDBACK_TYPES, feedbackBody, feedbackTitle, issueUrl, mailtoUrl, type Feedback } from './feedback'

const feedback: Feedback = {
  type: 'virhe',
  text: 'Kirjoitusvirhe & muuta\nToinen rivi',
  page: '0.2 Terminaali – https://example.com/#/polku/claude-code/terminaali',
  os: 'Windows',
}

describe('palaute', () => {
  it('otsikoksi tulee ensimmäinen rivi lyhennettynä', () => {
    expect(feedbackTitle(feedback)).toBe('Virhe: Kirjoitusvirhe & muuta')
    expect(feedbackTitle({ type: 'idea', text: 'a'.repeat(100) }, 10)).toBe(`Idea: ${'a'.repeat(9)}…`)
  })

  it('GitHub-linkki täyttää lomakepohjan kentät', () => {
    const url = new URL(issueUrl(feedback))
    expect(url.origin + url.pathname).toBe('https://github.com/mrjerkkuu/promptista-projektiksi/issues/new')
    expect(Object.fromEntries(url.searchParams)).toEqual({
      template: '2-virhe.yml',
      title: 'Virhe: Kirjoitusvirhe & muuta',
      kuvaus: 'Kirjoitusvirhe & muuta\nToinen rivi',
      sivu: feedback.page,
      kayttojarjestelma: 'Windows',
      body: feedbackBody(feedback),
    })
  })

  it('varateksti sisältää sivun ja käyttöjärjestelmän, jos lomakepohjaa ei ole', () => {
    expect(feedbackBody(feedback)).toBe(
      ['Palautteen tyyppi: Virhe tai epäselvä kohta', `Sivu: ${feedback.page}`, 'Käyttöjärjestelmä: Windows', '', feedback.text].join('\n'),
    )
  })

  it('tyhjä palaute avaa pelkän lomakepohjan, eikä idealle lähetetä käyttöjärjestelmää', () => {
    const url = new URL(issueUrl({ type: 'idea', text: '  ', page: '', os: 'Mac' }))
    expect(Object.fromEntries(url.searchParams)).toEqual({ template: '1-kehitysidea.yml' })
  })

  it('sähköpostilinkki koodaa välilyönnit %20:ksi ja kokoaa tiedot viestiin', () => {
    const url = mailtoUrl(feedback)
    expect(url.startsWith(`mailto:${FEEDBACK_EMAIL}?subject=`)).toBe(true)
    expect(url).not.toContain('+')
    const params = new URLSearchParams(url.slice(url.indexOf('?')))
    expect(params.get('subject')).toBe('[Promptista projektiksi] Virhe: Kirjoitusvirhe & muuta')
    expect(params.get('body')).toBe(`Projekti: Promptista projektiksi (https://github.com/mrjerkkuu/promptista-projektiksi)\n${feedbackBody(feedback)}`)
  })

  it('tyhjänkin sähköpostin otsikko kertoo projektin', () => {
    const url = mailtoUrl({ type: 'idea', text: '', page: '', os: '' })
    expect(new URLSearchParams(url.slice(url.indexOf('?'))).get('subject')).toBe('[Promptista projektiksi] Kehitysidea')
  })

  it('englanninkielinen viesti käyttää samoja lomakepohjia ja kenttiä', () => {
    const english: Feedback = { ...feedback, language: 'en' }
    expect(feedbackTitle(english)).toBe('Mistake: Kirjoitusvirhe & muuta')
    expect(feedbackBody(english).split('\n').slice(0, 3)).toEqual(['Feedback type: Mistake or unclear part', `Page: ${feedback.page}`, 'Operating system: Windows'])
    expect(new URL(issueUrl(english)).searchParams.get('template')).toBe('2-virhe.yml')
    expect(feedbackBody({ ...english, os: '' })).toContain('Operating system: not chosen')
  })

  it.each(Object.values(FEEDBACK_TYPES))('lomakepohjassa $template on kentät, jotka sivu täyttää', ({ template }) => {
    const yml = readFileSync(`.github/ISSUE_TEMPLATE/${template}`, 'utf8')
    expect(yml).toMatch(/^\s+id: kuvaus$/m)
    expect(yml).toMatch(/^\s+id: sivu$/m)
    if (template !== '1-kehitysidea.yml') expect(yml).toMatch(/^\s+id: kayttojarjestelma$/m)
  })
})
