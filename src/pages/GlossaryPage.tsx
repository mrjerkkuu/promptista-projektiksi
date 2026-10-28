import { useEffect, useId, useMemo, useState } from 'react'
import { useParams } from 'react-router'
import { Nuppu } from '../components/Nuppu'
import { useContent, useLanguage, useT, type Language } from '../i18n'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { GLOSSARY_CATEGORIES, type GlossaryCategory, type GlossaryEntry } from '../schemas/content'
import './pages.css'

/** Haun vertailumuoto: pienet kirjaimet ilman tarkkeita, jotta ”paate” löytää Päätteen. */
function normalize(text: string, language: Language) {
  return text.toLocaleLowerCase(language).normalize('NFD').replace(/\p{M}/gu, '')
}

/** Termit aakkosjärjestyksessä ja hakua varten normalisoituina. Aakkosjärjestys riippuu kielestä. */
function sortedEntries(glossary: Record<string, GlossaryEntry>, language: Language) {
  const entries = Object.entries(glossary).sort(([, a], [, b]) => a.term.localeCompare(b.term, language))
  const searchable = new Map(entries.map(([id, e]) => [id, normalize(`${e.term} ${e.definition}`, language)]))
  return { entries, searchable }
}

export function GlossaryPage() {
  const t = useT()
  const language = useLanguage()
  const { glossary } = useContent()
  const { entries, searchable } = useMemo(() => sortedEntries(glossary, language), [glossary, language])
  useDocumentTitle(t.glossary.title)
  const { termId } = useParams()
  const [query, setQuery] = useState('')
  const searchId = useId()

  useEffect(() => {
    if (termId) document.getElementById(`termi-${termId}`)?.scrollIntoView?.({ block: 'center' })
  }, [termId])

  const trimmed = query.trim()
  const needle = normalize(trimmed, language)
  const matches = needle ? entries.filter(([id]) => searchable.get(id)!.includes(needle)) : entries
  const groups = (Object.keys(GLOSSARY_CATEGORIES) as GlossaryCategory[])
    .map((category) => ({ category, items: matches.filter(([, e]) => e.category === category) }))
    .filter((g) => g.items.length > 0)

  return (
    <>
      <header className="page-header">
        <div className="page-header__text">
          <h1>{t.glossary.title}</h1>
          <p>{t.glossary.intro}</p>
        </div>
        <Nuppu pose="lukee" size={110} />
      </header>
      <div role="search" className="glossary-search">
        <label htmlFor={searchId}>{t.glossary.search}</label>
        <input id={searchId} type="search" value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" spellCheck={false} />
      </div>
      <p className="glossary-search__status" aria-live="polite">
        {trimmed && (matches.length === 0 ? t.glossary.noResults(trimmed) : t.glossary.results(matches.length))}
      </p>
      {groups.map(({ category, items }) => (
        <section key={category} aria-labelledby={`aihe-${category}`} className="glossary-group">
          <h2 id={`aihe-${category}`}>{t.glossary.categories[category]}</h2>
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
                        {t.glossary.readMore}
                        <span className="visually-hidden">{t.glossary.readMoreHidden(entry.term)}</span>
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
