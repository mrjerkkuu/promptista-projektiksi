/// <reference types="node" />
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Kontrastitarkistus (WCAG 2.1 AA): luetaan värit tokens.css:stä ja tarkistetaan
 * tärkeimmät teksti/tausta-parit sekä vaaleassa että tummassa teemassa.
 * Kun design vaihtaa värit, tämä testi kertoo, jos kontrasti ei riitä.
 */

const css = fs.readFileSync(path.resolve(import.meta.dirname, 'tokens.css'), 'utf8')

function block(selector: string): string {
  const start = css.indexOf(selector)
  if (start < 0) throw new Error(`Valitsinta ${selector} ei löytynyt`)
  const open = css.indexOf('{', start)
  const close = css.indexOf('}', open)
  return css.slice(open + 1, close)
}

function colors(source: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const m of source.matchAll(/--(color-[a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g)) result[m[1]] = m[2]
  return result
}

const light = colors(block(':root {'))
const dark = { ...light, ...colors(block(":root[data-theme=\"dark\"]")) }

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

/** [teksti, tausta, vähimmäiskontrasti] */
const PAIRS: [string, string, number][] = [
  ['color-text', 'color-bg', 4.5],
  ['color-text', 'color-surface', 4.5],
  ['color-text', 'color-surface-muted', 4.5],
  ['color-text-muted', 'color-bg', 4.5],
  ['color-text-muted', 'color-surface', 4.5],
  ['color-link', 'color-bg', 4.5],
  ['color-link', 'color-surface', 4.5],
  ['color-on-primary', 'color-primary', 4.5],
  ['color-on-primary', 'color-primary-hover', 4.5],
  ['color-primary', 'color-surface', 4.5],
  ['color-on-error', 'color-error', 4.5],
  ['color-success', 'color-success-bg', 4.5],
  ['color-text', 'color-success-bg', 4.5],
  ['color-text', 'color-error-bg', 4.5],
  ['color-text', 'color-info-bg', 4.5],
  ['color-text', 'color-warning-bg', 4.5],
  ['color-badge', 'color-badge-bg', 4.5],
  ['color-badge', 'color-surface', 4.5],
  ['color-text-muted', 'color-surface-muted', 4.5],
  ['color-code-text', 'color-code-bg', 4.5],
  ['color-term-text', 'color-term-bg', 4.5],
  ['color-term-prompt', 'color-term-bg', 4.5],
  ['color-term-error', 'color-term-bg', 4.5],
  ['color-term-hint', 'color-term-bg', 4.5],
  // Käyttöliittymän osat (WCAG 1.4.11): vähintään 3:1.
  ['color-focus', 'color-bg', 3],
  ['color-focus', 'color-surface', 3],
  ['color-border', 'color-surface', 3],
  ['color-progress-fill', 'color-progress-track', 3],
  ['color-code-muted', 'color-code-bg', 3],
  // Design v2 (design-handoff/tokens/KONTRASTIT.md)
  ['color-success', 'color-bg', 4.5],
  ['color-success', 'color-surface', 4.5],
  ['color-error', 'color-error-bg', 4.5],
  ['color-error', 'color-surface', 4.5],
  ['color-badge-locked', 'color-surface', 4.5],
  ['color-text-muted', 'color-primary-soft', 4.5],
  ['color-text', 'color-primary-soft', 4.5],
  ['color-text', 'color-term-bar', 4.5],
  ['color-topic-0-ink', 'color-topic-0-bg', 4.5],
  ['color-topic-1-ink', 'color-topic-1-bg', 4.5],
  ['color-topic-2-ink', 'color-topic-2-bg', 4.5],
  ['color-topic-3-ink', 'color-topic-3-bg', 4.5],
  ['color-text', 'color-topic-0-bg', 4.5],
  ['color-text', 'color-topic-1-bg', 4.5],
  ['color-text', 'color-topic-2-bg', 4.5],
  ['color-text', 'color-topic-3-bg', 4.5],
  ['color-text-muted', 'color-topic-1-bg', 4.5],
  ['color-text-muted', 'color-topic-2-bg', 4.5],
  ['color-text-muted', 'color-topic-3-bg', 4.5],
  ['color-border', 'color-bg', 3],
  ['color-progress-fill', 'color-bg', 3],
  ['color-primary', 'color-bg', 3],
  ['color-info-icon', 'color-info-bg', 3],
  ['color-warning-icon', 'color-warning-bg', 3],
  // Sovelluksen omat käytöt, joita KONTRASTIT.md ei listaa.
  ['color-text-muted', 'color-topic-0-bg', 4.5], // aiheen kuvaus polkusivulla
  ['color-topic-0-ink', 'color-surface', 4.5], // aihechipin numero
  ['color-topic-1-ink', 'color-surface', 4.5],
  ['color-topic-2-ink', 'color-surface', 4.5],
  ['color-topic-3-ink', 'color-surface', 4.5],
  ['color-term-prompt', 'color-bg', 4.5], // syöttörivin kehote
  ['color-surface', 'color-success', 3], // vaihtoehdon ✓-ikoni
  ['color-surface', 'color-error', 3], // vaihtoehdon ✗-ikoni
]

describe('tumma teema', () => {
  it('käyttöjärjestelmän asetuksen ja käyttäjän valinnan paletit ovat samat', () => {
    expect(colors(block(':root:not([data-theme="light"])'))).toEqual(colors(block(':root[data-theme="dark"]')))
  })
})

describe.each([
  ['vaalea', light],
  ['tumma', dark],
])('kontrastit: %s teema', (_name, palette) => {
  it.each(PAIRS)('%s taustalla %s ≥ %s', (fg, bg, min) => {
    expect(palette[fg], fg).toBeDefined()
    expect(palette[bg], bg).toBeDefined()
    expect(contrast(palette[fg], palette[bg])).toBeGreaterThanOrEqual(min)
  })
})
