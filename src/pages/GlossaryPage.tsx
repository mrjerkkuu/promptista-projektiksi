import { useEffect, useId, useState } from 'react'
import { useParams } from 'react-router'
import { Nuppu } from '../components/Nuppu'
import { glossary } from '../content'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { GLOSSARY_CATEGORIES, type GlossaryCategory } from '../schemas/content'
import './pages.css'

const entries = Object.entries(glossary).sort(([, a], [, b]) => a.term.localeCompare(b.term, 'fi'))

/** Haun vertailumuoto: pienet kirjaimet ilman tarkkeita, jotta ”paate” löytää Päätteen. */
function normalize(text: string) {
  return text.toLocaleLowerCase('fi').normalize('NFD').replace(/\p{M}/gu, '')
}

const searchable = new Map(entries.map(([id, e]) => [id, normalize(`${e.term} ${e.definition}`)]))

function statusText(query: string, count: number) {
  if (!query) return ''
  if (count === 0) return `Haulla ”${query}” ei löytynyt termejä. Kokeile jotain toista sanaa.`
  return count === 1 ? 'Löytyi 1 termi.' : `Löytyi ${count} termiä.`
}

export function GlossaryPage() {
  useDocumentTitle('Sanasto')
  const { termId } = useParams()
  const [query, setQuery] = useState('')
  const searchId = useId()

  useEffect(() => {
    if (termId) document.getElementById(`termi-${termId}`)?.scrollIntoView?.({ block: 'center' })
  }, [termId])

  const trimmed = query.trim()
  const needle = normalize(trimmed)
  const matches = needle ? entries.filter(([id]) => searchable.get(id)!.includes(needle)) : entries
  const groups = (Object.keys(GLOSSARY_CATEGORIES) as GlossaryCategory[])
    .map((category) => ({ category, items: matches.filter(([, e]) => e.category === category) }))
    .filter((g) => g.items.length > 0)

  return (
    <>
      <header className="page-header">
        <div className="page-header__text">
          <h1>Sanasto</h1>
          <p>Kaikki sivuston termit lyhyesti aiheittain. Tekstissä alleviivattua sanaa napauttamalla näet saman selityksen.</p>
        </div>
        <Nuppu pose="vilkuttaa" size={110} />
      </header>
      <div role="search" className="glossary-search">
        <label htmlFor={searchId}>Hae sanastosta</label>
        <input id={searchId} type="search" value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" spellCheck={false} />
      </div>
      <p className="glossary-search__status" aria-live="polite">
        {statusText(trimmed, matches.length)}
      </p>
      {groups.map(({ category, items }) => (
        <section key={category} aria-labelledby={`aihe-${category}`} className="glossary-group">
          <h2 id={`aihe-${category}`}>{GLOSSARY_CATEGORIES[category]}</h2>
          <dl className="glossary">
            {items.map(([id, entry]) => (
              <div key={id} id={`termi-${id}`} className={`glossary__entry${id === termId ? ' glossary__entry--active' : ''}`}>
                <dt className="glossary__term">{entry.term}</dt>
                <dd className="glossary__definition">
                  {entry.definition}
                  {entry.readMore && (
                    <>
                      {' '}
                      <a href={entry.readMore} target="_blank" rel="noreferrer">
                        Lue lisää<span className="visually-hidden"> termistä {entry.term}</span>
                      </a>
                    </>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </>
  )
}
